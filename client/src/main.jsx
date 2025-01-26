import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { ThemeProvider } from "./components/providers/theme-provider";
import { BrowserRouter } from "react-router-dom";
import QueryProvider from "./components/providers/query.provider";
import { Toaster } from "sonner";

createRoot(document.getElementById("root")).render(
  <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
    <QueryProvider>
      <BrowserRouter>
        <App />
        <Toaster />
      </BrowserRouter>
    </QueryProvider>
  </ThemeProvider>
);
