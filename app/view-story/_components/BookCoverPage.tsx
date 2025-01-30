import Image from "next/image";
import React from "react";

const BookCoverPage = ({ imageUrl }: any) => {
  return (
    <div>
      <Image
        src={imageUrl}
        className="object-cover w-full h-full"
        width={500}
        height={700}
        alt="cover"
      />
    </div>
  );
};

export default BookCoverPage;
