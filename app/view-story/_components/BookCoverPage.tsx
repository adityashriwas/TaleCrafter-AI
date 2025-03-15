import Image from "next/image";
import React, { useState } from "react";

const BookCoverPage = ({ imageUrl }: any) => {
  const [imageLoaded, setImageLoaded] = useState(false); // Track image loading

  return (
    <div className="relative w-full h-full">
      {/* Loader (Spinner) */}
      {!imageLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-200 rounded-lg">
          <span className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full"></span>
        </div>
      )}

      {/* Image with Fade-in Effect */}
      <Image
        src={imageUrl}
        className={`object-cover w-full h-full transition-opacity duration-300 ${
          imageLoaded ? "opacity-100" : "opacity-0"
        }`}
        width={500}
        height={700}
        alt="cover"
        onLoadingComplete={() => setImageLoaded(true)} // Image load handler
      />
    </div>
  );
};

export default BookCoverPage;
