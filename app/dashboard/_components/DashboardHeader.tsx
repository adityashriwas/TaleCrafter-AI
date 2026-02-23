"use client";
import { UserDetailContext } from "@/app/_context/UserDetailContext";
import { Button } from "@nextui-org/button";
import { Link } from "@nextui-org/react";
import Image from "next/image";
import React from "react";
import { useContext } from "react";
import { HiSparkles } from "react-icons/hi2";

const DashboardHeader = () => {
  const { userDetail } = useContext(UserDetailContext);

  return (
    <div className="tc-glass-panel p-5 shadow-[0_16px_45px_rgba(0,0,0,0.35)] md:p-8">
      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
        <div>
          <h2 className="tc-title-gradient text-3xl font-extrabold tracking-tight md:text-4xl">
            My Stories
          </h2>
          <p className="mt-2 text-sm text-blue-100/70 md:text-base">
            Manage your generated books, revisit ideas, and continue creating.
          </p>
        </div>

        <div className="flex flex-col items-start gap-3 md:items-end">
          <span className="inline-flex items-center rounded-xl border border-blue-300/20 bg-blue-500/10 px-4 py-2 text-lg font-bold text-white md:text-xl">
            <Image
              src={"/credits.png"}
              width={28}
              height={28}
              alt="coin"
              className="mr-2 inline-flex"
            />
            {userDetail?.credit ?? "-"}
          </span>
          <Link href="/buy-credits">
            <Button className="tc-btn-primary group bg-gradient-to-r from-blue-500 via-sky-500 to-cyan-400 px-6 py-5 text-sm shadow-[0_0_26px_rgba(59,130,246,0.38)] duration-200 hover:scale-[1.03] hover:from-blue-400 hover:via-sky-400 hover:to-cyan-300">
              <HiSparkles className="mr-2 text-base transition-transform duration-200 group-hover:rotate-12" />
              Buy Credits
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
