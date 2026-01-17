import React from "react";
import { IoPlayCircle, IoPauseCircle } from "react-icons/io5";

const StoryPages = ({ storyChapter }: any) => {
  const [isPlaying, setIsPlaying] = React.useState(false);
  const synth = typeof window !== "undefined" ? window.speechSynthesis : null;
  let utterance = new SpeechSynthesisUtterance(storyChapter?.textPrompt); // New instance per page

  // Function to toggle speech
  const toggleSpeech = () => {
    if (!synth) return;

    if (isPlaying) {
      synth.cancel(); // Stop speech completely
    } else {
      const utterance = new SpeechSynthesisUtterance(storyChapter?.textPrompt);
      synth.speak(utterance);
    }

    setIsPlaying(!isPlaying);
  };

  // Cleanup when unmounting
  React.useEffect(() => {
    return () => {
      if (synth) synth.cancel();
    };
  }, [synth]);

  return (
    <div>
      <h2 className="text-2xl font-bold text-primary flex justify-between">
        {storyChapter?.title}
        <span className="text-3xl cursor-pointer" onClick={toggleSpeech}>
          {isPlaying ? <IoPauseCircle /> : <IoPlayCircle />}
        </span>
      </h2>
      <div className="relative w-full min-h-[300px] mt-2">
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 rounded-lg border-2 border-dashed border-gray-400">
          <svg className="h-12 w-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-center text-gray-600 font-medium">Image currently unavailable</p>
          <p className="text-center text-gray-500 text-sm mt-1">API updates in progress</p>
        </div>
      </div>
      <div className="hsb2 max-h-52 overflow-y-scroll mt-2">
        <p className="text-xl text-black p-4 mt-3 rounded-lg bg-slate-100">
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
