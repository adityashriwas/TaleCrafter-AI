"use client"
import { Button } from "@nextui-org/button";
import Image from "next/image";
import React from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";

const Hero = () => {
  const { user, isSignedIn } = useUser();
  return (
    <div className="px-4 md:px-28 lg:px-44 mt-[20vh] bg-[#0C0414]">
      <div className="flex flex-col justify-center items-center">
          <h2 className="text-4xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold py-6 leading-none text-center">
            Convert your thoughts into stories with TaleCrafter AI✨
          </h2>
          <p className="px-8 sm:px-40 leading-none sm:leading-6 sm:text-xl tracking-tight mb-8 text-center">Unleash your imagination with TaleCrafter AI – the ultimate AI-powered storytelling platform! Create captivating stories tailored to your preferred age group, genre, and theme, complete with stunning AI-generated visuals and immersive text-to-speech narration. Whether you're a writer, educator, or storyteller, bring your ideas to life effortlessly. Start crafting your unique story today!</p>
          <div className="flex flex-row space-x-4">
          <Link href="/create-story">
            <Button color="primary" className="size-10 p-4 sm:size-full">
              Create Story
            </Button>
          </Link>
          <Link href={"/dashboard"}>
          <Button color="primary" className="size-10 p-4 sm:size-full">
            {" "}
           {isSignedIn ? "Dashboard" : "Get Started"}
           </Button>
         </Link>
          </div>
      </div>
    </div>
  );
};

export default Hero;
