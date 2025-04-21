import {
  Edit,
  Home,
  ImagePlus,
  LogIn,
  Moon,
  Sun,
  User2,
  Users,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { BASE_URL } from "@/http/api";
import axiosIntense from "@/http/axios";
import { useTheme } from "./providers/theme-provider";
import useAuth from "@/store/use-auth";
import { toast } from "sonner";

const navigationItems = [
  {
    title: "Uy",
    url: "/",
    icon: Home,
  },
  {
    title: "Foydalanuvchilar",
    url: "/users",
    icon: Users,
  },
];

export function AppSidebar({ children }) {
  const { theme, setTheme } = useTheme();
  const { userInfo, getUserInfo } = useAuth();
  const [isOpen, setIsOpenState] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [form, setForm] = useState({
    imageUrl: (userInfo && userInfo.imageUrl) || "",
    email: userInfo?.email || "",
    username: userInfo?.username || "",
  });

  const setIsOpen = useCallback(
    (open) => {
      setIsOpenState(open);

      if (!open) {
        setPreviewUrl(null);
        setIsDragging(false);
        setForm({
          imageUrl: userInfo.imageUrl || "",
          email: userInfo?.email || "",
          username: userInfo?.username || "",
        });
      }
    },
    [userInfo]
  );

  const isDark = theme === "dark";
  const pathname = window.location.pathname;

  const handleInputChange = useCallback((e) => {
    const { id, value, files } = e.target;

    if (id === "image" && files?.[0]) {
      const file = files[0];
      setForm((prev) => ({ ...prev, imageUrl: file }));

      const reader = new FileReader();
      reader.onloadend = () => setPreviewUrl(reader.result);
      reader.readAsDataURL(file);
    } else {
      setForm((prev) => ({ ...prev, [id]: value }));
    }
  }, []);

  const handleFileInput = useCallback(
    (file) => {
      if (file && file.type.startsWith("image/")) {
        const event = {
          target: {
            id: "image",
            files: [file],
          },
        };
        handleInputChange(event);
      }
    },
    [handleInputChange]
  );

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      handleFileInput(file);
    },
    [handleFileInput]
  );

  const handleImageClear = useCallback(() => {
    setForm((prev) => ({ ...prev, imageUrl: "" }));
    setPreviewUrl(null);
  }, []);

  const handleImageClick = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.id = "imageUrl";
    input.onchange = (e) => {
      const file = e.target.files?.[0];
      if (file) handleFileInput(file);
    };
    input.click();
  }, [handleFileInput]);

  const handleSubmit = async () => {
    try {
      const formData = new FormData();
      formData.append("profile-image", form.imageUrl);
      let image;

      if (form.imageUrl) {
        image = await axiosIntense.post("/auth/add-profile-image", formData);
      }

      await axiosIntense.put("/auth", {
        ...form,
        imageUrl: image ? image.data.imageUrl : null,
      });

      getUserInfo();
      setIsOpen(false);
      toast("Profile updated successfully");
    } catch (error) {
      toast.error("Something went wrong.");
      console.error(error);
    }
  };

  const { mutate: logout, isPending } = useMutation({
    mutationFn: async () => {
      await axiosIntense.post("/auth/logout");
    },
    onSuccess: () => {
      getUserInfo();
      window.location.pathname = "/auth";
    },
  });

  useEffect(() => {
    return () => {
      document.body.style.removeProperty("pointer-events");
    };
  }, [isOpen, setIsOpen]);

  if (pathname === "/auth" || (userInfo && userInfo.role === "STUDENT")) {
    return children;
  }

  return (
    <>
      <Sidebar>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel className="flex items-center gap-2 px-2 text-xl font-semibold tracking-tight">
              <div className="rounded-md bg-primary/10 p-1">
                <Users className="h-5 w-5 text-primary" />
              </div>
              Project
            </SidebarGroupLabel>
            <SidebarGroupContent className="mt-4">
              <SidebarMenu>
                {navigationItems.map((item) => {
                  const isActive = pathname === item.url;
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        className="h-11 gap-3 text-base hover:bg-secondary"
                      >
                        <Link to={item.url}>
                          <item.icon className="h-5 w-5" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>

      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center border-b px-4">
          <div className="flex w-full items-center justify-between">
            <SidebarTrigger />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="group flex items-center gap-3 rounded-lg p-2 outline-none hover:bg-secondary">
                  <Avatar>
                    <AvatarImage
                      className="bg-cover object-cover"
                      src={
                        userInfo?.imageUrl
                          ? `${BASE_URL}${userInfo.imageUrl}`
                          : ""
                      }
                      alt="User avatar"
                    />
                    <AvatarFallback>
                      <User2 />
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-left">
                    <h3 className="text-sm font-medium leading-none">
                      {userInfo?.username}
                    </h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {userInfo?.email}
                    </p>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-72">
                <DropdownMenuLabel>Mening hisobim</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-default gap-3 p-3"
                  onSelect={(e) => e.preventDefault()}
                >
                  <div className="flex flex-1 items-center justify-between">
                    <div className="flex items-center gap-3">
                      {isDark ? (
                        <Sun className="h-4 w-4" />
                      ) : (
                        <Moon className="h-4 w-4" />
                      )}
                      <span>{isDark ? "Kunki rejim" : "Tungi rejim"}</span>
                    </div>
                    <Switch
                      checked={isDark}
                      onCheckedChange={() =>
                        setTheme(isDark ? "light" : "dark")
                      }
                    />
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setIsOpen(true)}
                  className="gap-3 p-3"
                >
                  <Edit className="h-4 w-4" />
                  Tahrirlash
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={logout}
                  className="gap-3 p-3 text-destructive focus:bg-destructive focus:text-destructive-foreground"
                >
                  <LogIn className="h-4 w-4" />
                  {isPending ? "Yuklanmoqda..." : "Chiqish"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <main className="p-6">{children}</main>
      </SidebarInset>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Tahrirlash</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div
              className={`relative group cursor-pointer ${
                isDragging ? "border-primary" : "border-border"
              } border-2 border-dashed rounded-lg transition-colors duration-200`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {previewUrl ? (
                <div className="relative aspect-video">
                  <img
                    className="w-full h-full rounded-lg object-cover"
                    src={previewUrl || "/placeholder.svg"}
                    alt="Preview"
                  />
                  <button
                    type="button"
                    onClick={handleImageClear}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-background/80 hover:bg-background transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div
                  onClick={handleImageClick}
                  className="aspect-video flex flex-col items-center justify-center gap-4 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <div className="p-4 rounded-full bg-secondary">
                    <ImagePlus className="h-6 w-6" />
                  </div>
                  <div className="text-center space-y-1">
                    <p className="text-sm font-medium">
                      Drag and drop your image here, or click to select
                    </p>
                    <p className="text-xs">Supports: JPG, PNG, GIF</p>
                  </div>
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="example@gmail.com"
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, email: e.target.value }))
                }
                value={form.email}
                className="col-span-3"
              />
            </div>

            <div>
              <Label htmlFor="username" className="text-right">
                Foydalanuvchi nomi
              </Label>
              <Input
                id="username"
                placeholder="username"
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, username: e.target.value }))
                }
                value={form.username}
                className="col-span-3"
              />
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="destructive" type="button">
                Yopish
              </Button>
            </DialogClose>
            <Button
              type="submit"
              disabled={!form.username || !form.email}
              onClick={handleSubmit}
            >
              Saqlash
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
