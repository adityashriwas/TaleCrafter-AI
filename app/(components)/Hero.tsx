"use client";
import { Button } from "@nextui-org/button";
import React from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import Video from "./Video";

const Hero = () => {
  const pricingPlans = [
    { name: "Basic", price: "$1.99", credits: "10", color: "bg-blue-600" },
    { name: "Standard", price: "$2.99", credits: "30", color: "bg-blue-600" },
    { name: "Premium", price: "$3.99", credits: "75", color: "bg-blue-500" },
    {
      name: "Ultimate",
      price: "$5.99",
      credits: "150",
      color: "bg-blue-500",
    },
  ];

  const { user, isSignedIn } = useUser();
  return (
    <>
      <div className="px-4 md:px-28 lg:px-44 relative min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-black via-[#0a0f25] to-[#071340] overflow-hidden">
        <div className="flex flex-col items-center min-h-screen mt-[20vh]">
          <h2 className="text-4xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold py-6 leading-none text-center block w-full bg-gradient-to-b from-gray-100 via-gray-300 to-gray-500 bg-clip-text text-transparent drop-shadow-lg">
            Convert your thoughts into stories with TaleCrafter AI
          </h2>

          <p className="px-8 sm:px-40 sm:leading-6 sm:text-xl bg-transparent text-center leading-none tracking-tight mb-8 font-semibold text-gray-400">
            Unleash your imagination with TaleCrafter AI – the ultimate
            AI-powered storytelling platform! Whether you're a writer, educator,
            or storyteller, bring your ideas to life effortlessly. Start
            crafting your unique story today!
          </p>
          <div className="flex flex-row space-x-4">
            <Link href="/create-story">
              <Button
                color="primary"
                className="p-2 sm:p-4 sm:text-base sm:size-full px-6 py-2 rounded-lg bg-gray-800 text-white shadow-md hover:bg-gray-700 transition"
              >
                Create Story
              </Button>
            </Link>
            <Link href={"/dashboard"}>
              <Button
                color="primary"
                className="p-2 sm:p-4 sm:text-base sm:size-full px-6 py-2 rounded-lg bg-gray-800 text-white shadow-md hover:bg-gray-700 transition"
              >
                {" "}
                {isSignedIn ? "Dashboard" : "Get Started"}
              </Button>
            </Link>
          </div>
        </div>

        {/* features sections */}
        <section className="min-h-screen">
          <div className="relative mx-auto max-w-5xl text-center">
            <h2 className="block w-full bg-gradient-to-b from-gray-100 via-gray-300 to-gray-500 bg-clip-text font-bold text-transparent text-3xl sm:text-4xl drop-shadow-lg">
              Next-Gen AI Storytelling Experience
            </h2>
            <p className="mx-auto my-4 w-full max-w-xl bg-transparent text-center font-medium leading-relaxed tracking-wide text-gray-400">
              Craft immersive, AI-generated stories with stunning visuals,
              multilingual support, and engaging audio narration.
            </p>
          </div>

          <div className="relative mx-auto max-w-7xl z-10 grid grid-cols-1 gap-10 pt-14 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-md border border-neutral-800 bg-neutral-900/50 p-8 text-center shadow">
              <h3 className="sm:text-xl mt-6 text-gray-400">
                📖 AI-Powered Book Generation
              </h3>
              <p className="my-4 mb-0 font-normal leading-relaxed tracking-wide text-gray-400">
                Create captivating stories in seconds with AI. Just enter a
                theme, and let AI bring your ideas to life.
              </p>
            </div>

            <div className="rounded-md border border-neutral-800 bg-neutral-900/50 p-8 text-center shadow">
              <h3 className="sm:text-xl mt-6 text-gray-400">
                🎨 Stunning AI-Generated Illustrations
              </h3>
              <p className="my-4 mb-0 font-normal leading-relaxed tracking-wide text-gray-400">
                Every story comes to life with unique, high-quality AI-generated
                images tailored to the theme and style you choose.
              </p>
            </div>

            <div className="rounded-md border border-neutral-800 bg-neutral-900/50 p-8 text-center shadow">
              <h3 className="sm:text-xl mt-6 text-gray-400">
                🔊 Immersive Audio Narration
              </h3>
              <p className="my-4 mb-0 font-normal leading-relaxed tracking-wide text-gray-400">
                Enhance storytelling with voice narration, making your books
                engaging and accessible for all.
              </p>
            </div>

            <div className="rounded-md border border-neutral-800 bg-neutral-900/50 p-8 text-center shadow">
              <h3 className="sm:text-xl mt-6 text-gray-400">
                🌍 Available in 40 Languages
              </h3>
              <p className="my-4 mb-0 font-normal leading-relaxed tracking-wide text-gray-400">
                Generate books in multiple languages, expanding your reach
                globally and making storytelling truly universal.
              </p>
            </div>

            <div className="rounded-md border border-neutral-800 bg-neutral-900/50 p-8 text-center shadow">
              <h3 className="sm:text-xl mt-6 text-gray-400">
                📚 Personalized Storytelling
              </h3>
              <p className="my-4 mb-0 font-normal leading-relaxed tracking-wide text-gray-400">
                Experience books like never before with interactive animations
                that make reading fun and visually engaging.
              </p>
            </div>

            <div className="rounded-md border border-neutral-800 bg-neutral-900/50 p-8 text-center shadow">
              <h3 className="sm:text-xl mt-6 text-gray-400">
                💰 Flexible Pricing Plans
              </h3>
              <p className="my-4 mb-0 font-normal leading-relaxed tracking-wide text-gray-400">
                Choose premium plans, with options to purchase credits for
                more story creation.
              </p>
            </div>
          </div>
        </section>

          <Video />

        {/* pricing section */}
        <section className="min-h-[50vh] mt-[20vh]">
          <div className="relative text-center">
            <h2 className="block w-full bg-gradient-to-b from-gray-100 via-gray-300 to-gray-500 bg-clip-text font-bold text-transparent text-3xl sm:text-4xl drop-shadow-lg">
              Pricing
            </h2>
            <div className="flex flex-wrap justify-center gap-6 p-8 text-white">
              {pricingPlans.map((plan, index) => (
                <div
                  key={index}
                  className="p-6 rounded-lg w-full sm:w-64 text-center shadow-lg border border-neutral-800 bg-neutral-900/50"
                >
                  <h3 className="text-lg font-semibold">{plan.name}</h3>
                  <p className="text-2xl font-bold my-2">{plan.price}</p>
                  <p className="">✔ Get {plan.credits} Credits</p>

                  <Link href="/buy-credits">
                    <Button className="p-2 sm:p-4 sm:text-base mt-4 px-6 py-2 rounded-lg bg-gray-800 text-white shadow-md hover:bg-gray-700 transition">
                      Select Plan
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default Hero;
