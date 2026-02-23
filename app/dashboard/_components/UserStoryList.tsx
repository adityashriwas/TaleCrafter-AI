"use client";
import { db } from "@/config/config";
import { StoryData } from "@/config/schema";
import { useUser } from "@clerk/nextjs";
import { desc, eq } from "drizzle-orm";
import React, { useCallback, useEffect, useRef, useState } from "react";
import StoryItemCard from "./StoryItemCard";

type StoryItemType = {
  id: string;
  storyType: string;
  ageGroup: string;
  storyId: string;
  storySubject: string;
  imageStyle: string;
  coverImage: string;
  userName: string;
  userImage: string;
  userEmail: string;
  output: [] | any;
};

const PAGE_SIZE = 12;
const CACHE_PREFIX = "dashboard_stories_cache_v1_";

type DashboardCache = {
  storyList: StoryItemType[];
  offset: number;
  hasMoreStories: boolean;
  scrollY: number;
};

const UserStoryList = () => {
  const user = useUser();
  const userEmail = user.user?.primaryEmailAddress?.emailAddress;
  const [storyList, setStoryList] = useState<StoryItemType[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [offset, setOffset] = useState(0);
  const [hasMoreStories, setHasMoreStories] = useState(true);
  const [isRestored, setIsRestored] = useState(false);
  const loadTriggerRef = useRef<HTMLDivElement | null>(null);
  const loadingRef = useRef(false);
  const offsetRef = useRef(0);
  const hasMoreRef = useRef(true);
  const storyListRef = useRef<StoryItemType[]>([]);
  const userEmailRef = useRef<string | undefined>(userEmail);

  const cacheKey = userEmail ? `${CACHE_PREFIX}${userEmail}` : null;

  const persistStateSnapshot = useCallback((scrollY?: number) => {
    if (!userEmailRef.current) return;
    const currentKey = `${CACHE_PREFIX}${userEmailRef.current}`;
    try {
      const cache: DashboardCache = {
        storyList: storyListRef.current,
        offset: offsetRef.current,
        hasMoreStories: hasMoreRef.current,
        scrollY: scrollY ?? window.scrollY ?? 0,
      };
      sessionStorage.setItem(currentKey, JSON.stringify(cache));
    } catch {
      // ignore storage failures
    }
  }, []);

  const getUserStory = useCallback(async (email: string, newOffset: number) => {
    if (loadingRef.current || !hasMoreRef.current) return;
    loadingRef.current = true;
    setLoading(true);

    try {
      const result: any = await db
        .select()
        .from(StoryData)
        .where(eq(StoryData.userEmail, email))
        .orderBy(desc(StoryData.id))
        .limit(PAGE_SIZE)
        .offset(newOffset);

      setOffset(newOffset);
      setStoryList((prev) => {
        const merged =
          newOffset === 0 ? (result as StoryItemType[]) : [...prev, ...result];
        const uniqueById = new Map<string, StoryItemType>();
        merged.forEach((item) => uniqueById.set(item.storyId, item));
        return Array.from(uniqueById.values());
      });
      setHasMoreStories(result.length >= PAGE_SIZE);
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadingRef.current = loading;
  }, [loading]);

  useEffect(() => {
    storyListRef.current = storyList;
  }, [storyList]);

  useEffect(() => {
    offsetRef.current = offset;
  }, [offset]);

  useEffect(() => {
    hasMoreRef.current = hasMoreStories;
  }, [hasMoreStories]);

  useEffect(() => {
    userEmailRef.current = userEmail;
  }, [userEmail]);

  useEffect(() => {
    if (!userEmail) return;
    persistStateSnapshot();
  }, [storyList, offset, hasMoreStories, userEmail, persistStateSnapshot]);

  useEffect(() => {
    if (!userEmail) {
      setStoryList([]);
      setOffset(0);
      setHasMoreStories(true);
      setIsRestored(false);
      return;
    }

    let restored = false;
    if (cacheKey) {
      try {
        const raw = sessionStorage.getItem(cacheKey);
        if (raw) {
          const parsed: DashboardCache = JSON.parse(raw);
          if (Array.isArray(parsed.storyList) && parsed.storyList.length > 0) {
            restored = true;
            setStoryList(parsed.storyList);
            setOffset(parsed.offset ?? 0);
            const inferredHasMore =
              parsed.hasMoreStories ??
              (parsed.storyList.length % PAGE_SIZE === 0);
            setHasMoreStories(inferredHasMore);
            requestAnimationFrame(() => {
              window.scrollTo({ top: parsed.scrollY ?? 0, behavior: "auto" });
            });
          }
        }
      } catch {
        // ignore invalid cache
      }
    }

    if (!restored) {
      getUserStory(userEmail, 0);
    }
    setIsRestored(true);

    const onPageHide = () => persistStateSnapshot();
    window.addEventListener("pagehide", onPageHide);
    return () => {
      persistStateSnapshot();
      window.removeEventListener("pagehide", onPageHide);
    };
  }, [userEmail, cacheKey, getUserStory, persistStateSnapshot]);

  useEffect(() => {
    if (!userEmail || !isRestored) return;
    const trigger = loadTriggerRef.current;
    if (!trigger) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (!entry?.isIntersecting) return;
        if (loadingRef.current || !hasMoreRef.current) return;
        getUserStory(userEmail, offsetRef.current + PAGE_SIZE);
      },
      { root: null, rootMargin: "220px 0px", threshold: 0.01 }
    );

    observer.observe(trigger);
    return () => observer.disconnect();
  }, [userEmail, isRestored, getUserStory]);

  useEffect(() => {
    if (!userEmail || !isRestored) return;

    const onScroll = () => {
      if (loadingRef.current || !hasMoreRef.current) return;
      const nearBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 320;
      if (nearBottom) {
        getUserStory(userEmail, offsetRef.current + PAGE_SIZE);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [userEmail, isRestored, getUserStory]);

  return (
    <div className="tc-glass-panel-soft mt-8 p-5 md:p-7">
      <h3 className="tc-title-gradient text-2xl font-bold">
        Your Library
      </h3>
      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {storyList?.length === 0 && !loading && (
          <div className="col-span-4 text-center">
            <p className="inline-flex rounded-xl border border-blue-300/20 bg-white/[0.04] px-5 py-3 text-blue-100/70">
              You have not created a story yet.
            </p>
          </div>
        )}
        {storyList?.map((item: StoryItemType) => (
          <StoryItemCard
            key={item.storyId}
            story={item}
            currentUserEmail={userEmail ?? ""}
          />
        ))}
      </div>

      <div ref={loadTriggerRef} className="h-6" />

      {loading && (
        <div className="mt-4 flex justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-400 border-t-transparent" />
        </div>
      )}

      {!hasMoreStories && storyList.length > 0 && (
        <div className="mt-8 text-center">
          <p className="inline-flex rounded-xl border border-blue-300/20 bg-white/[0.04] px-5 py-3 text-blue-100/70">
            You have reached the end of your stories.
          </p>
        </div>
      )}
    </div>
  );
};

export default UserStoryList;
