"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import HTMLFlipBook from "react-pageflip";
import { IoIosArrowDropleftCircle, IoIosArrowDroprightCircle } from "react-icons/io";
import { toast } from "react-toastify";
import { db } from "@/config/config";
import { StoryData } from "@/config/schema";
import { ne, sql } from "drizzle-orm";
import BookCoverPage from "@/app/view-story/_components/BookCoverPage";
import StoryPages from "@/app/view-story/_components/StoryPages";
import { buildPollinationsImageUrl } from "@/lib/story-images";
import { DEFAULT_OG_IMAGE, toAbsoluteUrl } from "@/lib/seo";

type StoryPageClientProps = {
  initialStory: any;
  slug: string;
};

function SafeStoryModeImage({ src, alt }: { src: string; alt: string }) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div className="mt-3 flex min-h-[240px] w-full items-center justify-center rounded-lg border border-blue-200/40 bg-blue-50 px-6 text-center text-sm text-slate-600">
        We couldn&apos;t load this illustration right now. You can continue reading the story text.
      </div>
    );
  }

  return (
    <div className="relative mt-3 min-h-[240px] w-full overflow-hidden rounded-lg bg-transparent">
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 768px) 100vw, 50vw"
        className="object-contain"
        unoptimized
        loading="lazy"
        onError={() => setFailed(true)}
      />
    </div>
  );
}

const getOutputTitle = (story: any) => String(story?.output?.title ?? "AI Generated Story");

const getCleanChapterText = (chapter: any) => {
  return (
    chapter?.textPrompt
      ?.split(chapter?.imagePrompt?.substring(0, 20) || "")[0]
      ?.replace(/\{[^}]*\}/g, "")
      ?.replace(
        /(Water ?Color|Watercolor|Anime( style)?|3D ?Cartoon|Oil (Paint|painting)|Comic( book)?|Paper ?Cut|Papercut|Pixel ?Art)[\s\S]*/i,
        ""
      )
      ?.trim() ?? ""
  );
};

const getStorySummary = (story: any) => {
  const firstText = String(story?.output?.chapters?.[0]?.textPrompt ?? story?.storySubject ?? "")
    .replace(/\{[^}]*\}/g, "")
    .trim();

  if (firstText.length > 30) {
    return firstText.slice(0, 220);
  }

  return `Read '${getOutputTitle(story)}', an AI generated story created with TaleCrafter AI.`;
};

const getStoryPublishedDate = (story: any) => {
  const rawDate = story?.createdAt ?? story?.updatedAt;
  if (!rawDate) return undefined;

  const parsed = new Date(rawDate);
  if (Number.isNaN(parsed.getTime())) return undefined;
  return parsed.toISOString();
};

export default function StoryPageClient({ initialStory, slug }: StoryPageClientProps) {
  const RELATED_PAGE_SIZE = 10;
  const bookRef = useRef<typeof HTMLFlipBook | null>(null);
  const [story] = useState<any>(initialStory);
  const [count, setCount] = useState(0);
  const [copied, setCopied] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [contentMode, setContentMode] = useState<"flipbook" | "story">("story");
  const [activeNarrationKey, setActiveNarrationKey] = useState<number | null>(null);
  const [relatedStories, setRelatedStories] = useState<any[]>([]);
  const [relatedPage, setRelatedPage] = useState(1);
  const [relatedTotalPages, setRelatedTotalPages] = useState(0);
  const [relatedLoading, setRelatedLoading] = useState(false);

  const title = getOutputTitle(story);
  const summary = useMemo(() => getStorySummary(story), [story]);
  const publishedDate = useMemo(() => getStoryPublishedDate(story), [story]);
  const chapters = story?.output?.chapters ?? [];

  const introText = useMemo(() => {
    const clean = summary.endsWith(".") ? summary : `${summary}.`;
    return `${clean} Enjoy this full AI-crafted reading experience below.`;
  }, [summary]);

  const getRelatedStories = async (page: number) => {
    if (!story?.storyId) return;

    setRelatedLoading(true);
    try {
      const safePage = Math.max(1, page);
      const offset = (safePage - 1) * RELATED_PAGE_SIZE;
      const storyType = String(story?.storyType ?? "").trim();

      const baseFilter = ne(StoryData.storyId, story.storyId);
      const orderClause = storyType
        ? sql`CASE WHEN ${StoryData.storyType} = ${storyType} THEN 0 ELSE 1 END, RANDOM()`
        : sql`RANDOM()`;

      const [result, totalResult] = await Promise.all([
        db
          .select()
          .from(StoryData)
          .where(baseFilter)
          .orderBy(orderClause)
          .limit(RELATED_PAGE_SIZE)
          .offset(offset),
        db
          .select({ count: sql<number>`count(*)` })
          .from(StoryData)
          .where(baseFilter),
      ]);

      const totalCount = Number(totalResult?.[0]?.count ?? 0);
      const pages = Math.ceil(totalCount / RELATED_PAGE_SIZE);
      setRelatedStories(result ?? []);
      setRelatedTotalPages(pages);

      if (pages > 0 && safePage > pages) {
        setRelatedPage(pages);
      }
    } finally {
      setRelatedLoading(false);
    }
  };

  useEffect(() => {
    setRelatedPage(1);
  }, [story?.storyId]);

  useEffect(() => {
    getRelatedStories(relatedPage);
  }, [relatedPage, story?.storyId]);

  const getVisiblePageNumbers = () => {
    if (relatedTotalPages <= 1) return [];
    const start = Math.max(1, relatedPage - 2);
    const end = Math.min(relatedTotalPages, start + 4);
    return Array.from({ length: end - start + 1 }, (_, idx) => start + idx);
  };

  const onShareStory = async () => {
    const storyUrl = typeof window !== "undefined" ? window.location.href : "";
    if (!storyUrl) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: `Check out this story: ${title}`,
          url: storyUrl,
        });
      } catch {
        // user cancelled share flow
      }
      return;
    }

    await navigator.clipboard.writeText(storyUrl);
    setCopied(true);
    toast("Story link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const getChapterImageUrl = (chapter: any) => {
    const persistedImage = String(chapter?.imageUrl ?? "").trim();
    if (persistedImage) return persistedImage;

    return buildPollinationsImageUrl(
      chapter?.imagePrompt ?? chapter?.title ?? "Story illustration",
      { seed: 0 }
    );
  };

  const onDownloadPdf = async () => {
    if (!story) return;
    let exportRoot: HTMLElement | null = null;

    try {
      setDownloadingPdf(true);
      const html2canvasModule: any = await import("html2canvas");
      const html2canvas = html2canvasModule.default ?? html2canvasModule;
      const jsPdfModule: any = await import("jspdf");
      const JsPDF = jsPdfModule.jsPDF ?? jsPdfModule.default;
      const sanitizedTitle = title.replace(/[^\w\s-]/g, "").trim() || "story";
      const pdfRoot = document.getElementById("story-pdf-export");
      if (!pdfRoot) {
        toast.error("PDF content is not ready yet.");
        return;
      }

      exportRoot = pdfRoot.cloneNode(true) as HTMLElement;
      exportRoot.id = "story-pdf-export-runtime";
      exportRoot.style.position = "fixed";
      exportRoot.style.left = "-10000px";
      exportRoot.style.top = "0";
      exportRoot.style.zIndex = "9999";
      exportRoot.style.opacity = "1";
      exportRoot.style.pointerEvents = "none";
      exportRoot.style.maxHeight = "100vh";
      exportRoot.style.overflow = "auto";
      document.body.appendChild(exportRoot);

      const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
      const toDataUrlWithRetry = async (url: string, retries = 5, waitMs = 1500) => {
        let lastError: unknown = null;
        for (let attempt = 0; attempt < retries; attempt++) {
          try {
            const response = await fetch(url, { cache: "no-store" });
            if (!response.ok) throw new Error(`Image fetch failed: ${response.status}`);
            const contentType = response.headers.get("content-type") || "";
            if (!contentType.includes("image")) {
              throw new Error("Fetched resource is not an image");
            }
            const blob = await response.blob();
            return await new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(String(reader.result || ""));
              reader.onerror = () => reject(new Error("Unable to encode image"));
              reader.readAsDataURL(blob);
            });
          } catch (error) {
            lastError = error;
            if (attempt < retries - 1) await delay(waitMs);
          }
        }
        throw lastError ?? new Error("Image fetch failed");
      };

      const exportImages = Array.from(exportRoot.querySelectorAll("img"));
      let failedImages = 0;
      await Promise.all(
        exportImages.map(async (img) => {
          const image = img as HTMLImageElement;
          const currentSrc = image.currentSrc || image.src;
          if (!currentSrc) {
            failedImages += 1;
            return;
          }
          if (currentSrc.startsWith("data:")) {
            return;
          }
          try {
            const dataUrl = await toDataUrlWithRetry(currentSrc);
            image.src = dataUrl;
          } catch {
            failedImages += 1;
          }
        })
      );

      if (failedImages > 0) {
        toast.error(
          `${failedImages} image(s) are still loading. Please wait a few seconds and try PDF download again.`
        );
        return;
      }

      const sections = Array.from(exportRoot.querySelectorAll("section"));
      if (!sections.length) {
        toast.error("No pages found to export.");
        return;
      }

      const pdf = new JsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
      const pdfWidth = 210;
      const pdfHeight = 297;

      for (let i = 0; i < sections.length; i++) {
        const section = sections[i] as HTMLElement;
        const canvas = await html2canvas(section, {
          scale: 2,
          useCORS: true,
          allowTaint: false,
          backgroundColor: "#020b1f",
          width: 794,
          windowWidth: 794,
          scrollX: 0,
          scrollY: 0,
        });

        const imageData = canvas.toDataURL("image/jpeg", 0.98);
        if (i > 0) pdf.addPage();
        pdf.addImage(imageData, "JPEG", 0, 0, pdfWidth, pdfHeight);
      }

      pdf.save(`${sanitizedTitle}.pdf`);
      toast.success("PDF download started");
    } catch {
      toast.error("Unable to generate PDF. Please try again.");
    } finally {
      if (exportRoot) exportRoot.remove();
      setDownloadingPdf(false);
    }
  };

  const stopNarration = () => {
    if (typeof window === "undefined") return;
    window.speechSynthesis.cancel();
    setActiveNarrationKey(null);
  };

  useEffect(() => {
    stopNarration();
  }, [contentMode]);

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined") window.speechSynthesis.cancel();
    };
  }, []);

  const structuredData = useMemo(() => {
    const base: Record<string, any> = {
      "@context": "https://schema.org",
      "@type": "CreativeWork",
      headline: title,
      author: {
        "@type": "Organization",
        name: "TaleCrafter AI",
      },
      description: summary,
      image: story?.coverImage || toAbsoluteUrl(DEFAULT_OG_IMAGE),
      url: toAbsoluteUrl(`/story/${slug}`),
    };

    if (publishedDate) {
      base.datePublished = publishedDate;
    }

    return JSON.stringify(base);
  }, [publishedDate, slug, story?.coverImage, summary, title]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#020b1f] px-5 py-8 md:px-16 lg:px-28 xl:px-40">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: structuredData,
        }}
      />

      <div className="tc-hero-grid absolute inset-0 opacity-35" />
      <div className="tc-hero-orb tc-hero-orb-one" />
      <div className="tc-hero-orb tc-hero-orb-two" />

      <div className="relative">
        <div className="tc-glass-panel px-5 py-6 text-center shadow-[0_16px_45px_rgba(0,0,0,0.35)] md:px-8">
          <h1 className="tc-title-gradient text-3xl font-extrabold sm:text-4xl md:text-5xl">{title}</h1>
          <p className="mx-auto mt-4 max-w-4xl text-sm leading-relaxed text-blue-100/80 md:text-base">
            {introText}
          </p>
        </div>

        {contentMode === "flipbook" && (
          <>
            <div className="mt-8 flex flex-col items-center">
              {/* @ts-ignore */}
              <HTMLFlipBook
                className="max-w-[84vw] md:max-w-[62vw] lg:max-w-[48vw]"
                width={330}
                height={620}
                showCover={true}
                useMouseEvents={false}
                ref={bookRef}
                style={{ height: "auto", maxHeight: "auto" }}
              >
                <div className="p-0">
                  <BookCoverPage imageUrl={story?.coverImage} />
                </div>
                {chapters.map((chapter: any, index: number) => (
                  <div key={index} className="bg-white p-4 md:p-5">
                    <StoryPages
                      storyChapter={chapter}
                      chapterKey={index}
                      activeNarrationKey={activeNarrationKey}
                      onStartNarration={(key: number) => setActiveNarrationKey(key)}
                      onStopNarration={(key: number) => {
                        setActiveNarrationKey((prev) => (prev === key ? null : prev));
                      }}
                    />
                  </div>
                ))}
              </HTMLFlipBook>
            </div>

            <div className="mt-7 flex w-full items-center justify-between">
              <button
                className={`tc-icon-btn p-2 ${count <= 0 ? "pointer-events-none opacity-40" : ""}`}
                onClick={() => {
                  if (count <= 0) return;
                  stopNarration();
                  // @ts-ignore
                  bookRef.current?.pageFlip().flipPrev();
                  setCount((prev) => prev - 1);
                }}
                aria-label="Previous page"
              >
                <IoIosArrowDropleftCircle className="text-4xl" />
              </button>

              <div className="flex items-center gap-2">
                <button onClick={onShareStory} className="tc-btn-primary px-5 py-2 text-sm">
                  {copied ? "Link Copied!" : "Share Story"}
                </button>
              </div>

              <button
                className={`tc-icon-btn p-2 ${
                  count >= chapters.length ? "pointer-events-none opacity-40" : ""
                }`}
                onClick={() => {
                  if (count >= chapters.length) return;
                  stopNarration();
                  // @ts-ignore
                  bookRef.current?.pageFlip().flipNext();
                  setCount((prev) => prev + 1);
                }}
                aria-label="Next page"
              >
                <IoIosArrowDroprightCircle className="text-4xl" />
              </button>
            </div>
          </>
        )}

        {chapters.length > 0 && (
          <div className="tc-glass-panel-soft mt-10 p-4 md:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-2xl font-bold text-white md:text-3xl">Full Story</h2>
                <p className="mt-2 text-sm text-blue-100/75 md:text-base">
                  Switch between flipbook and full story layout.
                </p>
              </div>
              <div className="flex items-center gap-2">
                {contentMode === "story" && (
                  <button
                    onClick={onDownloadPdf}
                    disabled={downloadingPdf || !story}
                    className="tc-btn-ghost px-5 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {downloadingPdf ? "Generating PDF..." : "Download PDF"}
                  </button>
                )}
                <div className="tc-toggle-wrap">
                  <button
                    onClick={() => {
                      stopNarration();
                      setContentMode("flipbook");
                    }}
                    className={`tc-toggle-btn ${contentMode === "flipbook" ? "tc-toggle-btn-active" : ""}`}
                  >
                    Flipbook
                  </button>
                  <button
                    onClick={() => {
                      stopNarration();
                      setContentMode("story");
                    }}
                    className={`tc-toggle-btn ${contentMode === "story" ? "tc-toggle-btn-active" : ""}`}
                  >
                    Story
                  </button>
                </div>
              </div>
            </div>

            {contentMode === "story" ? (
              <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
                {chapters.map((chapter: any, index: number) => (
                  <article
                    key={`story-map-${index}`}
                    className="rounded-xl border border-blue-300/20 bg-[#04142e]/70 p-4"
                  >
                    <h3 className="mt-1 text-xl font-semibold text-white">{chapter?.title ?? "Untitled Chapter"}</h3>
                    <SafeStoryModeImage
                      src={getChapterImageUrl(chapter)}
                      alt={chapter?.title ?? "story chapter image"}
                    />
                    <p className="mt-3 text-sm leading-relaxed text-blue-100/85 md:text-base">
                      {getCleanChapterText(chapter)}
                    </p>
                  </article>
                ))}
              </div>
            ) : null}
          </div>
        )}

        <div className="tc-glass-panel-soft mt-10 p-5 md:p-7 text-center">
          <h2 className="text-2xl font-bold text-white">Generate Your Own AI Story</h2>
          <p className="mx-auto mt-2 max-w-2xl text-sm text-blue-100/75 md:text-base">
            Create your own personalized illustrated story in minutes.
          </p>
          <Link href="/create-story" className="tc-btn-primary mt-4 inline-flex px-5 py-2 text-sm" prefetch={true}>
            Create Story
          </Link>
        </div>

        <div className="tc-glass-panel-soft mt-10 p-5 md:p-7">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-2xl font-bold text-white">More Stories Like This</h2>
            <Link href="/explore" prefetch={true} className="tc-btn-ghost px-4 py-2 text-sm">
              View Explore
            </Link>
          </div>

          <div className="mt-2 text-sm text-blue-100/70">
            Page {relatedTotalPages === 0 ? 0 : relatedPage} of {relatedTotalPages}
          </div>

          <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
            {relatedStories.map((item) => {
              const href = item?.slug ? `/story/${item.slug}` : `/view-story/${item.storyId}`;
              return (
                <Link
                  key={item.storyId}
                  href={href}
                  prefetch={true}
                  className="rounded-xl border border-blue-300/20 bg-[#04142e]/70 p-3 transition hover:border-blue-300/40"
                >
                  <div className="relative h-40 w-full overflow-hidden rounded-lg bg-slate-900">
                    {item?.coverImage ? (
                      <Image
                        src={item.coverImage}
                        alt={item?.output?.title ?? "Related story cover"}
                        fill
                        sizes="(max-width: 768px) 100vw, 20vw"
                        className="object-cover"
                        unoptimized
                        loading="lazy"
                      />
                    ) : null}
                  </div>
                  <h3 className="mt-3 line-clamp-2 text-sm font-semibold text-blue-100">
                    {item?.output?.title ?? "Untitled Story"}
                  </h3>
                </Link>
              );
            })}

            {relatedLoading && (
              <div className="col-span-full flex justify-center py-5">
                <span className="h-8 w-8 animate-spin rounded-full border-4 border-blue-400 border-t-transparent" />
              </div>
            )}
          </div>

          {relatedTotalPages > 1 && (
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
              <button
                onClick={() => setRelatedPage((prev) => Math.max(1, prev - 1))}
                disabled={relatedPage === 1 || relatedLoading}
                className="tc-btn-ghost px-3 py-2 text-xs disabled:cursor-not-allowed disabled:opacity-50"
              >
                Prev
              </button>
              {getVisiblePageNumbers().map((pageNo) => (
                <button
                  key={`related-page-${pageNo}`}
                  onClick={() => setRelatedPage(pageNo)}
                  disabled={relatedLoading}
                  className={`rounded-lg px-3 py-2 text-xs font-semibold ${
                    pageNo === relatedPage
                      ? "bg-blue-500 text-white"
                      : "border border-blue-300/30 bg-[#04142e]/70 text-blue-100"
                  }`}
                >
                  {pageNo}
                </button>
              ))}
              <button
                onClick={() => setRelatedPage((prev) => Math.min(relatedTotalPages, prev + 1))}
                disabled={
                  relatedPage === relatedTotalPages ||
                  relatedTotalPages === 0 ||
                  relatedLoading
                }
                className="tc-btn-ghost px-3 py-2 text-xs disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>

        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            transform: "translateX(-200vw)",
            width: "794px",
            height: "100vh",
            overflow: "auto",
            background: "#020b1f",
            color: "#e2e8f0",
            pointerEvents: "none",
            zIndex: -1,
          }}
          aria-hidden="true"
        >
          <div id="story-pdf-export" style={{ width: "794px", background: "#020b1f" }}>
            <section
              style={{
                minHeight: "1123px",
                padding: "34px",
                boxSizing: "border-box",
                pageBreakAfter: "always",
                background: "#020b1f",
              }}
            >
              <div
                style={{
                  minHeight: "100%",
                  border: "1px solid #16325a",
                  borderRadius: "20px",
                  background: "linear-gradient(180deg, #031737 0%, #010d24 100%)",
                  padding: "28px",
                  boxSizing: "border-box",
                }}
              >
                <p
                  style={{
                    margin: "0 0 10px 0",
                    fontSize: "20px",
                    lineHeight: 1.2,
                    letterSpacing: "0.08em",
                    color: "#7dd3fc",
                    textTransform: "uppercase",
                  }}
                >
                  TaleCrafter AI
                </p>
                <h1
                  style={{
                    margin: "0 0 16px 0",
                    fontSize: "42px",
                    lineHeight: 1.15,
                    fontWeight: 800,
                    color: "#f8fafc",
                  }}
                >
                  {title}
                </h1>
                {story?.coverImage && (
                  <img
                    src={story.coverImage}
                    alt="cover"
                    style={{
                      maxWidth: "100%",
                      width: "auto",
                      height: "auto",
                      objectFit: "contain",
                      background: "#001230",
                      borderRadius: "14px",
                      display: "block",
                      margin: "0 auto",
                    }}
                  />
                )}
              </div>
            </section>

            {chapters.map((chapter: any, index: number) => (
              <section
                key={`pdf-page-${index}`}
                style={{
                  minHeight: "1123px",
                  padding: "34px",
                  boxSizing: "border-box",
                  pageBreakAfter: "always",
                  background: "#020b1f",
                }}
              >
                <article
                  style={{
                    minHeight: "100%",
                    border: "1px solid #16325a",
                    borderRadius: "20px",
                    background: "linear-gradient(180deg, #031737 0%, #010d24 100%)",
                    padding: "28px",
                    boxSizing: "border-box",
                  }}
                >
                  <p
                    style={{
                      margin: "0 0 8px 0",
                      fontSize: "24px",
                      letterSpacing: "0.03em",
                      textTransform: "uppercase",
                      color: "#7dd3fc",
                      fontWeight: 600,
                    }}
                  >
                    Chapter {index + 1}
                  </p>
                  <h2
                    style={{
                      margin: "0 0 16px 0",
                      fontSize: "44px",
                      lineHeight: 1.1,
                      color: "#f8fafc",
                      fontWeight: 800,
                    }}
                  >
                    {chapter?.title ?? "Untitled Chapter"}
                  </h2>
                  <img
                    src={getChapterImageUrl(chapter)}
                    alt={chapter?.title ?? "chapter image"}
                    style={{
                      maxWidth: "100%",
                      width: "auto",
                      height: "auto",
                      objectFit: "contain",
                      background: "#001230",
                      borderRadius: "16px",
                      marginBottom: "18px",
                      display: "block",
                      margin: "0 auto 18px auto",
                    }}
                  />
                  <p
                    style={{
                      margin: 0,
                      fontSize: "17px",
                      lineHeight: 1.8,
                      color: "#cbd5e1",
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {getCleanChapterText(chapter)}
                  </p>
                </article>
              </section>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
