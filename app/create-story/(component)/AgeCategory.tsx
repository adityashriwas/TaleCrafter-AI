import React from 'react'
import { useState } from 'react'
import Image from 'next/image'
import { OptionField } from './StoryType'

const AgeCategory = ({userSelection}:any) => {
    const [selectedOption, setSelectedOption] = useState<string>();

    const onUserSelect = (item:OptionField)=>{
        setSelectedOption(item.label);
        userSelection({
            fieldValue: item?.label,
            fieldName: 'ageCategory',
        })
    }

    const OptionList=[
        {
            label:'Children',
            imageUrl: '/toddler.webp',
            isFree: true
        },
        {
            label:'Teen',
            imageUrl: '/teen.webp',
            isFree: true
        },
        {
            label:'Adult',
            imageUrl: '/adult.webp',
            isFree: true
        }
    ]

  return (
    <div className='mt-5'>
        <label className='text-4xl'>Age Category</label>
        <div className='flex gap-5 mt-8 flex-wrap'>
            {
                OptionList.map((item, index)=>(
                    <div key={index} className={`relative hover:grayscale-0 cursor-pointer ${selectedOption === item.label ? 'border-medium rounded-3xl border-primary' : ''}`}
                    onClick={()=>onUserSelect(item)}
                    >
                        <Image src={item.imageUrl} alt={item.label}
                            width={200} height={200}
                            className='obejct-cover rounded-3xl'
                        />
                        <h2 className='text-center font-semibold text-2xl text-primary'>{item.label}</h2>
                    </div>
                ))
            }
        </div>
    </div>
  )
}

export default AgeCategory