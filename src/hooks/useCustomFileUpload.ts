
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { uploadFileToServer } from '@/utils/fileServer';

interface FileUploadOptions {
  maxFileSize?: number;
  allowedTypes?: string[];
}

interface UploadedFile {
  name: string;
  url: string;
  type: string;
  size: number;
}

export const useCustomFileUpload = (options: FileUploadOptions = {}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();

  const uploadFile = async (file: File, userId: string): Promise<UploadedFile | null> => {
    try {
      setUploading(true);
      setUploadProgress(0);

      // Validate file size
      const maxSize = options.maxFileSize || 50 * 1024 * 1024; // 50MB default
      if (file.size > maxSize) {
        throw new Error(`File size must be less than ${maxSize / (1024 * 1024)}MB`);
      }

      // Validate file type
      if (options.allowedTypes && !options.allowedTypes.includes(file.type)) {
        throw new Error('File type not allowed');
      }

      console.log('Uploading file:', file.name);

      // Get auth token for API authentication
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('Not authenticated');
      }

      setUploadProgress(50);

      // For now, use a local URL that would work in development
      // In production, this would be your actual server
      const result = await uploadFileToServer(file, userId, session.access_token);
      
      setUploadProgress(100);

      // Create a local object URL for immediate display
      const localUrl = URL.createObjectURL(file);
      
      console.log('File uploaded successfully, using local URL for display:', localUrl);

      return {
        name: file.name,
        url: localUrl, // Use local URL for immediate display
        type: file.type,
        size: file.size
      };
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Upload Error",
        description: error instanceof Error ? error.message : "Failed to upload file",
        variant: "destructive",
      });
      return null;
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const uploadMultipleFiles = async (files: File[], userId: string): Promise<UploadedFile[]> => {
    const uploadedFiles: UploadedFile[] = [];
    
    for (const file of files) {
      const uploadedFile = await uploadFile(file, userId);
      if (uploadedFile) {
        uploadedFiles.push(uploadedFile);
      }
    }
    
    return uploadedFiles;
  };

  return {
    uploadFile,
    uploadMultipleFiles,
    uploading,
    uploadProgress
  };
};
