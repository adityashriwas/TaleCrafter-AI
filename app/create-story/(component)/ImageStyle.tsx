import React from 'react'
import { useState } from 'react'
import Image from 'next/image'
import { OptionField } from './StoryType'

const ImageStyle = ({userSelection}:any) => {
    const [selectedOption, setSelectedOption] = useState<string>();

    const onUserSelect = (item:OptionField)=>{
        setSelectedOption(item.label);
        userSelection({
            fieldValue: item?.label,
            fieldName: 'imageStyle',
        })
    }


    const OptionList=[
        {
            label:'Paper Cut',
            imageUrl: '/paperCut.png',
            isFree: true
        },
        {
            label:'Water Color',
            imageUrl: '/watercolor.png',
            isFree: true
        },
        {
            label:'Anime Style',
            imageUrl: '/Anime.webp',
            isFree: true
        },
        {
            label:'Pixel Art',
            imageUrl: '/pixel.png',
            isFree: true
        },
        {
            label:'3D Cartoon',
            imageUrl: '/3D.png',
            isFree: true
        }
    ]

  return (
    <div className='mt-10'>
        <label className='text-4xl'>Image Style</label>
        <div className='mt-5 hsb overflow-x-auto whitespace-nowrap'>
            {
                OptionList.map((item, index)=>(
                    <div key={index} className={`relative hover:grayscale-0 inline-block m-5 cursor-pointer ${selectedOption === item.label ? 'border-medium rounded-3xl border-primary' : ''}`}
                    onClick={()=>onUserSelect(item)}
                    >
                        <Image src={item.imageUrl} alt={item.label}
                            width={200} height={100}
                            className='obejct-cover rounded-3xl'
                        />
                        <h2 className='text-center font-semibold text-xl text-primary'>{item.label}</h2>
                    </div>
                ))
            }
        </div>
    </div>
  )
}

export default ImageStyle