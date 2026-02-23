"use client";
import React, { useContext, useEffect, useState } from "react";
import StorySubjectInput from "./(component)/StorySubjectInput";
import StoryType from "./(component)/StoryType";
import AgeCategory from "./(component)/AgeCategory";
import ImageStyle from "./(component)/ImageStyle";
import { Button } from "@nextui-org/button";
import Suggestions from "./(component)/Suggestions";
import { chatSession } from "@/config/GeminiAI";
import { db } from "@/config/config";
import { StoryData } from "@/config/schema";
import uuid4 from "uuid4";
import CustomLoader from "./(component)/CustomLoader";
import { useUser } from "@clerk/nextjs";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { UserDetailContext } from "@/app/_context/UserDetailContext";
import { Users } from "@/config/schema";
import { eq } from "drizzle-orm";
import { chatSessionSuggestion } from "@/config/GeminiSuggestions";
import UploadImage from "./(component)/UploadImage";
import { motion } from "framer-motion";
const MotionDiv: any = motion.div;

const CREATE_STORY_PROMPT = process.env.NEXT_PUBLIC_CREATE_STORY_PROMPT;
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
  const [Suggestion, setSuggestion] = useState<string>("");
  const [formData, setFormData] = useState<FormDataType>();
  const [loading, setLoading] = useState<boolean>(false);
  const { user } = useUser();
  const notify = (msg: string) => toast(msg);
  const notifyError = (msg: string) => toast.error(msg);
  const { userDetail } = useContext(UserDetailContext);
  const [storySubject, setStorySubject] = useState("");

  useEffect(() => {
    GenerateSuggestion();
  }, []);

  const GenerateSuggestion = async () => {
    try {
      const result = await chatSessionSuggestion.sendMessage(
        process.env.NEXT_PUBLIC_SUGGESTION_STORY_PROMPT // Your prompt for the suggestion
      );
      const data = result.response.text();
      const suggestion = JSON.parse(data);
      // console.log(suggestion);

      setSuggestion(suggestion.story_idea); // Assuming story_idea is the correct field
    } catch (error) {
      console.log(error);
    }
  };

  const onHandleUserSelection = (data: feildData) => {
    setFormData((prev: any) => ({
      ...prev,
      [data.fieldName]: data.fieldValue,
    }));
    setStorySubject(storySubject);
    // console.log(formData);
  };

  const GenerateStory = async () => {
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
    const FINAL_PROMPT = CREATE_STORY_PROMPT?.replace(
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
          Suggestion ||
          ""
      )
      .replace("{imageStyle}", formData?.imageStyle ?? "");
    try {
      const result = await chatSession.sendMessage(FINAL_PROMPT);
      const story = JSON.parse(result?.response.text());
      const prompt = `Add-title-"${story?.title?.replace(
        /\s+/g,
        "-"
      )}"-in-bold-text-for-book-cover-image,-${story?.coverImagePrompt?.replace(
        /\s+/g,
        "-"
      )}`;
      const final_image_prompt = prompt;
      // console.log(final_image_prompt);
      const imageResp = `https://gen.pollinations.ai/image/${final_image_prompt}?model=${process.env.NEXT_PUBLIC_POLLINATIONS_AI_MODEL}&width=410&height=630&enhance=false&negative_prompt=worst+quality%2C+blurry&safe=false&seed=0&key=${process.env.NEXT_PUBLIC_POLLINATIONS_API_KEY}`;
      // console.log(imageResp);
      const resp: any = await SaveInDB(result?.response.text(), imageResp);
      // console.log(resp);
      notify("Story Generated Successfully");
      await UpdateUserCredits();
      router.push("/view-story/" + resp);

      // console.log(result?.response.text());
      setLoading(false);
    } catch (error) {
      // console.log(error);
      notifyError("Server Error! Please try again");
      setLoading(false);
    }
  };

  const SaveInDB = async (output: string, imageResp: string) => {
    const recordId = uuid4();
    setLoading(true);
    try {
      const result = await db
        .insert(StoryData)
        .values({
          storyId: recordId,
          ageGroup: formData?.ageCategory,
          storyType: formData?.storyType,
          storySubject: formData?.storySubject,
          imageStyle: formData?.imageStyle,
          output: JSON.parse(output),
          coverImage: imageResp,
          userEmail: user?.primaryEmailAddress?.emailAddress,
          userName: user?.fullName,
          userImage: user?.imageUrl,
        })
        .returning({ StoryId: StoryData?.storyId });
      setLoading(false);
      return result[0]?.StoryId;
    } catch (error) {
      // console.log(error);
      notifyError("Server Error! Please try again");
      setLoading(false);
    }
  };

  const UpdateUserCredits = async () => {
    await db
      .update(Users)
      .set({
        credit: Number(userDetail?.credit - 1),
      })
      .where(eq(Users.userEmail, user?.primaryEmailAddress?.emailAddress ?? ""))
      .returning({ id: Users.id });
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
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-blue-100/75 md:text-base">
                Configure your story prompt, visual style, and target audience.
                TaleCrafter AI will generate a complete illustrated storybook.
              </p>
            </div>
            <div className="inline-flex items-center rounded-xl border border-blue-300/20 bg-blue-500/10 px-4 py-3 text-blue-100/90">
              <span className="text-sm font-medium">Credits left:</span>
              <span className="ml-2 text-xl font-bold text-white">
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
            <Suggestions Suggestion={Suggestion} text={storySubject} />
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
          <Button
            disabled={loading}
            className="tc-btn-primary px-8 py-6 text-base shadow-[0_0_30px_rgba(29,141,255,0.3)] hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-70"
            color="primary"
            onClick={GenerateStory}
          >
            {user ? "Create Story" : "Login to Create Story"}
          </Button>
        </div>
      </div>
      <CustomLoader isLoading={loading} />
    </div>
  );
};

export default CreateStory;
