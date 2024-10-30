"use client";

import { Textarea } from '@nextui-org/react'
import React from 'react'

const StorySubjectInput = ({userSelection}:any) => {
  return (
    <div>
        <label className='text-4xl'>Subject of the story</label>
        <Textarea 
            className='mt-2 w-[40vw] min-w-[300px]'
            placeholder='Enter the subject of the story you want to create'
            size='lg'
            classNames={{
                input: " resize-y min-h-[230px] mt-2 p-5 text-2xl",
            }}
            onChange={(e)=>userSelection({
                feildValue: e.target.value,
                feildName: 'storySubject'
            })}
        />
    </div>
  )
}

export default StorySubjectInput