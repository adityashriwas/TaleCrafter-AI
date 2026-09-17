"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { IoIosArrowDropleftCircle, IoIosArrowDroprightCircle } from "react-icons/io";
import { toast } from "react-toastify";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import CustomLoader from "@/app/create-story/(component)/CustomLoader";
import BookCoverPage from "@/app/view-story/_components/BookCoverPage";
import { apiFetch } from "@/lib/api-client";

const MAX_DEPTH = 7;

const HTMLFlipBook = dynamic(() => import("react-pageflip"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[420px] w-full max-w-[380px] items-center justify-center rounded-lg bg-blue-50 text-sm text-slate-600">
      Loading book...
    </div>
  ),
});

type InteractivePage = {
  pageNumber: number;
  title: string;
  text: string;
  imagePrompt: string;
  imageUrl?: string;
};

type InteractiveStoryState = {
  story: StoryRow;
  nodes: StoryNode[];
  completedSlug?: string;
};

type StoryRow = {
  storyId: string;
  title: string;
  status: "draft" | "completed";
  totalPages: number;
  rootNodeId: string;
  currentNodeId: string;
  userEmail: string;
  userName: string;
  userImage: string;
  storySubject: string;
  storyType: string;
  ageGroup: string;
  imageStyle: string;
  coverImage: string;
};

type StoryNode = {
  nodeId: string;
  storyId: string;
  parentNodeId: string | null;
  depth: number;
  choiceTaken: string | null;
  choices: string[] | null;
  selectedChoice: string | null;
  pages: InteractivePage[];
  isActive: boolean;
};

type FlipBookApi = {
  flipPrev: () => void;
  flipNext: () => void;
  turnToPage?: (page: number) => void;
  getPageCount?: () => number;
  getCurrentPageIndex?: () => number;
  getOrientation?: () => string;
};

type FlipBookHandle = {
  pageFlip: () => FlipBookApi;
};

const SafeStoryImage = ({ src, alt }: { src?: string; alt: string }) => {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div className="mt-3 flex min-h-[260px] w-full items-center justify-center rounded-lg border border-blue-200/40 bg-blue-50 px-6 text-center text-sm text-slate-600">
        We couldn’t load this illustration right now. The story text is still available.
      </div>
    );
  }

  return (
    <div className="relative mt-3 min-h-[260px] w-full overflow-hidden rounded-lg bg-slate-100">
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 768px) 100vw, 50vw"
        className="object-contain"
        onError={() => setFailed(true)}
        unoptimized
      />
    </div>
  );
};

const InteractiveStoryPage = () => {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const router = useRouter();
  const { getToken } = useAuth();
  const bookRef = useRef<FlipBookHandle | null>(null);
  const bookSectionRef = useRef<HTMLDivElement | null>(null);
  const treeSectionRef = useRef<HTMLDivElement | null>(null);

  const [story, setStory] = useState<StoryRow | null>(null);
  const [nodes, setNodes] = useState<StoryNode[]>([]);
  const [loading, setLoading] = useState(false);
  const [flipPage, setFlipPage] = useState(0);
  const [maxFlipPage, setMaxFlipPage] = useState(0);
  const [isLandscapeSpread, setIsLandscapeSpread] = useState(false);
  const [generatingNext, setGeneratingNext] = useState(false);
  const [loaderMessage, setLoaderMessage] = useState("Story is generating...");

  const applyInteractiveState = useCallback((state: InteractiveStoryState) => {
    setStory(state.story);
    setNodes(state.nodes ?? []);
  }, []);

  const loadStory = useCallback(async () => {
    if (!id) return;

    setLoading(true);
    try {
      const token = await getToken();
      const state = await apiFetch<InteractiveStoryState>(`/interactive-stories/${id}`, {
        token,
      });

      if (state.completedSlug) {
        router.replace(`/story/${state.completedSlug}`);
        return;
      }

      applyInteractiveState(state);
    } catch {
      toast.error("Unable to load interactive story");
      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  }, [applyInteractiveState, getToken, id, router]);

  useEffect(() => {
    loadStory();
  }, [loadStory]);

  const activeNode = useMemo(() => {
    return nodes.find((node) => node.isActive) ?? nodes[nodes.length - 1] ?? null;
  }, [nodes]);

  const nodeMap = useMemo(() => {
    const map = new Map<string, StoryNode>();
    nodes.forEach((node) => map.set(node.nodeId, node));
    return map;
  }, [nodes]);

  const linearNodes = useMemo(() => {
    if (!activeNode) return [];
    const chain: StoryNode[] = [];
    let cursor: StoryNode | undefined = activeNode;

    while (cursor) {
      chain.push(cursor);
      if (!cursor.parentNodeId) break;
      cursor = nodeMap.get(cursor.parentNodeId);
    }

    return chain.reverse();
  }, [activeNode, nodeMap]);

  const linearPages = useMemo(() => {
    return linearNodes.flatMap((node) => node.pages ?? []);
  }, [linearNodes]);

  const totalPages = linearPages.length;

  const syncFlipState = useCallback(() => {
    const fallbackMax = Math.max(0, totalPages);
    const flipApi = bookRef.current?.pageFlip?.();

    if (!flipApi) {
      setMaxFlipPage(fallbackMax);
      setFlipPage((prev) => Math.max(0, Math.min(prev, fallbackMax)));
      return;
    }

    const pageCount = Number(flipApi.getPageCount?.() ?? fallbackMax + 1);
    const runtimeMax = Number.isFinite(pageCount) && pageCount > 0 ? pageCount - 1 : fallbackMax;
    const current = Number(flipApi.getCurrentPageIndex?.() ?? 0);
    const orientation = String(flipApi.getOrientation?.() ?? "portrait").toLowerCase();
    const landscape = orientation === "landscape";

    setMaxFlipPage(Math.max(0, runtimeMax));
    setIsLandscapeSpread(landscape);
    setFlipPage(Number.isFinite(current) ? Math.max(0, Math.min(current, Math.max(0, runtimeMax))) : 0);
  }, [totalPages]);

  const storyEndThreshold = isLandscapeSpread
    ? Math.max(0, maxFlipPage - 1)
    : maxFlipPage;
  const atCover = flipPage <= 0;
  const atEnd = totalPages > 0 && flipPage >= storyEndThreshold;
  const canFlipPrev = flipPage > 0;
  const canFlipNext = flipPage < storyEndThreshold;
  const displayedPageIndex = atCover
    ? 0
    : Math.min(totalPages, Math.max(1, flipPage));

  useEffect(() => {
    const timer = setTimeout(() => {
      syncFlipState();
    }, 80);

    return () => clearTimeout(timer);
  }, [story?.storyId, syncFlipState]);

  useEffect(() => {
    if (!atEnd || story?.status === "completed") return;

    const timer = setTimeout(() => {
      treeSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 180);

    return () => clearTimeout(timer);
  }, [atEnd, story?.status]);

  const completeStoryWithResolution = async (selectedChoice: string) => {
    if (!story || !activeNode || generatingNext) return;

    try {
      setLoaderMessage("Compiling all choices and making final book...");
      setGeneratingNext(true);
      const token = await getToken();
      const state = await apiFetch<InteractiveStoryState>(
        `/interactive-stories/${story.storyId}/complete`,
        {
          method: "POST",
          token,
          body: JSON.stringify({ choice: selectedChoice }),
        }
      );

      if (state.completedSlug) {
        router.replace(`/story/${state.completedSlug}`);
        return;
      }

      applyInteractiveState(state);
    } catch {
      toast.error("Unable to finalize story right now");
    } finally {
      setGeneratingNext(false);
    }
  };

  const onPickChoice = async (choice: string) => {
    if (!story || !activeNode || generatingNext) return;

    if (activeNode.selectedChoice) {
      toast.info("This branch is already locked");
      return;
    }

    if (activeNode.depth >= MAX_DEPTH) {
      await completeStoryWithResolution(choice);
      return;
    }

    try {
      setLoaderMessage("Expanding your chosen path...");
      setGeneratingNext(true);
      const token = await getToken();
      const state = await apiFetch<InteractiveStoryState>(
        `/interactive-stories/${story.storyId}/choices`,
        {
          method: "POST",
          token,
          body: JSON.stringify({ choice }),
        }
      );

      if (state.completedSlug) {
        router.replace(`/story/${state.completedSlug}`);
        return;
      }

      applyInteractiveState(state);
      setFlipPage(0);
      setMaxFlipPage(Math.max(0, totalPages));
      setIsLandscapeSpread(false);

      setTimeout(() => {
        const flipApi = bookRef.current?.pageFlip?.();
        flipApi?.turnToPage?.(0);
        bookSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 180);
    } catch {
      toast.error("Failed to generate continuation");
    } finally {
      setGeneratingNext(false);
    }
  };

  const onEndStory = async () => {
    if (!activeNode) return;
    await completeStoryWithResolution("End Story");
  };

  const treeGraph = useMemo(() => {
    if (!linearNodes.length) {
      return {
        nodes: [] as Array<{
          id: string;
          depth: number;
          pos: number;
          label: string;
          status: "selected" | "disabled" | "available" | "current";
          originNodeId?: string;
          realNode?: StoryNode;
        }>,
        edges: [] as Array<{ from: string; to: string; status: "selected" | "disabled" | "available" }>,
        maxDepth: 0,
      };
    }

    const nodeMap = new Map<
      string,
      {
        id: string;
        depth: number;
        pos: number;
        label: string;
        status: "selected" | "disabled" | "available" | "current";
        originNodeId?: string;
        realNode?: StoryNode;
      }
    >();
    const edges: Array<{ from: string; to: string; status: "selected" | "disabled" | "available" }> = [];

    let selectedPos = 0;
    const root = linearNodes[0];
    nodeMap.set("0-0", {
      id: "0-0",
      depth: 0,
      pos: 0,
      label: "Start",
      status: linearNodes.length === 1 ? "current" : "selected",
      realNode: root,
    });

    for (let index = 0; index < linearNodes.length; index++) {
      const node = linearNodes[index];
      const nextNode = linearNodes[index + 1];
      const depth = index;
      const parentId = `${depth}-${selectedPos}`;

      let choices = Array.isArray(node.choices) ? node.choices.slice(0, 2) : [];
      const takenChoice = nextNode?.choiceTaken ?? node.selectedChoice ?? null;

      if (choices.length === 0 && takenChoice) {
        choices = [takenChoice, "Locked"];
      } else if (choices.length === 1) {
        choices = [choices[0], "Locked"];
      }

      if (choices.length < 2) continue;

      let chosenDir = takenChoice ? choices.findIndex((choice) => choice === takenChoice) : -1;
      if (chosenDir < 0 && nextNode) chosenDir = 0;

      const childDepth = depth + 1;
      const childPositions = [selectedPos * 2, selectedPos * 2 + 1];

      choices.forEach((choiceText, choiceIndex) => {
        const childPos = childPositions[choiceIndex];
        const childId = `${childDepth}-${childPos}`;
        const isChosenBranch = chosenDir === choiceIndex && (Boolean(nextNode) || Boolean(takenChoice));
        const branchStatus: "selected" | "disabled" | "available" = isChosenBranch
          ? "selected"
          : chosenDir !== -1
          ? "disabled"
          : "available";

        nodeMap.set(childId, {
          id: childId,
          depth: childDepth,
          pos: childPos,
          label: choiceText,
          status: branchStatus,
          originNodeId: node.nodeId,
        });

        edges.push({
          from: parentId,
          to: childId,
          status: branchStatus,
        });
      });

      if (nextNode) {
        const chosenPos = childPositions[chosenDir >= 0 ? chosenDir : 0];
        selectedPos = chosenPos;
        const selectedId = `${childDepth}-${selectedPos}`;
        const existing = nodeMap.get(selectedId);
        nodeMap.set(selectedId, {
          ...(existing ?? {
            id: selectedId,
            depth: childDepth,
            pos: selectedPos,
            label: "Path",
            status: "selected",
          }),
          status: index + 1 === linearNodes.length - 1 ? "current" : "selected",
          realNode: nextNode,
        });
      }
    }

    const nodes = Array.from(nodeMap.values()).sort((a, b) => {
      if (a.depth !== b.depth) return a.depth - b.depth;
      return a.pos - b.pos;
    });

    const maxDepth = nodes.reduce((max, node) => Math.max(max, node.depth), 0);

    return {
      nodes,
      edges,
      maxDepth,
    };
  }, [linearNodes]);

  const treeLayout = useMemo(() => {
    const depthBuckets = new Map<number, typeof treeGraph.nodes>();

    treeGraph.nodes.forEach((node) => {
      const bucket = depthBuckets.get(node.depth) ?? [];
      bucket.push(node);
      depthBuckets.set(node.depth, bucket);
    });

    depthBuckets.forEach((bucket) => {
      bucket.sort((a, b) => a.pos - b.pos);
    });

    const maxNodesInLevel = Math.max(
      1,
      ...Array.from(depthBuckets.values()).map((bucket) => bucket.length)
    );

    const minWidth = Math.max(900, maxNodesInLevel * 220);
    const height = Math.max(520, (treeGraph.maxDepth + 1) * 150);
    const nodePointById = new Map<string, { x: number; y: number }>();

    depthBuckets.forEach((bucket, depth) => {
      const y = treeGraph.maxDepth === 0 ? 50 : 10 + (depth / treeGraph.maxDepth) * 82;

      bucket.forEach((node, index) => {
        const x =
          bucket.length === 1
            ? 50
            : 10 + (index / Math.max(1, bucket.length - 1)) * 80;
        nodePointById.set(node.id, { x, y });
      });
    });

    return {
      minWidth,
      height,
      nodePointById,
    };
  }, [treeGraph]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#020b1f] px-5 py-8 md:px-16 lg:px-28 xl:px-40">
      <div className="tc-hero-grid absolute inset-0 opacity-35" />
      <div className="tc-hero-orb tc-hero-orb-one" />
      <div className="tc-hero-orb tc-hero-orb-two" />

      <div className="relative">
        <div className="tc-glass-panel px-5 py-6 text-center shadow-[0_16px_45px_rgba(0,0,0,0.35)] md:px-8">
          <h2 className="tc-title-gradient text-3xl font-extrabold sm:text-4xl md:text-5xl">
            {story?.title ?? "Plot Twist Story"}
          </h2>
          <p className="mt-2 text-blue-100/70">
            Draft depth: {activeNode?.depth ?? 0}/{MAX_DEPTH} · Status: {story?.status ?? "draft"}
          </p>
        </div>

        <div ref={bookSectionRef} className="mt-6 tc-glass-panel-soft p-4 md:p-6">
          <div className="mb-4 flex items-center justify-between text-sm text-blue-100/80">
            <span>
              {atCover
                ? `Cover / ${Math.max(totalPages, 1)} pages`
                : `Page ${Math.max(1, displayedPageIndex)} / ${Math.max(totalPages, 1)}`}
            </span>
            <button
              onClick={onEndStory}
              disabled={generatingNext || story?.status === "completed"}
              className="tc-btn-ghost px-4 py-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              End Story
            </button>
          </div>

          <div className="flex flex-col items-center">
            {/* @ts-expect-error -- react-pageflip's published props require internal defaults. */}
            <HTMLFlipBook
              key={story?.storyId}
              className="max-w-[84vw] md:max-w-[62vw] lg:max-w-[48vw]"
              width={340}
              height={620}
              showCover={true}
              useMouseEvents={false}
              ref={bookRef}
              onFlip={() => syncFlipState()}
              style={{ height: "auto", maxHeight: "auto" }}
            >
              <div className="p-0">
                <BookCoverPage imageUrl={story?.coverImage} />
              </div>
              {linearPages.map((page, index) => (
                <div key={`${story?.storyId}_${page.pageNumber}_${index}`} className="bg-white p-4 md:p-5">
                  <h3 className="text-xl font-semibold text-blue-700">{page.title}</h3>
                  <SafeStoryImage src={page.imageUrl} alt={page.title} />
                  <p className="mt-3 max-h-56 overflow-y-auto rounded-lg bg-blue-50 p-4 text-base text-slate-800">
                    {page.text}
                  </p>
                </div>
              ))}
            </HTMLFlipBook>
          </div>

          <div className="mt-5 flex w-full items-center justify-between">
            <button
              className={`tc-icon-btn p-2 ${!canFlipPrev ? "pointer-events-none opacity-40" : ""}`}
              disabled={!canFlipPrev}
              onClick={() => {
                if (!canFlipPrev) return;
                bookRef.current?.pageFlip().flipPrev();
                setTimeout(() => syncFlipState(), 90);
              }}
              aria-label="Previous page"
            >
              <IoIosArrowDropleftCircle className="text-4xl" />
            </button>
            <button
              className={`tc-icon-btn p-2 ${!canFlipNext ? "pointer-events-none opacity-40" : ""}`}
              disabled={!canFlipNext}
              onClick={() => {
                if (!canFlipNext) return;
                bookRef.current?.pageFlip().flipNext();
                setTimeout(() => syncFlipState(), 90);
              }}
              aria-label="Next page"
            >
              <IoIosArrowDroprightCircle className="text-4xl" />
            </button>
          </div>
        </div>

        <div ref={treeSectionRef} className="mt-8 tc-glass-panel-soft p-5">
          <h3 className="tc-title-gradient text-2xl font-bold">Story Tree</h3>
          <p className="mt-2 text-sm text-blue-100/70">
            Decision history in tree form. Select available branch nodes here to continue once you reach the last page.
          </p>

          <div className="mt-6 overflow-x-auto">
            <div
              className="relative mx-auto"
              style={{ minWidth: `${treeLayout.minWidth}px`, height: `${treeLayout.height}px` }}
            >
              <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                {treeGraph.edges.map((edge, edgeIndex) => {
                  const p1 = treeLayout.nodePointById.get(edge.from);
                  const p2 = treeLayout.nodePointById.get(edge.to);
                  if (!p1 || !p2) return null;
                  const midY = (p1.y + p2.y) / 2;
                  const stroke =
                    edge.status === "selected"
                      ? "rgba(34,211,238,0.9)"
                      : edge.status === "disabled"
                      ? "rgba(148,163,184,0.35)"
                      : "rgba(147,197,253,0.6)";

                  return (
                    <path
                      key={`edge_${edgeIndex}`}
                      d={`M ${p1.x},${p1.y} C ${p1.x},${midY} ${p2.x},${midY} ${p2.x},${p2.y}`}
                      stroke={stroke}
                      strokeWidth={edge.status === "selected" ? "0.45" : "0.35"}
                      fill="none"
                    />
                  );
                })}
              </svg>

              {treeGraph.nodes.map((node, index) => {
                const point = treeLayout.nodePointById.get(node.id);
                if (!point) return null;
                const nodeLabel =
                  node.label && node.label.trim().length > 0
                    ? node.label
                    : node.realNode?.choiceTaken || "Story Path";
                const isDisabled = node.status === "disabled";
                const isSelected = node.status === "selected" || node.status === "current";
                const isActiveChoiceNode =
                  node.status === "available" &&
                  node.originNodeId === activeNode?.nodeId &&
                  !generatingNext &&
                  story?.status !== "completed";

                return (
                  <div
                    key={`tree_node_${index}_${node.id}`}
                    className="absolute z-10 -translate-x-1/2 -translate-y-1/2"
                    style={{ left: `${point.x}%`, top: `${point.y}%` }}
                  >
                    <button
                      type="button"
                      disabled={!isActiveChoiceNode}
                      className={`flex w-[180px] items-center justify-center rounded-2xl border px-3 py-3 text-center text-[12px] font-semibold leading-snug shadow-[0_8px_26px_rgba(2,8,23,0.35)] transition ${
                        node.status === "current"
                          ? "border-cyan-100 bg-cyan-500 text-white"
                          : isSelected
                          ? "border-blue-100 bg-blue-600 text-white"
                          : isDisabled
                          ? "border-slate-400 bg-slate-700 text-slate-100"
                          : "border-blue-200 bg-blue-900/95 text-blue-100"
                      } ${isActiveChoiceNode ? "cursor-pointer hover:scale-[1.03]" : ""}`}
                      title={node.label}
                      onClick={() => {
                        if (!isActiveChoiceNode) return;
                        if (!atEnd) {
                          toast.info("Reach the last page to unlock this choice");
                          return;
                        }
                        onPickChoice(node.label);
                      }}
                    >
                      {nodeLabel}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-4 text-xs text-blue-100/80">
            <span className="inline-flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-blue-500" /> Chosen path
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-cyan-400" /> Current node
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-slate-500" /> Disabled branch
            </span>
          </div>
        </div>
      </div>

      <CustomLoader isLoading={loading || generatingNext} message={loaderMessage} />
    </div>
  );
};

export default InteractiveStoryPage;
