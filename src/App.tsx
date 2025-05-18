
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import MainLayout from "./components/layout/MainLayout";
import Index from "./pages/Index";
import Timer from "./pages/Timer";
import Planner from "./pages/Planner";
import StudyRooms from "./pages/StudyRooms";
import Resources from "./pages/Resources";
import Tools from "./pages/Tools";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Profile from "./pages/auth/Profile";
import NotFound from "./pages/NotFound";
import { StrictMode } from "react";

// Create a client
const queryClient = new QueryClient();

const App = () => (
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <AuthProvider>
            <Routes>
              <Route path="/" element={<MainLayout><Index /></MainLayout>} />
              <Route path="/tools" element={<MainLayout><ProtectedRoute><Tools /></ProtectedRoute></MainLayout>} />
              <Route path="/timer" element={<MainLayout><ProtectedRoute><Timer /></ProtectedRoute></MainLayout>} />
              <Route path="/planner" element={<MainLayout><ProtectedRoute><Planner /></ProtectedRoute></MainLayout>} />
              <Route path="/rooms" element={<MainLayout><ProtectedRoute><StudyRooms /></ProtectedRoute></MainLayout>} />
              <Route path="/resources" element={<MainLayout><ProtectedRoute><Resources /></ProtectedRoute></MainLayout>} />
              <Route path="/login" element={<MainLayout><Login /></MainLayout>} />
              <Route path="/register" element={<MainLayout><Register /></MainLayout>} />
              <Route path="/profile" element={<MainLayout><ProtectedRoute><Profile /></ProtectedRoute></MainLayout>} />
              <Route path="*" element={<MainLayout><NotFound /></MainLayout>} />
            </Routes>
          </AuthProvider>
        </TooltipProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>
);

export default App;
