"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { UserButton, useUser } from "@clerk/nextjs";

function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname(); // Get current route
  const { user } = useUser();
  const adminEmail = (process.env.NEXT_PUBLIC_ADMIN_EMAIL ?? "").toLowerCase();
  const currentUserEmail =
    user?.primaryEmailAddress?.emailAddress?.toLowerCase() ?? "";
  const isAdmin = adminEmail !== "" && currentUserEmail === adminEmail;
  const toggleOpen = () => setIsOpen(!isOpen);
  const closeNavbar = () => setIsOpen(false);

  const MenuList = [
    {
      name: "Home",
      path: "/",
    },
    {
      name: "About",
      path: "/about",
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
    },
  ];

  if (isAdmin) {
    MenuList.push({
      name: "Admin Panel",
      path: "/admin",
    });
  }

  return (
    <>
      {/* Top Navbar */}
      <nav className="sticky top-0 z-50 flex w-full items-center justify-between border-b border-blue-300/15 bg-[#010715]/95 px-3 py-1.5 backdrop-blur-xl shadow-[0_10px_35px_rgba(0,0,0,0.45)]">
        <div className="text-xl flex items-center py-1">
          <a href="/" className="flex items-center">
            <Image
              src="/app_logo.png"
              alt="Logo"
              width={58}
              height={58}
              className="object-contain"
            />
            <h2 className="tc-title-gradient ml-1 hidden w-full text-xl font-bold sm:block sm:text-2xl">
              TaleCrafterAI
            </h2>
          </a>
        </div>

        <div className="flex items-center space-x-4">
          {/* Hamburger Menu Button */}
          <button
            onClick={toggleOpen}
            className="flex flex-col space-y-1 rounded-lg border border-blue-300/30 bg-white/5 p-2 transition hover:bg-white/10 focus:outline-none"
            aria-label="Toggle Navigation Menu"
          >
            <div
              className={`h-0.5 w-6 bg-gradient-to-r from-blue-100 to-cyan-300 transition ${
                isOpen ? "-rotate-45 translate-x-[-6px] translate-y-[6px] " : ""
              }`}
            ></div>
            <div
              className={`h-0.5 w-6 bg-gradient-to-r from-blue-100 to-cyan-300 transition ${
                isOpen ? "opacity-0" : ""
              }`}
            ></div>
            <div
              className={`h-0.5 w-6 bg-gradient-to-r from-blue-100 to-cyan-300 transition ${
                isOpen ? "rotate-45 translate-x-[-6px] translate-y-[-6px]" : ""
              }`}
            ></div>
          </button>
        </div>
      </nav>

      {/* Sidebar Menu */}
      <div
        className={`fixed right-0 top-0 z-40 h-full w-[270px] border-l border-blue-300/20 bg-[#03122e]/70 pt-[100px] backdrop-blur-3xl transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {MenuList.map((item, index) => (
          <Link
            key={index}
            href={item.path}
            className={`mx-3 my-1 block rounded-xl px-5 py-3 text-[19px] font-bold no-underline transition-colors duration-300 ${
              pathname === item.path
                ? "border border-blue-300/20 bg-blue-500/20 text-white"
                : "tc-title-gradient w-full hover:bg-white/10"
            }`}
            onClick={closeNavbar}
          >
            {item.name}
          </Link>
        ))}

        <div className="fixed bottom-0 flex w-full items-center justify-center gap-4 border-t border-blue-300/15 bg-[#010715]/95 p-5 backdrop-blur-xl shadow-inner">
          <UserButton />
          <h2 className="tc-title-gradient text-xl font-bold">
            {user ? user.fullName : "Guest User"}
          </h2>
        </div>
      </div>
    </>
  );
}

export default Header;
