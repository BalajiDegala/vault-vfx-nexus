
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  DollarSign, 
  Users, 
  Heart, 
  ExternalLink,
  Clock,
  Star
} from "lucide-react";
import { Link } from "react-router-dom";

interface ProjectCardProps {
  project: {
    id: string;
    title: string;
    description: string;
    budget: string;
    deadline: string;
    client: string;
    skills: string[];
    status: string;
    applications: number;
    image: string;
  };
}

const ProjectCard = ({ project }: ProjectCardProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Open":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "In Progress":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "Completed":
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  return (
    <Card className="bg-gray-800/50 border-gray-600 hover:border-blue-500/50 transition-all duration-300 group">
      <CardHeader className="p-0">
        <div className="relative overflow-hidden rounded-t-lg">
          <img 
            src={project.image} 
            alt={project.title}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-4 left-4">
            <Badge className={`${getStatusColor(project.status)} border`}>
              {project.status}
            </Badge>
          </div>
          <div className="absolute top-4 right-4">
            <Button size="sm" variant="ghost" className="bg-black/50 hover:bg-black/70 text-white">
              <Heart className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-6 space-y-4">
        <div>
          <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
            {project.title}
          </h3>
          <p className="text-gray-400 text-sm line-clamp-2">
            {project.description}
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex items-center text-sm text-gray-300">
            <DollarSign className="h-4 w-4 mr-2 text-green-400" />
            {project.budget}
          </div>
          
          <div className="flex items-center text-sm text-gray-300">
            <Calendar className="h-4 w-4 mr-2 text-orange-400" />
            Due: {new Date(project.deadline).toLocaleDateString()}
          </div>
          
          <div className="flex items-center text-sm text-gray-300">
            <Users className="h-4 w-4 mr-2 text-purple-400" />
            {project.applications} applications
          </div>
        </div>

        <div>
          <p className="text-sm text-gray-400 mb-2">Client:</p>
          <p className="text-white font-medium">{project.client}</p>
        </div>

        <div>
          <p className="text-sm text-gray-400 mb-2">Required Skills:</p>
          <div className="flex flex-wrap gap-1">
            {project.skills.slice(0, 3).map((skill, index) => (
              <Badge key={index} variant="secondary" className="text-xs bg-blue-500/20 text-blue-400">
                {skill}
              </Badge>
            ))}
            {project.skills.length > 3 && (
              <Badge variant="secondary" className="text-xs bg-gray-500/20 text-gray-400">
                +{project.skills.length - 3} more
              </Badge>
            )}
          </div>
        </div>

        <div className="flex gap-2 pt-4">
          <Link to={`/projects/${project.id}`} className="flex-1">
            <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
              View Details
              <ExternalLink className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectCard;
