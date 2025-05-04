import React from "react";
import { useState } from "react";
import Image from "next/image";
import { OptionField } from "./StoryType";

const ImageStyle = ({ userSelection }: any) => {
  const [selectedOption, setSelectedOption] = useState<string>();

  const onUserSelect = (item: OptionField) => {
    setSelectedOption(item.label);
    userSelection({
      fieldValue: item?.label,
      fieldName: "imageStyle",
    });
  };

  const OptionList = [
    {
      label: "Water Color",
      imageUrl: "/watercolor.png",
      isFree: true,
    },
    {
      label: "Anime",
      imageUrl: "/Anime.webp",
      isFree: true,
    },
    {
      label: "3D Cartoon",
      imageUrl: "/3D.png",
      isFree: true,
    },
    {
      label: "Oil Paint",
      imageUrl: "/Oil-painting.webp",
      isFree: true,
    },
    {
      label: "Comic",
      imageUrl: "/Comic.webp",
      isFree: true,
    },
    {
      label: "Paper Cut",
      imageUrl: "/paperCut.png",
      isFree: true,
    },
    {
      label: "Pixel Art",
      imageUrl: "/pixel.png",
      isFree: true,
    },
  ];

  return (
    <div className="mt-10">
      <label className="text-2xl sm:text-3xl lg:text-4xl block w-full bg-gradient-to-b from-white to-gray-400 bg-clip-text font-bold text-transparent">
        Image Style
      </label>
      <div className="mt-5 hsb overflow-x-auto whitespace-nowrap">
        {OptionList.map((item, index) => (
          <div
            key={index}
            className={`relative hover:grayscale-0 inline-block m-1 sm:m-3 cursor-pointer ${
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
              height={100}
              className="obejct-cover rounded-3xl h-[100px] w-[100px] sm:h-[200px] sm:w-[200px]"
            />
            <h2 className="text-center tracking-tighter font-semibold text-xl sm:text-2xl block w-full bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">
              {item.label}
            </h2>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImageStyle;
