"use client";
import React from "react";

import { cn } from "@/lib/utils";

const AvatarCircles = ({ numPeople, className, avatarUrls }) => {
  return (
    <div className={cn("z-10 flex -space-x-4 rtl:space-x-reverse", className)}>
      {avatarUrls.map((url, index) => (
        <div key={index}>
          <img
            key={index}
            className="h-10 w-10 rounded-full border-2 cursor-pointer border-white dark:border-gray-800"
            src={url.imageUrl}
            width={40}
            height={40}
            alt={`Avatar ${index + 1}`}
          />
        </div>
      ))}
      {(numPeople ?? 0) > 0 && (
        <p className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border-2 border-white bg-black text-center text-xs font-medium text-white hover:bg-gray-600 dark:border-gray-800 dark:bg-white dark:text-black">
          {numPeople}
        </p>
      )}
    </div>
  );
};

export default AvatarCircles;
