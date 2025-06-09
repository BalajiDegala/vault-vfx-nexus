
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Upload, File, Download } from "lucide-react";

const ProjectFiles = () => {
  return (
    <div className="space-y-6">
      <Card className="bg-gray-900/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Project Files & Assets
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                <h4 className="text-white font-medium mb-2">Deliverables</h4>
                <p className="text-gray-400 text-sm mb-3">Final renders, compositions, and approved assets</p>
                <Button variant="outline" size="sm" className="w-full">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Files
                </Button>
              </div>
              
              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                <h4 className="text-white font-medium mb-2">Work in Progress</h4>
                <p className="text-gray-400 text-sm mb-3">Draft versions, previews, and work files</p>
                <Button variant="outline" size="sm" className="w-full">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Files
                </Button>
              </div>

              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                <h4 className="text-white font-medium mb-2">References</h4>
                <p className="text-gray-400 text-sm mb-3">Concept art, references, and source materials</p>
                <Button variant="outline" size="sm" className="w-full">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Files
                </Button>
              </div>
            </div>

            <div className="border-t border-gray-700 pt-4">
              <h4 className="text-white font-medium mb-3">Recent Files</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg border border-gray-700">
                  <div className="flex items-center gap-3">
                    <File className="h-5 w-5 text-blue-400" />
                    <div>
                      <p className="text-white text-sm">project_v1.blend</p>
                      <p className="text-gray-400 text-xs">Uploaded 2 hours ago • 24.5 MB</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg border border-gray-700">
                  <div className="flex items-center gap-3">
                    <File className="h-5 w-5 text-green-400" />
                    <div>
                      <p className="text-white text-sm">render_test.mp4</p>
                      <p className="text-gray-400 text-xs">Uploaded 1 day ago • 156.2 MB</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg border border-gray-700">
                  <div className="flex items-center gap-3">
                    <File className="h-5 w-5 text-purple-400" />
                    <div>
                      <p className="text-white text-sm">concept_art_seq01.jpg</p>
                      <p className="text-gray-400 text-xs">Uploaded 3 days ago • 8.7 MB</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* File upload dropzone */}
            <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center hover:border-gray-500 transition-colors">
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h4 className="text-white font-medium mb-2">Drop files here to upload</h4>
              <p className="text-gray-400 text-sm mb-4">or click to browse files</p>
              <Button variant="outline" size="sm">
                Choose Files
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectFiles;
