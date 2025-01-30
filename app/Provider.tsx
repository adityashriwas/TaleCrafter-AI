"use client"
import React, { useEffect } from 'react'
import { NextUIProvider, User } from '@nextui-org/react'
import { ClerkProvider } from '@clerk/nextjs'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { db } from '@/config/config';
import { eq } from 'drizzle-orm';
import { Users } from '@/config/schema';
import { UserDetailContext } from './_context/UserDetailContext';
import { PayPalScriptProvider} from "@paypal/react-paypal-js";

const Provider = ({children} : {children: React.ReactNode}) => {

  const [userDetail, setUserDetail] = useState<any>();
  const {user}= useUser();

  useEffect(() => {
    user && saveNewUserIfNotExist();
  }, [user])


  const saveNewUserIfNotExist = async()=>{
    // check if user already exist
    const userResp = await db.select().from(Users).where(eq(Users.userEmail, user?.primaryEmailAddress?.emailAddress??''));
    console.log("existing user", userResp);
    
    // if not will add new user to db
    if(!userResp[0]){
      const result = await db.insert(Users).values({
        userEmail: user?.primaryEmailAddress?.emailAddress,
        userName: user?.fullName,
        userImage: user?.fullName
      }).returning({
        userEmail: Users.userEmail,
        userName: Users.userName,
        userImage: Users.userImage,
        credit: Users.credit
      })
      console.log("new user", result[0]);
      
      setUserDetail(result[0]);
    } else {
      setUserDetail(userResp[0]);
    }
  }

  return (
    <UserDetailContext.Provider value={{userDetail, setUserDetail}}>
      <PayPalScriptProvider options={{ clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID??'' }}>
    <NextUIProvider>
        {children}
        <ToastContainer />
    </NextUIProvider>
    </PayPalScriptProvider>
    </UserDetailContext.Provider>
  )
}

export default Provider