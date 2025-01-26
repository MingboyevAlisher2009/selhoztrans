import React, { useEffect } from "react";
import { SidebarProvider } from "./components/ui/sidebar";
import { Route, Routes, useNavigate } from "react-router-dom";
import Auth from "./pages/auth/page";
import Home from "./pages/home/page";
import Users from "./pages/users/page";
import Group from "./pages/group/page";
import { AppSidebar } from "./components/app-sidebar";
import useAuth from "./store/use-auth";
import { Loader } from "lucide-react";

const App = () => {
  const { getUserInfo, isLoading, userInfo } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    getUserInfo();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      navigate(
        userInfo
          ? window.location.pathname === "/auth"
            ? "/"
            : window.location.pathname
          : "/auth"
      );
    }
  }, [isLoading, userInfo, navigate]);

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-gradient-to-b from-background to-secondary/10 grid place-items-center">
        <Loader size={60} className="animate-spin text-primary" />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/users" element={<Users />} />
          <Route path="/group/:id" element={<Group />} />
        </Routes>
      </AppSidebar>
    </SidebarProvider>
  );
};

export default App;
