
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Briefcase, 
  Clock, 
  Users, 
  DollarSign
} from "lucide-react";

interface ProjectsStatsProps {
  stats: {
    totalProjects: number;
    openProjects: number;
    avgBudget: number;
    activeArtists: number;
  };
  enabled: boolean;
}

const ProjectsStats: React.FC<ProjectsStatsProps> = ({ stats, enabled }) => {
  if (!enabled) return null;

  return (
    <div className="grid md:grid-cols-4 gap-4 mb-8">
      <StatsCard 
        icon={<Briefcase />} 
        label="Total Projects" 
        value={stats.totalProjects.toString()} 
      />
      <StatsCard 
        icon={<Clock />} 
        label="Open Projects" 
        value={stats.openProjects.toString()} 
      />
      <StatsCard 
        icon={<DollarSign />} 
        label="Avg Budget" 
        value={stats.avgBudget > 0 ? `$${stats.avgBudget.toLocaleString()}` : "N/A"} 
      />
      <StatsCard 
        icon={<Users />} 
        label="Active Artists" 
        value={stats.activeArtists.toString()} 
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

export default ProjectsStats;
