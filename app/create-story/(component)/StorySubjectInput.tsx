"use client";

import { Textarea } from "@nextui-org/react";
import React from "react";

const StorySubjectInput = ({ userSelection }: any) => {
  return (
    <div>
      <label className="text-2xl sm:text-3xl lg:text-4xl block w-full bg-gradient-to-b from-white to-gray-400 bg-clip-text font-bold text-transparent">Subject of the story</label>
      <Textarea
        className="mt-2 sm:w-[39vw] w-[80vw]"
        placeholder="Enter the subject of the story you want to create"
        size="lg"
        classNames={{
          input: " resize-y min-h-[230px] mt-2 p-5 text-2xl",
        }}
        onChange={(e) =>
          userSelection({
            fieldValue: e.target.value,
            fieldName: "storySubject",
          })
        }
      />
    </div>
  );
};

export default StorySubjectInput;
