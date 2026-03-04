"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { use } from "react";
import HTMLFlipBook from "react-pageflip";
import { IoIosArrowDropleftCircle, IoIosArrowDroprightCircle } from "react-icons/io";
import { toast } from "react-toastify";
import { and, asc, eq } from "drizzle-orm";
import uuid4 from "uuid4";
import { chatSession } from "@/config/GeminiAI";
import { dbV2 } from "@/config/configV2";
import { InteractiveStories, InteractiveStoryNodes } from "@/config/schemaV2";
import {
  buildChoicePrompt,
  buildContinuationPrompt,
  createUniqueImageUrl,
  makePageContext,
  parseChoices,
  parsePages,
  type InteractivePage,
} from "@/config/plottwist";
import { db } from "@/config/config";
import { StoryData } from "@/config/schema";
import { useRouter } from "next/navigation";
import CustomLoader from "@/app/create-story/(component)/CustomLoader";

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

const InteractiveStoryPage = ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = use(params);
  const router = useRouter();
  const bookRef = useRef<typeof HTMLFlipBook | null>(null);

  const [story, setStory] = useState<StoryRow | null>(null);
  const [nodes, setNodes] = useState<StoryNode[]>([]);
  const [loading, setLoading] = useState(false);
  const [flipPage, setFlipPage] = useState(0);
  const [generatingNext, setGeneratingNext] = useState(false);

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
  const displayedPageIndex = Math.min(totalPages, Math.max(1, flipPage * 2 || 1));
  const atEnd = totalPages > 0 && displayedPageIndex >= totalPages;

  const ensureChoices = async () => {
    if (!story || !activeNode || activeNode.depth >= MAX_DEPTH || activeNode.choices?.length === 2) {
      return;
    }

    try {
      setGeneratingNext(true);
      const context = makePageContext(linearPages);
      const choicePrompt = buildChoicePrompt(context);
      const choiceResponse = await chatSession.sendMessage(choicePrompt);
      const choices = parseChoices(choiceResponse.response.text());

      if (choices.length < 2) {
        throw new Error("Could not generate two choices");
      }

      await dbV2
        .update(InteractiveStoryNodes)
        .set({ choices })
        .where(eq(InteractiveStoryNodes.nodeId, activeNode.nodeId));

      await loadStory();
    } catch {
      toast.error("Unable to generate choices right now");
    } finally {
      setGeneratingNext(false);
    }
  };

  useEffect(() => {
    if (atEnd) {
      ensureChoices();
    }
  }, [atEnd, activeNode?.nodeId]);

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
      const parsedPages = parsePages(continuationResp.response.text());
      const pages = parsedPages.slice(0, 6);

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
        choices: null,
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
              Page {displayedPageIndex} / {Math.max(totalPages, 1)}
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
              showCover={false}
              useMouseEvents={false}
              ref={bookRef}
              onFlip={(event: any) => setFlipPage(Number(event?.data ?? 0))}
              style={{ height: "auto", maxHeight: "auto" }}
            >
              {linearPages.map((page, index) => (
                <div key={`${story?.storyId}_${page.pageNumber}_${index}`} className="bg-white p-4 md:p-5">
                  <h3 className="text-xl font-semibold text-blue-700">{page.title}</h3>
                  <img
                    src={page.imageUrl}
                    alt={page.title}
                    className="mt-3 h-auto w-full rounded-lg bg-slate-100 object-contain"
                    loading="lazy"
                  />
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
          <div className="mt-8 tc-glass-panel-soft p-5 md:p-6">
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
          <h3 className="tc-title-gradient text-2xl font-bold">Story Path</h3>
          <div className="mt-5 space-y-4">
            {linearNodes.map((node, index) => (
              <div key={node.nodeId} className="relative rounded-xl border border-blue-300/20 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-wide text-blue-100/70">Node depth {node.depth}</p>
                {node.choiceTaken && <p className="mt-1 text-sm text-cyan-100">Taken choice: {node.choiceTaken}</p>}
                {node.selectedChoice && <p className="mt-1 text-sm text-blue-100/80">Locked branch: {node.selectedChoice}</p>}
                <p className="mt-2 text-sm text-blue-100/75">Pages in node: {node.pages?.length ?? 0}</p>
                {index < linearNodes.length - 1 && (
                  <svg className="pointer-events-none absolute left-1/2 top-full h-10 w-8 -translate-x-1/2" viewBox="0 0 40 40" preserveAspectRatio="none">
                    <path d="M 20,2 C 25,14 15,26 20,38" stroke="rgba(147,197,253,0.7)" strokeWidth="2" fill="none" />
                  </svg>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <CustomLoader isLoading={loading || generatingNext} />
    </div>
  );
};

export default InteractiveStoryPage;
