import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Paperclip, X, Image, Video, FileText, File } from 'lucide-react';
import { useCustomFileUpload } from '@/hooks/useCustomFileUpload';

interface UploadedFile {
  name: string;
  url: string;
  type: string;
  size: number;
  fileId?: string; // Add fileId for local storage
}

interface AttachmentUploadProps {
  onFilesUploaded: (files: UploadedFile[]) => void;
  currentUserId: string;
  maxFiles?: number;
}

const AttachmentUpload = ({ onFilesUploaded, currentUserId, maxFiles = 5 }: AttachmentUploadProps) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const { uploadMultipleFiles, uploading, uploadProgress } = useCustomFileUpload({
    maxFileSize: 5 * 1024 * 1024, // Reduced to 5MB for local storage
    allowedTypes: [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'video/mp4', 'video/webm',
      'application/pdf', 'text/plain'
    ]
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    console.log('AttachmentUpload: Files selected:', files);
    if (files.length > maxFiles) {
      console.warn(`AttachmentUpload: Too many files selected. Max is ${maxFiles}. Truncating.`);
    }
    const validFiles = files.slice(0, maxFiles);
    setSelectedFiles(validFiles);
    console.log('AttachmentUpload: Valid files to be processed:', validFiles);
  };

  const removeFile = (index: number) => {
    console.log('AttachmentUpload: Removing file at index:', index);
    setSelectedFiles(files => files.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      console.log('AttachmentUpload: No files selected for upload.');
      return;
    }
    console.log('AttachmentUpload: Starting local storage upload for files:', selectedFiles, 'by userId:', currentUserId);

    const uploadedFiles = await uploadMultipleFiles(selectedFiles, currentUserId);
    console.log('AttachmentUpload: Files stored locally, response from hook:', uploadedFiles);

    if (uploadedFiles && uploadedFiles.length > 0) {
      onFilesUploaded(uploadedFiles);
      console.log('AttachmentUpload: onFilesUploaded called with:', uploadedFiles);
      setSelectedFiles([]);
    } else {
      console.warn('AttachmentUpload: uploadMultipleFiles returned empty or null. Not calling onFilesUploaded.');
    }
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="h-4 w-4" />;
    if (type.startsWith('video/')) return <Video className="h-4 w-4" />;
    if (type === 'application/pdf') return <FileText className="h-4 w-4" />;
    return <File className="h-4 w-4" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Input
          type="file"
          multiple
          accept="image/*,video/*,application/pdf,text/plain"
          onChange={handleFileSelect}
          className="hidden"
          id="file-upload"
          disabled={uploading}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => document.getElementById('file-upload')?.click()}
          className="border-gray-600 text-gray-300"
          disabled={uploading}
        >
          <Paperclip className="h-4 w-4 mr-2" />
          Attach Files
        </Button>
        {selectedFiles.length > 0 && (
          <Button
            type="button"
            onClick={handleUpload}
            disabled={uploading || selectedFiles.length === 0}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700"
          >
            {uploading ? `Storing... ${uploadProgress > 0 ? uploadProgress + '%' : ''}` : `Store ${selectedFiles.length} file${selectedFiles.length > 1 ? 's' : ''}`}
          </Button>
        )}
      </div>

      {selectedFiles.length > 0 && !uploading && (
        <div className="space-y-2">
          <p className="text-xs text-gray-400">Selected files:</p>
          {selectedFiles.map((file, index) => (
            <div key={index} className="flex items-center justify-between bg-gray-800 p-2 rounded">
              <div className="flex items-center gap-2">
                {getFileIcon(file.type)}
                <span className="text-sm text-gray-300">{file.name}</span>
                <span className="text-xs text-gray-500">({formatFileSize(file.size)})</span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeFile(index)}
                className="text-gray-400 hover:text-red-400"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
      
      {uploading && uploadProgress > 0 && (
        <div className="w-full bg-gray-700 rounded-full h-2.5">
          <div 
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-out" 
            style={{ width: `${uploadProgress}%` }}
          ></div>
        </div>
      )}

      <div className="text-xs text-gray-500">
        Max {maxFiles} files, 5MB each (stored locally). Supported: Images, Videos, PDF, Text
      </div>
    </div>
  );
};

export default AttachmentUpload;
