"use client";
import React, { useContext, useState } from 'react'
import StorySubjectInput from './(component)/StorySubjectInput'
import StoryType from './(component)/StoryType';
import AgeCategory from './(component)/AgeCategory';
import ImageStyle from './(component)/ImageStyle';
import { Button } from '@nextui-org/button';
import { i, p } from 'framer-motion/client';
import Suggestions from './(component)/Suggestions';
import { chatSession } from '@/config/GeminiAI';
import { db } from '@/config/config';
import { StoryData } from '@/config/schema';
import uuid4 from 'uuid4';
import CustomLoader from './(component)/CustomLoader';
import axios from 'axios';
import { useUser } from '@clerk/nextjs';
import { toast } from 'react-toastify';
import { useRouter } from "next/navigation";
import { UserDetailContext } from '@/app/_context/UserDetailContext';
import { Users } from '@/config/schema';
import { eq } from 'drizzle-orm';

const CREATE_STORY_PROMPT=process.env.NEXT_PUBLIC_CREATE_STORY_PROMPT;
export interface feildData {
  fieldValue: string,
  fieldName: string
}

export interface FormDataType{
  storySubject: string,
  storyType: string,
  ageCategory: string,
  imageStyle: string
}

const CreateStory = () => {
  const router = useRouter();
  
  const [formData, setFormData] = useState<FormDataType>();
  const [loading, setLoading] = useState<boolean>(false);
  const {user} = useUser();
  const notify = (msg:string) => toast(msg);
  const notifyError = (msg:string) => toast.error(msg);
  const {userDetail, setUserDetail} = useContext(UserDetailContext);

  // use to add data to the form
  // @param data

  const onHandleUserSelection = (data:feildData)=>{
    setFormData((prev:any)=>({
      ...prev,
      [data.fieldName]: data.fieldValue,
    }));
    console.log(formData);
  }

  const GenerateStory = async()=>{

    if (userDetail.credit <=0) {
      notifyError('You have no credit left! Please buy credit to generate story');
      return;
    }

    setLoading(true);
    const FINAL_PROMPT = CREATE_STORY_PROMPT
    ?.replace('{ageGroup}', formData?.ageCategory??'')
    .replace('{storyType}', formData?.storyType??'')
    .replace('{storySubject}', formData?.storySubject??'')
    .replace('{imageStyle}', formData?.imageStyle??'')
    try {
      const result = await chatSession.sendMessage(FINAL_PROMPT);
      const story = JSON.parse(result?.response.text());
      let prompt = `Add-text-with-title-"${story?.title?.replace(/\s+/g, "-")}"-in-bold-text-for-book-cover,-${story?.coverImagePrompt?.replace(/\s+/g, "-")}`;
      const final_image_prompt = prompt;
      
      const imageResp = `https://image.pollinations.ai/prompt/${final_image_prompt}`;
      console.log(imageResp);
      const resp:any = await SaveInDB(result?.response.text(), imageResp);
      console.log(resp);
      notify('Story Generated Successfully');
      await UpdateUserCredits();
      router.push('/view-story/'+resp);

      console.log(result?.response.text());      
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  }

  const SaveInDB = async (output:string, imageResp:string)=>{
    const recordId = uuid4();
    setLoading(true);
    try {
      const result = await db.insert(StoryData).values({
        storyId: recordId,
        ageGroup: formData?.ageCategory,
        storyType: formData?.storyType,
        storySubject: formData?.storySubject,
        imageStyle: formData?.imageStyle,
        output: JSON.parse(output),
        coverImage: imageResp,
        userEmail: user?.primaryEmailAddress?.emailAddress,
        userName: user?.fullName,
        userImage: user?.imageUrl
      }).returning({StoryId: StoryData?.storyId});
      setLoading(false);
      return result[0]?.StoryId;
    } catch (error) {
      console.log(error);   
      notifyError('Server Error! Please try again'); 
      setLoading(false);  
    }
  }

  const UpdateUserCredits = async()=>{
    const result = await db.update(Users).set({
      credit: Number(userDetail?.credit - 1)
    }).where(eq(Users.userEmail, user?.primaryEmailAddress?.emailAddress??''))
    .returning({id: Users.id})
  }

  return (
    <div className='px-10 md:px-20 pb-10 lg:px-40 bg-[#0C0414]'>
      <h1 className='font-extrabold text-[5vw] text-center'>Create Story</h1>
      <p className='text-2xl text-center'>Unlock your creativity with AI: Craft stories like never before! Let our AI bring your imagination to life, one story at a time. </p>
      <div className=''>
        {/* story subject and suggestions*/}
        
        <div className='flex justify-between mt-10 flex-wrap gap-5'>
        <StorySubjectInput userSelection={onHandleUserSelection}/>
        <Suggestions/>
        </div>

        {/* story type */}
        <StoryType userSelection={onHandleUserSelection}/>

        {/* story image */}
        <ImageStyle userSelection={onHandleUserSelection}/>
        
        {/* age category */}
        <AgeCategory userSelection={onHandleUserSelection}/>

      </div>
      <div className='flex justify-end '>
        <Button 
        disabled={loading}
        className='mt-5 text-xl p-7' color='primary'
        onClick={GenerateStory}
        >Create Story</Button>
      </div>
      <CustomLoader isLoading={loading}/>
    </div>
  )
}

export default CreateStory