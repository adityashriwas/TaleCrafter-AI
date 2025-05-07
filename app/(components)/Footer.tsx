"use client";
import React from "react";
import Image from "next/image";
import Feedback from "./Feedback";
import Link from "next/link";

const Footer = () => {
  return (
    <footer className="bg-[#0f031b] backdrop-blur-md shadow-md text-gray-400">
      <div className="w-full max-w-screen-xl mx-auto px-4 py-4 flex flex-col md:flex-row justify-between items-center gap-6">
        {/* Logo and Name */}
        <a href="/" className="flex items-center gap-3">
          <Image
            src="/app_logo.png"
            alt="TaleCrafter AI"
            width={60}
            height={60}
          />
          <span className="block w-full bg-gradient-to-b from-white to-gray-400 bg-clip-text font-bold text-transparent text-xl sm:text-2xl ml-1">
            TaleCrafter AI
          </span>
        </a>

        {/* Navigation Links */}
        <div className="flex flex-wrap gap-4 justify-center text-sm md:text-base">
          <Link
            href="/"
            className="hover:text-white transition duration-300"
          >
            Home
          </Link>
          <Link
            href="/about"
            className="hover:text-white transition duration-300"
          >
            About
          </Link>
          <a
            className="hover:text-white transition duration-300"
            href="mailto:adityashriwas08@gmail.com"
          >
            Contact
          </a>
        </div>

        {/* Feedback Component */}
        <div className="flex-shrink-0">
          <Feedback />
        </div>
      </div>

      {/* Bottom copyright */}
      <div className="text-center text-sm text-gray-500 py-2">
        © {new Date().getFullYear()} TaleCrafter AI™. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
