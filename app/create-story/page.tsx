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
import UploadImage from "./(component)/UploadImage";

const CREATE_STORY_PROMPT = process.env.NEXT_PUBLIC_CREATE_STORY_PROMPT;
const GENERATE_SUGGESTION_PROMPT =
  process.env.NEXT_PUBLIC_SUGGESTION_STORY_PROMPT;
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

const CreateStory = ({ passData }: any) => {
  const router = useRouter();
  const [Suggestion, setSuggestion] = useState<string>("");
  const [formData, setFormData] = useState<FormDataType>();
  const [loading, setLoading] = useState<boolean>(false);
  const { user } = useUser();
  const notify = (msg: string) => toast(msg);
  const notifyError = (msg: string) => toast.error(msg);
  const { userDetail, setUserDetail } = useContext(UserDetailContext);
  const [storySubject, setStorySubject] = useState("");

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

      // Generate cover image
      let prompt = `Add-title-"${story?.title?.replace(
        /\s+/g,
        "-"
      )}"-in-bold-text-for-book-cover-image,-${story?.coverImagePrompt?.replace(
        /\s+/g,
        "-"
      )}`;

      const final_image_prompt = prompt;

      const coverImageUrl = `https://gen.pollinations.ai/image/${final_image_prompt}?model=nanobanana&width=410&height=630&enhance=false&negative_prompt=worst+quality%2C+blurry&safe=false&seed=0&key=${process.env.NEXT_PUBLIC_POLLINATIONS_API_KEY}`;

      // Generate and store image URLs for all chapters
      const chaptersWithImages = story?.chapters?.map((chapter: any) => {
        // Ensure imagePrompt is properly formatted (spaces replaced with hyphens)
        const formattedImagePrompt = chapter?.imagePrompt?.replace(/\s+/g, "-") || "";
        const chapterImageUrl = `https://gen.pollinations.ai/image/${formattedImagePrompt}?model=nanobanana&enhance=false&negative_prompt=worst+quality%2C+blurry&safe=false&seed=0&key=${process.env.NEXT_PUBLIC_POLLINATIONS_API_KEY}`;
        return {
          ...chapter,
          imageUrl: chapterImageUrl,
          // Keep imagePrompt for reference but don't regenerate URLs from it
        };
      }) || [];

      // Update story object with chapters that have image URLs
      const updatedStory = {
        ...story,
        chapters: chaptersWithImages,
      };

      const resp: any = await SaveInDB(
        JSON.stringify(updatedStory),
        coverImageUrl
      );
      notify("Story Generated Successfully");
      await UpdateUserCredits();
      router.push("/view-story/" + resp);

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
    <div className="px-7 md:px-20 pb-10 lg:px-40 bg-gradient-to-br from-black via-[#0a0f25] to-[#071340] min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-3xl mt-4 sm:text-4xl md:text-5xl lg:text-6xl xl:text-6xl block w-full bg-gradient-to-b from-white to-gray-400 bg-clip-text font-bold text-transparent text-center">
        Create Story
      </h1>

      {/* Unavailability Notice */}
      <div className="mt-12 w-full max-w-2xl">
        <div className="relative overflow-hidden rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/10 via-transparent to-orange-500/5 p-8 md:p-10 shadow-2xl">
          {/* Decorative background elements */}
          <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-amber-500/5 blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-orange-500/5 blur-3xl"></div>

          {/* Content */}
          <div className="relative z-10">
            <div className="flex items-start gap-4">
              <div className="mt-1 flex-shrink-0">
                <svg className="h-6 w-6 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg md:text-xl font-semibold text-amber-200 mb-2">Service Temporarily Unavailable</h3>
                <p className="text-gray-300 text-sm md:text-base leading-relaxed mb-4">
                  Due to recent updates in our AI model and image generation API, the story creation feature is currently unavailable. We are working diligently to restore this service as soon as possible.
                </p>
                <div className="space-y-2">
                  <p className="text-gray-400 text-sm flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-400"></span>
                    Estimated restoration time: We will have updates soon
                  </p>
                  <p className="text-gray-400 text-sm flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-400"></span>
                    In the meantime, you can explore existing stories in the Explore section
                  </p>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <div className="mt-8 pt-6 border-t border-amber-500/20 flex flex-col sm:flex-row gap-3">
              <a href="/explore" className="flex-1">
                <Button className="w-full bg-amber-600 text-white hover:bg-amber-700 transition shadow-lg">
                  Explore Stories
                </Button>
              </a>
              <Button className="flex-1 bg-gray-700 text-gray-200 hover:bg-gray-600 transition" disabled>
                Create Story
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateStory;
