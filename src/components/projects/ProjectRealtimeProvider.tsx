
import React, { createContext, useContext, ReactNode } from "react";
import { useProjectRealtime } from "@/hooks/useProjectRealtime";

interface ProjectRealtimeContextType {
  presence: Record<string, any>;
  updates: any[];
  isConnected: boolean;
  updatePresence: (section: string) => Promise<void>;
  broadcastUpdate: (update: any) => Promise<void>;
  getActiveUsers: () => any[];
  getUsersInSection: (section: string) => any[];
}

const ProjectRealtimeContext = createContext<ProjectRealtimeContextType | null>(null);

interface ProjectRealtimeProviderProps {
  projectId: string;
  userId: string;
  username: string;
  children: ReactNode;
}

export const ProjectRealtimeProvider: React.FC<ProjectRealtimeProviderProps> = ({
  projectId,
  userId,
  username,
  children,
}) => {
  const realtimeData = useProjectRealtime(projectId, userId, username);

  return (
    <ProjectRealtimeContext.Provider value={realtimeData}>
      {children}
    </ProjectRealtimeContext.Provider>
  );
};

export const useProjectRealtimeContext = () => {
  const context = useContext(ProjectRealtimeContext);
  if (!context) {
    throw new Error('useProjectRealtimeContext must be used within a ProjectRealtimeProvider');
  }
  return context;
};
