import logger from "@/lib/logger";

// Local file storage utility for browser-based file uploads
interface StoredFile {
  id: string;
  name: string;
  type: string;
  size: number;
  data: string; // base64 encoded file data
  createdAt: string;
}

const STORAGE_KEY = 'vfx_uploaded_files';
const MAX_STORAGE_SIZE = 5 * 1024 * 1024; // 5MB limit

// Generate a unique ID for files
const generateFileId = (): string => {
  return `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Convert file to base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

// Get all stored files
const getStoredFiles = (): StoredFile[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    logger.error('Error reading stored files:', error);
    return [];
  }
};

// Save files to localStorage
const saveStoredFiles = (files: StoredFile[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(files));
  } catch (error) {
    logger.error('Error saving files to storage:', error);
    throw new Error('Storage quota exceeded');
  }
};

// Check storage size
const getStorageSize = (files: StoredFile[]): number => {
  return files.reduce((total, file) => total + file.data.length, 0);
};

// Store a file in localStorage
export const storeFile = async (file: File): Promise<StoredFile> => {
  const files = getStoredFiles();
  
  // Check if adding this file would exceed storage limit
  const base64Data = await fileToBase64(file);
  const newFileSize = base64Data.length;
  const currentSize = getStorageSize(files);
  
  if (currentSize + newFileSize > MAX_STORAGE_SIZE) {
    throw new Error('Storage limit exceeded. Please remove some files first.');
  }
  
  const storedFile: StoredFile = {
    id: generateFileId(),
    name: file.name,
    type: file.type,
    size: file.size,
    data: base64Data,
    createdAt: new Date().toISOString()
  };
  
  files.push(storedFile);
  saveStoredFiles(files);
  
  logger.log('File stored locally:', storedFile.name, 'ID:', storedFile.id);
  return storedFile;
};

// Retrieve a file from localStorage and convert to blob URL
export const getFileUrl = (fileId: string): string | null => {
  const files = getStoredFiles();
  const file = files.find(f => f.id === fileId);
  
  if (!file) {
    logger.warn('File not found:', fileId);
    return null;
  }
  
  try {
    // Convert base64 back to blob
    const base64Data = file.data.split(',')[1]; // Remove data:type;base64, prefix
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    const blob = new Blob([bytes], { type: file.type });
    return URL.createObjectURL(blob);
  } catch (error) {
    logger.error('Error converting stored file to URL:', error);
    return null;
  }
};

// Delete files from localStorage
export const deleteStoredFiles = (fileIds: string[]): void => {
  const files = getStoredFiles();
  const updatedFiles = files.filter(file => !fileIds.includes(file.id));
  saveStoredFiles(updatedFiles);
  logger.log('Deleted files from storage:', fileIds);
};

// Get storage usage info
export const getStorageInfo = () => {
  const files = getStoredFiles();
  const usedSize = getStorageSize(files);
  return {
    filesCount: files.length,
    usedSize,
    maxSize: MAX_STORAGE_SIZE,
    usagePercentage: (usedSize / MAX_STORAGE_SIZE) * 100
  };
};

// Clean up old files (optional utility)
export const cleanupOldFiles = (daysOld: number = 30): void => {
  const files = getStoredFiles();
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);
  
  const recentFiles = files.filter(file => 
    new Date(file.createdAt) > cutoffDate
  );
  
  if (recentFiles.length < files.length) {
    saveStoredFiles(recentFiles);
    logger.log(`Cleaned up ${files.length - recentFiles.length} old files`);
  }
};
