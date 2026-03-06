import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { createStoryChatSession, storyGenerationConfig } from "@/config/GeminiAI";

type GeminiRequestBody = {
  prompt?: string;
  mode?: "text" | "image-analysis" | "story-generation";
  imageBase64?: string;
  mimeType?: string;
};

const DEFAULT_MODEL = "gemini-2.5-flash";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as GeminiRequestBody;
    const prompt = String(body?.prompt ?? "").trim();

    if (!prompt) {
      return NextResponse.json(
        { message: "Prompt is required" },
        { status: 400 }
      );
    }

    const modelName = process.env.GEMINI_MODEL ?? DEFAULT_MODEL;
    const mode = body?.mode ?? "text";

    if (mode === "image-analysis") {
      const apiKey =
        process.env.GEMINI_API_KEY_IMAGE_ANALYSIS ?? process.env.GEMINI_API_KEY;

      if (!apiKey) {
        return NextResponse.json(
          { message: "Gemini image analysis key is not configured" },
          { status: 500 }
        );
      }

      if (!body?.imageBase64) {
        return NextResponse.json(
          { message: "Image data is required for image analysis" },
          { status: 400 }
        );
      }

      const client = new GoogleGenerativeAI(apiKey);
      const model = client.getGenerativeModel({ model: modelName });
      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            data: body.imageBase64,
            mimeType: body.mimeType ?? "image/jpeg",
          },
        },
      ]);

      return NextResponse.json({ text: result.response.text() });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { message: "Gemini API key is not configured" },
        { status: 500 }
      );
    }

    if (mode === "story-generation") {
      const storyChat = createStoryChatSession({ apiKey, modelName });
      const result = await storyChat.sendMessage(prompt);
      return NextResponse.json({ text: result.response.text() });
    }

    const client = new GoogleGenerativeAI(apiKey);
    const model = client.getGenerativeModel({
      model: modelName,
      generationConfig: storyGenerationConfig,
    });
    const result = await model.generateContent(prompt);

    return NextResponse.json({ text: result.response.text() });
  } catch {
    return NextResponse.json(
      { message: "Gemini request failed" },
      { status: 500 }
    );
  }
}
