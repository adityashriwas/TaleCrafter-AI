"use client";
import { db } from "@/config/config";
import { StoryData } from "@/config/schema";
import { useUser } from "@clerk/nextjs";
import { desc, eq } from "drizzle-orm";
import React, { useEffect, useState } from "react";
import StoryItemCard from "./StoryItemCard";
import CustomLoader from "@/app/create-story/(component)/CustomLoader";

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
  const [storyList, setStoryList] = useState<StoryItemType[]>();
  const [loading, setLoading] = useState<boolean>(false);
  useEffect(() => {
    user && getUserStory();
  }, [user]);

  const getUserStory = async () => {
    // setLoading(true)
    const result: any = await db
      .select()
      .from(StoryData)
      .where(
        eq(
          StoryData.userEmail,
          user.user?.primaryEmailAddress?.emailAddress ?? ""
        )
      )
      .orderBy(desc(StoryData.id));
    setStoryList(result);
    // setLoading(false)
  };

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10 mt-10">
        {storyList &&
          storyList.map((item: StoryItemType, index: number) => (
            <StoryItemCard key={index} story={item} />
          ))}
      </div>
      <CustomLoader isLoading={loading} />
    </div>
  );
};

export default UserStoryList;
