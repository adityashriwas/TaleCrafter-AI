"use client";
import { db } from "@/config/config";
import { StoryData } from "@/config/schema";
import { useUser } from "@clerk/nextjs";
import { desc, eq } from "drizzle-orm";
import React, { useEffect, useState } from "react";
import StoryItemCard from "./StoryItemCard";
import CustomLoader from "@/app/explore/CustomLoader";

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

const UserStoryList = () => {
  const user = useUser();
  const userEmail = user.user?.primaryEmailAddress?.emailAddress;
  const [storyList, setStoryList] = useState<StoryItemType[]>();
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!userEmail) {
      setStoryList([]);
      return;
    }
    getUserStory(userEmail);
  }, [userEmail]);

  const getUserStory = async (email: string) => {
    setLoading(true);
    const result: any = await db
      .select()
      .from(StoryData)
      .where(eq(StoryData.userEmail, email))
      .orderBy(desc(StoryData.id));
    setStoryList(result);
    setLoading(false);
  };

  return (
    <div className="mt-8 rounded-2xl border border-blue-300/20 bg-white/[0.04] p-5 backdrop-blur-sm md:p-7">
      <h3 className="bg-gradient-to-b from-white via-blue-100 to-blue-300 bg-clip-text text-2xl font-bold text-transparent">
        Your Library
      </h3>
      {loading ? (
        <div className="mt-8 flex justify-center">
          <CustomLoader isLoading={loading} />
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {storyList?.length === 0 && (
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
              currentUserEmail={
                user?.user?.primaryEmailAddress?.emailAddress ?? ""
              }
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default UserStoryList;
