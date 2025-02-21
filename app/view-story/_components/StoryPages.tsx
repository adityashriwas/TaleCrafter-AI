import React, { useState, useEffect } from "react";
import { IoPlayCircle, IoPauseCircle } from "react-icons/io5";

const StoryPages = ({ storyChapter }: any) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [pausedPosition, setPausedPosition] = useState(0);
  const synth = window.speechSynthesis; // Get speech synthesis instance
  let utterance = new SpeechSynthesisUtterance(storyChapter?.textPrompt); // New instance per page

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
      <p className="text-xl text-black p-4 mt-3 rounded-lg bg-slate-100">
        {storyChapter?.textPrompt}
      </p>
    </div>
  );
};

export default StoryPages;
