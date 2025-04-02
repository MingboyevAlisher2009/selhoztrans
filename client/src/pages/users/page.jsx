"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ImagePlus, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import PaginationCom from "@/components/pagination";
import DeleteModal from "../../components/delete-modal";
import StudentCard from "./components/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import useUsers from "@/store/use-users";
import { useMutation } from "@tanstack/react-query";
import axiosIntense from "@/http/axios";
import { toast } from "sonner";
import useAuth from "@/store/use-auth";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import UsersSkeleton from "@/components/skeletons/users-card";

export default function Users() {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [userId, setUserId] = useState(null);
  const inputRef = useRef();
  const [role, setRole] = useState(null);

  const { users, getUsers, isLoading: loading } = useUsers();
  const { userInfo } = useAuth();

  const toggleModal = () => setIsOpen(!isOpen);
  const toggleDeleteModal = () => setIsDeleteOpen(!isDeleteOpen);

  const formSchema = z.object({
    username: z.string().min(2, {
      message: "Username must be at least 2 characters.",
    }),
    email: z.string().email({
      message: "Invalid email.",
    }),
    password: z.string().min(6, {
      message: "Password must be at least 4 characters.",
    }),
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
  });

  const handleSelectChange = useCallback((value) => {
    setRole(value);
  }, []);

  const { mutate: signUp, isPending: isLoading } = useMutation({
    mutationFn: async (data) => {
      const response = await axiosIntense.post("/auth/sign-up", data);
      return response.data;
    },
    onSuccess: (data) => {
      getUsers();
      toggleModal();
      toast(`User ${data.username} added successfully`);
    },
    onError: (error) => {
      toast.error(
        `Error: ${error.response?.data?.message || "Something went wrong"}`
      );
    },
  });

  function onSubmit(values) {
    signUp({ ...values, role });
  }

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      await axiosIntense.delete(`/auth/${userId}`);
    },
    onSuccess: () => {
      getUsers();
      toggleDeleteModal();
      toast("User deleted succesfully");
    },
  });

  useEffect(() => {
    getUsers();
  }, []);

  return (
    <div>
      <div className="container mx-auto max-w-7xl">
        <div className="space-y-8">
          <div className="w-full flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                O'quvchilar
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setIsOpen(true)}
                size="sm"
                className="gap-2"
              >
                <Plus className="w-4 h-4" />
                Yangi o'quvchi
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap gap-5">
            {loading &&
              Array.from({ length: 6 }).map((_, i) => (
                <UsersSkeleton key={i} />
              ))}
            {!loading &&
              users &&
              users.map((student) => (
                <StudentCard
                  key={student._id}
                  {...student}
                  onDelete={() => {
                    setUserId(student._id);
                    toggleDeleteModal();
                  }}
                />
              ))}
          </div>
        </div>
      </div>
      <Dialog open={isOpen} onOpenChange={toggleModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-semibold">
              Foydalanauvchi
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <Label>Foydalanuvchi nomi</Label>
                    <FormControl>
                      <Input placeholder="Jon Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <Label>Email</Label>
                    <FormControl>
                      <Input placeholder="info@gmail.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {userInfo && userInfo.role === "SUPER_ADMIN" && (
                <FormField
                  control={form.control}
                  name="role"
                  render={() => (
                    <FormItem>
                      <Label>Role</Label>
                      <FormControl>
                        <Select
                          onValueChange={(value) => handleSelectChange(value)}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ADMIN">Admin</SelectItem>
                            <SelectItem value="STUDENT">O'quvchi</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <Label>Parol</Label>
                    <FormControl>
                      <Input placeholder="******" type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end">
                <Button disabled={isLoading} type="submit">
                  Qo'shish
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      <DeleteModal
        isPending={isPending}
        isOpen={isDeleteOpen}
        onOpenChange={toggleDeleteModal}
        onConfirm={mutate}
      />
    </div>
  );
}
