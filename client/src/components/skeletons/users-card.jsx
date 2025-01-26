import React from "react";
import { Skeleton } from "../ui/skeleton";
import { motion } from "framer-motion";
import { Card, CardContent, CardFooter, CardHeader } from "../ui/card";
import { Book, Users } from "lucide-react";

const UsersSkeleton = () => {
  return (
    <motion.div
      className="w-full lg:w-96"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="overflow-hidden group hover:shadow-lg transition-all duration-300 flex flex-col h-full">
        <CardHeader className="p-6 text-center">
          <div className="relative mx-auto">
            <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-primary/20 to-secondary/20 blur-lg opacity-75 group-hover:opacity-100 transition-opacity duration-500" />
            <Skeleton className="w-32 h-32 rounded-full border-4 border-background shadow-xl mx-auto group-hover:scale-105" />
          </div>
          <Skeleton className="w-32 h-6 mx-auto" />
          <div className="mt-2 px-4">
            <Skeleton
              className={
                "w-52 h-4 mx-auto"
              }
            />
          </div>
        </CardHeader>

        <CardContent className="p-6 pt-0 flex-1">
          <div className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Book className="w-4 h-4" />
                  <span>Groups</span>
                </div>
                  <div className="flex gap-2 justify-center">
                  <Skeleton className={"w-20 h-4"}/>
                  <Skeleton className={"w-20 h-4"}/>
                  <Skeleton className={"w-20 h-4"}/>
                  </div>
                </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="w-4 h-4" />
                    <span>Attendance</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Skeleton className={"w-12 h-4"}/>
                  </div>
                </div>
               <Skeleton className={"w-full h-4"}/>
              </div>
            
          </div>
        </CardContent>

        <CardFooter className="p-6">
          <Skeleton className="w-full gap-2 py-4" />
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default UsersSkeleton;
