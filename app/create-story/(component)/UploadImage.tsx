"use client";

import { useState } from "react";
import Image from "next/image";
import { GoogleGenerativeAI } from "@google/generative-ai";

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
    const genAI = new GoogleGenerativeAI(
      process.env.NEXT_PUBLIC_GEMINI_API_KEY_IMAGE_ANALYSIS!
    );
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    try {
      const imageParts = await fileToGenerativePart(image);
      const result = await model.generateContent([
        `Analyze this image and give me a short story idea description int 30 to 50 words that can be generated based on the appearance of the image.`,
        imageParts,
      ]);
      const response = await result.response;
      // console.log(response);

      const text = response
        .text()
        .trim()
        .replace(/```/g, "")
        .replace(/\*\*/g, "")
        .replace(/\*/g, "")
        .replace(/-\s*/g, "")
        .replace(/\n\s*\n/g, "\n");
      setResult(text);
      setImageSubject(text);
      console.log("Image analysis result:", text);
    } catch (error) {
      console.error("Error identifying image:", error);
      if (error instanceof Error) {
        setResult(`Error identifying image: ${error.message}`);
      } else {
        setResult("An unknown error occurred while identifying the image.");
      }
    } finally {
      setLoading(false);
    }
  };

  async function fileToGenerativePart(file: File): Promise<{
    inlineData: { data: string; mimeType: string };
  }> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result as string;
        const base64Content = base64data.split(",")[1];
        resolve({
          inlineData: {
            data: base64Content,
            mimeType: file.type,
          },
        });
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  return (
    <main className=" w-full mt-4">
      <div className="bg-gradient-to-br from-[#071340] via-[#0a0f25] to-[#071340] rounded-lg shadow-xl overflow-hidden ">
        <div className="p-8">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl bg-gradient-to-b from-white to-gray-400 bg-clip-text font-bold text-transparent text-center">
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
            <h3 className="text-2xl font-bold bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent text-center m-2">
              Story Idea Description
            </h3>
            <div className="prose prose-blue max-w-none">
              {result.split("\n").map((line, index) => {
                if (line.trim() !== "") {
                  return (
                    <p
                      key={index}
                      className="mb-1 text-gray-100 sm:text-xl p-4"
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
