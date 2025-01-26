import React from "react";
import { Skeleton } from "../ui/skeleton";
import { motion } from "framer-motion";
import { Card, CardContent, CardFooter, CardHeader } from "../ui/card";

const HomeCardSkeleton = () => {
  return (
    <motion.div
    className="w-full lg:w-96"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="overflow-hidden group">
        <CardHeader className="p-0">
          <div className="relative">
            <Skeleton className={"w-full h-48  group-hover:scale-105"} />
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div>
              <Skeleton className="w-2/4 py-2.5" />
              <Skeleton className="h-3 w-[250px] mt-4" />
              <Skeleton className="h-3 w-[200px] mt-1" />

              {/* <p className="text-muted-foreground">{description}</p> */}
            </div>

            <div className="flex flex-wrap gap-2">
              <div className="flex items-center gap-1.5 text-sm bg-secondary/50 text-secondary-foreground px-2.5 py-1 rounded-full capitalize">
                <Skeleton className="w-4 h-4" />
                <Skeleton className={"px-8 py-2"} />
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="p-6 pt-0">
          <Skeleton className="w-full gap-2 py-4" />
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default HomeCardSkeleton;
