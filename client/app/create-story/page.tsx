"use client";
import { useContext, useState } from "react";
import StorySubjectInput from "./(component)/StorySubjectInput";
import StoryType from "./(component)/StoryType";
import AgeCategory from "./(component)/AgeCategory";
import ImageStyle from "./(component)/ImageStyle";
import { Button } from "@nextui-org/button";
import uuid4 from "uuid4";
import CustomLoader from "./(component)/CustomLoader";
import { useAuth, useUser } from "@clerk/nextjs";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { UserDetailContext } from "@/app/_context/UserDetailContext";
import UploadImage from "./(component)/UploadImage";
import { motion } from "framer-motion";
import { createPollinationsImageUrl, persistImageUrl } from "@/lib/story-images";
import { apiFetch } from "@/lib/api-client";
import type { UserDetail } from "@/app/_context/UserDetailContext";
const MotionDiv: any = motion.div;

const CREATE_STORY_PROMPT = process.env.NEXT_PUBLIC_CREATE_STORY_PROMPT;

const cleanJsonText = (raw: string) =>
  raw
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

const normalizeJsonCandidate = (raw: string) =>
  raw
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/,\s*([}\]])/g, "$1")
    .trim();

const tryParseGeminiJson = (raw: string) => {
  const cleaned = cleanJsonText(raw);
  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");

  const candidates = [
    cleaned,
    firstBrace >= 0 && lastBrace > firstBrace
      ? cleaned.slice(firstBrace, lastBrace + 1)
      : "",
  ].filter(Boolean);

  for (const candidate of candidates) {
    try {
      return JSON.parse(normalizeJsonCandidate(candidate));
    } catch {
      // try next candidate
    }
  }

  return null;
};

const buildJsonRepairPrompt = (brokenJson: string) => `
You are a strict JSON repair assistant.
Fix the JSON below so it is syntactically valid while preserving the original meaning and fields.
Return ONLY valid JSON. No markdown fences. No explanation.

${brokenJson}
`;

const parseGeminiJson = (raw: string) => {
  const parsed = tryParseGeminiJson(raw);
  if (parsed) {
    return parsed;
  }

  throw new Error("Gemini response is not valid JSON");
};

export interface feildData {
  fieldValue: string;
  fieldName: string;
}

export interface FormDataType {
  storySubject: string;
  storyType: string;
  ageCategory: string;
  imageStyle: string;
}

const CreateStory = () => {
  const router = useRouter();
  const [formData, setFormData] = useState<FormDataType>();
  const [loading, setLoading] = useState<boolean>(false);
  const { user } = useUser();
  const { getToken } = useAuth();
  const notify = (msg: string) => toast(msg);
  const notifyError = (msg: string) => toast.error(msg);
  const { userDetail, setUserDetail } = useContext(UserDetailContext);
  const [storySubject, setStorySubject] = useState("");

  const onHandleUserSelection = (data: feildData) => {
    setFormData((prev: any) => ({
      ...prev,
      [data.fieldName]: data.fieldValue,
    }));
  };

  const callGemini = async (
    prompt: string,
    mode: "text" | "story-generation" = "text"
  ) => {
    const token = await getToken();
    const data = await apiFetch<{ text: string }>("/ai/gemini", {
      method: "POST",
      token,
      body: JSON.stringify({ prompt, mode }),
    });

    return String(data?.text ?? "");
  };

  const persistWithFallback = async (imageUrl: string, token?: string | null) => {
    try {
      return await persistImageUrl(imageUrl, token);
    } catch {
      return imageUrl;
    }
  };

  const GenerateStory = async (mode: "classic" | "interactive" = "classic") => {
    if (!user) {
      router.push("/sign-up?redirect_url=/create-story");
      return;
    }

    if (!userDetail || userDetail.credit === undefined) {
      notifyError("User details not loaded yet. Please try again.");
      return;
    }

    if (userDetail.credit <= 0) {
      notifyError(
        "You have no credit left! Please buy credit to generate story"
      );
      return;
    }

    setLoading(true);
    const FINAL_PROMPT = (CREATE_STORY_PROMPT ?? "").replace(
      "{ageGroup}",
      formData?.ageCategory ?? ""
    )
      .replace("{storyType}", formData?.storyType ?? "")
      .replace(
        "{storySubject}",
        formData?.storySubject ||
          storySubject.replace(
            "Here's a short story idea based on the image:",
            ""
          ) ||
          ""
      )
      .replace("{imageStyle}", formData?.imageStyle ?? "");
    const isInteractive = mode === "interactive";
    const interactivePrompt = `${FINAL_PROMPT}\n\nFor interactive story starter, return 6 to 8 chapters minimum in consistent JSON format. No markdown wrappers.`;
    try {
      const imageToken = await getToken();
      const outputText = await callGemini(
        isInteractive ? interactivePrompt : FINAL_PROMPT,
        "story-generation"
      );
      let story = tryParseGeminiJson(outputText);

      // Keep classic flow untouched; only repair malformed JSON for interactive starter.
      if (!story && isInteractive) {
        const repairedText = await callGemini(
          buildJsonRepairPrompt(cleanJsonText(outputText)),
          "text"
        );
        story = tryParseGeminiJson(repairedText);
      }

      if (!story) {
        story = parseGeminiJson(outputText);
      }

      if (!Array.isArray(story?.chapters) || story.chapters.length === 0) {
        throw new Error("Generated story does not contain chapters");
      }
      const safeTitle = String(story?.title ?? "Story");
      const safeCoverPrompt = String(
        story?.coverImagePrompt ??
          `${safeTitle} ${formData?.imageStyle ?? "illustration"} book cover`
      );
      let resp: any;
      if (isInteractive) {
        resp = await SaveInteractiveStarterInDB(story);
      } else {
        const prompt = `Add-title-"${safeTitle.replace(
          /\s+/g,
          "-"
        )}"-in-bold-text-for-book-cover-image,-${safeCoverPrompt.replace(
          /\s+/g,
          "-"
        )}`;
        const coverPollinationsUrl = await createPollinationsImageUrl(prompt, {
          width: 410,
          height: 630,
          seed: 0,
        }, imageToken);

        const chapters = (story.chapters as any[]).map((chapter: any, index: number) => ({
          ...chapter,
          chapterNumber: Number(chapter?.chapterNumber ?? index + 1),
        }));

        const persistedChapterEntries = await Promise.all(
          chapters.map(async (chapter: any, index: number) => {
            const sourcePrompt = String(
              chapter?.imagePrompt ?? chapter?.textPrompt ?? `${safeTitle} illustration`
            ).trim();
            const pollinationsUrl = await createPollinationsImageUrl(sourcePrompt, {
              seed: `${Date.now()}_${index}_${Math.floor(Math.random() * 100000)}`,
            }, imageToken);
            const persistedUrl = await persistWithFallback(pollinationsUrl, imageToken);

            return {
              ...chapter,
              imagePrompt: sourcePrompt,
              imageUrl: persistedUrl,
            };
          })
        );

        const persistedCoverImage = await persistWithFallback(coverPollinationsUrl, imageToken);
        const persistedStoryOutput = {
          ...story,
          chapters: persistedChapterEntries,
        };
        resp = await SaveInDB(persistedStoryOutput, persistedCoverImage);
      }
      notify("Story Generated Successfully");
      await UpdateUserCredits();
      router.push((isInteractive ? "/interactive-story/" : "/story/") + resp);

      setLoading(false);
    } catch (error) {
      console.error("Error generating story:", error);
      notifyError("Server Error! Please try in a moment.");
      setLoading(false);
    }
  };

  const SaveInDB = async (output: any, imageResp: string) => {
    const recordId = uuid4();
    setLoading(true);
    try {
      const token = await getToken();
      const result = await apiFetch<{ slug?: string; storyId?: string }>("/stories", {
        method: "POST",
        token,
        body: JSON.stringify({
          storyId: recordId,
          ageGroup: formData?.ageCategory,
          storyType: formData?.storyType,
          storySubject: formData?.storySubject,
          imageStyle: formData?.imageStyle,
          output,
          coverImage: imageResp,
        }),
      });
      setLoading(false);
      return result?.slug || result?.storyId;
    } catch (error) {
      notifyError("Server Error! Please try again");
      setLoading(false);
    }
  };

  const SaveInteractiveStarterInDB = async (story: any) => {
    const token = await getToken();
    const result = await apiFetch<{ storyId: string }>("/interactive-stories", {
      method: "POST",
      token,
      body: JSON.stringify({
        story,
        formData: {
          storySubject: formData?.storySubject,
          storyType: formData?.storyType,
          ageGroup: formData?.ageCategory,
          imageStyle: formData?.imageStyle,
        },
      }),
    });

    return result.storyId;
  };

  const UpdateUserCredits = async () => {
    const token = await getToken();
    const updatedUser = await apiFetch<UserDetail>("/users/me/credits/decrement", {
      method: "POST",
      token,
      body: JSON.stringify({ amount: 1 }),
    });
    setUserDetail(updatedUser);
  };
  const fadeUp = {
    hidden: { opacity: 0, y: 24 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#020b1f] px-5 pb-12 md:px-16 lg:px-28 xl:px-40">
      <div className="tc-hero-grid absolute inset-0 opacity-35" />
      <div className="tc-hero-orb tc-hero-orb-one" />
      <div className="tc-hero-orb tc-hero-orb-two" />

      <div className="relative">
        <MotionDiv
          initial="hidden"
          animate="show"
          variants={fadeUp}
          transition={{ duration: 0.6 }}
          className="tc-glass-panel mt-6 px-5 py-7 shadow-[0_16px_45px_rgba(0,0,0,0.35)] md:px-8"
        >
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
            <div>
              <h1 className="tc-title-gradient text-3xl font-extrabold sm:text-4xl md:text-5xl">
                Create Story
              </h1>
              <p className="tc-title-gradient mt-3 max-w-2xl text-sm leading-relaxed md:text-base">
                Configure your story prompt, visual style, and target audience.
                TaleCrafter AI will generate a complete illustrated storybook with branching plot options.
              </p>
            </div>
            <div className="inline-flex items-center rounded-xl border border-blue-300/20 bg-blue-500/10 px-4 py-3 text-blue-100/90">
              <span className="tc-title-gradient text-sm font-medium">Credits left:</span>
              <span className="tc-title-gradient ml-2 text-xl font-bold">
                {userDetail?.credit ?? "-"}
              </span>
            </div>
          </div>
        </MotionDiv>

        <MotionDiv
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.1 }}
          variants={fadeUp}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="tc-glass-panel-soft mt-8 p-5 md:p-7"
        >
          <div className="flex flex-col justify-between gap-5">
            <StorySubjectInput userSelection={onHandleUserSelection} />
          </div>
        </MotionDiv>

        <MotionDiv
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.1 }}
          variants={fadeUp}
          transition={{ delay: 0.12, duration: 0.5 }}
          className="tc-glass-panel-soft mt-7 p-5 md:p-7"
        >
          <UploadImage setImageSubject={setStorySubject} />
        </MotionDiv>

        <MotionDiv
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.1 }}
          variants={fadeUp}
          transition={{ delay: 0.14, duration: 0.5 }}
          className="tc-glass-panel-soft mt-7 p-5 md:p-7"
        >
          <StoryType userSelection={onHandleUserSelection} />
        </MotionDiv>

        <MotionDiv
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.1 }}
          variants={fadeUp}
          transition={{ delay: 0.16, duration: 0.5 }}
          className="tc-glass-panel-soft mt-7 p-5 md:p-7"
        >
          <ImageStyle userSelection={onHandleUserSelection} />
        </MotionDiv>

        <MotionDiv
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.1 }}
          variants={fadeUp}
          transition={{ delay: 0.18, duration: 0.5 }}
          className="tc-glass-panel-soft mt-7 p-5 md:p-7"
        >
          <AgeCategory userSelection={onHandleUserSelection} />
        </MotionDiv>

        <div className="mt-8 flex justify-end">
          <div className="flex flex-wrap items-center gap-3">
            <Button
              disabled={loading}
              className="tc-btn-primary px-8 py-6 text-base shadow-[0_0_32px_rgba(56,189,248,0.38)] hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-70"
              onClick={() => GenerateStory("interactive")}
            >
              {user ? "Create Interactive Story" : "Login to Create Interactive Story"}
            </Button>
            <Button
              disabled={loading}
              className="tc-btn-ghost px-8 py-6 text-base hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-70"
              color="primary"
              onClick={() => GenerateStory("classic")}
            >
              {user ? "Create Story" : "Login to Create Story"}
            </Button>
          </div>
        </div>
      </div>
      <CustomLoader isLoading={loading} />
    </div>
  );
};

export default CreateStory;
