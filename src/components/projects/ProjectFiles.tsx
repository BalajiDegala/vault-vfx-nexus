
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, File, Download, Eye, Trash2, FolderOpen } from "lucide-react";
import { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

interface ProjectFilesProps {
  projectId: string;
  userRole?: AppRole | null;
}

interface ProjectFile {
  id: string;
  name: string;
  size: string;
  type: string;
  uploadedBy: string;
  uploadedAt: string;
  url?: string;
}

const ProjectFiles = ({ projectId, userRole }: ProjectFilesProps) => {
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock data for now - replace with real Supabase integration later
  useEffect(() => {
    const mockFiles: ProjectFile[] = [
      {
        id: "1",
        name: "character_concept_v2.psd",
        size: "45.2 MB",
        type: "PSD",
        uploadedBy: "John Doe",
        uploadedAt: "2024-01-15T10:30:00Z"
      },
      {
        id: "2", 
        name: "environment_ref.jpg",
        size: "8.1 MB",
        type: "JPG",
        uploadedBy: "Jane Smith", 
        uploadedAt: "2024-01-14T15:45:00Z"
      },
      {
        id: "3",
        name: "animation_blocking.ma",
        size: "125.8 MB", 
        type: "Maya",
        uploadedBy: "Mike Johnson",
        uploadedAt: "2024-01-13T09:20:00Z"
      }
    ];

    // Simulate loading
    setTimeout(() => {
      setFiles(mockFiles);
      setLoading(false);
    }, 1000);
  }, [projectId]);

  const getFileIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'psd':
      case 'jpg':
      case 'png':
      case 'gif':
        return <Eye className="h-4 w-4" />;
      case 'maya':
      case 'ma':
      case 'mb':
        return <FolderOpen className="h-4 w-4" />;
      default:
        return <File className="h-4 w-4" />;
    }
  };

  const getFileTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'psd':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'jpg':
      case 'png':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'maya':
      case 'ma':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const canUpload = userRole && ['producer', 'admin', 'studio'].includes(userRole);
  const canDelete = userRole && ['producer', 'admin'].includes(userRole);

  if (loading) {
    return (
      <div className="space-y-6">
        <Card className="bg-gray-900/50 border-gray-700">
          <CardContent className="p-6">
            <div className="text-center text-gray-400">Loading files...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      {canUpload && (
        <Card className="bg-gray-900/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Upload className="h-5 w-5 text-blue-400" />
              Upload Files
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center hover:border-blue-500 transition-colors cursor-pointer">
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-300 mb-2">Drop files here or click to browse</p>
              <p className="text-gray-500 text-sm">Supports PSD, Maya files, images, and more</p>
              <Button className="mt-4 bg-blue-600 hover:bg-blue-700">
                Select Files
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Files List */}
      <Card className="bg-gray-900/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <FolderOpen className="h-5 w-5 text-green-400" />
            Project Files ({files.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {files.length === 0 ? (
            <div className="text-center py-8">
              <File className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400">No files uploaded yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {files.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-gray-700 rounded-lg">
                      {getFileIcon(file.type)}
                    </div>
                    <div>
                      <h4 className="text-white font-medium">{file.name}</h4>
                      <div className="flex items-center gap-3 text-sm text-gray-400">
                        <span>{file.size}</span>
                        <span>•</span>
                        <span>by {file.uploadedBy}</span>
                        <span>•</span>
                        <span>{formatDate(file.uploadedAt)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge className={getFileTypeColor(file.type)}>
                      {file.type.toUpperCase()}
                    </Badge>
                    
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800">
                        <Eye className="h-4 w-4" />
                      </Button>
                      {canDelete && (
                        <Button size="sm" variant="outline" className="border-red-600 text-red-400 hover:bg-red-900/20">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* File Statistics */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="bg-gray-900/50 border-gray-700">
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-blue-400">{files.length}</div>
            <div className="text-gray-400 text-sm">Total Files</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-900/50 border-gray-700">
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-green-400">
              {files.reduce((acc, file) => acc + parseFloat(file.size.replace(/[^\d.]/g, '')), 0).toFixed(1)} MB
            </div>
            <div className="text-gray-400 text-sm">Total Size</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-900/50 border-gray-700">
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-purple-400">
              {new Set(files.map(f => f.type)).size}
            </div>
            <div className="text-gray-400 text-sm">File Types</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProjectFiles;
