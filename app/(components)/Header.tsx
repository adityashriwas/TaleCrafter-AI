"use client";
import Image from 'next/image';
import React, { useState } from 'react'
import {Button, ButtonGroup} from "@nextui-org/button";
import Link from 'next/link';
import { menu } from '@nextui-org/theme';
import { UserButton, useUser } from '@clerk/nextjs';
import { UserProfile } from '@clerk/nextjs';
import {  
    Navbar,   
    NavbarBrand,   
    NavbarContent,   
    NavbarItem,   
    NavbarMenuToggle,  
    NavbarMenu,  
    NavbarMenuItem
}   from "@nextui-org/navbar";

const Header = () => {

    const {user, isSignedIn} = useUser();

    const MenuList = [
        {
            name: 'Home',
            path: '/'
        },
        {
            name: 'Create Story',
            path: '/create-story'
        },
        {
            name: 'Explore Stories',
            path: '/explore'
        },
        {
            name: 'Contact Us',
            path: '/contact-us'
        }
    ]

    const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <Navbar maxWidth='full' onMenuOpenChange={setIsMenuOpen}>
        <NavbarContent>
            <NavbarMenuToggle 
                aria-label={isMenuOpen ? 'Close menu' : 'Open menu'} 
                className='sm:hidden'
            />
            <NavbarBrand>
                <Image src="/logo.svg" alt="Logo" width={40} height={40} />
                <h2 className='font-bold text-2xl text-primary ml-3'>Apni Kahani</h2>
            </NavbarBrand>
        </NavbarContent>

        <NavbarContent className='hidden sm:flex'>
                {MenuList.map((item, index) => (
                    <NavbarItem key={index} className='text-xl font-medium hover:underline ml-3'>
                        <Link href={item.path}>
                            {item.name}
                        </Link>
                    </NavbarItem>
                ))}
        </NavbarContent>

        <NavbarContent justify="end">
            <Link href={'/dashboard'}>
            <Button color='primary'
            >   {
                    isSignedIn?'Dashboard':'Get Started'
                }
            </Button>
            </Link>
            <UserButton/>
        </NavbarContent>

        <NavbarMenu>
            {MenuList.map((item, index) => (
                <NavbarMenuItem key={index}>
                    <Link href={item.path}>
                        {
                            item.name
                        }
                    </Link>
                </NavbarMenuItem>
            ))}
        </NavbarMenu>
    </Navbar>
  )
}

export default Header