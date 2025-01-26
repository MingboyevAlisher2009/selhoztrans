"use client";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { Book, Mail, Trash, User, Users, X } from "lucide-react";
import { BASE_URL } from "@/http/api";

const StudentCard = ({
  username,
  email,
  groups = [],
  imageUrl,
  attendance = {
    totalSessions: 0,
    attendedSessions: 0,
    attendancePercentage: 0,
  },
  role,
  onDelete,
}) => {
  const isStudent = role !== "ADMIN";

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
            {imageUrl ? (
              <img
                src={`${BASE_URL}${imageUrl}`}
                alt={username}
                className="relative w-32 h-32 rounded-full object-cover border-4 border-background shadow-xl mx-auto transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="relative flex items-center justify-center w-32 h-32 rounded-full border-4 border-background shadow-xl mx-auto bg-muted">
                <User className="w-16 h-16 text-muted-foreground" />
              </div>
            )}
          </div>
          <CardTitle className="mt-4 text-2xl font-bold line-clamp-1">
            {username}
          </CardTitle>
          <div className="mt-2 px-4">
            <Badge
              variant="secondary"
              className="max-w-full inline-flex items-center truncate"
            >
              <Mail className="w-4 h-4 mr-1 flex-shrink-0" />
              <span className="truncate">{email}</span>
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-6 pt-0 flex-1">
          <div className="space-y-6">
            {isStudent && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Book className="w-4 h-4" />
                  <span>Groups</span>
                </div>
                {groups.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {groups.map((group, i) => (
                      <Badge
                        key={i}
                        variant="outline"
                        className="bg-secondary/50 hover:bg-secondary/70 transition-colors"
                      >
                        {group.name}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-smd bg-destructive/10 text-destructive rounded-md p-2">
                    <X className="w-4 h-4" />
                    <span>No groups assigned</span>
                  </div>
                )}
              </div>
            )}

            {isStudent && (
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="w-4 h-4" />
                    <span>Attendance</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">
                      {attendance.attendedSessions}/{attendance.totalSessions}
                    </span>
                    <Badge variant="secondary">
                      {attendance.attendancePercentage}%
                    </Badge>
                  </div>
                </div>
                <Progress
                  value={attendance.attendancePercentage}
                  className="h-2"
                />
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter className="p-6">
          <Button
            onClick={onDelete}
            variant="destructive"
            className="w-full gap-2 hover:bg-destructive/90 transition-colors"
            size="lg"
          >
            <Trash className="w-4 h-4" />
            Delete
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default StudentCard;
