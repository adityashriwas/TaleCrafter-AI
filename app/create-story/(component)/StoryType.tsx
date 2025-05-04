"use client";
import React, { useState } from "react";
import Image from "next/image";

export interface OptionField {
  label: string;
  imageUrl: string;
  isFree: boolean;
}

const StoryType = ({ userSelection }: any) => {
  const [selectedOption, setSelectedOption] = useState<string>();

  const onUserSelect = (item: OptionField) => {
    setSelectedOption(item.label);
    userSelection({
      fieldValue: item?.label,
      fieldName: "storyType",
    });
  };

  const OptionList = [
    {
      label: "Horror",
      imageUrl: "/Horror.webp",
      isFree: true,
    },
    {
      label: "Mythology",
      imageUrl: "/mythology.webp",
      isFree: true,
    },
    {
      label: "Fantasy",
      imageUrl: "/fantasy.webp",
      isFree: true,
    },
    {
      label: "Crime",
      imageUrl: "/Crime-Thriller.webp",
      isFree: true,
    },
    {
      label: "Sci-fi",
      imageUrl: "/sci-fi.webp",
      isFree: true,
    },
    {
      label: "History",
      imageUrl: "/History.webp",
      isFree: true,
    },
    {
      label: "Motivational",
      imageUrl: "/motivational.webp",
      isFree: true,
    },
    {
      label: "Educational",
      imageUrl: "/educational.webp",
      isFree: true,
    },
    {
      label: "Romantic",
      imageUrl: "/Romance.webp",
      isFree: true,
    },
  ];

  return (
    <div className="mt-10">
      <label className="text-2xl sm:text-3xl lg:text-4xl block w-full bg-gradient-to-b from-white to-gray-400 bg-clip-text font-bold text-transparent">
        Story Genres
      </label>
      <div className="mt-5 hsb overflow-x-auto whitespace-nowrap">
        {OptionList.map((item, index) => (
          <div
            key={index}
            className={`relative hover:grayscale-0 m-1 p-1 sm:m-3 inline-block cursor-pointer ${
              selectedOption === item.label
                ? "border-medium rounded-3xl border-gray-400"
                : ""
            }`}
            onClick={() => onUserSelect(item)}
          >
            <Image
              src={item.imageUrl}
              alt={item.label}
              width={200}
              height={200}
              className="obejct-cover rounded-3xl h-[100px] w-[100px] sm:h-[200px] sm:w-[200px]"
            />
            <h2 className="tracking-tighter font-semibold text-xl sm:text-2xl text-center block w-full bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">
              {item.label}
            </h2>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StoryType;
