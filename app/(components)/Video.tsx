"use client";

export default function Video() {
  return (
    <div className="rounded-md border border-blue-500 shadow-blue-900 p-2 sm:p-8 text-center flex flex-col mt-10 mb-14 gap-4">
      <h2 className="text-center block w-full bg-gradient-to-b from-gray-100 via-gray-300 to-gray-500 bg-clip-text font-bold text-transparent text-2xl sm:text-4xl drop-shadow-lg">
        How to Use the App
      </h2>
      <div className="w-full">
        <div className="relative">
          <video
            src="/Demo_video.mp4"
            className="w-full h-full"
            autoPlay
            loop
            muted
            controls
            onError={() => console.error("Video failed to load")}
          />
        </div>
      </div>
    </div>
  );
}
