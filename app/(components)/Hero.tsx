"use client";
import { Button } from "@nextui-org/button";
import React from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import Video from "./Video";
import { motion } from "framer-motion";
const MotionDiv: any = motion.div;

const Hero = () => {
  const pricingPlans = [
    { name: "Basic", price: "$1.99", credits: "10" },
    { name: "Standard", price: "$2.99", credits: "30" },
    { name: "Premium", price: "$3.99", credits: "75" },
    { name: "Ultimate", price: "$5.99", credits: "150" },
  ];

  const { isSignedIn } = useUser();

  const featureItems = [
    {
      title: "AI-Powered Book Generation",
      description:
        "Turn any idea into a complete storybook with chapter flow, visuals, and polished output in seconds.",
      icon: "01",
    },
    {
      title: "Image to Story",
      description:
        "Upload an image and let AI detect scenes, mood, and characters to craft a tailored story concept.",
      icon: "02",
    },
    {
      title: "Illustration Styles",
      description:
        "Generate artwork in anime, watercolor, comic, oil paint, 3D, pixel, and more visual directions.",
      icon: "03",
    },
    {
      title: "Narrated Reading",
      description:
        "Play your story aloud with integrated text-to-speech for a more immersive reading experience.",
      icon: "04",
    },
    {
      title: "Global Language Support",
      description:
        "Create stories in multiple languages and share content with learners and readers across regions.",
      icon: "05",
    },
    {
      title: "Interactive Book Experience",
      description:
        "Read inside a page-flip interface that makes generated stories feel like real digital books.",
      icon: "06",
    },
  ];

  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <>
      <div className="relative overflow-hidden bg-[#020b1f] text-blue-100">
        <div className="tc-hero-grid absolute inset-0 opacity-40" />
        <div className="tc-hero-orb tc-hero-orb-one" />
        <div className="tc-hero-orb tc-hero-orb-two" />
        <div className="tc-hero-orb tc-hero-orb-three" />

        <section className="relative px-4 pt-14 pb-16 md:px-16 lg:px-32 xl:px-44">
          <MotionDiv
            initial="hidden"
            animate="show"
            transition={{ duration: 0.7 }}
            variants={fadeUp}
            className="mx-auto max-w-4xl text-center"
          >
            <span className="inline-flex items-center rounded-full border border-blue-300/30 bg-blue-500/10 px-5 py-2 text-sm font-medium tracking-wide text-blue-100 backdrop-blur-sm">
              Build cinematic storybooks with AI
            </span>
            <h1 className="mt-5 bg-gradient-to-b from-white via-blue-100 to-blue-300 bg-clip-text text-4xl font-extrabold leading-tight text-transparent sm:text-5xl md:text-6xl lg:text-7xl">
              TaleCrafter AI
              <span className="block text-3xl sm:text-4xl md:text-5xl lg:text-6xl">
                Product-grade story creation platform
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-3xl text-base font-medium leading-relaxed text-blue-100/75 sm:text-lg">
              Create polished, illustrated, and narrated digital books from a
              single prompt. Designed for creators, educators, and teams that
              want story production to feel premium.
            </p>
          </MotionDiv>

          <MotionDiv
            initial="hidden"
            animate="show"
            transition={{ delay: 0.2, duration: 0.6 }}
            variants={fadeUp}
            className="mt-8 flex flex-wrap items-center justify-center gap-4"
          >
            <Link href="/create-story">
              <Button className="rounded-xl border border-blue-300/30 bg-gradient-to-r from-blue-500 to-cyan-400 px-7 py-6 text-base font-semibold text-white shadow-[0_0_30px_rgba(29,141,255,0.3)] transition hover:scale-[1.03] hover:from-blue-400 hover:to-cyan-300">
                Create Story
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button className="rounded-xl border border-blue-200/30 bg-white/10 px-7 py-6 text-base font-semibold text-blue-100 backdrop-blur-sm transition hover:scale-[1.03] hover:bg-white/20">
                {isSignedIn ? "Dashboard" : "Get Started"}
              </Button>
            </Link>
          </MotionDiv>

          <MotionDiv
            initial="hidden"
            animate="show"
            transition={{ delay: 0.3, duration: 0.6 }}
            variants={fadeUp}
            className="mx-auto mt-12 grid max-w-5xl grid-cols-2 gap-3 rounded-2xl border border-blue-300/20 bg-white/[0.04] p-4 backdrop-blur-md sm:grid-cols-4"
          >
            <div className="rounded-xl bg-blue-400/10 p-4 text-center">
              <p className="text-2xl font-bold text-white">40+</p>
              <p className="text-xs uppercase tracking-wide text-blue-100/70">
                Languages
              </p>
            </div>
            <div className="rounded-xl bg-blue-400/10 p-4 text-center">
              <p className="text-2xl font-bold text-white">9</p>
              <p className="text-xs uppercase tracking-wide text-blue-100/70">
                Story Genres
              </p>
            </div>
            <div className="rounded-xl bg-blue-400/10 p-4 text-center">
              <p className="text-2xl font-bold text-white">7</p>
              <p className="text-xs uppercase tracking-wide text-blue-100/70">
                Art Styles
              </p>
            </div>
            <div className="rounded-xl bg-blue-400/10 p-4 text-center">
              <p className="text-2xl font-bold text-white">TTS</p>
              <p className="text-xs uppercase tracking-wide text-blue-100/70">
                Narrated Reading
              </p>
            </div>
          </MotionDiv>
        </section>

        <section className="relative px-4 pb-12 md:px-16 lg:px-32 xl:px-44">
          <div className="mx-auto max-w-5xl text-center">
            <h2 className="bg-gradient-to-b from-white via-blue-100 to-blue-300 bg-clip-text text-3xl font-bold text-transparent sm:text-4xl">
              Built for modern AI storytelling workflows
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-blue-100/70">
              Every major experience from idea generation to book-like reading
              is optimized for quality, speed, and visual consistency.
            </p>
          </div>

          <MotionDiv
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            transition={{ staggerChildren: 0.08 }}
            className="mx-auto mt-10 grid max-w-7xl grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
          >
            {featureItems.map((item) => (
              <MotionDiv
                key={item.title}
                variants={fadeUp}
                transition={{ duration: 0.5 }}
                className="group rounded-2xl border border-blue-300/20 bg-white/[0.04] p-6 shadow-[0_10px_40px_rgba(3,10,30,0.45)] backdrop-blur-sm transition hover:-translate-y-1 hover:border-blue-300/40 hover:bg-blue-400/10"
              >
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 text-sm font-bold text-white">
                  {item.icon}
                </span>
                <h3 className="mt-4 text-xl font-semibold text-white">
                  {item.title}
                </h3>
                <p className="mt-2 leading-relaxed text-blue-100/70">
                  {item.description}
                </p>
              </MotionDiv>
            ))}
          </MotionDiv>

          <div className="mt-16">
            <Video />
          </div>
        </section>

        <section className="relative px-4 pb-20 md:px-16 lg:px-32 xl:px-44">
          <div className="text-center">
            <h2 className="bg-gradient-to-b from-white via-blue-100 to-blue-300 bg-clip-text text-3xl font-bold text-transparent sm:text-4xl">
              Simple pricing for rapid creation
            </h2>
            <p className="mt-3 text-blue-100/70">
              Pick a plan and scale story generation as your usage grows.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-6 p-2 text-white">
              {pricingPlans.map((plan, index) => (
                <div
                  key={index}
                  className="w-full rounded-2xl border border-blue-300/20 bg-white/[0.04] p-6 text-center shadow-xl backdrop-blur-sm sm:w-64"
                >
                  <h3 className="text-lg font-semibold text-blue-100">
                    {plan.name}
                  </h3>
                  <p className="my-2 text-3xl font-extrabold text-white">
                    {plan.price}
                  </p>
                  <p className="text-blue-100/85">Get {plan.credits} Credits</p>

                  <Link href="/buy-credits">
                    <Button className="mt-4 rounded-xl border border-blue-300/30 bg-blue-500/80 px-6 py-5 text-sm font-semibold text-white transition hover:bg-blue-400">
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
