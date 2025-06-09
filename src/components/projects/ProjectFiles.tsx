
import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  FileText, Upload, File, Download, FolderOpen, Search, 
  Filter, Eye, Share2, Trash2, Star, Clock, Users, 
  Image, Video, Archive, FileCode, Music
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FileItem {
  id: string;
  name: string;
  type: 'image' | 'video' | 'audio' | 'archive' | 'code' | 'document';
  size: string;
  uploadedBy: string;
  uploadedAt: string;
  category: 'deliverables' | 'wip' | 'references';
  isStarred: boolean;
  downloadCount: number;
  tags: string[];
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
      tags: ['final', 'hero', 'lighting']
    },
    {
      id: '2',
      name: 'animation_test_v2.mp4',
      type: 'video',
      size: '89.5 MB',
      uploadedBy: 'Sarah Miller',
      uploadedAt: '5 hours ago',
      category: 'wip',
      isStarred: false,
      downloadCount: 8,
      tags: ['animation', 'test', 'character']
    },
    {
      id: '3',
      name: 'concept_references.zip',
      type: 'archive',
      size: '24.8 MB',
      uploadedBy: 'Alex Chen',
      uploadedAt: '1 day ago',
      category: 'references',
      isStarred: false,
      downloadCount: 15,
      tags: ['concept', 'reference', 'mood']
    },
    {
      id: '4',
      name: 'shader_setup.blend',
      type: 'code',
      size: '12.3 MB',
      uploadedBy: 'Mike Johnson',
      uploadedAt: '3 days ago',
      category: 'wip',
      isStarred: true,
      downloadCount: 6,
      tags: ['shader', 'blender', 'material']
    }
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedFileType, setSelectedFileType] = useState<string>("all");
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

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
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    }
  };

  const filteredFiles = files.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         file.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === "all" || file.category === selectedCategory;
    const matchesType = selectedFileType === "all" || file.type === selectedFileType;
    
    return matchesSearch && matchesCategory && matchesType;
  });

  const handleFileUpload = (category: 'deliverables' | 'wip' | 'references') => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const simulateUpload = () => {
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev === null) return 0;
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setUploadProgress(null), 1000);
          toast({
            title: "Upload Complete",
            description: "File uploaded successfully!",
          });
          return 100;
        }
        return prev + 10;
      });
    }, 200);
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

  return (
    <div className="space-y-6">
      <Card className="bg-gray-900/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Project Files & Assets
            <Badge variant="outline" className="ml-auto text-xs">
              {files.length} files
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search files and tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-800/50 border-gray-600 text-white"
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white"
                >
                  <option value="all">All Categories</option>
                  <option value="deliverables">Deliverables</option>
                  <option value="wip">Work in Progress</option>
                  <option value="references">References</option>
                </select>
                <select
                  value={selectedFileType}
                  onChange={(e) => setSelectedFileType(e.target.value)}
                  className="bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white"
                >
                  <option value="all">All Types</option>
                  <option value="image">Images</option>
                  <option value="video">Videos</option>
                  <option value="audio">Audio</option>
                  <option value="archive">Archives</option>
                  <option value="code">Code/Scenes</option>
                </select>
              </div>
            </div>

            {/* Upload Areas */}
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <h4 className="text-white font-medium">Deliverables</h4>
                </div>
                <p className="text-gray-400 text-sm mb-3">Final renders, compositions, and approved assets</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => handleFileUpload('deliverables')}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Files
                </Button>
              </div>
              
              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <h4 className="text-white font-medium">Work in Progress</h4>
                </div>
                <p className="text-gray-400 text-sm mb-3">Draft versions, previews, and work files</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => handleFileUpload('wip')}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Files
                </Button>
              </div>

              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <h4 className="text-white font-medium">References</h4>
                </div>
                <p className="text-gray-400 text-sm mb-3">Concept art, references, and source materials</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => handleFileUpload('references')}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Files
                </Button>
              </div>
            </div>

            {/* Upload Progress */}
            {uploadProgress !== null && (
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-blue-300 font-medium">Uploading file...</span>
                  <span className="text-blue-300 text-sm">{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
              </div>
            )}

            {/* Files List */}
            <div className="border-t border-gray-700 pt-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-white font-medium">Files ({filteredFiles.length})</h4>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" className="text-gray-400">
                    <Filter className="h-4 w-4 mr-1" />
                    Sort
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                {filteredFiles.length === 0 ? (
                  <div className="text-center py-8">
                    <FolderOpen className="h-12 w-12 text-gray-500 mx-auto mb-3" />
                    <p className="text-gray-400">No files match your current filters</p>
                  </div>
                ) : (
                  filteredFiles.map((file) => (
                    <div key={file.id} className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg border border-gray-700 hover:bg-gray-800/50 transition-colors group">
                      <div className="flex items-center gap-4 flex-1">
                        {getFileIcon(file.type)}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-white text-sm font-medium">{file.name}</p>
                            {file.isStarred && <Star className="h-4 w-4 text-yellow-400 fill-current" />}
                            <Badge className={getCategoryColor(file.category)} variant="outline">
                              {file.category}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-gray-400">
                            <span>Uploaded by {file.uploadedBy}</span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {file.uploadedAt}
                            </span>
                            <span>{file.size}</span>
                            <span className="flex items-center gap-1">
                              <Download className="h-3 w-3" />
                              {file.downloadCount}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {file.tags.map(tag => (
                              <Badge key={tag} variant="secondary" className="text-xs bg-gray-700/50">
                                {tag}
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
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-400 hover:text-red-300">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* File Upload Dropzone */}
            <div 
              className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center hover:border-gray-500 transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h4 className="text-white font-medium mb-2">Drop files here to upload</h4>
              <p className="text-gray-400 text-sm mb-4">or click to browse files</p>
              <Button variant="outline" size="sm" onClick={simulateUpload}>
                Choose Files
              </Button>
            </div>

            {/* File Statistics */}
            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
              <h4 className="text-white font-medium mb-3">Storage Usage</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
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
                    {files.reduce((acc, f) => acc + f.downloadCount, 0)}
                  </p>
                  <p className="text-gray-400 text-xs">Total Downloads</p>
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
