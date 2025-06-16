
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, BarChart3, List, Grid } from "lucide-react";
import TaskCard from "./TaskCard";
import TaskFilters from "./TaskFilters";
import TasksOverview from "./TasksOverview";
import { useTasks } from "@/hooks/useTasks";
import { useTaskFilters } from "@/hooks/useTaskFilters";
import { Loader2 } from "lucide-react";

interface TaskManagementProps {
  projectId?: string;
  shotId?: string;
  userRole?: string;
  userId?: string;
}

const TaskManagement = ({ projectId, shotId, userRole, userId }: TaskManagementProps) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const { tasks, loading, updateTaskStatus, assignTask } = useTasks(projectId, shotId);
  
  const {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    priorityFilter,
    setPriorityFilter,
    typeFilter,
    setTypeFilter,
    assigneeFilter,
    setAssigneeFilter,
    filteredTasks,
    hasActiveFilters,
    clearFilters
  } = useTaskFilters(tasks);

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    await updateTaskStatus(taskId, newStatus);
  };

  const handleAssignTask = async (taskId: string) => {
    if (!userId) return;
    await assignTask(taskId, userId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <span className="ml-2 text-gray-400">Loading tasks...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Task Management</h2>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            className="border-gray-600 text-gray-400 hover:text-white"
          >
            {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
          </Button>
          <Button
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Task
          </Button>
        </div>
      </div>

      <Tabs defaultValue="tasks" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 bg-gray-900/50 border-gray-700">
          <TabsTrigger value="overview" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
            <BarChart3 className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="tasks" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
            <List className="h-4 w-4 mr-2" />
            Tasks
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <TasksOverview tasks={tasks} />
        </TabsContent>

        <TabsContent value="tasks" className="space-y-6">
          <Card className="bg-gray-900/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Filter Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <TaskFilters
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                statusFilter={statusFilter}
                onStatusChange={setStatusFilter}
                priorityFilter={priorityFilter}
                onPriorityChange={setPriorityFilter}
                typeFilter={typeFilter}
                onTypeChange={setTypeFilter}
                assigneeFilter={assigneeFilter}
                onAssigneeChange={setAssigneeFilter}
                onClearFilters={clearFilters}
                hasActiveFilters={hasActiveFilters}
              />
            </CardContent>
          </Card>

          {filteredTasks.length === 0 ? (
            <Card className="bg-gray-900/50 border-gray-700">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <List className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">No Tasks Found</h3>
                <p className="text-gray-400 text-center max-w-md">
                  {hasActiveFilters
                    ? "No tasks match your current filters. Try adjusting your search criteria."
                    : "No tasks have been created yet. Click 'Add Task' to get started."
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className={
              viewMode === 'grid'
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                : "space-y-4"
            }>
              {filteredTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onStatusChange={handleStatusChange}
                  onAssign={handleAssignTask}
                  showActions={userRole === 'studio' || userRole === 'admin'}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TaskManagement;
