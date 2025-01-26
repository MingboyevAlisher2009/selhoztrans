"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import useAuth from "@/store/use-auth";
import axiosIntense from "@/http/axios";

const formSchema = z.object({
  email: z.string().email({
    message: "Invalid email address, please check and try again.",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
});

export default function Auth() {
  const { getUserInfo } = useAuth();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: async (formData) => {
      await axiosIntense.post(`/auth/login`, formData);
    },
    onSuccess: () => {
      getUserInfo();
      window.location.pathname = "/";
      toast("Login successful");
    },
    onError: () => {
      toast("Something went wrong error.");
    },
  });

  function onSubmit(data) {
    mutate(data);
  }

  return (
    <div className="flex justify-center items-center w-full h-screen">
      <div className="w-full max-w-md space-y-6 p-6">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold">Sign In</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Enter your email below to sign in to your account
          </p>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <label>Email</label>
                  <FormControl>
                    <Input
                      placeholder="info@example.com"
                      type="email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <label>Password</label>
                  <FormControl>
                    <Input
                      placeholder="Enter your password"
                      type="password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isPending}>
              Sign In
              {isPending && (
                <span className="dark:border-black border-b-2 rounded-full w-6 h-6 animate-spin"></span>
              )}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
