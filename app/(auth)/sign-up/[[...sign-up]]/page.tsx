import { SignUp } from '@clerk/nextjs'
import Image from 'next/image'

export default function Page() {
  return(
      <div className='grid grid-cols-1 md:grid-cols-2 bg-[#0C0414]'>
        <div>
          <Image src="/sign-in.webp" alt="Sign In" width={500} height={500} className='w-full h-full order-first md:order-last'/>
        </div>
        <div className='min-h-screen flex justify-center items-center p-4'>
        <SignUp/>
        </div>
      </div>
    ) 
}