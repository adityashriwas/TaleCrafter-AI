import { useState } from "react";
import Image from "next/image";

const BookCoverPage = ({ imageUrl }: { imageUrl?: string | null }) => {
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

      {imageUrl ? (
        <Image
          src={imageUrl}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className={`h-full w-full object-cover transition-opacity duration-300 ${
            imageLoaded ? "opacity-100" : "opacity-0"
          }`}
          alt="cover"
          priority
          unoptimized
          onLoad={() => setImageLoaded(true)}
          onError={() => setHasError(true)}
        />
      ) : null}
    </div>
  );
};

export default BookCoverPage;
