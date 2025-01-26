"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Separator } from "../ui/separator";

export default function GroupSkeleton() {
  return (
    <div className="container mx-auto max-w-4xl md:max-w-6xl px-4 py-4 sm:py-6">
      {/* Header Skeleton */}
      <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
        <Skeleton className="w-full lg:w-[40%] aspect-[4/3] max-w-full rounded-xl" />
        <div className="flex-1 space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-12 w-3/4 max-w-full" />
            <Skeleton className="h-5 w-1/2 max-w-full" />
          </div>
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-6 w-24 max-w-full" />
            <Skeleton className="h-6 w-32 max-w-full" />
          </div>
        </div>
      </div>

      {/* Members Section */}
      <div className="mt-12 lg:mt-16">
        <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center mb-6 sm:mb-10 gap-4 sm:gap-0">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Skeleton className="h-10 w-32 max-w-full" />
          </motion.div>
          <div className="flex flex-col sm:flex-row gap-2">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <Skeleton className="h-10 w-32 max-w-full" />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <Skeleton className="h-10 w-40 max-w-full" />
            </motion.div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={index} className="overflow-hidden">
              <CardHeader className="p-0">
                <Skeleton className="w-full h-48 max-w-full" />
              </CardHeader>
              <CardContent className="p-4 sm:p-6 space-y-4">
                <div className="space-y-2">
                  <Skeleton className="h-6 w-3/4 max-w-full" />
                  <Skeleton className="h-6 w-32 max-w-full" />
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-5 w-20 max-w-full" />
                  <Skeleton className="h-5 w-24 rounded-full max-w-full" />
                </div>
                <Separator />
                <Skeleton className="h-9 w-full max-w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
