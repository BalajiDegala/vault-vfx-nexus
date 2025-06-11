
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  Filter, 
  Plus, 
  Briefcase, 
  Clock, 
  Users, 
  Star,
  Calendar,
  DollarSign
} from "lucide-react";
import CreateProjectModal from "./CreateProjectModal";
import ProjectCard from "./ProjectCard";

const ProjectsHub = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("browse");

  // Mock data for now - this will come from Supabase later
  const mockProjects = [
    {
      id: "1",
      title: "Sci-Fi Battle Sequence",
      description: "Creating epic space battle VFX for upcoming blockbuster film",
      budget: "$50,000 - $75,000",
      deadline: "2024-02-15",
      client: "Marvel Studios",
      skills: ["3D Animation", "Compositing", "Particle Systems"],
      status: "Open",
      applications: 12,
      image: "/placeholder.svg"
    },
    {
      id: "2", 
      title: "Dragon Animation Project",
      description: "High-quality dragon character animation for fantasy series",
      budget: "$25,000 - $40,000",
      deadline: "2024-01-30",
      client: "HBO",
      skills: ["Character Animation", "Rigging", "Texturing"],
      status: "In Progress",
      applications: 8,
      image: "/placeholder.svg"
    },
    {
      id: "3",
      title: "Car Chase Destruction",
      description: "Realistic vehicle destruction and environmental effects",
      budget: "$30,000 - $50,000", 
      deadline: "2024-03-10",
      client: "Universal Pictures",
      skills: ["Destruction Simulation", "Compositing", "Motion Graphics"],
      status: "Open",
      applications: 15,
      image: "/placeholder.svg"
    }
  ];

  const filteredProjects = mockProjects.filter(project =>
    project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-2">
            VFX Projects Hub
          </h1>
          <p className="text-gray-400">Discover and manage amazing VFX projects</p>
        </div>
        <Button 
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 mt-4 md:mt-0"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Project
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search projects, skills, or keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-gray-800/50 border-gray-600 text-white"
          />
        </div>
        <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800">
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-gray-800/50 border-gray-600">
          <TabsTrigger value="browse" className="data-[state=active]:bg-blue-600">
            <Briefcase className="h-4 w-4 mr-2" />
            Browse Projects
          </TabsTrigger>
          <TabsTrigger value="my-projects" className="data-[state=active]:bg-blue-600">
            <Users className="h-4 w-4 mr-2" />
            My Projects
          </TabsTrigger>
          <TabsTrigger value="saved" className="data-[state=active]:bg-blue-600">
            <Star className="h-4 w-4 mr-2" />
            Saved
          </TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid md:grid-cols-4 gap-4 mb-6">
            <StatsCard icon={<Briefcase />} label="Active Projects" value="247" />
            <StatsCard icon={<Clock />} label="Avg. Timeline" value="6 weeks" />
            <StatsCard icon={<DollarSign />} label="Total Budget" value="$2.5M" />
            <StatsCard icon={<Users />} label="Active Artists" value="1,200+" />
          </div>

          {/* Projects Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>

          {filteredProjects.length === 0 && (
            <div className="text-center py-12">
              <Briefcase className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-300 mb-2">No projects found</h3>
              <p className="text-gray-400">Try adjusting your search criteria</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="my-projects">
          <div className="text-center py-12">
            <Briefcase className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-300 mb-2">No projects yet</h3>
            <p className="text-gray-400 mb-6">Create your first project to get started</p>
            <Button 
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-gradient-to-r from-blue-500 to-purple-600"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Project
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="saved">
          <div className="text-center py-12">
            <Star className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-300 mb-2">No saved projects</h3>
            <p className="text-gray-400">Save projects you're interested in</p>
          </div>
        </TabsContent>
      </Tabs>

      {/* Create Project Modal */}
      <CreateProjectModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
};

const StatsCard = ({ icon, label, value }: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) => (
  <Card className="bg-gray-800/50 border-gray-600">
    <CardContent className="p-4">
      <div className="flex items-center space-x-3">
        <div className="text-blue-400">
          {icon}
        </div>
        <div>
          <p className="text-2xl font-bold text-white">{value}</p>
          <p className="text-sm text-gray-400">{label}</p>
        </div>
      </div>
    </CardContent>
  </Card>
);

export default ProjectsHub;
