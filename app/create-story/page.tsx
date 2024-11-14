"use client";
import React, { useState } from 'react'
import StorySubjectInput from './(component)/StorySubjectInput'
import StoryType from './(component)/StoryType';
import AgeCategory from './(component)/AgeCategory';
import ImageStyle from './(component)/ImageStyle';
import { Button } from '@nextui-org/button';
import { p } from 'framer-motion/client';
import Suggestions from './(component)/Suggestions';

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

  const [formData, setFormData] = useState<FormDataType>();

  // use to add data to the form
  // @param data

  const onHandleUserSelection = (data:feildData)=>{
    setFormData((prev:any)=>({
      ...prev,
      [data.fieldName]: data.fieldValue,
    }));
    console.log(formData);
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
        <Button className='mt-5 text-xl p-7' color='primary'>Create Story</Button>
      </div>
    </div>
  )
}

export default CreateStory