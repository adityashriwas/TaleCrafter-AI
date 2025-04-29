"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { UserButton, useUser } from "@clerk/nextjs";

function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname(); // Get current route
  const { user, isSignedIn } = useUser();
  const toggleOpen = () => setIsOpen(!isOpen);
  const closeNavbar = () => setIsOpen(false);
  

  const MenuList = [
        {
          name: "Home",
          path: "/",
        },
        {
          name: "Create Story",
          path: "/create-story",
        },
        {
          name: "Explore Stories",
          path: "/explore",
        },
        {
          name: "My Stories",
          path: "/dashboard",
        }
      ];

  return (
    <>
      {/* Top Navbar */}
      <nav className="sticky top-0 w-full px-2 py-1 bg-[#0f031b] backdrop-blur-md shadow-md flex justify-between items-center z-50">
        <div className="text-xl flex items-center">
        <Image src="/app_logo.png" alt="Logo" width={80} height={80} className=""/>
        <h2 className="block w-full bg-gradient-to-b from-white to-gray-400 bg-clip-text font-bold text-transparent text-xl sm:text-2xl ml-1">TaleCrafterAI</h2>
        </div>

        <div className="flex items-center space-x-4">
         
        {/* Hamburger Menu Button */}
        <button
          onClick={toggleOpen}
          className="flex flex-col space-y-1 p-2 rounded focus:outline-none"
          aria-label="Toggle Navigation Menu"
        >
          <div className={`w-6 h-0.5 bg-gradient-to-b from-white to-gray-400 transition ${isOpen ? "-rotate-45 translate-x-[-6px] translate-y-[6px] " : ""}`}></div>
          <div className={`w-6 h-0.5 bg-gradient-to-b from-white to-gray-400 transition ${isOpen ? "opacity-0" : ""}`}></div>
          <div className={`w-6 h-0.5 bg-gradient-to-b from-white to-gray-400 transition ${isOpen ? "rotate-45 translate-x-[-6px] translate-y-[-6px]" : ""}`}></div>
        </button>
        </div>
      </nav>

      {/* Sidebar Menu */}
      <div
        className={`fixed top-0 right-0 w-[250px] h-full bg-[#17031b64] backdrop-blur-3xl transform transition-transform duration-300 ease-in-out z-40 pt-[100px] ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {
          MenuList.map((item, index) => (
            <Link
              key={index}
              href={item.path}
              className={`block font-bold px-5 py-2.5 text-[20px] no-underline transition-colors duration-300 hover:bg-[#8e8f916a] ${
                pathname === item.path ? "bg-[#1D1D2F] text-white font-bold" : "block w-full bg-gradient-to-b from-white to-gray-400 bg-clip-text font-bold text-transparent"
              }`}
              onClick={closeNavbar}
            >
              {item.name}
            </Link>
          ))
        }

        <div className="fixed flex items-center justify-center gap-4 bottom-0 w-full p-5 bg-[#0f031b] backdrop-blur-md shadow-md">
        <UserButton />
        <h2 className="font-bold text-xl text-gray-300" >{user ? user.fullName : "Guest User"}</h2>
        </div>
      </div>
    </>
  );
}

export default Header;