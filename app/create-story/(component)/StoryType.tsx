"use client";
import { label } from 'framer-motion/client'
import React, { useState } from 'react'
import Image from 'next/image'

export interface OptionField{
    label: string,
    imageUrl: string,
    isFree: boolean 
}

const StoryType = ({userSelection}:any) => {

    const [selectedOption, setSelectedOption] = useState<string>();

    const onUserSelect = (item:OptionField)=>{
        setSelectedOption(item.label);
        userSelection({
            fieldValue: item?.label,
            fieldName: 'storyType',
        })
    }

    const OptionList=[
        {
            label:'Story Book',
            imageUrl: '/Hero_img.png',
            isFree: true, 
        },
        {
            label:'Bed Story',
            imageUrl: '/sign-in.webp',
            isFree: true, 
        },
        {
            label:'Educational',
            imageUrl: '/sign-in.webp',
            isFree: true, 
        },
        {
            label:'Educational',
            imageUrl: '/sign-in.webp',
            isFree: true, 
        },
        {
            label:'Educational',
            imageUrl: '/sign-in.webp',
            isFree: true, 
        },
        {
            label:'Educational',
            imageUrl: '/sign-in.webp',
            isFree: true, 
        },
        {
            label:'Educational',
            imageUrl: '/sign-in.webp',
            isFree: true, 
        },
        {
            label:'Educational',
            imageUrl: '/sign-in.webp',
            isFree: true, 
        },
    ]

  return (
    <div className='mt-10'>
        <label className='text-4xl'>Story Genres</label>
        <div className='mt-5 hsb overflow-x-auto whitespace-nowrap'>
            {
                OptionList.map((item, index)=>(
                    <div key={index} className={`relative hover:grayscale-0 m-2 inline-block cursor-pointer ${selectedOption === item.label ? 'border-medium rounded-3xl border-primary' : ''}`}
                    onClick={()=>onUserSelect(item)}
                    >
                        <Image src={item.imageUrl} alt={item.label}
                            width={200} height={200}
                            className='obejct-cover rounded-3xl h-[200px] w-[200px]'
                        />
                        <h2 className='font-semibold text-2xl text-center text-primary'>{item.label}</h2>
                    </div>
                ))
            }
        </div>
    </div>
  )
}

export default StoryType