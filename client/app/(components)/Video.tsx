"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef } from "react";

const Video = () => {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        const video = ref.current;
        if (video) video.load();
      }
    });

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="mb-14 flex flex-col gap-6 text-center">
      <h2 className="tc-title-gradient block w-full text-center text-2xl font-bold drop-shadow-lg sm:text-4xl">
        How to Use the App
      </h2>
      <div className="w-full">
        <div className="relative overflow-hidden rounded-xl border border-blue-300/20">
          <video
            ref={ref}
            preload="none"
            muted
            playsInline
            autoPlay
            loop
            controls
            width="100%"
            height="auto"
          >
            <source src="/App_Demo_Video.mp4" type="video/mp4" />
          </video>
        </div>
      </div>
    </div>
  );
};

export default dynamic(() => Promise.resolve(Video), { ssr: false });
