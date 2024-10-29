"use client";
import Image from 'next/image';
import React, { useState } from 'react'
import {Button, ButtonGroup} from "@nextui-org/button";
import Link from 'next/link';
import {  
    Navbar,   
    NavbarBrand,   
    NavbarContent,   
    NavbarItem,   
    NavbarMenuToggle,  
    NavbarMenu,  
    NavbarMenuItem
}   from "@nextui-org/navbar";
import { menu } from '@nextui-org/theme';

const Header = () => {

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
                    <NavbarItem className='text-xl font-medium hover:underline ml-3'>
                        <Link href={item.path}>
                            {item.name}
                        </Link>
                    </NavbarItem>
                ))}
        </NavbarContent>

        <NavbarContent justify="end">
            <Button color='primary'>Get Started</Button>
        </NavbarContent>

        <NavbarMenu>
            {MenuList.map((item, index) => (
                <NavbarMenuItem>
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