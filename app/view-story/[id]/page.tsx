"use client";
import { db } from "@/config/config";
import { StoryData } from "@/config/schema";
import { eq } from "drizzle-orm";
import React, { useEffect, useRef, useState } from "react";
import HTMLFlipBook from "react-pageflip";
import BookCoverPage from "../_components/BookCoverPage";
import StoryPages from "../_components/StoryPages";
import LastPage from "../_components/LastPage";
import { Button } from "@nextui-org/button";
import { IoIosArrowDroprightCircle } from "react-icons/io";
import { IoIosArrowDropleftCircle } from "react-icons/io";
import {use} from "react";

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
  return (
    <div className="p-10 md:px-20 lg:px-40 flex items-center bg-[#0C0414] justify-evenly flex-col overflow-hidden"> 
      <h2 className="font-bold text-3xl sm:text-4xl text-center py-4 min-w-full rounded-2xl bg-primary text-white">
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

      <div className="w-full flex justify-between mt-2 p-4 sm:px-40">
        { count!=0 && <div className=""
        onClick={()=>{
          // @ts-ignore
          bookRef.current.pageFlip().flipPrev();
          setCount(count-1);
        }}
        >
        <IoIosArrowDropleftCircle className="text-4xl cursor-pointer"/>
        </div>}
      
        { count != (story?.output.chapters?.length-1) && <div className="" 
        onClick={()=>{
          // @ts-ignore
          bookRef.current.pageFlip().flipNext();
          setCount(count+1);
        }}
        >
        <IoIosArrowDroprightCircle className="text-4xl cursor-pointer"/>
        </div>}
        </div>
        

    </div>
  );
}

export default ViewStory;
