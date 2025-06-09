
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, FolderOpen, Camera, CheckSquare, Edit, Trash2, Play } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Database } from "@/integrations/supabase/types";

type Project = Database["public"]["Tables"]["projects"]["Row"];
type AppRole = Database["public"]["Enums"]["app_role"];

interface Sequence {
  id: string;
  name: string;
  description?: string;
  order_index: number;
  status: "planning" | "in_progress" | "completed";
  shots: Shot[];
}

interface Shot {
  id: string;
  sequence_id: string;
  name: string;
  description?: string;
  frame_start: number;
  frame_end: number;
  status: "pending" | "in_progress" | "review" | "approved";
  assigned_to?: string;
  tasks: Task[];
}

interface Task {
  id: string;
  shot_id: string;
  name: string;
  description?: string;
  task_type: "modeling" | "animation" | "lighting" | "compositing" | "fx";
  status: "todo" | "in_progress" | "review" | "completed";
  assigned_to?: string;
  estimated_hours?: number;
  actual_hours?: number;
  priority: "low" | "medium" | "high" | "critical";
}

interface ProjectHierarchyProps {
  project: Project;
  userRole: AppRole;
  userId: string;
}

const ProjectHierarchy = ({ project, userRole, userId }: ProjectHierarchyProps) => {
  const [sequences, setSequences] = useState<Sequence[]>([]);
  const [showAddSequence, setShowAddSequence] = useState(false);
  const [showAddShot, setShowAddShot] = useState<string | null>(null);
  const [showAddTask, setShowAddTask] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [newItemData, setNewItemData] = useState<any>({});
  const { toast } = useToast();

  const canEdit = userRole === "admin" || userRole === "producer" || userRole === "studio" || project.client_id === userId;
  const canAssign = userRole === "admin" || userRole === "producer" || userRole === "studio";

  // Mock data for now - in real app would come from database
  useEffect(() => {
    const mockSequences: Sequence[] = [
      {
        id: "seq1",
        name: "Opening Sequence",
        description: "Hero character introduction",
        order_index: 1,
        status: "in_progress",
        shots: [
          {
            id: "shot1",
            sequence_id: "seq1",
            name: "SH010",
            description: "Wide establishing shot",
            frame_start: 1001,
            frame_end: 1120,
            status: "in_progress",
            tasks: [
              {
                id: "task1",
                shot_id: "shot1",
                name: "Environment Modeling",
                task_type: "modeling",
                status: "completed",
                priority: "high",
                estimated_hours: 16,
                actual_hours: 14
              },
              {
                id: "task2",
                shot_id: "shot1",
                name: "Camera Animation",
                task_type: "animation",
                status: "in_progress",
                priority: "medium",
                estimated_hours: 8
              }
            ]
          }
        ]
      }
    ];
    setSequences(mockSequences);
  }, []);

  const addSequence = () => {
    const newSequence: Sequence = {
      id: `seq_${Date.now()}`,
      name: newItemData.name || "New Sequence",
      description: newItemData.description,
      order_index: sequences.length + 1,
      status: "planning",
      shots: []
    };
    setSequences([...sequences, newSequence]);
    setShowAddSequence(false);
    setNewItemData({});
    toast({ title: "Sequence created successfully" });
  };

  const addShot = (sequenceId: string) => {
    const sequenceIndex = sequences.findIndex(s => s.id === sequenceId);
    if (sequenceIndex === -1) return;

    const newShot: Shot = {
      id: `shot_${Date.now()}`,
      sequence_id: sequenceId,
      name: newItemData.name || "New Shot",
      description: newItemData.description,
      frame_start: newItemData.frame_start || 1001,
      frame_end: newItemData.frame_end || 1100,
      status: "pending",
      tasks: []
    };

    const updatedSequences = [...sequences];
    updatedSequences[sequenceIndex].shots.push(newShot);
    setSequences(updatedSequences);
    setShowAddShot(null);
    setNewItemData({});
    toast({ title: "Shot created successfully" });
  };

  const addTask = (shotId: string) => {
    const sequenceIndex = sequences.findIndex(s => s.shots.some(sh => sh.id === shotId));
    if (sequenceIndex === -1) return;
    
    const shotIndex = sequences[sequenceIndex].shots.findIndex(sh => sh.id === shotId);
    if (shotIndex === -1) return;

    const newTask: Task = {
      id: `task_${Date.now()}`,
      shot_id: shotId,
      name: newItemData.name || "New Task",
      description: newItemData.description,
      task_type: newItemData.task_type || "modeling",
      status: "todo",
      priority: newItemData.priority || "medium",
      estimated_hours: newItemData.estimated_hours
    };

    const updatedSequences = [...sequences];
    updatedSequences[sequenceIndex].shots[shotIndex].tasks.push(newTask);
    setSequences(updatedSequences);
    setShowAddTask(null);
    setNewItemData({});
    toast({ title: "Task created successfully" });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": case "approved": return "bg-green-500/20 text-green-400";
      case "in_progress": return "bg-blue-500/20 text-blue-400";
      case "review": return "bg-orange-500/20 text-orange-400";
      case "pending": case "todo": return "bg-gray-500/20 text-gray-400";
      default: return "bg-gray-500/20 text-gray-400";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical": return "bg-red-500/20 text-red-400";
      case "high": return "bg-orange-500/20 text-orange-400";
      case "medium": return "bg-yellow-500/20 text-yellow-400";
      case "low": return "bg-green-500/20 text-green-400";
      default: return "bg-gray-500/20 text-gray-400";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-white">Project Structure</h3>
        {canEdit && (
          <Button onClick={() => setShowAddSequence(true)} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Sequence
          </Button>
        )}
      </div>

      {sequences.map((sequence) => (
        <Card key={sequence.id} className="bg-gray-900/80 border-blue-500/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FolderOpen className="h-5 w-5 text-blue-400" />
                <div>
                  <CardTitle className="text-white">{sequence.name}</CardTitle>
                  {sequence.description && (
                    <p className="text-gray-400 text-sm mt-1">{sequence.description}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={getStatusColor(sequence.status)}>
                  {sequence.status.replace('_', ' ')}
                </Badge>
                {canEdit && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowAddShot(sequence.id)}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Shot
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sequence.shots.map((shot) => (
                <Card key={shot.id} className="bg-gray-800/50 border-gray-600">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Camera className="h-4 w-4 text-purple-400" />
                        <div>
                          <h4 className="text-white font-medium">{shot.name}</h4>
                          <p className="text-gray-400 text-xs">
                            Frames: {shot.frame_start} - {shot.frame_end} ({shot.frame_end - shot.frame_start + 1} frames)
                          </p>
                          {shot.description && (
                            <p className="text-gray-400 text-sm mt-1">{shot.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(shot.status)}>
                          {shot.status.replace('_', ' ')}
                        </Badge>
                        {canEdit && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setShowAddTask(shot.id)}
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Task
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="grid gap-2">
                      {shot.tasks.map((task) => (
                        <div key={task.id} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                          <div className="flex items-center gap-3">
                            <CheckSquare className="h-3 w-3 text-gray-400" />
                            <div>
                              <p className="text-white text-sm font-medium">{task.name}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="text-xs">
                                  {task.task_type}
                                </Badge>
                                <Badge className={getPriorityColor(task.priority) + " text-xs"}>
                                  {task.priority}
                                </Badge>
                                {task.estimated_hours && (
                                  <span className="text-gray-400 text-xs">
                                    {task.actual_hours || 0}h / {task.estimated_hours}h
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <Badge className={getStatusColor(task.status)}>
                            {task.status.replace('_', ' ')}
                          </Badge>
                        </div>
                      ))}
                      {shot.tasks.length === 0 && (
                        <p className="text-gray-500 text-sm text-center py-4">No tasks yet</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
              {sequence.shots.length === 0 && (
                <p className="text-gray-500 text-sm text-center py-4">No shots yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      ))}

      {sequences.length === 0 && (
        <Card className="bg-gray-900/80 border-gray-600">
          <CardContent className="py-12 text-center">
            <FolderOpen className="h-12 w-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 mb-4">No sequences created yet</p>
            {canEdit && (
              <Button onClick={() => setShowAddSequence(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Sequence
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Add Sequence Modal */}
      <Dialog open={showAddSequence} onOpenChange={setShowAddSequence}>
        <DialogContent className="bg-gray-900 border-blue-500/20">
          <DialogHeader>
            <DialogTitle className="text-white">Add New Sequence</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-gray-300 text-sm">Name</label>
              <Input
                value={newItemData.name || ""}
                onChange={(e) => setNewItemData({...newItemData, name: e.target.value})}
                className="bg-gray-800/50 border-gray-600 text-white"
                placeholder="Sequence name"
              />
            </div>
            <div>
              <label className="text-gray-300 text-sm">Description</label>
              <Textarea
                value={newItemData.description || ""}
                onChange={(e) => setNewItemData({...newItemData, description: e.target.value})}
                className="bg-gray-800/50 border-gray-600 text-white"
                placeholder="Optional description"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={addSequence} className="bg-blue-600 hover:bg-blue-700">
                Create Sequence
              </Button>
              <Button variant="outline" onClick={() => setShowAddSequence(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Shot Modal */}
      <Dialog open={!!showAddShot} onOpenChange={() => setShowAddShot(null)}>
        <DialogContent className="bg-gray-900 border-blue-500/20">
          <DialogHeader>
            <DialogTitle className="text-white">Add New Shot</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-gray-300 text-sm">Shot Name</label>
              <Input
                value={newItemData.name || ""}
                onChange={(e) => setNewItemData({...newItemData, name: e.target.value})}
                className="bg-gray-800/50 border-gray-600 text-white"
                placeholder="e.g., SH010"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-gray-300 text-sm">Start Frame</label>
                <Input
                  type="number"
                  value={newItemData.frame_start || ""}
                  onChange={(e) => setNewItemData({...newItemData, frame_start: parseInt(e.target.value)})}
                  className="bg-gray-800/50 border-gray-600 text-white"
                  placeholder="1001"
                />
              </div>
              <div>
                <label className="text-gray-300 text-sm">End Frame</label>
                <Input
                  type="number"
                  value={newItemData.frame_end || ""}
                  onChange={(e) => setNewItemData({...newItemData, frame_end: parseInt(e.target.value)})}
                  className="bg-gray-800/50 border-gray-600 text-white"
                  placeholder="1100"
                />
              </div>
            </div>
            <div>
              <label className="text-gray-300 text-sm">Description</label>
              <Textarea
                value={newItemData.description || ""}
                onChange={(e) => setNewItemData({...newItemData, description: e.target.value})}
                className="bg-gray-800/50 border-gray-600 text-white"
                placeholder="Shot description"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={() => showAddShot && addShot(showAddShot)} className="bg-purple-600 hover:bg-purple-700">
                Create Shot
              </Button>
              <Button variant="outline" onClick={() => setShowAddShot(null)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Task Modal */}
      <Dialog open={!!showAddTask} onOpenChange={() => setShowAddTask(null)}>
        <DialogContent className="bg-gray-900 border-blue-500/20">
          <DialogHeader>
            <DialogTitle className="text-white">Add New Task</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-gray-300 text-sm">Task Name</label>
              <Input
                value={newItemData.name || ""}
                onChange={(e) => setNewItemData({...newItemData, name: e.target.value})}
                className="bg-gray-800/50 border-gray-600 text-white"
                placeholder="Task name"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-gray-300 text-sm">Task Type</label>
                <Select value={newItemData.task_type} onValueChange={(value) => setNewItemData({...newItemData, task_type: value})}>
                  <SelectTrigger className="bg-gray-800/50 border-gray-600 text-white">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="modeling">Modeling</SelectItem>
                    <SelectItem value="animation">Animation</SelectItem>
                    <SelectItem value="lighting">Lighting</SelectItem>
                    <SelectItem value="compositing">Compositing</SelectItem>
                    <SelectItem value="fx">FX</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-gray-300 text-sm">Priority</label>
                <Select value={newItemData.priority} onValueChange={(value) => setNewItemData({...newItemData, priority: value})}>
                  <SelectTrigger className="bg-gray-800/50 border-gray-600 text-white">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="text-gray-300 text-sm">Estimated Hours</label>
              <Input
                type="number"
                value={newItemData.estimated_hours || ""}
                onChange={(e) => setNewItemData({...newItemData, estimated_hours: parseInt(e.target.value)})}
                className="bg-gray-800/50 border-gray-600 text-white"
                placeholder="8"
              />
            </div>
            <div>
              <label className="text-gray-300 text-sm">Description</label>
              <Textarea
                value={newItemData.description || ""}
                onChange={(e) => setNewItemData({...newItemData, description: e.target.value})}
                className="bg-gray-800/50 border-gray-600 text-white"
                placeholder="Task description"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={() => showAddTask && addTask(showAddTask)} className="bg-green-600 hover:bg-green-700">
                Create Task
              </Button>
              <Button variant="outline" onClick={() => setShowAddTask(null)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProjectHierarchy;
