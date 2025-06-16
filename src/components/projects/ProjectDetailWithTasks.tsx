
import { useState } from "react";
import { User } from "@supabase/supabase-js";
import { Database } from "@/integrations/supabase/types";
import ProjectHierarchy from "./ProjectHierarchy";
import ShotsList from "./ShotsList";
import TaskSharingModal from "@/components/tasks/TaskSharingModal";

type Project = Database["public"]["Tables"]["projects"]["Row"];
type AppRole = Database["public"]["Enums"]["app_role"];

interface ProjectDetailWithTasksProps {
  project: Project;
  user: User;
  userRole: AppRole;
}

const ProjectDetailWithTasks = ({ project, user, userRole }: ProjectDetailWithTasksProps) => {
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [showTaskSharingModal, setShowTaskSharingModal] = useState(false);

  const handleShareTask = (taskId: string) => {
    setSelectedTaskId(taskId);
    setShowTaskSharingModal(true);
  };

  const handleCloseTaskSharing = () => {
    setSelectedTaskId(null);
    setShowTaskSharingModal(false);
  };

  return (
    <div className="space-y-6">
      <ProjectHierarchy 
        project={project} 
        userRole={userRole}
        renderShotsList={(sequenceId) => (
          <ShotsList 
            sequenceId={sequenceId} 
            userRole={userRole}
            onShareTask={handleShareTask}
          />
        )}
      />

      {/* Task Sharing Modal */}
      <TaskSharingModal
        isOpen={showTaskSharingModal}
        onClose={handleCloseTaskSharing}
        task={selectedTaskId ? { id: selectedTaskId } as any : null}
        userRole={userRole}
        userId={user.id}
      />
    </div>
  );
};

export default ProjectDetailWithTasks;
