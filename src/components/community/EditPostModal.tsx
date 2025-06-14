
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
import AttachmentUpload from './AttachmentUpload'; // Assuming this exists and is set up
import { CommunityPost, UploadedFile } from '@/types/community';
import { POST_CATEGORIES } from './PostCategories';

interface EditPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  postToEdit: CommunityPost | null;
  onSave: (
    postId: string,
    content: string,
    category: string,
    newAttachments: UploadedFile[],
    oldAttachments: UploadedFile[]
  ) => Promise<boolean>;
  currentUserId: string; // To pass to AttachmentUpload if needed
}

const EditPostModal = ({ isOpen, onClose, postToEdit, onSave, currentUserId }: EditPostModalProps) => {
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('general');
  const [attachments, setAttachments] = useState<UploadedFile[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (postToEdit) {
      setContent(postToEdit.content);
      setCategory(postToEdit.category || 'general');
      setAttachments(postToEdit.attachments || []);
    } else {
      // Reset form when no post is being edited (e.g. modal closed and reopened for a new edit)
      setContent('');
      setCategory('general');
      setAttachments([]);
    }
  }, [postToEdit, isOpen]); // Re-run if postToEdit changes or modal re-opens

  const handleSave = async () => {
    if (!postToEdit) return;
    setIsSaving(true);
    const success = await onSave(postToEdit.id, content, category, attachments, postToEdit.attachments || []);
    setIsSaving(false);
    if (success) {
      onClose();
    }
  };

  const handleFilesChange = (files: UploadedFile[]) => {
    setAttachments(files);
  };
  
  if (!postToEdit) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-gray-800 border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle>Edit Post</DialogTitle>
          <DialogDescription className="text-gray-400">
            Make changes to your post.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
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
                  <SelectItem key={cat.id} value={cat.id} className="hover:bg-gray-600">
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
             <Label className="text-gray-300">Attachments</Label>
            {/* Assuming AttachmentUpload can take initialFiles and onFilesChange */}
            <AttachmentUpload
              currentUserId={currentUserId} 
              onFilesChange={handleFilesChange}
              initialFiles={attachments} 
              bucketName="community-attachments"
            />
          </div>
        </div>
        <DialogFooter>
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

