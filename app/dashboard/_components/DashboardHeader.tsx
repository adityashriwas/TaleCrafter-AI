import Image from 'next/image'
import React from 'react'

const DashboardHeader = () => {
  return (
    <div className='p-7 bg-primary text-white flex justify-between'>
        <h2 className='font-bold text-3xl'>My Stories</h2>
        <div className='flex items-center gap-4'>
            <Image src={'/credits.png'} width={35} height={35} alt='coin'/>
            <span className='text-2xl font-bold'>3 Credit Left</span>
        </div>
    </div>
  )
}

export default DashboardHeader