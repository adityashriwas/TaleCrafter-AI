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
    <div className="px-2 py-1.5 sm:px-7 bg-primary text-white flex justify-between items-center">
      <h2 className="font-bold text-2xl sm:text-3xl tracking-tight">My Stories</h2>
      <div className="flex gap-2 items-center justify-center flex-col">
        <span className="text-2xl sm:text-3xl font-bold">
          <Image src={"/credits.png"} width={35} height={35} alt="coin" className="inline-flex"/> {userDetail?.credit}
        </span>
        <Link href="/buy-credits">
          <Button className="" color="secondary">
            Buy Credit
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default DashboardHeader;
