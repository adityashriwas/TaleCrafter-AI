import React, { useState } from "react";
import { IoPlayCircle, IoPauseCircle } from "react-icons/io5";

const StoryPages = ({ storyChapter }: any) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [synth] = useState(window.speechSynthesis);
  const [utterance] = useState(new SpeechSynthesisUtterance(storyChapter?.textPrompt));
  const [pausedPosition, setPausedPosition] = useState(0); // Track character index

  // Function to toggle speech
  const toggleSpeech = () => {
    if (!synth) return;

    if (isPlaying) {
      // Pause if currently speaking
      synth.pause();
      setPausedPosition(utterance.text.length - synth.pending ? synth.pending : 0); // Store last position
    } else {
      // Resume or restart
      if (synth.paused) {
        synth.resume(); // Resume if paused
      } else {
        utterance.text = storyChapter?.textPrompt.slice(pausedPosition); // Resume from last point
        synth.speak(utterance); // Start speaking
      }
    }
    setIsPlaying(!isPlaying);
  };

  // Handle speech completion
  utterance.onend = () => {
    setIsPlaying(false); // Reset state when finished
    setPausedPosition(0); // Reset paused position
  };

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
