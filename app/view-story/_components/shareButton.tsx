import { useState } from "react";

const ShareButton = ({
  storyTitle,
  storyUrl,
}: {
  storyTitle: string;
  storyUrl: string;
}) => {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: storyTitle,
          text: `Check out this amazing story: ${storyTitle}`,
          url: storyUrl,
        });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    } else {
      navigator.clipboard.writeText(storyUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      onClick={handleShare}
      className="p-2 sm:p-4 sm:text-base mt-4 px-6 py-2 rounded-lg bg-gray-800 text-white shadow-md hover:bg-gray-700 transition"
    >
      {copied ? "Link Copied!" : "Share Story"}
    </button>
  );
};

export default ShareButton;
