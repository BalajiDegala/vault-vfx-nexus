
import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileText, Upload, File, Download, FolderOpen, Search, 
  Filter, Eye, Share2, Trash2, Star, Clock, Users, 
  Image, Video, Archive, FileCode, Music, Folder,
  MoreVertical, Copy, Edit3, Move, CheckCircle,
  AlertTriangle, PlayCircle, Pause, RotateCcw
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface FileItem {
  id: string;
  name: string;
  type: 'image' | 'video' | 'audio' | 'archive' | 'code' | 'document';
  size: string;
  uploadedBy: string;
  uploadedAt: string;
  category: 'deliverables' | 'wip' | 'references' | 'assets';
  isStarred: boolean;
  downloadCount: number;
  tags: string[];
  status: 'approved' | 'pending' | 'revision' | 'archived';
  version: string;
  comments: number;
  lastModified: string;
  path: string;
}

interface UploadTask {
  id: string;
  name: string;
  progress: number;
  status: 'uploading' | 'completed' | 'failed' | 'paused';
  speed: string;
  eta: string;
}

const ProjectFiles = () => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [files, setFiles] = useState<FileItem[]>([
    {
      id: '1',
      name: 'hero_shot_final_v3.exr',
      type: 'image',
      size: '156.2 MB',
      uploadedBy: 'John Doe',
      uploadedAt: '2 hours ago',
      category: 'deliverables',
      isStarred: true,
      downloadCount: 12,
      tags: ['final', 'hero', 'lighting'],
      status: 'approved',
      version: 'v3',
      comments: 3,
      lastModified: '2 hours ago',
      path: '/renders/hero_shots/'
    },
    {
      id: '2',
      name: 'character_animation_test.mp4',
      type: 'video',
      size: '89.5 MB',
      uploadedBy: 'Sarah Miller',
      uploadedAt: '5 hours ago',
      category: 'wip',
      isStarred: false,
      downloadCount: 8,
      tags: ['animation', 'test', 'character'],
      status: 'pending',
      version: 'v2',
      comments: 5,
      lastModified: '3 hours ago',
      path: '/animation/tests/'
    },
    {
      id: '3',
      name: 'concept_art_collection.zip',
      type: 'archive',
      size: '124.8 MB',
      uploadedBy: 'Alex Chen',
      uploadedAt: '1 day ago',
      category: 'references',
      isStarred: false,
      downloadCount: 15,
      tags: ['concept', 'reference', 'mood'],
      status: 'approved',
      version: 'v1',
      comments: 2,
      lastModified: '1 day ago',
      path: '/references/concepts/'
    },
    {
      id: '4',
      name: 'material_library.blend',
      type: 'code',
      size: '45.3 MB',
      uploadedBy: 'Mike Johnson',
      uploadedAt: '3 days ago',
      category: 'assets',
      isStarred: true,
      downloadCount: 23,
      tags: ['materials', 'blender', 'library'],
      status: 'approved',
      version: 'v4',
      comments: 8,
      lastModified: '1 day ago',
      path: '/assets/materials/'
    }
  ]);

  const [uploadTasks, setUploadTasks] = useState<UploadTask[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedFileType, setSelectedFileType] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("recent");
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image': return <Image className="h-5 w-5 text-green-400" />;
      case 'video': return <Video className="h-5 w-5 text-red-400" />;
      case 'audio': return <Music className="h-5 w-5 text-purple-400" />;
      case 'archive': return <Archive className="h-5 w-5 text-orange-400" />;
      case 'code': return <FileCode className="h-5 w-5 text-blue-400" />;
      default: return <File className="h-5 w-5 text-gray-400" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'deliverables': return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 'wip': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      case 'references': return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      case 'assets': return 'bg-purple-500/20 text-purple-400 border-purple-500/50';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-500/20 text-green-400';
      case 'pending': return 'bg-yellow-500/20 text-yellow-400';
      case 'revision': return 'bg-red-500/20 text-red-400';
      case 'archived': return 'bg-gray-500/20 text-gray-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-3 w-3" />;
      case 'pending': return <Clock className="h-3 w-3" />;
      case 'revision': return <AlertTriangle className="h-3 w-3" />;
      case 'archived': return <Archive className="h-3 w-3" />;
      default: return <Clock className="h-3 w-3" />;
    }
  };

  const filteredFiles = files.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         file.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         file.uploadedBy.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || file.category === selectedCategory;
    const matchesType = selectedFileType === "all" || file.type === selectedFileType;
    const matchesStatus = selectedStatus === "all" || file.status === selectedStatus;
    
    return matchesSearch && matchesCategory && matchesType && matchesStatus;
  });

  const sortedFiles = [...filteredFiles].sort((a, b) => {
    switch (sortBy) {
      case 'name': return a.name.localeCompare(b.name);
      case 'size': return parseFloat(b.size) - parseFloat(a.size);
      case 'downloads': return b.downloadCount - a.downloadCount;
      case 'recent': 
      default: return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
    }
  });

  const handleFileUpload = (category: 'deliverables' | 'wip' | 'references' | 'assets') => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const simulateUpload = () => {
    const newTask: UploadTask = {
      id: Date.now().toString(),
      name: 'new_file.mp4',
      progress: 0,
      status: 'uploading',
      speed: '2.5 MB/s',
      eta: '30s'
    };

    setUploadTasks(prev => [...prev, newTask]);

    const interval = setInterval(() => {
      setUploadTasks(prev => prev.map(task => {
        if (task.id === newTask.id && task.progress < 100) {
          const newProgress = Math.min(task.progress + 10, 100);
          const isComplete = newProgress === 100;
          
          return {
            ...task,
            progress: newProgress,
            status: isComplete ? 'completed' : 'uploading',
            eta: isComplete ? 'Complete' : `${Math.max(0, 30 - (newProgress / 10) * 3)}s`
          };
        }
        return task;
      }));
    }, 300);

    setTimeout(() => {
      clearInterval(interval);
      toast({
        title: "Upload Complete",
        description: "File uploaded successfully!",
      });
      setTimeout(() => {
        setUploadTasks(prev => prev.filter(task => task.id !== newTask.id));
      }, 2000);
    }, 3000);
  };

  const toggleStar = (fileId: string) => {
    setFiles(files.map(file => 
      file.id === fileId ? { ...file, isStarred: !file.isStarred } : file
    ));
  };

  const downloadFile = (file: FileItem) => {
    setFiles(files.map(f => 
      f.id === file.id ? { ...f, downloadCount: f.downloadCount + 1 } : f
    ));
    toast({
      title: "Download Started",
      description: `Downloading ${file.name}`,
    });
  };

  const changeFileStatus = (fileId: string, newStatus: FileItem['status']) => {
    setFiles(files.map(f => 
      f.id === fileId ? { ...f, status: newStatus } : f
    ));
    toast({
      title: "Status Updated",
      description: `File status changed to ${newStatus}`,
    });
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gray-900/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Project Files & Assets
            <Badge variant="outline" className="ml-auto text-xs">
              {files.length} files • {uploadTasks.length} uploading
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Enhanced Search and Filters */}
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search files, tags, or users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-800/50 border-gray-600 text-white"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-40 bg-gray-800 border-gray-600 text-white">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="deliverables">Deliverables</SelectItem>
                    <SelectItem value="wip">Work in Progress</SelectItem>
                    <SelectItem value="references">References</SelectItem>
                    <SelectItem value="assets">Assets</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedFileType} onValueChange={setSelectedFileType}>
                  <SelectTrigger className="w-32 bg-gray-800 border-gray-600 text-white">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="image">Images</SelectItem>
                    <SelectItem value="video">Videos</SelectItem>
                    <SelectItem value="audio">Audio</SelectItem>
                    <SelectItem value="archive">Archives</SelectItem>
                    <SelectItem value="code">Code/Scenes</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-32 bg-gray-800 border-gray-600 text-white">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="revision">Needs Revision</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-32 bg-gray-800 border-gray-600 text-white">
                    <SelectValue placeholder="Sort" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    <SelectItem value="recent">Recent</SelectItem>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="size">Size</SelectItem>
                    <SelectItem value="downloads">Downloads</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Upload Areas */}
            <Tabs defaultValue="deliverables" className="space-y-4">
              <TabsList className="grid w-full grid-cols-4 bg-gray-800/50">
                <TabsTrigger value="deliverables" className="data-[state=active]:bg-green-500/20">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Deliverables
                </TabsTrigger>
                <TabsTrigger value="wip" className="data-[state=active]:bg-yellow-500/20">
                  <Clock className="h-4 w-4 mr-2" />
                  Work in Progress
                </TabsTrigger>
                <TabsTrigger value="references" className="data-[state=active]:bg-blue-500/20">
                  <Image className="h-4 w-4 mr-2" />
                  References
                </TabsTrigger>
                <TabsTrigger value="assets" className="data-[state=active]:bg-purple-500/20">
                  <Archive className="h-4 w-4 mr-2" />
                  Assets
                </TabsTrigger>
              </TabsList>

              <TabsContent value="deliverables">
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-6">
                  <h3 className="text-green-300 font-medium mb-2">Final Deliverables</h3>
                  <p className="text-gray-400 text-sm mb-4">Approved final renders, compositions, and client-ready assets</p>
                  <Button onClick={() => handleFileUpload('deliverables')} className="bg-green-600 hover:bg-green-700">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Deliverables
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="wip">
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-6">
                  <h3 className="text-yellow-300 font-medium mb-2">Work in Progress</h3>
                  <p className="text-gray-400 text-sm mb-4">Draft versions, tests, and files under development</p>
                  <Button onClick={() => handleFileUpload('wip')} className="bg-yellow-600 hover:bg-yellow-700">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload WIP Files
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="references">
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-6">
                  <h3 className="text-blue-300 font-medium mb-2">Reference Materials</h3>
                  <p className="text-gray-400 text-sm mb-4">Concept art, references, mood boards, and inspiration</p>
                  <Button onClick={() => handleFileUpload('references')} className="bg-blue-600 hover:bg-blue-700">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload References
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="assets">
                <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-6">
                  <h3 className="text-purple-300 font-medium mb-2">Project Assets</h3>
                  <p className="text-gray-400 text-sm mb-4">Models, textures, libraries, and reusable components</p>
                  <Button onClick={() => handleFileUpload('assets')} className="bg-purple-600 hover:bg-purple-700">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Assets
                  </Button>
                </div>
              </TabsContent>
            </Tabs>

            {/* Upload Progress */}
            {uploadTasks.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-white font-medium">Active Uploads</h4>
                {uploadTasks.map(task => (
                  <div key={task.id} className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-blue-300 font-medium">{task.name}</span>
                      <div className="flex items-center gap-2">
                        {task.status === 'uploading' && (
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                            <Pause className="h-3 w-3" />
                          </Button>
                        )}
                        <span className="text-blue-300 text-sm">{task.progress}%</span>
                      </div>
                    </div>
                    <Progress value={task.progress} className="h-2 mb-2" />
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>{task.speed}</span>
                      <span>ETA: {task.eta}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Files List */}
            <div className="border-t border-gray-700 pt-6">
              <div className="flex items-center justify-between mb-6">
                <h4 className="text-white font-medium">Files ({sortedFiles.length})</h4>
                <div className="flex items-center gap-2">
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                  >
                    List
                  </Button>
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                  >
                    Grid
                  </Button>
                </div>
              </div>
              
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-3'}>
                {sortedFiles.length === 0 ? (
                  <div className="text-center py-12 col-span-full">
                    <FolderOpen className="h-16 w-16 text-gray-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-300 mb-2">No files found</h3>
                    <p className="text-gray-400">Try adjusting your filters or upload some files</p>
                  </div>
                ) : (
                  sortedFiles.map((file) => (
                    <div key={file.id} className={`${viewMode === 'grid' ? 'bg-gray-800/30 rounded-lg p-4' : 'flex items-center justify-between p-4 bg-gray-800/30 rounded-lg'} border border-gray-700 hover:bg-gray-800/50 transition-colors group`}>
                      {viewMode === 'grid' ? (
                        <div className="space-y-3">
                          <div className="flex items-start justify-between">
                            {getFileIcon(file.type)}
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100">
                                  <MoreVertical className="h-3 w-3" />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-48 bg-gray-800 border-gray-600" align="end">
                                <div className="space-y-1">
                                  <Button variant="ghost" size="sm" className="w-full justify-start text-gray-300">
                                    <Eye className="h-3 w-3 mr-2" />
                                    Preview
                                  </Button>
                                  <Button variant="ghost" size="sm" className="w-full justify-start text-gray-300" onClick={() => downloadFile(file)}>
                                    <Download className="h-3 w-3 mr-2" />
                                    Download
                                  </Button>
                                  <Button variant="ghost" size="sm" className="w-full justify-start text-gray-300">
                                    <Share2 className="h-3 w-3 mr-2" />
                                    Share
                                  </Button>
                                  <Button variant="ghost" size="sm" className="w-full justify-start text-gray-300">
                                    <Edit3 className="h-3 w-3 mr-2" />
                                    Rename
                                  </Button>
                                  <Button variant="ghost" size="sm" className="w-full justify-start text-gray-300">
                                    <Move className="h-3 w-3 mr-2" />
                                    Move
                                  </Button>
                                  <Button variant="ghost" size="sm" className="w-full justify-start text-red-400">
                                    <Trash2 className="h-3 w-3 mr-2" />
                                    Delete
                                  </Button>
                                </div>
                              </PopoverContent>
                            </Popover>
                          </div>
                          
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <p className="text-white text-sm font-medium truncate">{file.name}</p>
                              {file.isStarred && <Star className="h-3 w-3 text-yellow-400 fill-current" />}
                            </div>
                            <div className="flex items-center gap-2 mb-2">
                              <Badge className={getCategoryColor(file.category)} variant="outline">
                                {file.category}
                              </Badge>
                              <Badge className={getStatusColor(file.status)} variant="outline">
                                {getStatusIcon(file.status)}
                                <span className="ml-1">{file.status}</span>
                              </Badge>
                            </div>
                            <div className="text-xs text-gray-400 space-y-1">
                              <p>By {file.uploadedBy} • {file.uploadedAt}</p>
                              <p>{file.size} • {file.downloadCount} downloads</p>
                              <p>{file.version} • {file.comments} comments</p>
                            </div>
                          </div>
                          
                          <div className="flex flex-wrap gap-1">
                            {file.tags.map(tag => (
                              <Badge key={tag} variant="secondary" className="text-xs bg-gray-700/50">
                                #{tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-4 flex-1">
                            {getFileIcon(file.type)}
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="text-white text-sm font-medium">{file.name}</p>
                                {file.isStarred && <Star className="h-4 w-4 text-yellow-400 fill-current" />}
                                <Badge className={getCategoryColor(file.category)} variant="outline">
                                  {file.category}
                                </Badge>
                                <Badge className={getStatusColor(file.status)} variant="outline">
                                  {getStatusIcon(file.status)}
                                  <span className="ml-1">{file.status}</span>
                                </Badge>
                              </div>
                              <div className="flex items-center gap-4 text-xs text-gray-400">
                                <span>By {file.uploadedBy}</span>
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {file.uploadedAt}
                                </span>
                                <span>{file.size}</span>
                                <span className="flex items-center gap-1">
                                  <Download className="h-3 w-3" />
                                  {file.downloadCount}
                                </span>
                                <span>{file.version}</span>
                                <span>{file.comments} comments</span>
                              </div>
                              <div className="flex flex-wrap gap-1 mt-2">
                                {file.tags.map(tag => (
                                  <Badge key={tag} variant="secondary" className="text-xs bg-gray-700/50">
                                    #{tag}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0"
                              onClick={() => toggleStar(file.id)}
                            >
                              <Star className={`h-4 w-4 ${file.isStarred ? 'text-yellow-400 fill-current' : 'text-gray-400'}`} />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <Share2 className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0"
                              onClick={() => downloadFile(file)}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-48 bg-gray-800 border-gray-600" align="end">
                                <div className="space-y-1">
                                  <div className="px-2 py-1 text-xs text-gray-400 font-medium">Change Status</div>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="w-full justify-start text-green-400"
                                    onClick={() => changeFileStatus(file.id, 'approved')}
                                  >
                                    <CheckCircle className="h-3 w-3 mr-2" />
                                    Approve
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="w-full justify-start text-red-400"
                                    onClick={() => changeFileStatus(file.id, 'revision')}
                                  >
                                    <RotateCcw className="h-3 w-3 mr-2" />
                                    Request Revision
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="w-full justify-start text-gray-400"
                                    onClick={() => changeFileStatus(file.id, 'archived')}
                                  >
                                    <Archive className="h-3 w-3 mr-2" />
                                    Archive
                                  </Button>
                                  <div className="border-t border-gray-600 my-1"></div>
                                  <Button variant="ghost" size="sm" className="w-full justify-start text-red-400">
                                    <Trash2 className="h-3 w-3 mr-2" />
                                    Delete
                                  </Button>
                                </div>
                              </PopoverContent>
                            </Popover>
                          </div>
                        </>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Enhanced Statistics */}
            <div className="bg-gray-800/30 rounded-lg p-6 border border-gray-700">
              <h4 className="text-white font-medium mb-4">Project Statistics</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-green-400">
                    {files.filter(f => f.category === 'deliverables').length}
                  </p>
                  <p className="text-gray-400 text-xs">Deliverables</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-yellow-400">
                    {files.filter(f => f.category === 'wip').length}
                  </p>
                  <p className="text-gray-400 text-xs">WIP Files</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-400">
                    {files.filter(f => f.category === 'references').length}
                  </p>
                  <p className="text-gray-400 text-xs">References</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-purple-400">
                    {files.filter(f => f.category === 'assets').length}
                  </p>
                  <p className="text-gray-400 text-xs">Assets</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-orange-400">
                    {files.reduce((acc, f) => acc + f.downloadCount, 0)}
                  </p>
                  <p className="text-gray-400 text-xs">Downloads</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-pink-400">
                    {files.filter(f => f.status === 'approved').length}
                  </p>
                  <p className="text-gray-400 text-xs">Approved</p>
                </div>
              </div>
            </div>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={simulateUpload}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectFiles;
