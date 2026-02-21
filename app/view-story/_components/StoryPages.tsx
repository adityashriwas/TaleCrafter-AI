import React, { useState, useEffect } from "react";
import { IoPlayCircle, IoPauseCircle } from "react-icons/io5";

const StoryPages = ({ storyChapter }: any) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false); // Track image loading state
  const synth = window.speechSynthesis; // Get speech synthesis instance
  let utterance = new SpeechSynthesisUtterance(storyChapter?.textPrompt); // New instance per page

  // Function to toggle speech
  const toggleSpeech = () => {
    if (!synth) return;

    if (isPlaying) {
      synth.cancel(); // Stop speech completely
    } else {
      utterance = new SpeechSynthesisUtterance(storyChapter?.textPrompt); // New instance per play
      synth.speak(utterance);
    }

    setIsPlaying(!isPlaying);
  };

  // Handle speech completion
  utterance.onend = () => {
    setIsPlaying(false);
  };

  // Cleanup when unmounting
  useEffect(() => {
    return () => synth.cancel();
  }, []);

  return (
    <div>
      <h2 className="flex items-center justify-between text-2xl font-bold text-blue-700">
        <span className="pr-3">{storyChapter?.title}</span>
        <button
          className="rounded-full bg-blue-100 p-1 text-3xl text-blue-700 transition hover:bg-blue-200"
          onClick={toggleSpeech}
          aria-label={isPlaying ? "Pause narration" : "Play narration"}
        >
          {isPlaying ? <IoPauseCircle /> : <IoPlayCircle />}
        </button>
      </h2>
      <div className="relative w-full min-h-[300px] mt-2">
        {!imageLoaded && (
          <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-blue-50">
            <span className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></span>
          </div>
        )}
        <img
          src={`https://gen.pollinations.ai/image/${storyChapter?.imagePrompt}?model=${process.env.NEXT_PUBLIC_POLLINATIONS_AI_MODEL}&enhance=false&negative_prompt=worst+quality%2C+blurry&safe=false&seed=0&key=${process.env.NEXT_PUBLIC_POLLINATIONS_API_KEY}`}
          alt=""
          className={`w-full min-h-full object-cover rounded-lg transition-opacity duration-300 ${
            imageLoaded ? "opacity-100" : "opacity-0"
          }`}
          onLoad={() => setImageLoaded(true)} // Set imageLoaded to true when image loads
        />
      </div>
      <div className="hsb2 max-h-52 overflow-y-scroll mt-2">
        <p className="mt-3 rounded-lg bg-blue-50 p-4 text-lg text-slate-800 md:text-xl">
          {storyChapter?.textPrompt
            ?.split(storyChapter?.imagePrompt?.substring(0, 20) || "")[0]
            ?.replace(/\{[^}]*\}/g, "")
            ?.replace(
              /(Water ?Color|Watercolor|Anime( style)?|3D ?Cartoon|Oil (Paint|painting)|Comic( book)?|Paper ?Cut|Papercut|Pixel ?Art)[\s\S]*/i,
              ""
            )
            ?.trim()}
        </p>
      </div>
    </div>
  );
};

export default StoryPages;
