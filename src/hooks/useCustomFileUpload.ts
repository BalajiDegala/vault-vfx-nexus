
import logger from "@/lib/logger";
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { storeFile, getFileUrl } from '@/utils/localFileStorage';

interface FileUploadOptions {
  maxFileSize?: number;
  allowedTypes?: string[];
}

interface UploadedFile {
  name: string;
  url: string;
  type: string;
  size: number;
  fileId: string; // This is critical for local storage reference
}

export const useCustomFileUpload = (options: FileUploadOptions = {}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();

  const uploadFile = async (file: File, userId: string): Promise<UploadedFile | null> => {
    try {
      setUploading(true);
      setUploadProgress(0);

      logger.log('useCustomFileUpload: Starting upload for:', file.name, 'Size:', file.size);

      // Validate file size
      const maxSize = options.maxFileSize || 50 * 1024 * 1024; // 50MB default
      if (file.size > maxSize) {
        throw new Error(`File size must be less than ${maxSize / (1024 * 1024)}MB`);
      }

      // Validate file type
      if (options.allowedTypes && !options.allowedTypes.includes(file.type)) {
        throw new Error('File type not allowed');
      }

      logger.log('useCustomFileUpload: Validation passed, storing file in localStorage');
      setUploadProgress(25);

      // Store file in localStorage
      const storedFile = await storeFile(file);
      logger.log('useCustomFileUpload: File stored with ID:', storedFile.id);
      setUploadProgress(75);

      // Get the blob URL for immediate display
      const fileUrl = getFileUrl(storedFile.id);
      if (!fileUrl) {
        throw new Error('Failed to create file URL');
      }

      setUploadProgress(100);
      
      logger.log('useCustomFileUpload: Upload complete. FileId:', storedFile.id, 'URL:', fileUrl);

      const uploadedFile: UploadedFile = {
        name: file.name,
        url: fileUrl,
        type: file.type,
        size: file.size,
        fileId: storedFile.id // Ensure fileId is always included
      };

      logger.log('useCustomFileUpload: Returning uploaded file:', uploadedFile);
      return uploadedFile;
    } catch (error) {
      console.error('useCustomFileUpload: Error during upload:', error);
      toast({
        title: "Upload Error",
        description: error instanceof Error ? error.message : "Failed to store file locally",
        variant: "destructive",
      });
      return null;
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const uploadMultipleFiles = async (files: File[], userId: string): Promise<UploadedFile[]> => {
    logger.log('useCustomFileUpload: Starting multiple file upload for', files.length, 'files');
    const uploadedFiles: UploadedFile[] = [];
    
    for (const file of files) {
      const uploadedFile = await uploadFile(file, userId);
      if (uploadedFile) {
        uploadedFiles.push(uploadedFile);
      }
    }
    
    logger.log('useCustomFileUpload: Multiple upload complete. Successful uploads:', uploadedFiles.length);
    return uploadedFiles;
  };

  return {
    uploadFile,
    uploadMultipleFiles,
    uploading,
    uploadProgress
  };
};
