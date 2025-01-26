"use client";

import { BASE_URL } from "@/http/api";
import useAuth from "@/store/use-auth";
import {
  User,
  Mail,
  Calendar,
  Users,
  CheckCircle2,
  XCircle,
  GraduationCap,
  Trash,
  ImagePlus,
  Loader2,
  LogOut,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import axiosIntense from "@/http/axios";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const StudentPage = () => {
  const { userInfo, getUserInfo } = useAuth();
  const fileInputRef = useRef(null);
  const [isHovering, setIsHovering] = useState(false);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const now = Date.now();

  const stats = [
    {
      title: "Total Groups",
      value: userInfo.attendance?.totalGroups || 0,
      icon: Users,
    },
    {
      title: "Total Sessions",
      value: userInfo.attendance?.totalSessions || 0,
      icon: Calendar,
    },
    {
      title: "Attended",
      value: userInfo.attendance?.attendedSessions || 0,
      icon: CheckCircle2,
    },
    {
      title: "Missed",
      value: userInfo.attendance?.notAttendedSessions || 0,
      icon: XCircle,
    },
  ];

  const { mutate: addImage, isPending: isUploading } = useMutation({
    mutationFn: async (e) => {
      const file = e.target.files?.[0];
      if (!file) throw new Error("No file selected");

      if (file.size > 5 * 1024 * 1024) {
        throw new Error("File size must be less than 5MB");
      }

      const formData = new FormData();
      formData.append("profile-image", file);
      await axiosIntense.post("/auth/add-profile-image", formData);
    },
    onSuccess: () => {
      getUserInfo();
      queryClient.invalidateQueries({ queryKey: ["user"] });
      toast.success("Profile image updated successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update profile image");
    },
  });

  const { mutate: removeImage, isPending: isRemoving } = useMutation({
    mutationFn: async () => {
      return await axiosIntense.delete(`/auth/image/${now}`);
    },
    onSuccess: () => {
      getUserInfo();
      toast.success("Profile image removed successfully");
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.error || "Failed to remove profile image"
      );
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      await axiosIntense.post("/auth/logout");
      return;
    },
    onSuccess: () => {
      window.location.pathname = "/auth";
    },
  });

  const handleImageUpload = (e) => {
    if (isUploading) return;
    addImage(e);
  };

  const handleImageRemove = () => {
    if (isRemoving) return;
    removeImage();
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl space-y-8">
      {/* Profile Header */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-3xl" />
        <div className="=]['/=]}+-{o0.,} flex flex-col lg:flex-row items-center gap-8 p-8 rounded-3xl bg-card">
          <div
            className="relative group"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          >
            {userInfo.imageUrl ? (
              <img
                className="w-48 h-48 rounded-full object-cover border-4 border-background shadow-xl transition-transform duration-500 group-hover:scale-105"
                src={`${BASE_URL}${userInfo.imageUrl}`}
                alt={userInfo.username}
              />
            ) : (
              <div className="w-48 h-48 rounded-full bg-muted/50 flex items-center justify-center border-4 border-background shadow-xl transition-transform duration-500 group-hover:scale-105">
                <User size={64} className="text-muted-foreground" />
              </div>
            )}
            <div
              className={cn(
                "absolute inset-0 rounded-full z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center transition-all duration-300",
                isHovering ? "opacity-100" : "opacity-0"
              )}
            >
              {isUploading || isRemoving ? (
                <Loader2 className="h-8 w-8 text-white animate-spin" />
              ) : userInfo.imageUrl ? (
                <button
                  onClick={handleImageRemove}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors"
                  disabled={isRemoving}
                >
                  <Trash size={30} className="text-white" />
                </button>
              ) : (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors"
                  disabled={isUploading}
                >
                  <ImagePlus size={30} className="text-white cursor-pointer" />
                </button>
              )}
              <Input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
          </div>

          <div className="flex-1 text-center lg:text-left space-y-4">
            <div>
              <h1 className="text-4xl font-bold mb-2">{userInfo.username}</h1>
              <div className="flex items-center gap-2 justify-center lg:justify-start text-muted-foreground">
                <Mail className="w-4 h-4" />
                <span>{userInfo.email}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
              <Badge variant="secondary" className="text-sm capitalize">
                {userInfo.role.toLowerCase()}
              </Badge>
              <Badge variant="outline" className="text-sm">
                Joined {format(new Date(userInfo.createdAt), "MMM dd yyyy")}
              </Badge>
            </div>

            <div className="flex items-center gap-2 justify-center lg:justify-start">
              <Progress
                value={userInfo.attendance?.attendanceRate || 0}
                className="w-48"
              />
              <span className="text-sm text-muted-foreground">
                {userInfo.attendance?.attendanceRate || 0}% Attendance
              </span>
            </div>
          </div>
          <Button
            onClick={mutate}
            disabled={isPending}
            className="cursor-pointer z-50"
            variant="destructive"
          >
            <LogOut />
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Groups Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Your Groups</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {userInfo.groups?.length === 0 ? (
            <div className="col-span-full text-center py-10 text-muted-foreground">
              You haven't joined any groups yet.
            </div>
          ) : (
            userInfo.groups?.map((group, index) => (
              <motion.div
                key={group._id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="group hover:shadow-lg transition-shadow duration-300">
                  <div className="relative aspect-video rounded-t-lg overflow-hidden">
                    <img
                      src={
                        group.imageUrl
                          ? `${BASE_URL}${group.imageUrl}`
                          : "/placeholder.svg?height=200&width=300"
                      }
                      alt={group.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </div>
                  <CardContent className="pt-6">
                    <h3 className="text-xl font-bold mb-2 line-clamp-1">
                      {group.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {group.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <GraduationCap className="w-4 h-4 text-primary" />
                        <span className="text-sm">
                          {group.attendance.totalSessions} Sessions
                        </span>
                      </div>
                      <Badge
                        variant={
                          group.attendance.attendanceRate === 100
                            ? "default"
                            : "secondary"
                        }
                      >
                        {group.attendance.attendanceRate}% Attendance
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Today's Activity */}
      {userInfo.attendance?.today && userInfo.attendance.today.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Today's Activity</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userInfo.attendance.today.map((activity) => (
              <Card key={activity.groupId}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <Badge
                      variant={
                        activity.status === "attending"
                          ? "default"
                          : "secondary"
                      }
                    >
                      {activity.status}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(activity.timestamp), "HH:mm")}
                    </span>
                  </div>
                  <h3 className="font-semibold">{activity.groupTitle}</h3>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentPage;
