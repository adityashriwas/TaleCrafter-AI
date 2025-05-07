import React from "react";
import { useState } from "react";
import Image from "next/image";
import { OptionField } from "./StoryType";

const AgeCategory = ({ userSelection }: any) => {
  const [selectedOption, setSelectedOption] = useState<string>();

  const onUserSelect = (item: OptionField) => {
    setSelectedOption(item.label);
    userSelection({
      fieldValue: item?.label,
      fieldName: "ageCategory",
    });
  };

  const OptionList = [
    {
      label: "Mature",
      imageUrl: "/adult.webp",
      isFree: true,
    },
    {
      label: "Teen",
      imageUrl: "/teen.webp",
      isFree: true,
    },
    {
      label: "Pre Teen",
      imageUrl: "/pre-teens.webp",
      isFree: true,
    },
    {
      label: "Kids",
      imageUrl: "/kids.webp",
      isFree: true,
    },
    {
      label: "Toddler",
      imageUrl: "/toddler.webp",
      isFree: true,
    }
  ];

  return (
    <div className="mt-5">
      <label className="text-2xl sm:text-3xl lg:text-4xl block w-full bg-gradient-to-b from-white to-gray-400 bg-clip-text font-bold text-transparent">
        Age Category
      </label>
      <div className="mt-5 hsb overflow-x-auto whitespace-nowrap">
        {OptionList.map((item, index) => (
          <div
            key={index}
            className={`relative hover:grayscale-0 inline-block m-2 sm:m-5 cursor-pointer ${
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
            <h2 className="text-center tracking-tighter font-semibold text-xl sm:text-2xl block w-full bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">
              {item.label}
            </h2>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AgeCategory;
