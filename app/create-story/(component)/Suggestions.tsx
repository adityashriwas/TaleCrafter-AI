"use client";

import { Textarea } from "@nextui-org/react";
import React from "react";

interface SuggestionsProps {
  Suggestion: string;
}

const Suggestions: React.FC<SuggestionsProps> = ({ Suggestion }) => {
  return (
    <div>
      <label className="text-2xl sm:text-3xl lg:text-4xl">Story Ideas</label>
      <Textarea
        disabled
        value={Suggestion}
        className="mt-2 sm:w-[35vw] w-[80vw]"
        placeholder="Story Ideads are generating....."
        size="lg"
        classNames={{
          input: " resize-y min-h-[230px] mt-2 p-5 text-2xl",
        }}
      />
    </div>
  );
};

export default Suggestions;
