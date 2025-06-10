
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import MainLayout from "./components/layout/MainLayout";
import Index from "./pages/Index";
import Tools from "./pages/Tools";
import Resources from "./pages/Resources";
import MCQ from "./pages/MCQ";
import Test from "./pages/Test";
import Preparation from "./pages/Preparation";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Profile from "./pages/auth/Profile";
import NotFound from "./pages/NotFound";
import Forum from "./pages/Forum";
import ForumQuestion from "./pages/ForumQuestion";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import HelpCenter from "./pages/HelpCenter";
import ContactUs from "./pages/ContactUs";
import StudyAnalysisPage from "./pages/StudyAnalysis";
import { PomodoroPage } from "./pages/PomodoroPage.tsx";
import AchievementsLeaderboard from "./pages/AchievementsLeaderboard";
import Payment from "./pages/Payment"; // Added import for Payment page
import { StrictMode } from "react";
import ErrorBoundary from "./components/ErrorBoundary";
import ScrollToTop from "./components/ScrollToTop";

// Create a client
const queryClient = new QueryClient();

const App = () => (
  <StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <ScrollToTop />
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <AuthProvider>
              <Routes>
                <Route path="/" element={<MainLayout><Index /></MainLayout>} />
                <Route path="/tools/*" element={<MainLayout><ProtectedRoute><Tools /></ProtectedRoute></MainLayout>} />
                <Route path="/preparation" element={<MainLayout><ProtectedRoute><Preparation /></ProtectedRoute></MainLayout>} />
                <Route path="/resources" element={<MainLayout><ProtectedRoute><Resources /></ProtectedRoute></MainLayout>} />
                <Route path="/forum" element={<MainLayout><Forum /></MainLayout>} />
                <Route path="/forum/:id" element={<MainLayout><ForumQuestion /></MainLayout>} />
                <Route path="/mcq" element={<MainLayout><ProtectedRoute><MCQ /></ProtectedRoute></MainLayout>} />
                <Route path="/test" element={<MainLayout><ProtectedRoute><Test /></ProtectedRoute></MainLayout>} />
                <Route path="/login" element={<MainLayout><Login /></MainLayout>} />
                <Route path="/register" element={<MainLayout><Register /></MainLayout>} />
                <Route path="/profile" element={<MainLayout><ProtectedRoute><Profile /></ProtectedRoute></MainLayout>} />
                <Route path="/help-center" element={<MainLayout><HelpCenter /></MainLayout>} />
                <Route path="/contact-us" element={<MainLayout><ContactUs /></MainLayout>} />
                <Route path="/privacy-policy" element={<MainLayout><PrivacyPolicy /></MainLayout>} />
                <Route path="/terms-of-service" element={<MainLayout><TermsOfService /></MainLayout>} />
                <Route path="/study-analysis" element={<MainLayout><ProtectedRoute><StudyAnalysisPage /></ProtectedRoute></MainLayout>} />
                <Route path="/pomodoro" element={<MainLayout><ProtectedRoute><PomodoroPage /></ProtectedRoute></MainLayout>} />
                <Route path="/achievements" element={<MainLayout><ProtectedRoute><AchievementsLeaderboard /></ProtectedRoute></MainLayout>} />
                <Route path="/payment" element={<MainLayout><ProtectedRoute><Payment /></ProtectedRoute></MainLayout>} /> {/* Added route for Payment */}
                <Route path="*" element={<MainLayout><NotFound /></MainLayout>} />
              </Routes>
            </AuthProvider>
          </TooltipProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  </StrictMode>
);

export default App;
