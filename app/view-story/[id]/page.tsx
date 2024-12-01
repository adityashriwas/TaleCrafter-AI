"use client";
import { db } from "@/config/config";
import { StoryData } from "@/config/schema";
import { eq } from "drizzle-orm";
import React, { useEffect, useState } from "react";
import HTMLFlipBook from "react-pageflip";
import BookCoverPage from "../_components/BookCoverPage";
import StoryPages from "../_components/StoryPages";
import LastPage from "../_components/LastPage";

function ViewStory({ params }: any) {
  const [story, setStory] = useState<any>();
  useEffect(() => {
    console.log(params.id);
    getStory();
  }, []);

  const getStory = async () => {
    const result = await db
      .select()
      .from(StoryData)
      .where(eq(StoryData.storyId, params.id));
    console.log(result[0]);
    setStory(result[0]);
  };
  return (
    <div className="p-10 md:px-20 lg:px-40">
      <h2 className="font-bold text-4xl text-center p-10 bg-primary text-white">
        {story?.output?.title}
      </h2>
      {/* @ts-ignore */}
      <HTMLFlipBook showCover={true} className="mt-10" width={500} height={500}>
        <div>
          <BookCoverPage imageUrl={story?.coverImage} />
        </div>
        {
          [...Array(story?.output?.chapters?.length)].map((item, index)=>(
            <div key={index} className="bg-white p-10 border">
              <StoryPages storyChapter={story?.output?.chapters[index]}/>
            </div>
          ))
        }
        {/* <div>
          <LastPage/>
        </div> */}
      </HTMLFlipBook>
    </div>
  );
}

export default ViewStory;
