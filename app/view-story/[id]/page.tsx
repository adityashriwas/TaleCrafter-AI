"use client";
import { db } from "@/config/config";
import { StoryData } from "@/config/schema";
import { eq } from "drizzle-orm";
import React, { useEffect, useRef, useState } from "react";
import BookCoverPage from "../_components/BookCoverPage";
import StoryPages from "../_components/StoryPages";
import HTMLFlipBook from "react-pageflip";
import { IoIosArrowDroprightCircle } from "react-icons/io";
import { IoIosArrowDropleftCircle } from "react-icons/io";
import { use } from "react";
import { toast } from "react-toastify";

function ViewStory({ params }: { params: Promise<{ id: any }> }) {
  const { id } = use(params);
  const bookRef = useRef<typeof HTMLFlipBook | null>(null);
  const [story, setStory] = useState<any>();
  const [count, setCount] = useState(0);
  const chapters = story?.output?.chapters ?? [];
  const [copied, setCopied] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [contentMode, setContentMode] = useState<"flipbook" | "story">("flipbook");
  const [activeNarrationKey, setActiveNarrationKey] = useState<number | null>(null);

  useEffect(() => {
    getStory();
  }, []);

  const getStory = async () => {
    const result = await db
      .select()
      .from(StoryData)
      .where(eq(StoryData.storyId, id));
    setStory(result[0]);
  };

  const onShareStory = async () => {
    const storyUrl = typeof window !== "undefined" ? window.location.href : "";
    const storyTitle = story?.output?.title || "TaleCrafter Story";

    if (!storyUrl) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: storyTitle,
          text: `Check out this story: ${storyTitle}`,
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
    const prompt = encodeURIComponent(chapter?.imagePrompt ?? "");
    return `https://gen.pollinations.ai/image/${prompt}?model=${process.env.NEXT_PUBLIC_POLLINATIONS_AI_MODEL}&enhance=false&negative_prompt=worst+quality%2C+blurry&safe=false&seed=0&key=${process.env.NEXT_PUBLIC_POLLINATIONS_API_KEY}`;
  };
  const getPdfSafeImageUrl = (url: string) =>
    `/_next/image?url=${encodeURIComponent(url)}&w=1200&q=95`;

  const getChapterText = (chapter: any) => {
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

  const onDownloadPdf = async () => {
    if (!story) return;
    let exportRoot: HTMLElement | null = null;

    try {
      setDownloadingPdf(true);
      const html2canvasModule: any = await import("html2canvas");
      const html2canvas = html2canvasModule.default ?? html2canvasModule;
      const jsPdfModule: any = await import("jspdf");
      const JsPDF = jsPdfModule.jsPDF ?? jsPdfModule.default;
      const title = story?.output?.title || "TaleCrafter Story";
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
        exportImages.map(async (img, index) => {
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

      const images = Array.from(exportRoot.querySelectorAll("img"));
      await Promise.all(
        images.map(
          (img) =>
            new Promise<void>((resolve) => {
              const image = img as HTMLImageElement;
              if (image.complete && image.naturalWidth > 0) {
                resolve();
                return;
              }
              const onLoad = () => resolve();
              const onError = () => resolve();
              image.addEventListener("load", onLoad, { once: true });
              image.addEventListener("error", onError, { once: true });
              setTimeout(() => resolve(), 7000);
            })
        )
      );

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

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#020b1f] px-5 py-8 md:px-16 lg:px-28 xl:px-40">
      <div className="tc-hero-grid absolute inset-0 opacity-35" />
      <div className="tc-hero-orb tc-hero-orb-one" />
      <div className="tc-hero-orb tc-hero-orb-two" />

      <div className="relative">
        <div className="rounded-2xl border border-blue-300/20 bg-white/[0.04] px-5 py-6 text-center shadow-[0_16px_45px_rgba(0,0,0,0.35)] backdrop-blur-md md:px-8">
          <h2 className="bg-gradient-to-b from-white via-blue-100 to-blue-300 bg-clip-text text-3xl font-extrabold text-transparent sm:text-4xl md:text-5xl">
            {story?.output?.title ?? "Loading story..."}
          </h2>
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
                className={`rounded-xl border border-blue-300/20 bg-white/10 p-2 text-blue-100 transition hover:bg-white/20 ${
                  count <= 0 ? "pointer-events-none opacity-40" : ""
                }`}
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
                <button
                  onClick={onShareStory}
                  className="rounded-xl border border-blue-300/30 bg-gradient-to-r from-blue-500 to-cyan-400 px-5 py-2 text-sm font-semibold text-white transition hover:from-blue-400 hover:to-cyan-300"
                >
                  {copied ? "Link Copied!" : "Share Story"}
                </button>
              </div>

              <button
                className={`rounded-xl border border-blue-300/20 bg-white/10 p-2 text-blue-100 transition hover:bg-white/20 ${
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
          <div className="mt-10 rounded-2xl border border-blue-300/20 bg-white/[0.04] p-4 backdrop-blur-sm md:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-2xl font-bold text-white md:text-3xl">
                  Story Content
                </h3>
                <p className="mt-2 text-sm text-blue-100/75 md:text-base">
                  Switch between flipbook and full story layout.
                </p>
              </div>
              <div className="flex items-center gap-2">
                {contentMode === "story" && (
                  <button
                    onClick={onDownloadPdf}
                    disabled={downloadingPdf || !story}
                    className="rounded-xl border border-blue-300/30 bg-white/10 px-5 py-2 text-sm font-semibold text-blue-100 transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {downloadingPdf ? "Generating PDF..." : "Download PDF"}
                  </button>
                )}
                <div className="inline-flex rounded-xl border border-blue-300/20 bg-white/10 p-1">
                  <button
                    onClick={() => {
                      stopNarration();
                      setContentMode("flipbook");
                    }}
                    className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                      contentMode === "flipbook"
                        ? "bg-gradient-to-r from-blue-500 to-cyan-400 text-white"
                        : "text-blue-100 hover:bg-white/10"
                    }`}
                  >
                    Flipbook
                  </button>
                  <button
                    onClick={() => {
                      stopNarration();
                      setContentMode("story");
                    }}
                    className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                      contentMode === "story"
                        ? "bg-gradient-to-r from-blue-500 to-cyan-400 text-white"
                        : "text-blue-100 hover:bg-white/10"
                    }`}
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
                    <h4 className="mt-1 text-xl font-semibold text-white">
                      {chapter?.title ?? "Untitled Chapter"}
                    </h4>
                    <img
                      src={getChapterImageUrl(chapter)}
                      alt={chapter?.title ?? "story chapter image"}
                      className="mt-3 h-auto w-full rounded-lg bg-slate-100 object-contain"
                      loading="lazy"
                    />
                    <p className="mt-3 text-sm leading-relaxed text-blue-100/85 md:text-base">
                      {getChapterText(chapter)}
                    </p>
                  </article>
                ))}
              </div>
            ) : null}
          </div>
        )}

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
                  {story?.output?.title ?? "Story"}
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
                    {getChapterText(chapter)}
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

export default ViewStory;
