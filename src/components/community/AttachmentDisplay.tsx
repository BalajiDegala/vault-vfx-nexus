
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Image, Video, FileText, File, Download, ExternalLink } from 'lucide-react';

interface Attachment {
  name: string;
  url: string;
  type: string;
  size: number;
}

interface AttachmentDisplayProps {
  attachments: Attachment[];
}

const AttachmentDisplay = ({ attachments }: AttachmentDisplayProps) => {
  console.log('AttachmentDisplay: Received attachments:', attachments);

  if (!attachments || attachments.length === 0) {
    console.log('AttachmentDisplay: No attachments to display.');
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

  const renderAttachment = (attachment: Attachment, index: number) => {
    console.log(`AttachmentDisplay: Rendering attachment ${index}:`, attachment);
    if (!attachment || !attachment.url || !attachment.type) {
      console.warn(`AttachmentDisplay: Attachment ${index} is invalid or missing URL/type. Skipping.`, attachment);
      return (
        <div key={`invalid-${index}`} className="text-red-500 text-sm">
          Invalid attachment data for: {attachment.name || `Attachment ${index + 1}`}
        </div>
      );
    }

    if (attachment.type.startsWith('image/')) {
      console.log(`AttachmentDisplay: Rendering image ${attachment.name} from URL ${attachment.url}`);
      return (
        <Dialog key={index}>
          <DialogTrigger asChild>
            <div className="relative cursor-pointer group">
              <img
                src={attachment.url}
                alt={attachment.name}
                className="max-h-48 rounded-lg object-cover group-hover:opacity-90 transition-opacity"
                onError={(e) => {
                  console.error(`AttachmentDisplay: Error loading image ${attachment.url}`, e);
                  // Show a placeholder when image fails to load
                  (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzY2NiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmaWxsPSIjZmZmIiBmb250LXNpemU9IjE2IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+SW1hZ2UgRXJyb3I8L3RleHQ+PC9zdmc+';
                }}
                onLoad={() => console.log(`AttachmentDisplay: Image loaded successfully: ${attachment.url}`)}
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-lg flex items-center justify-center">
                <ExternalLink className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          </DialogTrigger>
          <DialogContent className="max-w-4xl bg-gray-900 border-gray-700">
            <img
              src={attachment.url}
              alt={attachment.name}
              className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
              onError={(e) => console.error(`AttachmentDisplay: Error loading image in dialog ${attachment.url}`, e)}
            />
          </DialogContent>
        </Dialog>
      );
    }

    if (attachment.type.startsWith('video/')) {
      console.log(`AttachmentDisplay: Rendering video ${attachment.name} from URL ${attachment.url}`);
      return (
        <div key={index} className="max-w-md">
          <video
            controls
            className="w-full rounded-lg"
            preload="metadata"
            onError={(e) => console.error(`AttachmentDisplay: Error loading video ${attachment.url}`, e)}
          >
            <source src={attachment.url} type={attachment.type} />
            Your browser does not support the video tag.
          </video>
        </div>
      );
    }
    
    console.log(`AttachmentDisplay: Rendering generic file ${attachment.name} (type: ${attachment.type}) from URL ${attachment.url}`);
    return (
      <div key={index} className="flex items-center gap-3 bg-gray-800 p-3 rounded-lg">
        <div className="flex items-center gap-2 flex-1">
          {getFileIcon(attachment.type)}
          <div>
            <p className="text-sm text-gray-300 font-medium">{attachment.name}</p>
            <p className="text-xs text-gray-500">{formatFileSize(attachment.size)}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            // For blob URLs, we can't directly download, so just open in new tab
            if (attachment.url.startsWith('blob:')) {
              window.open(attachment.url, '_blank');
            } else {
              window.open(attachment.url, '_blank');
            }
          }}
          className="text-blue-400 hover:text-blue-300"
        >
          <Download className="h-4 w-4 mr-1" />
          View
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
