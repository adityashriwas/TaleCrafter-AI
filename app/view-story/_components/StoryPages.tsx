import React from "react";
import { IoPlayCircle } from "react-icons/io5";

const StoryPages = ({ storyChapter }: any) => {
  const playSpeech = (text: string) => {
    const synth = window?.speechSynthesis;
    const textToSpeech = new SpeechSynthesisUtterance(text);
    synth.speak(textToSpeech);
  };
  return (
    <div>
      <h2 className="text-2xl font-bold text-primary flex justify-between">
        {storyChapter?.title}
        <span
          className="text-3xl cursor-pointer"
          onClick={() => {
            playSpeech(storyChapter?.textPrompt);
          }}
        >
          <IoPlayCircle />
        </span>
      </h2>
      <p className="text-xl text-black p-4 mt-3 rounded-lg bg-slate-100">
        {storyChapter?.textPrompt}
      </p>
    </div>
  );
};

export default StoryPages;
