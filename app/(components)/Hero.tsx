import { Button } from "@nextui-org/button";
import Image from "next/image";
import React from "react";
import Link from "next/link";

const Hero = () => {
  return (
    <div className="px-10 md:px-28 lg:px-44 mt-[20vh] bg-[#0C0414]">
      <div className="flex sm:flex-col md:flex-row justify-center">
        <div>
          <h2 className="text-[7vw] text-extrabold py-10 leading-none">
            Convert your thoughts into stories✨
          </h2>
          <Link href="/create-story">
            <Button color="primary" size="lg">
              Create Story
            </Button>
          </Link>
        </div>
        <div className="w-[90vw]">
          <Image className="w-full" src={"/Hero_img.png"} alt="img" height={700} width={800} />
        </div>
      </div>
    </div>
  );
};

export default Hero;
