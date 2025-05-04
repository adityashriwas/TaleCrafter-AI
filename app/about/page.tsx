"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";

const About = () => {
  return (
    <div className="min-h-screen bg-[#0f031b] text-gray-300 px-6 py-12">
      <div className="max-w-6xl mx-auto">
        {/* Heading */}
        <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent text-center mb-6">
          About TaleCrafter AI
        </h1>

        {/* Intro */}
        <p className="text-lg md:text-xl text-gray-400 text-center mb-10">
          TaleCrafter AI is a story generation platform where ancient tales, historical events, and educational concepts come to life through AI-generated stories, illustrations, and voice.
        </p>

        {/* Content Section */}
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div>
            <Image
              src="/demo.png" // Replace with an actual path to a sample
              alt="Story example"
              width={600}
              height={400}
              className="rounded-xl shadow-lg"
            />
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-white mb-4">Why TaleCrafter?</h2>
            <ul className="list-disc pl-5 space-y-3 text-base leading-relaxed">
              <li>🎙️ Generates AI-powered educational stories with audio and visuals.</li>
              <li>📚 Creates shareable digital books for kids, students, and educators.</li>
              <li>🌐 Supports multilingual storytelling (English, Hindi and more).</li>
              <li>🧠 Offers historical insights and moral lessons in minutes.</li>
              <li>📤 Users can share their stories or explore curated ones by others.</li>
            </ul>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <h3 className="text-2xl md:text-3xl font-semibold text-white mb-4">Join the Revolution in Smart Education</h3>
          <p className="text-md md:text-lg text-gray-400 mb-6">
            Whether you're a student, teacher, or content creator — TaleCrafter AI empowers you to tell better stories, learn smarter, and preserve culture in a digital way.
          </p>
          <Link
            href="/create-story"
            className="inline-block bg-violet-600 hover:bg-violet-700 text-white font-semibold px-6 py-3 rounded-full transition duration-300"
          >
            Start Creating Your Tale
          </Link>
        </div>
      </div>
    </div>
  );
};

export default About;
