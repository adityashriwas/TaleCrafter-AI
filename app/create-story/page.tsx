"use client";
import React, { use, useContext, useEffect, useState } from "react";
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

const CREATE_STORY_PROMPT = process.env.NEXT_PUBLIC_CREATE_STORY_PROMPT;
const GENERATE_SUGGESTION_PROMPT = process.env.NEXT_PUBLIC_SUGGESTION_STORY_PROMPT;
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
  const { userDetail, setUserDetail } = useContext(UserDetailContext);

  // use to add data to the form
  // @param data

  useEffect(() => {
    GenerateSuggestion();
  }, []);

  let data;
  let suggestion;

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
      // console.log(error);
    }
  };

  const onHandleUserSelection = (data: feildData) => {
    setFormData((prev: any) => ({
      ...prev,
      [data.fieldName]: data.fieldValue,
    }));
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
      notifyError("You have no credit left! Please buy credit to generate story");
      return;
    }

    setLoading(true);
    const FINAL_PROMPT = CREATE_STORY_PROMPT?.replace(
      "{ageGroup}",
      formData?.ageCategory ?? ""
    )
      .replace("{storyType}", formData?.storyType ?? "")
      .replace("{storySubject}", formData?.storySubject ?? Suggestion ?? "")
      .replace("{imageStyle}", formData?.imageStyle ?? "");
    try {
      const result = await chatSession.sendMessage(FINAL_PROMPT);
      const story = JSON.parse(result?.response.text());
      let prompt = `Add-title-"${story?.title?.replace(
        /\s+/g,
        "-"
      )}"-in-bold-text-for-book-cover-image,-${story?.coverImagePrompt?.replace(
        /\s+/g,
        "-"
      )}`;
      const final_image_prompt = prompt;

      const imageResp = `https://image.pollinations.ai/prompt/${final_image_prompt}?enhance=true&nologo=true&width=410&height=630`;
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
    const result = await db
      .update(Users)
      .set({
        credit: Number(userDetail?.credit - 1),
      })
      .where(eq(Users.userEmail, user?.primaryEmailAddress?.emailAddress ?? ""))
      .returning({ id: Users.id });
  };

  return (
    <div className="px-7 md:px-20 pb-10 lg:px-40 bg-gradient-to-br from-black via-[#0a0f25] to-[#071340]">
      <h1 className="text-3xl mt-4 sm:text-4xl md:text-5xl lg:text-6xl xl:text-6xl block w-full bg-gradient-to-b from-white to-gray-400 bg-clip-text font-bold text-transparent text-center">
        Create Story
      </h1>
      <div className="">
        {/* story subject and suggestions*/}

        <div className="flex justify-between mt-10 flex-col sm:flex-row w-4/5 gap-5">
          <StorySubjectInput userSelection={onHandleUserSelection} />
          <Suggestions Suggestion={Suggestion} />
        </div>

        {/* story type */}
        <StoryType userSelection={onHandleUserSelection} />

        {/* story image */}
        <ImageStyle userSelection={onHandleUserSelection} />

        {/* age category */}
        <AgeCategory userSelection={onHandleUserSelection} />
      </div>
      <div className="flex justify-end ">
        <Button
          disabled={loading}
          className="mt-5 text-xl p-2 sm:size-full bg-gray-800 text-white shadow-md hover:bg-gray-700 transition"
          color="primary"
          onClick={GenerateStory}
        >
          Create Story
        </Button>
      </div>
      <CustomLoader isLoading={loading} />
    </div>
  );
};

export default CreateStory;