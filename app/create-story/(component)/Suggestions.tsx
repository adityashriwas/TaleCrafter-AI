"use client";

import { Textarea } from "@nextui-org/react";
import React from "react";

interface SuggestionsProps {
  Suggestion: string;
  text: string;
}

const Suggestions: React.FC<SuggestionsProps> = ({ Suggestion, text }) => {
  return (
    <div>
      <label className="text-2xl sm:text-3xl lg:text-4xl block w-full bg-gradient-to-b from-white to-gray-400 bg-clip-text font-bold text-transparent">AI Generated Ideas</label>
      <Textarea
        disabled
        value={text ? text : Suggestion}
        className="mt-2 w-full"
        placeholder="Story Ideads are generating....."
        classNames={{
          input: "mt-2 sm:p-2 p-1 sm:text-2xl bg-transparent",
        }}
      />
    </div>
  );
};

export default Suggestions;
