"use client";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import {
  BookOpen,
  Crown,
  ImageMinus,
  ImageOff,
  Medal,
  Star,
  Trash,
} from "lucide-react";
import { BASE_URL } from "@/http/api";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

const CourseCard = ({
  _id,
  title,
  description,
  level,
  achievement,
  imageUrl,
  onDelete,
}) => {
  const navigate = useNavigate();

  const levelColors = {
    beginner: "bg-emerald-500/10 text-emerald-500",
    intermediate: "bg-blue-500/10 text-blue-500",
    advanced: "bg-purple-500/10 text-purple-500",
  };

  const achievementIcons = {
    "First Step!": Star,
    "Number Master": Crown,
    "Super Learner": Medal,
  };

  const Icon = achievementIcons[achievement] || BookOpen;

  return (
    <motion.div
      className="w-full lg:w-96"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="overflow-hidden group hover:shadow-lg transition-all duration-300 h-full flex flex-col">
        <CardHeader className="p-0">
          <div className="relative">
            {imageUrl ? (
              <img
                src={imageUrl ? `${BASE_URL}${imageUrl}` : "/no-image.png"}
                alt={`Cover image for ${title} course`}
                className={cn(
                  "w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                )}
              />
            ) : (
              <div className="flex justify-center items-center w-full h-48">
                <ImageOff size={80}/>
              </div>
            )}

            <div className="absolute bottom-2 left-2">
              <Badge
                variant="secondary"
                className={`${levelColors[level]} font-medium capitalize`}
              >
                {level}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 flex-1">
          <div className="space-y-4">
            <div>
              <h3 className="text-2xl font-bold tracking-tight mb-2">
                {title}
              </h3>
              <p className="text-muted-foreground">{description}</p>
            </div>

            <div className="flex flex-wrap gap-2">
              <div className="flex items-center gap-1.5 text-sm bg-secondary/50 text-secondary-foreground px-2.5 py-1 rounded-full capitalize">
                <Icon className="w-4 h-4" />
                <span>{achievement.split("_").join(" ")}</span>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="p-6 w-full flex flex-col sm:flex-row gap-5">
          <Button
            onClick={() => navigate(`/group/${_id}`)}
            className="w-full gap-2"
            size="lg"
          >
            <BookOpen className="w-4 h-4" />
            Continue Learning
          </Button>
          <Button
            onClick={onDelete}
            variant="destructive"
            className="py-5 w-full"
          >
            <Trash />
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default CourseCard;
