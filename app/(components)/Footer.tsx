import React from 'react'
import Image from 'next/image'

const Footer = () => {
  return (
    <>
        {/* footer section */}
        <footer className="p-2 bg-[#0f031b] backdrop-blur-md shadow-md">
          <div className="w-full max-w-screen-xl mx-auto p-4 md:py-8 flex gap-2 flex-wrap items-center justify-center">
            <div className="sm:flex sm:items-center sm:justify-between">
              <div className="flex gap-2 items-center justify-center">
                <Image
                  src="/app_logo.png"
                  alt="TaleCrafter AI"
                  width={70}
                  height={70}
                />
                <span className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">
                  TaleCrafter AI
                </span>
              </div>
            </div>
            <div className="flex flex-wrap">
              <span className="block text-sm text-center text-gray-500 sm:text-center dark:text-gray-400">
                © {new Date().getFullYear()} TaleCrafter AI™. All Rights
                Reserved.
              </span>
            </div>
          </div>
        </footer>
    </>
  )
}

export default Footer