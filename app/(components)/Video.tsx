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
    <div className="rounded-2xl border border-blue-300/25 bg-white/[0.04] p-2 sm:p-8 text-center flex flex-col mt-10 mb-14 gap-4 backdrop-blur-sm shadow-[0_20px_60px_rgba(2,12,34,0.5)]">
      <h2 className="text-center block w-full bg-gradient-to-b from-white via-blue-100 to-blue-300 bg-clip-text font-bold text-transparent text-2xl sm:text-4xl drop-shadow-lg">
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
