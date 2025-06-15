
import React from "react";
import { ProjectRealtimeProvider } from "./ProjectRealtimeProvider";
import ProjectPresenceIndicator from "./ProjectPresenceIndicator";
import RealtimeUpdatesPanel from "./RealtimeUpdatesPanel";
import { useProjectRealtimeContext } from "./ProjectRealtimeProvider";

interface ProjectRealtimeWrapperProps {
  projectId: string;
  userId: string;
  username: string;
  currentSection?: string;
}

const ProjectRealtimeContent: React.FC<{ currentSection?: string }> = ({ currentSection }) => {
  const { getActiveUsers, updates, isConnected } = useProjectRealtimeContext();
  const activeUsers = getActiveUsers();

  return (
    <div className="space-y-4">
      <ProjectPresenceIndicator 
        activeUsers={activeUsers} 
        currentSection={currentSection}
      />
      <RealtimeUpdatesPanel 
        updates={updates} 
        isConnected={isConnected}
      />
    </div>
  );
};

const ProjectRealtimeWrapper: React.FC<ProjectRealtimeWrapperProps> = ({
  projectId,
  userId,
  username,
  currentSection,
}) => {
  return (
    <ProjectRealtimeProvider 
      projectId={projectId} 
      userId={userId} 
      username={username}
    >
      <ProjectRealtimeContent currentSection={currentSection} />
    </ProjectRealtimeProvider>
  );
};

export default ProjectRealtimeWrapper;
