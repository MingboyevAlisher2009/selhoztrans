import {
  Home,
  Loader,
  LogIn,
  Moon,
  Sun,
  User,
  User2,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";

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
import { BASE_URL } from "@/http/api";
import { useMutation } from "@tanstack/react-query";
import axiosIntense from "@/http/axios";
import { useTheme } from "./providers/theme-provider";
import useAuth from "@/store/use-auth";

const navigationItems = [
  {
    title: "Home",
    url: "/",
    icon: Home,
  },
  {
    title: "Users",
    url: "/users",
    icon: Users,
  },
];

export function AppSidebar({ children }) {
  const context = useTheme();
  const { userInfo, getUserInfo } = useAuth();

  const isDark = context.theme === "dark";
  const pathname = window.location.pathname;

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      await axiosIntense.post("/auth/logout");
      return;
    },
    onSuccess: () => {
      getUserInfo();
      window.location.pathname = "/auth";
    },
  });

  return (
    <>
      {pathname === "/auth" || (userInfo && userInfo.role === "STUDENT") ? (
        children
      ) : (
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
                          src={`${BASE_URL}${userInfo && userInfo.imageUrl}`}
                          alt="User avatar"
                        />
                        <AvatarFallback>
                          <User2 />
                        </AvatarFallback>
                      </Avatar>
                      <div className="text-left">
                        <h3 className="text-sm font-medium leading-none">
                          {userInfo && userInfo.username}
                        </h3>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {userInfo && userInfo.email}
                        </p>
                      </div>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-72">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
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
                          <span>{isDark ? "Light mode" : "Dark mode"}</span>
                        </div>
                        <Switch
                          checked={isDark}
                          onCheckedChange={() =>
                            context.setTheme(isDark ? "light" : "dark")
                          }
                        />
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={mutate}
                      className="gap-3 p-3 text-destructive focus:bg-destructive focus:text-destructive-foreground"
                    >
                      <LogIn className="h-4 w-4" />
                      {isPending ? (
                        <span>Loading...</span>
                      ) : (
                        <span>Logout</span>
                      )}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </header>
            <main className="p-6">{children}</main>
          </SidebarInset>
        </>
      )}
    </>
  );
}
