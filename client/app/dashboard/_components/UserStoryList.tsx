"use client";
import { useAuth, useUser } from "@clerk/nextjs";
import { useCallback, useEffect, useRef, useState } from "react";
import StoryItemCard from "./StoryItemCard";
import { apiFetch } from "@/lib/api-client";
import type { StoryItem } from "@/types/story";

const PAGE_SIZE = 12;
const CACHE_PREFIX = "dashboard_stories_cache_v1_";

type DashboardCache = {
  storyList: StoryItem[];
  offset: number;
  hasMoreStories: boolean;
  scrollY: number;
};

const UserStoryList = () => {
  const user = useUser();
  const { getToken } = useAuth();
  const userEmail = user.user?.primaryEmailAddress?.emailAddress;
  const [storyList, setStoryList] = useState<StoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [offset, setOffset] = useState(0);
  const [hasMoreStories, setHasMoreStories] = useState(true);
  const [isRestored, setIsRestored] = useState(false);
  const loadTriggerRef = useRef<HTMLDivElement | null>(null);
  const loadingRef = useRef(false);
  const offsetRef = useRef(0);
  const hasMoreRef = useRef(true);
  const storyListRef = useRef<StoryItem[]>([]);
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

  const getUserStory = useCallback(async (_email: string, newOffset: number) => {
    if (loadingRef.current || !hasMoreRef.current) return;
    loadingRef.current = true;
    setLoading(true);

    try {
      const token = await getToken();
      const result = await apiFetch<StoryItem[]>(`/stories/me?limit=${PAGE_SIZE}&offset=${newOffset}`, { token });

      setOffset(newOffset);
      setStoryList((prev) => {
        const merged =
          newOffset === 0 ? result : [...prev, ...result];
        const uniqueById = new Map<string, StoryItem>();
        merged.forEach((item) => uniqueById.set(item.storyId, item));
        return Array.from(uniqueById.values());
      });
      setHasMoreStories(result.length >= PAGE_SIZE);
    } catch {
      setHasMoreStories(false);
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, [getToken]);

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

  const handleStoryDeleted = (storyId: string) => {
    setStoryList((prev) => prev.filter((item) => item.storyId !== storyId));
  };

  return (
    <div className="tc-glass-panel-soft mt-8 p-5 md:p-7">
      <h3 className="tc-title-gradient text-2xl font-bold">
        Your Library
      </h3>
      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {storyList?.length === 0 && !loading && (
          <div className="col-span-4">
            <p className="text-blue-100/70">
              You have not created a story yet.
            </p>
          </div>
        )}
        {storyList?.map((item: StoryItem) => (
          <StoryItemCard
            key={item.storyId}
            story={item}
            currentUserEmail={userEmail ?? ""}
            onDeleteSuccess={handleStoryDeleted}
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
        <div className="mt-8">
          <p className="text-blue-100/70">
            You have reached the end of your stories.
          </p>
        </div>
      )}
    </div>
  );
};

export default UserStoryList;
