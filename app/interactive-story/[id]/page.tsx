"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { use } from "react";
import HTMLFlipBook from "react-pageflip";
import { IoIosArrowDropleftCircle, IoIosArrowDroprightCircle } from "react-icons/io";
import { toast } from "react-toastify";
import { asc, eq } from "drizzle-orm";
import uuid4 from "uuid4";
import { chatSession } from "@/config/GeminiAI";
import { dbV2 } from "@/config/configV2";
import { InteractiveStories, InteractiveStoryNodes } from "@/config/schemaV2";
import {
  buildContinuationPrompt,
  createUniqueImageUrl,
  makePageContext,
  parseContinuationPayload,
  parsePages,
  type InteractivePage,
} from "@/config/plottwist";
import { db } from "@/config/config";
import { StoryData } from "@/config/schema";
import { useRouter } from "next/navigation";
import CustomLoader from "@/app/create-story/(component)/CustomLoader";
import BookCoverPage from "@/app/view-story/_components/BookCoverPage";

const MAX_DEPTH = 7;

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
    <img
      src={src}
      alt={alt}
      className="mt-3 h-auto min-h-[260px] w-full rounded-lg bg-slate-100 object-contain"
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
};

const InteractiveStoryPage = ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = use(params);
  const router = useRouter();
  const bookRef = useRef<typeof HTMLFlipBook | null>(null);
  const choiceSectionRef = useRef<HTMLDivElement | null>(null);

  const [story, setStory] = useState<StoryRow | null>(null);
  const [nodes, setNodes] = useState<StoryNode[]>([]);
  const [loading, setLoading] = useState(false);
  const [flipPage, setFlipPage] = useState(0);
  const [generatingNext, setGeneratingNext] = useState(false);
  const [loaderMessage, setLoaderMessage] = useState("Story is generating...");

  const loadStory = async () => {
    setLoading(true);
    try {
      const storyResp: any = await dbV2
        .select()
        .from(InteractiveStories)
        .where(eq(InteractiveStories.storyId, id));

      const nodeResp: any = await dbV2
        .select()
        .from(InteractiveStoryNodes)
        .where(eq(InteractiveStoryNodes.storyId, id))
        .orderBy(asc(InteractiveStoryNodes.id));

      const foundStory = storyResp?.[0] ?? null;
      if (!foundStory) {
        toast.error("Interactive story not found");
        router.push("/dashboard");
        return;
      }

      const parsedNodes: StoryNode[] = (nodeResp ?? []).map((item: any) => ({
        nodeId: String(item.nodeId),
        storyId: String(item.storyId),
        parentNodeId: item.parentNodeId ? String(item.parentNodeId) : null,
        depth: Number(item.depth ?? 0),
        choiceTaken: item.choiceTaken ? String(item.choiceTaken) : null,
        choices: Array.isArray(item.choices) ? item.choices : null,
        selectedChoice: item.selectedChoice ? String(item.selectedChoice) : null,
        pages: Array.isArray(item.pages) ? item.pages : [],
        isActive: Boolean(item.isActive),
      }));

      setStory(foundStory);
      setNodes(parsedNodes);
    } catch {
      toast.error("Unable to load interactive story");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStory();
  }, [id]);

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
  const displayedPageIndex = Math.min(
    totalPages,
    Math.max(0, (flipPage || 0) * 2 - 1)
  );
  const atEnd = totalPages > 0 && displayedPageIndex >= totalPages;

  useEffect(() => {
    if (!atEnd || story?.status === "completed") return;
    const timer = setTimeout(() => {
      choiceSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 180);
    return () => clearTimeout(timer);
  }, [atEnd, story?.status]);

  const saveCompletedToClassicStory = async (pages: InteractivePage[], finalTitle: string) => {
    const existing: any = await db
      .select()
      .from(StoryData)
      .where(eq(StoryData.storyId, id));

    const classicOutput = {
      title: finalTitle,
      chapters: pages.map((page, index) => ({
        chapterNumber: index + 1,
        title: page.title,
        textPrompt: page.text,
        imagePrompt: page.imagePrompt,
      })),
    };

    if (!existing?.[0]) {
      await db.insert(StoryData).values({
        storyId: id,
        storySubject: story?.storySubject,
        storyType: story?.storyType,
        ageGroup: story?.ageGroup,
        imageStyle: story?.imageStyle,
        coverImage: pages[0]?.imageUrl ?? story?.coverImage,
        output: classicOutput,
        userEmail: story?.userEmail,
        userName: story?.userName,
        userImage: story?.userImage,
      });
    } else {
      await db
        .update(StoryData)
        .set({
          output: classicOutput,
          coverImage: pages[0]?.imageUrl ?? story?.coverImage,
        })
        .where(eq(StoryData.storyId, id));
    }
  };

  const completeStoryWithResolution = async (selectedChoice: string) => {
    if (!story || !activeNode) return;

    try {
      setLoaderMessage("Compiling all choices and making final book...");
      setGeneratingNext(true);

      await dbV2
        .update(InteractiveStoryNodes)
        .set({
          isActive: false,
          selectedChoice,
        })
        .where(eq(InteractiveStoryNodes.nodeId, activeNode.nodeId));

      const context = makePageContext(linearPages, 6);
      const finalPrompt = buildContinuationPrompt({
        title: story.title,
        selectedChoice,
        context,
        minPages: 3,
        maxPages: 5,
        finalResolution: true,
      });
      const finalResponse = await chatSession.sendMessage(finalPrompt);
      const parsedPages = parsePages(finalResponse.response.text());
      const resolutionPages = parsedPages.slice(0, 5);

      if (resolutionPages.length < 3) {
        throw new Error("Final resolution must have at least 3 pages");
      }

      const finalNodeId = uuid4();
      const depth = Math.min(MAX_DEPTH, Number(activeNode.depth ?? 0) + 1);
      const now = new Date();

      const mappedPages = resolutionPages.map((page, index) => ({
        ...page,
        pageNumber: totalPages + index + 1,
        imageUrl: createUniqueImageUrl(
          page.imagePrompt || page.text,
          `${Date.now()}_final_${index}_${Math.floor(Math.random() * 100000)}`
        ),
      }));

      await dbV2.insert(InteractiveStoryNodes).values({
        nodeId: finalNodeId,
        storyId: story.storyId,
        parentNodeId: activeNode.nodeId,
        depth,
        choiceTaken: selectedChoice,
        choices: null,
        selectedChoice: null,
        pages: mappedPages,
        isActive: false,
        createdAt: now,
      });

      const refreshedNodesResp: any = await dbV2
        .select()
        .from(InteractiveStoryNodes)
        .where(eq(InteractiveStoryNodes.storyId, story.storyId))
        .orderBy(asc(InteractiveStoryNodes.id));

      const refreshedNodes: StoryNode[] = (refreshedNodesResp ?? []).map((item: any) => ({
        nodeId: String(item.nodeId),
        storyId: String(item.storyId),
        parentNodeId: item.parentNodeId ? String(item.parentNodeId) : null,
        depth: Number(item.depth ?? 0),
        choiceTaken: item.choiceTaken ? String(item.choiceTaken) : null,
        choices: Array.isArray(item.choices) ? item.choices : null,
        selectedChoice: item.selectedChoice ? String(item.selectedChoice) : null,
        pages: Array.isArray(item.pages) ? item.pages : [],
        isActive: Boolean(item.isActive),
      }));

      const finalMap = new Map<string, StoryNode>();
      refreshedNodes.forEach((node) => finalMap.set(node.nodeId, node));
      const chain: StoryNode[] = [];
      let cursor: StoryNode | undefined = finalMap.get(finalNodeId);
      while (cursor) {
        chain.push(cursor);
        if (!cursor.parentNodeId) break;
        cursor = finalMap.get(cursor.parentNodeId);
      }

      const compiledPages = chain.reverse().flatMap((node) => node.pages ?? []);

      await dbV2
        .update(InteractiveStories)
        .set({
          status: "completed",
          currentNodeId: finalNodeId,
          totalPages: compiledPages.length,
          compiledPages,
          updatedAt: new Date(),
        })
        .where(eq(InteractiveStories.storyId, story.storyId));

      await saveCompletedToClassicStory(compiledPages, story.title);
      router.push(`/view-story/${story.storyId}`);
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

      await dbV2
        .update(InteractiveStoryNodes)
        .set({
          isActive: false,
          selectedChoice: choice,
        })
        .where(eq(InteractiveStoryNodes.nodeId, activeNode.nodeId));

      const context = makePageContext(linearPages, 6);
      const continuationPrompt = buildContinuationPrompt({
        title: story.title,
        selectedChoice: choice,
        context,
        minPages: 3,
        maxPages: 6,
      });

      const continuationResp = await chatSession.sendMessage(continuationPrompt);
      const payload = parseContinuationPayload(continuationResp.response.text());
      const pages = payload.pages.slice(0, 6);
      const nextChoices = payload.choices.slice(0, 2);

      if (pages.length < 3) {
        throw new Error("Each continuation must have minimum 3 pages");
      }

      const nextNodeId = uuid4();
      const now = new Date();
      const nextDepth = Number(activeNode.depth ?? 0) + 1;
      const mappedPages = pages.map((page, index) => ({
        ...page,
        pageNumber: totalPages + index + 1,
        imageUrl: createUniqueImageUrl(
          page.imagePrompt || page.text,
          `${Date.now()}_${index}_${Math.floor(Math.random() * 100000)}`
        ),
      }));

      await dbV2.insert(InteractiveStoryNodes).values({
        nodeId: nextNodeId,
        storyId: story.storyId,
        parentNodeId: activeNode.nodeId,
        depth: nextDepth,
        choiceTaken: choice,
        choices:
          nextChoices.length >= 2
            ? nextChoices
            : ["Take the hopeful next step", "Risk a bold unknown path"],
        selectedChoice: null,
        pages: mappedPages,
        isActive: true,
        createdAt: now,
      });

      await dbV2
        .update(InteractiveStories)
        .set({
          currentNodeId: nextNodeId,
          totalPages: totalPages + mappedPages.length,
          updatedAt: new Date(),
        })
        .where(eq(InteractiveStories.storyId, story.storyId));

      await loadStory();
      setFlipPage(0);
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

  const choiceOptions = activeNode?.choices?.slice(0, 2) ?? [];
  const selectedChoice = activeNode?.selectedChoice ?? null;

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
        const isChosenBranch = chosenDir === choiceIndex && Boolean(nextNode);
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

  const getNodePoint = (depth: number, pos: number, maxDepth: number) => {
    const slots = Math.max(1, 2 ** depth);
    const x = ((pos + 0.5) / slots) * 100;
    const y = maxDepth === 0 ? 50 : 8 + (depth / maxDepth) * 84;
    return { x, y };
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#020b1f] px-5 py-8 md:px-16 lg:px-28 xl:px-40">
      <div className="tc-hero-grid absolute inset-0 opacity-35" />
      <div className="tc-hero-orb tc-hero-orb-one" />
      <div className="tc-hero-orb tc-hero-orb-two" />

      <div className="relative">
        <div className="tc-glass-panel px-5 py-6 text-center shadow-[0_16px_45px_rgba(0,0,0,0.35)] md:px-8">
          <h2 className="tc-title-gradient text-3xl font-extrabold sm:text-4xl md:text-5xl">
            {story?.title ?? "Interactive Story"}
          </h2>
          <p className="mt-2 text-blue-100/70">
            Draft depth: {activeNode?.depth ?? 0}/{MAX_DEPTH} · Status: {story?.status ?? "draft"}
          </p>
        </div>

        <div className="mt-6 tc-glass-panel-soft p-4 md:p-6">
          <div className="mb-4 flex items-center justify-between text-sm text-blue-100/80">
            <span>
              {flipPage === 0
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
            {/* @ts-ignore */}
            <HTMLFlipBook
              key={story?.storyId}
              className="max-w-[84vw] md:max-w-[62vw] lg:max-w-[48vw]"
              width={340}
              height={620}
              showCover={true}
              useMouseEvents={false}
              ref={bookRef}
              onFlip={(event: any) => setFlipPage(Number(event?.data ?? 0))}
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
              className="tc-icon-btn p-2"
              onClick={() => {
                // @ts-ignore
                bookRef.current?.pageFlip().flipPrev();
              }}
              aria-label="Previous page"
            >
              <IoIosArrowDropleftCircle className="text-4xl" />
            </button>
            <button
              className="tc-icon-btn p-2"
              onClick={() => {
                // @ts-ignore
                bookRef.current?.pageFlip().flipNext();
              }}
              aria-label="Next page"
            >
              <IoIosArrowDroprightCircle className="text-4xl" />
            </button>
          </div>
        </div>

        {atEnd && story?.status !== "completed" && (
          <div ref={choiceSectionRef} className="mt-8 tc-glass-panel-soft p-5 md:p-6">
            <h3 className="tc-title-gradient text-2xl font-bold">Choose what happens next</h3>

            <div className="mt-3 text-sm text-blue-100/70">
              Non-selected branch will be locked permanently.
            </div>

            <div className="relative mt-7">
              <svg className="pointer-events-none absolute inset-0 h-[130px] w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <path d="M 50,8 C 40,28 30,45 18,70" stroke="rgba(147,197,253,0.7)" strokeWidth="1.4" fill="none" />
                <path d="M 50,8 C 60,28 70,45 82,70" stroke="rgba(147,197,253,0.7)" strokeWidth="1.4" fill="none" />
              </svg>

              <div className="mx-auto mb-8 flex h-9 w-9 items-center justify-center rounded-full border border-blue-300/30 bg-blue-400/20 text-xs font-bold text-blue-100">
                {Math.min((activeNode?.depth ?? 0) + 1, MAX_DEPTH)}
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {[0, 1].map((index) => {
                  const choice = choiceOptions[index];
                  const disabled = !choice || generatingNext || Boolean(selectedChoice && selectedChoice !== choice);
                  const isChosen = selectedChoice === choice;

                  return (
                    <button
                      key={`choice_${index}_${choice ?? "empty"}`}
                      onClick={() => choice && onPickChoice(choice)}
                      disabled={disabled}
                      className={`rounded-xl border p-4 text-left transition ${
                        isChosen
                          ? "border-cyan-300/45 bg-cyan-400/20 text-white"
                          : "border-blue-300/20 bg-white/5 text-blue-100 hover:bg-white/10"
                      } ${disabled && !isChosen ? "opacity-40" : ""}`}
                    >
                      <p className="text-xs uppercase tracking-wide text-blue-100/70">Choice {index + 1}</p>
                      <p className="mt-2 text-base font-semibold">{choice ?? "Generating option..."}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 tc-glass-panel-soft p-5">
          <h3 className="tc-title-gradient text-2xl font-bold">Story Tree</h3>
          <p className="mt-2 text-sm text-blue-100/70">
            Decision history in tree form. Blue/cyan nodes represent active path, dim nodes are disabled branches.
          </p>

          <div className="mt-6 overflow-x-auto">
            <div className="relative mx-auto h-[520px] min-w-[820px]">
              <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                {treeGraph.edges.map((edge, edgeIndex) => {
                  const from = treeGraph.nodes.find((node) => node.id === edge.from);
                  const to = treeGraph.nodes.find((node) => node.id === edge.to);
                  if (!from || !to) return null;

                  const p1 = getNodePoint(from.depth, from.pos, treeGraph.maxDepth);
                  const p2 = getNodePoint(to.depth, to.pos, treeGraph.maxDepth);
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
                const point = getNodePoint(node.depth, node.pos, treeGraph.maxDepth);
                const nodeLabel =
                  node.label && node.label.trim().length > 0
                    ? node.label
                    : node.realNode?.choiceTaken || "Story Path";
                const isDisabled = node.status === "disabled";
                const isSelected = node.status === "selected" || node.status === "current";
                const isClickableChoiceNode =
                  node.status === "available" &&
                  node.originNodeId === activeNode?.nodeId &&
                  atEnd &&
                  !generatingNext &&
                  story?.status !== "completed";

                return (
                  <div
                    key={`tree_node_${index}_${node.id}`}
                    className="absolute z-10 -translate-x-1/2 -translate-y-1/2"
                    style={{ left: `${point.x}%`, top: `${point.y}%` }}
                  >
                    <div
                      className={`flex min-w-[120px] max-w-[180px] items-center justify-center rounded-xl border px-3 py-2 text-center text-[11px] font-semibold leading-tight shadow-lg ${
                        node.status === "current"
                          ? "border-cyan-100 bg-cyan-500 text-white"
                          : isSelected
                          ? "border-blue-100 bg-blue-600 text-white"
                          : isDisabled
                          ? "border-slate-400 bg-slate-700 text-slate-100"
                          : "border-blue-200 bg-blue-900 text-blue-100"
                      } ${isClickableChoiceNode ? "cursor-pointer hover:scale-[1.03]" : ""}`}
                      title={node.label}
                      onClick={() => {
                        if (!isClickableChoiceNode) return;
                        onPickChoice(node.label);
                      }}
                    >
                      {nodeLabel}
                    </div>
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
