import React from "react";

const BookCoverPage = ({ imageUrl }: any) => {
  return (
    <div className="relative w-full h-full">
      {/* Cover Unavailable Message */}
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg border border-gray-700">
        <svg className="h-16 w-16 text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p className="text-center text-gray-400 font-medium text-lg">Book Cover</p>
        <p className="text-center text-gray-500 text-sm mt-2">Image currently unavailable</p>
        <p className="text-center text-gray-600 text-xs mt-1">API updates in progress</p>
      </div>
    </div>
  );
};

export default BookCoverPage;
