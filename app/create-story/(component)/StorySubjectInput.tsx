"use client";

import React from "react";

const StorySubjectInput = ({ userSelection }: any) => {
  return (
    <div>
      <label className="text-2xl sm:text-3xl lg:text-4xl block w-full bg-gradient-to-b from-white to-gray-400 bg-clip-text font-bold text-transparent">
        Your Imagination
      </label>
      <textarea
        className="w-full mt-2 px-4 py-2 text-md text-xl min-h-28 text-white bg-[#1c0f2b] border border-purple-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 transition-all"
        placeholder="Enter the subject of the story or pick an image to generate a story"
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
