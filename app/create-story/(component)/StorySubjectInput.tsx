"use client";

import { Textarea } from "@nextui-org/react";
import React from "react";

const StorySubjectInput = ({ userSelection }: any) => {
  return (
    <div>
      <label className="text-2xl sm:text-3xl lg:text-4xl block w-full bg-gradient-to-b from-white to-gray-400 bg-clip-text font-bold text-transparent">Subject of the story</label>
      <Textarea
        className="mt-2 w-full"
        placeholder="Enter the subject of the story or pick an image to generate a story"
        classNames={{
          input: "mt-2 sm:p-2 p-1 sm:text-2xl bg-transparent",
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