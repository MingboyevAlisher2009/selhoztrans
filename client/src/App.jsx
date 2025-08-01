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
import Certificate from "./pages/certificate/page";

const App = () => {
  const { getUserInfo, isLoading, userInfo } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    getUserInfo();
  }, []);

  useEffect(() => {
    if (isLoading) return;

    const isCertificateRoute =
      window.location.pathname.startsWith("/certificate");

    if (isCertificateRoute) return;

    if (!userInfo) {
      navigate("/auth");
    } else if (window.location.pathname === "/auth") {
      navigate("/");
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
          <Route path="/certificate/:id" element={<Certificate />} />
          <Route path="/users" element={<Users />} />
          <Route path="/group/:id" element={<Group />} />
        </Routes>
      </AppSidebar>
    </SidebarProvider>
  );
};

export default App;
