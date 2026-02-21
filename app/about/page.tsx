"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
const MotionDiv: any = motion.div;

const About = () => {
  const highlights = [
    {
      title: "AI Story Engine",
      description:
        "Generate structured stories with chapters, cover concepts, and scene-level prompts tuned to your selected genre and age category.",
    },
    {
      title: "Visual Consistency",
      description:
        "Create book-ready visuals across multiple styles while preserving a cohesive feel from cover to final chapter page.",
    },
    {
      title: "Narrated Reading",
      description:
        "Turn every generated story into an immersive read-and-listen experience with integrated text-to-speech support.",
    },
  ];

  const fadeUp = {
    hidden: { opacity: 0, y: 24 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#020b1f] px-6 py-12 text-blue-100 md:px-12 lg:px-24">
      <div className="tc-hero-grid absolute inset-0 opacity-30" />
      <div className="tc-hero-orb tc-hero-orb-one" />
      <div className="tc-hero-orb tc-hero-orb-two" />

      <div className="relative mx-auto max-w-6xl">
        <MotionDiv
          initial="hidden"
          animate="show"
          variants={fadeUp}
          transition={{ duration: 0.6 }}
          className="rounded-2xl border border-blue-300/20 bg-white/[0.04] p-6 text-center shadow-[0_15px_45px_rgba(0,0,0,0.35)] backdrop-blur-md md:p-10"
        >
          <h1 className="bg-gradient-to-b from-white via-blue-100 to-blue-300 bg-clip-text text-3xl font-extrabold text-transparent md:text-5xl">
            About TaleCrafter AI
          </h1>
          <p className="mx-auto mt-5 max-w-3xl text-base leading-relaxed text-blue-100/75 md:text-lg">
            TaleCrafter AI is built to help creators, educators, and storytellers
            produce premium digital storybooks with AI-generated writing,
            illustrations, and narration in one streamlined workflow.
          </p>
        </MotionDiv>

        <MotionDiv
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeUp}
          transition={{ delay: 0.1, duration: 0.6 }}
          className="mt-10 grid items-center gap-8 rounded-2xl border border-blue-300/20 bg-white/[0.03] p-5 shadow-xl backdrop-blur-sm md:grid-cols-2 md:p-8"
        >
          <div className="overflow-hidden rounded-xl border border-blue-300/20">
            <Image
              src="/demo.png"
              alt="TaleCrafter app preview"
              width={600}
              height={400}
              className="h-full w-full object-cover"
            />
          </div>
          <div>
            <h2 className="bg-gradient-to-b from-white to-blue-300 bg-clip-text text-2xl font-bold text-transparent md:text-3xl">
              Why teams choose TaleCrafter
            </h2>
            <ul className="mt-5 space-y-3 text-sm leading-relaxed text-blue-100/80 md:text-base">
              <li>Generate complete storybooks from short prompts or uploaded images.</li>
              <li>Match output to audience age, genre, and visual style instantly.</li>
              <li>Use narration-ready pages for classrooms and creator workflows.</li>
              <li>Access stories through a clean dashboard and interactive book reader.</li>
              <li>Explore community stories for faster ideation and inspiration.</li>
            </ul>
          </div>
        </MotionDiv>

        <MotionDiv
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.15 }}
          transition={{ staggerChildren: 0.08 }}
          className="mt-10 grid gap-5 md:grid-cols-3"
        >
          {highlights.map((item) => (
            <MotionDiv
              key={item.title}
              variants={fadeUp}
              transition={{ duration: 0.5 }}
              className="rounded-2xl border border-blue-300/20 bg-blue-500/10 p-6 backdrop-blur-sm"
            >
              <h3 className="text-xl font-semibold text-white">{item.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-blue-100/80 md:text-base">
                {item.description}
              </p>
            </MotionDiv>
          ))}
        </MotionDiv>

        <MotionDiv
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeUp}
          transition={{ duration: 0.6 }}
          className="mt-12 rounded-2xl border border-blue-300/20 bg-gradient-to-r from-blue-500/20 to-cyan-500/10 p-8 text-center shadow-xl backdrop-blur-sm"
        >
          <h3 className="text-2xl font-semibold text-white md:text-3xl">
            Build your next story universe
          </h3>
          <p className="mx-auto mt-3 max-w-3xl text-sm text-blue-100/80 md:text-lg">
            Launch from idea to illustrated storybook in minutes with an
            interface designed for modern product-grade storytelling.
          </p>
          <Link
            href="/create-story"
            className="mt-6 inline-block rounded-xl border border-blue-300/30 bg-gradient-to-r from-blue-500 to-cyan-400 px-6 py-3 font-semibold text-white transition hover:scale-[1.03] hover:from-blue-400 hover:to-cyan-300"
          >
            Start Creating
          </Link>
        </MotionDiv>
      </div>
    </div>
  );
};

export default About;
