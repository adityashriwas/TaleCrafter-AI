import React from 'react'
import { NextUIProvider } from '@nextui-org/react'
import { ClerkProvider } from '@clerk/nextjs'

const Provider = ({children} : {children: React.ReactNode}) => {
  return (
    <ClerkProvider>
    <NextUIProvider>
        {children}
    </NextUIProvider>
    </ClerkProvider>
  )
}

export default Provider