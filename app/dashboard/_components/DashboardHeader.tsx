"use client";
import { UserDetailContext } from "@/app/_context/UserDetailContext";
import { Button } from "@nextui-org/button";
import { Link } from "@nextui-org/react";
import Image from "next/image";
import React from "react";
import { useContext } from "react";

const DashboardHeader = () => {
  const { userDetail, setUserDetail } = useContext(UserDetailContext);

  return (
    <div className="px-2 py-1.5 sm:px-7 border border-neutral-800 bg-neutral-900/50 p-8 shadow flex justify-between items-center">
      <h2 className="text-2xl sm:text-3xl tracking-tight block w-full bg-gradient-to-b from-white to-gray-400 bg-clip-text font-bold text-transparent">
        My Stories
      </h2>
      <div className="flex gap-2 items-center justify-center flex-col">
        <span className="text-2xl sm:text-3xl tracking-tight block w-full bg-gradient-to-b from-white to-gray-400 bg-clip-text font-bold text-transparent">
          <Image
            src={"/credits.png"}
            width={35}
            height={35}
            alt="coin"
            className="inline-flex"
          />{" "}
          {userDetail?.credit}
        </span>
        <Link href="/buy-credits">
          <Button className="bg-gray-800 text-white shadow-md hover:bg-gray-700 transition">
            Buy Credit
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default DashboardHeader;
