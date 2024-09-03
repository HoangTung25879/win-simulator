"use client"; // Error boundaries must be Client Components

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div
      role="alert"
      className="flex h-screen w-screen flex-col items-center justify-center bg-gray-900
        text-white"
    >
      <div className="flex flex-col rounded-lg bg-gray-800 p-8 shadow-lg">
        <h1 className="mb-4 text-5xl font-bold text-red-500">
          {error.message}
        </h1>
        <p className="mb-4 text-lg">
          Oops! Something went wrong on. Please try again later.
        </p>
        <button
          className="mt-4 rounded bg-red-600 px-6 py-2 text-lg font-semibold text-white
            hover:bg-red-700"
          onClick={reset}
        >
          Retry
        </button>
      </div>
    </div>
  );
}
