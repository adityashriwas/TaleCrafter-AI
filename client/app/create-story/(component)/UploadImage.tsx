"use client";

import { useState } from "react";
import Image from "next/image";

export default function UploadImage({
  setImageSubject,
}: {
  setImageSubject: (text: string) => void;
}) {
  const [image, setImage] = useState<File | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const identifyImage = async () => {
    if (!image) return;

    setLoading(true);

    try {
      const imageBase64 = await fileToBase64(image);
      const response = await fetch("/api/gemini", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mode: "image-analysis",
          prompt:
            "Analyze this image and give me a short story idea description int 30 to 50 words that can be generated based on the appearance of the image.",
          imageBase64,
          mimeType: image.type || "image/jpeg",
        }),
      });

      if (!response.ok) {
        throw new Error("Unable to analyze image");
      }

      const data = await response.json();

      const text = String(data?.text ?? "")
        .trim()
        .replace(/```/g, "")
        .replace(/\*\*/g, "")
        .replace(/\*/g, "")
        .replace(/-\s*/g, "")
        .replace(/\n\s*\n/g, "\n");
      setResult(text);
      setImageSubject(text);
    } catch (error) {
      if (error instanceof Error) {
        setResult(`Error identifying image: ${error.message}`);
      } else {
        setResult("An unknown error occurred while identifying the image.");
      }
    } finally {
      setLoading(false);
    }
  };

  async function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result as string;
        const base64Content = base64data.split(",")[1];
        resolve(base64Content);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  return (
    <main className=" w-full mt-4">
      <div className="bg-gradient-to-br from-[#071340] via-[#0a0f25] to-[#071340] rounded-lg shadow-xl overflow-hidden ">
        <div className="p-8">
          <h2 className="tc-title-gradient text-2xl sm:text-3xl lg:text-4xl font-bold text-center">
            Pick an Image to generate a story
          </h2>
          <div className="mb-8 flex items-center justify-center">
            <input
              id="image-upload"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="block mt-2 w-full cursor-pointer text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition duration-150 ease-in-out"
            />
          </div>
          {image && (
            <div className="mb-8 flex justify-center">
              <Image
                src={URL.createObjectURL(image)}
                alt="Uploaded image"
                width={300}
                height={300}
                className="rounded-lg shadow-md"
              />
            </div>
          )}
          <button
            onClick={() => identifyImage()}
            disabled={!image || loading}
            className="mt-5 text-xl p-2 sm:size-full bg-gray-800 text-white shadow-md hover:bg-gray-700 transition cursor-pointer"
          >
            {loading ? "Identifying image..." : "Generate Idea"}
          </button>
        </div>

        {result && (
          <div className="">
            <h3 className="tc-title-gradient text-2xl font-bold text-center m-2">
              Story Idea Description
            </h3>
            <div className="prose prose-blue max-w-none">
              {result.split("\n").map((line, index) => {
                if (line.trim() !== "") {
                  return (
                    <p
                      key={index}
                      className="tc-title-gradient mb-1 sm:text-xl p-4"
                    >
                      {line}
                    </p>
                  );
                }
                return null;
              })}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
