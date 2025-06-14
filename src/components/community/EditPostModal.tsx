
import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AttachmentUpload from './AttachmentUpload';
import { CommunityPost, UploadedFile } from '@/types/community';
import { POST_CATEGORIES } from './PostCategories';
import { X, Image, Video, FileText, File as FileIcon } from 'lucide-react'; // Renamed File to FileIcon to avoid conflict

interface EditPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  postToEdit: CommunityPost | null;
  onSave: (
    postId: string,
    content: string,
    category: string,
    finalAttachments: UploadedFile[], // Changed from newAttachments for clarity
    originalAttachments: UploadedFile[]
  ) => Promise<boolean>;
  currentUserId: string;
}

const getFileIcon = (type: string) => {
  if (type.startsWith('image/')) return <Image className="h-5 w-5 text-gray-400" />;
  if (type.startsWith('video/')) return <Video className="h-5 w-5 text-gray-400" />;
  if (type === 'application/pdf') return <FileText className="h-5 w-5 text-gray-400" />;
  return <FileIcon className="h-5 w-5 text-gray-400" />;
};

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const EditPostModal = ({ isOpen, onClose, postToEdit, onSave, currentUserId }: EditPostModalProps) => {
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('general');
  const [attachments, setAttachments] = useState<UploadedFile[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (postToEdit) {
      setContent(postToEdit.content);
      setCategory(postToEdit.category || 'general');
      setAttachments(Array.isArray(postToEdit.attachments) ? postToEdit.attachments : []);
    } else {
      setContent('');
      setCategory('general');
      setAttachments([]);
    }
  }, [postToEdit, isOpen]);

  const handleSave = async () => {
    if (!postToEdit) return;
    setIsSaving(true);
    const success = await onSave(postToEdit.id, content, category, attachments, postToEdit.attachments || []);
    setIsSaving(false);
    if (success) {
      onClose();
    }
  };

  const handleNewFilesUploaded = (newlyUploadedFiles: UploadedFile[]) => {
    setAttachments(prevAttachments => [...prevAttachments, ...newlyUploadedFiles]);
  };

  const removeAttachment = (fileUrlToRemove: string) => {
    setAttachments(prevAttachments => prevAttachments.filter(file => file.url !== fileUrlToRemove));
  };
  
  if (!postToEdit) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-gray-800 border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle>Edit Post</DialogTitle>
          <DialogDescription className="text-gray-400">
            Make changes to your post. Click Save Changes when you're done.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4 max-h-[70vh] overflow-y-auto pr-2">
          <div className="grid gap-2">
            <Label htmlFor="edit-content" className="text-gray-300">Content</Label>
            <Textarea
              id="edit-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's on your mind?"
              className="min-h-[120px] bg-gray-700 border-gray-600 text-white placeholder-gray-500"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="edit-category" className="text-gray-300">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="edit-category" className="w-full bg-gray-700 border-gray-600 text-white">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent className="bg-gray-700 border-gray-600 text-white">
                {POST_CATEGORIES.map(cat => (
                  <SelectItem key={cat.id} value={cat.id} className="focus:bg-gray-600 data-[highlighted]:bg-gray-600">
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Manage Existing and New Attachments */}
          <div className="grid gap-2">
            <Label className="text-gray-300">Manage Attachments</Label>
            {attachments.length > 0 ? (
              <div className="space-y-2 p-3 border border-gray-600 rounded-md bg-gray-750">
                {attachments.map((file) => (
                  <div
                    key={file.url}
                    className="flex items-center justify-between bg-gray-700 p-2 rounded text-sm"
                  >
                    <div className="flex items-center gap-2 overflow-hidden flex-1">
                      {getFileIcon(file.type)}
                      <span className="truncate text-gray-200" title={file.name}>{file.name}</span>
                      <span className="text-xs text-gray-500 whitespace-nowrap">({formatFileSize(file.size)})</span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeAttachment(file.url)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10 h-7 w-7"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-500 px-3 py-2 border border-dashed border-gray-600 rounded-md text-center">No attachments currently.</p>
            )}
          </div>

          {/* Upload New Attachments */}
          <div className="grid gap-2">
            <Label className="text-gray-300">Add New Attachments</Label>
            <AttachmentUpload
              currentUserId={currentUserId}
              onFilesUploaded={handleNewFilesUploaded}
              // The bucketName is configured within useFileUpload hook used by AttachmentUpload
            />
          </div>
        </div>
        <DialogFooter className="pt-4 border-t border-gray-700">
          <DialogClose asChild>
            <Button type="button" variant="outline" className="text-white border-gray-600 hover:bg-gray-700">
              Cancel
            </Button>
          </DialogClose>
          <Button type="submit" onClick={handleSave} disabled={isSaving || !content.trim()}>
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditPostModal;
