
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import ProjectDetail from "./pages/ProjectDetail";
import TasksPage from "./pages/TasksPage";
import Community from "./pages/Community";
import Marketplace from "./pages/Marketplace";
import MachineRental from "./pages/MachineRental";
import StorageManagement from "./pages/StorageManagement";
import Portfolio from "./pages/Portfolio";
import Profiles from "./pages/Profiles";
import ProfileDiscovery from "./pages/ProfileDiscovery";
import Settings from "./pages/Settings";
import TestUsers from "./pages/TestUsers";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/projects/:id" element={<ProjectDetail />} />
        <Route path="/tasks" element={<TasksPage />} />
        <Route path="/community" element={<Community />} />
        <Route path="/marketplace" element={<Marketplace />} />
        <Route path="/machine-rental" element={<MachineRental />} />
        <Route path="/storage-management" element={<StorageManagement />} />
        <Route path="/portfolio" element={<Portfolio />} />
        <Route path="/profiles" element={<Profiles />} />
        <Route path="/profile-discovery" element={<ProfileDiscovery />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/test-users" element={<TestUsers />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </Router>
  );
}

export default App;
