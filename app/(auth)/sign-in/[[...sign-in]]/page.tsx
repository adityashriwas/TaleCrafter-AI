import { SignIn } from '@clerk/nextjs'
import Image from 'next/image'

export default function Page() {
  return(
    <div className='grid grid-cols-1 md:grid-cols-2 bg-gradient-to-br from-black via-[#0a0f25] to-[#071340]'>
      <div>
        <Image src="/sign-in.webp" alt="Sign In" width={500} height={500} className='w-full h-full order-first md:order-last'/>
      </div>
      <div className='h-screen flex justify-center items-center'>
      <SignIn/>
      </div>
    </div>
  ) 
}