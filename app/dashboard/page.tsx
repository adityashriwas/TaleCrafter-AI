"use client";
import React from "react";
import DashboardHeader from "./_components/DashboardHeader";
import UserStoryList from "./_components/UserStoryList";
import { motion } from "framer-motion";
const MotionDiv: any = motion.div;

const Dashboard = () => {
  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <div className="relative min-h-screen bg-[#020b1f] px-5 py-8 md:px-16 lg:px-28 xl:px-40">
      <div className="tc-hero-grid absolute inset-0 opacity-35" />
      <div className="tc-hero-orb tc-hero-orb-one" />
      <div className="tc-hero-orb tc-hero-orb-two" />

      <MotionDiv
        initial="hidden"
        animate="show"
        variants={fadeUp}
        transition={{ duration: 0.55 }}
        className="relative"
      >
        <DashboardHeader />
      </MotionDiv>
      <MotionDiv
        initial="hidden"
        animate="show"
        variants={fadeUp}
        transition={{ delay: 0.08, duration: 0.5 }}
        className="relative"
      >
        <UserStoryList />
      </MotionDiv>
    </div>
  );
};

export default Dashboard;
