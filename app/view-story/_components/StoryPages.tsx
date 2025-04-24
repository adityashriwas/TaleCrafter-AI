import React, { useState, useEffect } from "react";
import { IoPlayCircle, IoPauseCircle } from "react-icons/io5";

const StoryPages = ({ storyChapter }: any) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [pausedPosition, setPausedPosition] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false); // Track image loading state
  const synth = window.speechSynthesis; // Get speech synthesis instance
  let utterance = new SpeechSynthesisUtterance(storyChapter?.textPrompt); // New instance per page
  const formattedImagePrompt = encodeURIComponent(
    storyChapter?.imagePrompt ?? ""
  );

  // Function to toggle speech
  const toggleSpeech = () => {
    if (!synth) return;

    if (isPlaying) {
      synth.cancel(); // Stop speech completely
      setPausedPosition(0); // Reset paused position
    } else {
      utterance = new SpeechSynthesisUtterance(storyChapter?.textPrompt); // New instance per play
      synth.speak(utterance);
    }

    setIsPlaying(!isPlaying);
  };

  // Handle speech completion
  utterance.onend = () => {
    setIsPlaying(false);
    setPausedPosition(0);
  };

  // Cleanup when unmounting
  useEffect(() => {
    return () => synth.cancel();
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold text-primary flex justify-between">
        {storyChapter?.title}
        <span className="text-3xl cursor-pointer" onClick={toggleSpeech}>
          {isPlaying ? <IoPauseCircle /> : <IoPlayCircle />}
        </span>
      </h2>
      <div className="relative w-full min-h-[300px] mt-2">
        {!imageLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-200 rounded-lg">
            <span className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full"></span>
          </div>
        )}
        <img
          src={`https://image.pollinations.ai/prompt/${storyChapter?.imagePrompt}?enhance=true&nologo=true`}
          alt=""
          className={`w-full min-h-full object-cover rounded-lg transition-opacity duration-300 ${
            imageLoaded ? "opacity-100" : "opacity-0"
          }`}
          onLoad={() => setImageLoaded(true)} // Set imageLoaded to true when image loads
        />
      </div>
      <div className="hsb2 max-h-52 overflow-y-scroll mt-2">
        <p className="text-xl text-black p-4 mt-3 rounded-lg bg-slate-100">
          {storyChapter?.textPrompt
            ?.split(storyChapter?.imagePrompt?.substring(0, 20) || "")[0]
            ?.replace(/\{[^}]*\}/g, "")
            ?.trim()}
        </p>
      </div>
    </div>
  );
};

export default StoryPages;
