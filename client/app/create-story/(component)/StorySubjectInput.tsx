"use client";
import type { StorySelectionProps } from "@/types/story";

const StorySubjectInput = ({ userSelection }: StorySelectionProps) => {
  return (
    <div>
      <label
        htmlFor="story-subject"
        className="tc-title-gradient text-2xl sm:text-3xl lg:text-4xl block w-full font-bold"
      >
        Your Imagination
      </label>
      <textarea
        id="story-subject"
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
