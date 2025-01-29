import React from "react";
import { Card, CardHeader, CardBody, CardFooter } from "@nextui-org/card";
import { Button } from "@nextui-org/react";
import { Image } from "@nextui-org/react";
import Link from "next/link";
type StoryItemType = {
  story: {
    id: string;
    storyType: string;
    ageGroup: string;
    storyId: string;
    storySubject: string;
    imageStyle: string;
    coverImage: string;
    userName: string;
    userImage: string;
    userEmail: string;
    output: [] | any;
  };
};
const StoryItemCard = ({ story }: StoryItemType) => {
  return (
    <Link href={'/view-story/'+story?.storyId}>
      <Card isFooterBlurred radius="lg" className="border-none hover:scale-105 transition-all cursor-pointer overflow-hidden">
        <Image
          alt="BookCoverImage"
          className="object-cover w-full "
          height={200}
          src={story?.coverImage}
          width="100%"
        />
        <CardFooter className="justify-between bg-white/10 border-white/20 border-1 py-1 absolute rounded-xl w-full bottom-0 shadow-small z-10"> 
          <p className="text-xl text-black/80">{story?.output?.title}</p>
          <Button
            className="text-tiny text-white bg-black/20"
            variant="flat"
            color="default"
            radius="full"
            size="sm"
          >
            Read
          </Button>
        </CardFooter>
      </Card>
    </Link>
  );
};

export default StoryItemCard;
