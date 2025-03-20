"use client";
import { db } from "@/config/config";
import { StoryData } from "@/config/schema";
import { eq } from "drizzle-orm";
import React, { useEffect, useRef, useState } from "react";
import HTMLFlipBook from "react-pageflip";
import BookCoverPage from "../_components/BookCoverPage";
import StoryPages from "../_components/StoryPages";
import LastPage from "../_components/shareButton";
import { Button } from "@nextui-org/button";
import { IoIosArrowDroprightCircle } from "react-icons/io";
import { IoIosArrowDropleftCircle } from "react-icons/io";
import {use} from "react";
import ShareButton from "../_components/shareButton";

function ViewStory({ params }: { params: Promise<{ id: any }> }){
  const { id } = use(params); 
  const bookRef = useRef();
  const [story, setStory] = useState<any>();
  const [count, setCount] = useState(0);
  useEffect(() => {
    // console.log(params.id);
    getStory();
  }, []);

  const getStory = async () => {
    const result = await db
      .select()
      .from(StoryData)
      .where(eq(StoryData.storyId, id));
    console.log(result[0]);
    setStory(result[0]);
  };

  // share story
  const storyUrl = typeof window !== "undefined" ? window.location.href : "";

  return (
    <div className="min-h-screen p-10 md:px-20 lg:px-40 flex items-center bg-gradient-to-br from-black via-[#0a0f25] to-[#071340] justify-evenly flex-col overflow-hidden"> 
      <h2 className="text-3xl sm:text-4xl text-center py-4 min-w-full rounded-2xl border border-neutral-800 bg-neutral-900/50 p-8 shadow block bg-gradient-to-b from-white to-gray-400 bg-clip-text font-bold text-transparent">
        {story?.output?.title}
      </h2>
      {/* @ts-ignore */}
      <HTMLFlipBook className="mt-10 max-w-[80vw] sm:max-w-[80vw] md:max-w-[60vw] lg:max-w-[50vw]" width={330} height={620}
      showCover={true}
      useMouseEvents={false}
      ref={bookRef}
      style={{ height: 'auto', maxHeight: 'auto' }}
      >
        <div>
          <BookCoverPage imageUrl={story?.coverImage} />
        </div>
        {
          [...Array(story?.output?.chapters?.length)].map((item, index)=>(
            <div key={index} className="bg-white p-4 md:p-5 border">
              <StoryPages storyChapter={story?.output?.chapters[index]} imagePrompt={story?.output.chapters[index].imagePrompt?.replace(
        /\s+/g,
        "-"
      )}/>
            </div>
          ))
        } 
      </HTMLFlipBook>

      <div className="w-full flex justify-between items-center mt-2 p-4 sm:px-40">
        { count!=0 && <div className=""
        onClick={()=>{
          // @ts-ignore
          bookRef.current.pageFlip().flipPrev();
          setCount(count-1);
        }}
        >
        <IoIosArrowDropleftCircle className="text-4xl cursor-pointer text-gray-300"/>
        </div>}
        <ShareButton storyTitle={story?.output?.title} storyUrl={storyUrl}/>       
      
        { count != (story?.output.chapters?.length-1) && <div className="" 
        onClick={()=>{
          // @ts-ignore
          bookRef.current.pageFlip().flipNext();
          setCount(count+1);
        }}
        >
        <IoIosArrowDroprightCircle className="text-4xl cursor-pointer text-gray-300"/>
        </div>}
        </div>
        

    </div>
  );
}

export default ViewStory;
