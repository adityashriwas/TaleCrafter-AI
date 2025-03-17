"use client";

import { Textarea } from "@nextui-org/react";
import React from "react";

interface SuggestionsProps {
  Suggestion: string;
}

const Suggestions: React.FC<SuggestionsProps> = ({ Suggestion }) => {
  return (
    <div>
      <label className="text-2xl sm:text-3xl lg:text-4xl block w-full bg-gradient-to-b from-white to-gray-400 bg-clip-text font-bold text-transparent">Story Ideas</label>
      <Textarea
        disabled
        value={Suggestion}
        className="mt-2 sm:w-[38vw] w-[80vw]"
        placeholder="Story Ideads are generating....."
        size="lg"
        classNames={{
          input: " resize-y min-h-[230px] mt-2 sm:p-5 p-2 text-xl sm:text-2xl",
        }}
      />
    </div>
  );
};

export default Suggestions;
