import React, { useState } from "react";

const BookCoverPage = ({ imageUrl }: any) => {
  const [imageLoaded, setImageLoaded] = useState(false); // Track image loading
  const [hasError, setHasError] = useState(false);

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#001230]">
      {/* Loader (Spinner) */}
      {!imageLoaded && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#001230]">
          <span className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></span>
        </div>
      )}

      {hasError ? (
        <div className="flex h-full w-full items-center justify-center bg-[#001230] p-4 text-center text-sm text-blue-100">
          Cover image is taking too long to load. Please refresh to retry.
        </div>
      ) : (
        <img
          src={imageUrl}
          className={`h-full w-full object-cover transition-opacity duration-300 ${
            imageLoaded ? "opacity-100" : "opacity-0"
          }`}
          alt="cover"
          loading="eager"
          onLoad={() => setImageLoaded(true)}
          onError={() => setHasError(true)}
        />
      )}
    </div>
  );
};

export default BookCoverPage;
