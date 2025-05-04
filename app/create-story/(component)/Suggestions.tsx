"use client";

import React from "react";

interface SuggestionsProps {
  Suggestion: string;
  text: string;
}

const Suggestions: React.FC<SuggestionsProps> = ({ Suggestion, text }) => {
  return (
    <div>
      <label className="text-2xl sm:text-3xl lg:text-4xl block w-full bg-gradient-to-b from-white to-gray-400 bg-clip-text font-bold text-transparent">AI Generated Ideas</label>
      <textarea
        disabled
        value={text ? text : Suggestion}
        className="mt-2 w-full px-4 py-2 text-md text-xl h-28 sm:h-full text-white bg-[#1c0f2b] border border-purple-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 transition-all"
        placeholder="Story Ideads are generating....."
      />
    </div>
  );
};

export default Suggestions;