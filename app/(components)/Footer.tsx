"use client";
import React from "react";
import Image from "next/image";
import Feedback from "./Feedback";
import Link from "next/link";

const Footer = () => {
  return (
    <footer className="border-t border-blue-300/15 bg-[#010715]/95 text-blue-100/80 backdrop-blur-xl shadow-[0_-12px_30px_rgba(0,0,0,0.4)]">
      <div className="mx-auto flex w-full max-w-screen-xl flex-col items-center justify-between gap-6 px-4 py-5 md:flex-row">
        <a href="/" className="flex items-center gap-3">
          <Image
            src="/app_logo.png"
            alt="TaleCrafter AI"
            width={52}
            height={52}
            className="object-contain"
          />
          <span className="block bg-gradient-to-b from-white via-blue-100 to-blue-300 bg-clip-text text-xl font-bold text-transparent sm:text-2xl">
            TaleCrafter AI
          </span>
        </a>

        <div className="flex flex-wrap justify-center gap-4 text-sm md:text-base">
          <Link
            href="/"
            className="rounded-lg px-3 py-1 transition duration-300 hover:bg-white/10 hover:text-white"
          >
            Home
          </Link>
          <Link
            href="/about"
            className="rounded-lg px-3 py-1 transition duration-300 hover:bg-white/10 hover:text-white"
          >
            About
          </Link>
          <a
            className="rounded-lg px-3 py-1 transition duration-300 hover:bg-white/10 hover:text-white"
            href="mailto:adityashriwas08@gmail.com"
          >
            Contact
          </a>
        </div>

        <div className="flex-shrink-0">
          <Feedback />
        </div>
      </div>

      <div className="border-t border-blue-300/15 py-2 text-center text-sm text-blue-100/60">
        (c) {new Date().getFullYear()} TaleCrafter AI. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
