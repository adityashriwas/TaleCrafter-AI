"use client";

import { useState } from "react";
import Image from "next/image";
import { useAuth } from "@clerk/nextjs";
import { apiFetch } from "@/lib/api-client";

export default function UploadImage({
  setImageSubject,
}: {
  setImageSubject: (text: string) => void;
}) {
  const [image, setImage] = useState<File | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { getToken } = useAuth();

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
      const token = await getToken();
      const data = await apiFetch<{ text: string }>("/ai/gemini", {
        method: "POST",
        token,
        body: JSON.stringify({
          mode: "image-analysis",
          prompt:
            "Analyze this image and give me a short story idea description int 30 to 50 words that can be generated based on the appearance of the image.",
          imageBase64,
          mimeType: image.type || "image/jpeg",
        }),
      });

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
          <div className="mb-8 mt-5 flex flex-col items-center justify-center gap-3">
            <input
              id="image-upload"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="sr-only"
            />
            <label
              htmlFor="image-upload"
              className="tc-btn-ghost inline-flex cursor-pointer items-center justify-center px-6 py-3 text-sm"
            >
              Choose Image
            </label>
            {image && (
              <p className="max-w-full truncate text-sm text-blue-100/70">
                {image.name}
              </p>
            )}
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
            type="button"
            onClick={() => identifyImage()}
            disabled={!image || loading}
            className="tc-btn-primary mt-5 w-full px-6 py-3 text-base disabled:cursor-not-allowed disabled:opacity-70"
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
