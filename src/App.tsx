import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import ProjectDetail from "./pages/ProjectDetail";
import Community from "./pages/Community";
import MachineRental from "./pages/MachineRental";
import Profiles from "./pages/Profiles";
import ProfileDiscovery from "./pages/ProfileDiscovery";
import Marketplace from "./pages/Marketplace";
import TestUsers from "./pages/TestUsers";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import StorageManagement from "./pages/StorageManagement";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/:id" element={<ProjectDetail />} />
          <Route path="/profiles" element={<Profiles />} />
          <Route path="/profile-discovery" element={<ProfileDiscovery />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/community" element={<Community />} />
          <Route path="/machine-rental" element={<MachineRental />} />
          <Route path="/storage-management" element={<StorageManagement />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/test-users" element={<TestUsers />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
