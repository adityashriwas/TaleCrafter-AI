"use client";

import { Textarea } from "@nextui-org/react";
import React from "react";

const Suggestions = () => {
  return (
    <div>
      <label className="text-2xl sm:text-3xl lg:text-4xl">Suggestions</label>
      <Textarea
        disabled
        className="mt-2 sm:w-[35vw] w-[80vw]"
        placeholder="Suggestions for the story you want to create"
        size="lg"
        classNames={{
          input: " resize-y min-h-[230px] mt-2 p-5 text-2xl",
        }}
      />
    </div>
  );
};

export default Suggestions;
