
import logger from "@/lib/logger";
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Image, Video, FileText, File, Download, ExternalLink, AlertCircle } from 'lucide-react';
import { getFileUrl, getStorageInfo } from '@/utils/localFileStorage';

interface Attachment {
  name: string;
  url: string;
  type: string;
  size: number;
  fileId?: string;
}

interface AttachmentDisplayProps {
  attachments: Attachment[];
}

// URL cache to prevent memory leaks and unnecessary blob URL recreation
const urlCache = new Map<string, string>();

const AttachmentDisplay = ({ attachments }: AttachmentDisplayProps) => {
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  
  logger.log('AttachmentDisplay: Received attachments:', attachments);
  logger.log('AttachmentDisplay: Current storage info:', getStorageInfo());

  useEffect(() => {
    // Cleanup blob URLs when component unmounts
    return () => {
      urlCache.forEach(url => {
        if (url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
      urlCache.clear();
    };
  }, []);

  if (!attachments || attachments.length === 0) {
    logger.log('AttachmentDisplay: No attachments to display.');
    return null;
  }

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

  const getAttachmentUrl = (attachment: Attachment): string => {
    logger.log('AttachmentDisplay: Getting URL for attachment:', attachment.name, 'fileId:', attachment.fileId);
    
    // If we have a fileId, try to get fresh URL from local storage
    if (attachment.fileId) {
      // Check cache first
      const cacheKey = `file_${attachment.fileId}`;
      if (urlCache.has(cacheKey)) {
        const cachedUrl = urlCache.get(cacheKey)!;
        logger.log('AttachmentDisplay: Using cached URL for:', attachment.name);
        return cachedUrl;
      }
      
      // Generate fresh blob URL from localStorage
      const localUrl = getFileUrl(attachment.fileId);
      if (localUrl) {
        logger.log('AttachmentDisplay: Generated fresh blob URL for:', attachment.name, localUrl);
        urlCache.set(cacheKey, localUrl);
        return localUrl;
      } else {
        logger.error('AttachmentDisplay: Failed to retrieve file from localStorage:', attachment.fileId);
        setImageErrors(prev => new Set([...prev, attachment.fileId!]));
      }
    }
    
    // Fallback to stored URL (for backwards compatibility)
    logger.log('AttachmentDisplay: Using fallback URL for:', attachment.name, attachment.url);
    return attachment.url;
  };

  const handleImageError = (attachment: Attachment) => {
    logger.error('AttachmentDisplay: Image failed to load:', attachment.name, 'fileId:', attachment.fileId);
    if (attachment.fileId) {
      setImageErrors(prev => new Set([...prev, attachment.fileId!]));
      // Remove from cache to force regeneration on next render
      const cacheKey = `file_${attachment.fileId}`;
      if (urlCache.has(cacheKey)) {
        const oldUrl = urlCache.get(cacheKey)!;
        if (oldUrl.startsWith('blob:')) {
          URL.revokeObjectURL(oldUrl);
        }
        urlCache.delete(cacheKey);
      }
    }
  };

  const renderAttachment = (attachment: Attachment, index: number) => {
    logger.log(`AttachmentDisplay: Rendering attachment ${index}:`, attachment);
    
    if (!attachment || !attachment.type) {
      logger.warn(`AttachmentDisplay: Attachment ${index} is invalid or missing type.`, attachment);
      return (
        <div key={`invalid-${index}`} className="flex items-center gap-2 bg-red-900/20 border border-red-500/30 rounded-lg p-3 text-red-400">
          <AlertCircle className="h-4 w-4" />
          <span className="text-sm">Invalid attachment: {attachment.name || `Attachment ${index + 1}`}</span>
        </div>
      );
    }

    const fileUrl = getAttachmentUrl(attachment);
    const hasError = attachment.fileId && imageErrors.has(attachment.fileId);

    if (attachment.type.startsWith('image/')) {
      if (hasError) {
        return (
          <div key={index} className="flex items-center gap-2 bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-3 text-yellow-400">
            <AlertCircle className="h-4 w-4" />
            <div>
              <p className="text-sm font-medium">{attachment.name}</p>
              <p className="text-xs">Image file not found in local storage</p>
            </div>
          </div>
        );
      }

      return (
        <Dialog key={index}>
          <DialogTrigger asChild>
            <div className="relative cursor-pointer group">
              <img
                src={fileUrl}
                alt={attachment.name}
                className="max-h-48 rounded-lg object-cover group-hover:opacity-90 transition-opacity"
                onError={() => handleImageError(attachment)}
                onLoad={() => logger.log(`AttachmentDisplay: Image loaded successfully: ${attachment.name}`)}
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-lg flex items-center justify-center">
                <ExternalLink className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          </DialogTrigger>
          <DialogContent className="max-w-4xl bg-gray-900 border-gray-700">
            <img
              src={fileUrl}
              alt={attachment.name}
              className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
              onError={() => handleImageError(attachment)}
            />
          </DialogContent>
        </Dialog>
      );
    }

    if (attachment.type.startsWith('video/')) {
      if (hasError) {
        return (
          <div key={index} className="flex items-center gap-2 bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-3 text-yellow-400">
            <AlertCircle className="h-4 w-4" />
            <div>
              <p className="text-sm font-medium">{attachment.name}</p>
              <p className="text-xs">Video file not found in local storage</p>
            </div>
          </div>
        );
      }

      return (
        <div key={index} className="max-w-md">
          <video
            controls
            className="w-full rounded-lg"
            preload="metadata"
            onError={() => handleImageError(attachment)}
          >
            <source src={fileUrl} type={attachment.type} />
            Your browser does not support the video tag.
          </video>
        </div>
      );
    }
    
    return (
      <div key={index} className="flex items-center gap-3 bg-gray-800 p-3 rounded-lg">
        <div className="flex items-center gap-2 flex-1">
          {getFileIcon(attachment.type)}
          <div>
            <p className="text-sm text-gray-300 font-medium">{attachment.name}</p>
            <p className="text-xs text-gray-500">{formatFileSize(attachment.size)}</p>
            {hasError && <p className="text-xs text-yellow-400">File not found in storage</p>}
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            if (!hasError) {
              window.open(fileUrl, '_blank');
            }
          }}
          disabled={hasError}
          className="text-blue-400 hover:text-blue-300 disabled:text-gray-500"
        >
          <Download className="h-4 w-4 mr-1" />
          {hasError ? 'Missing' : 'View'}
        </Button>
      </div>
    );
  };

  return (
    <div className="mt-3 space-y-3">
      {attachments.map((attachment, index) => renderAttachment(attachment, index))}
    </div>
  );
};

export default AttachmentDisplay;
