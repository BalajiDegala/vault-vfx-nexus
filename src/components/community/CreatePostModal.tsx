
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { POST_CATEGORIES } from './PostCategories';
import AttachmentUpload from './AttachmentUpload';

interface UploadedFile {
  name: string;
  url: string;
  type: string;
  size: number;
}

interface CreatePostModalProps {
  onCreatePost: (content: string, category?: string, attachments?: UploadedFile[]) => Promise<boolean>;
  currentUserId: string;
}

const CreatePostModal = ({ onCreatePost, currentUserId }: CreatePostModalProps) => {
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('general');
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [attachments, setAttachments] = useState<UploadedFile[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setLoading(true);
    const success = await onCreatePost(content, category, attachments);
    
    if (success) {
      setContent('');
      setCategory('general');
      setAttachments([]);
      setIsOpen(false);
    }
    setLoading(false);
  };

  const handleFilesUploaded = (files: UploadedFile[]) => {
    setAttachments(prev => [...prev, ...files]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Create Post
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-gray-900 border-gray-700 max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-white">Create New Discussion</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-gray-300 text-sm font-medium mb-2 block">Category</label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600">
                {POST_CATEGORIES.filter(cat => cat.id !== 'all').map((cat) => (
                  <SelectItem key={cat.id} value={cat.id} className="text-white hover:bg-gray-700">
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="text-gray-300 text-sm font-medium mb-2 block">Content</label>
            <Textarea
              placeholder="What's on your mind? Use #hashtags and @mentions to connect with the community..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="bg-gray-800 border-gray-600 text-white min-h-[120px]"
              maxLength={2000}
            />
            <div className="mt-2 text-xs text-gray-400">
              <p>💡 Tips: Use #vfx #3d #animation for hashtags, @username for mentions</p>
            </div>
          </div>

          <div>
            <label className="text-gray-300 text-sm font-medium mb-2 block">Attachments</label>
            <AttachmentUpload
              onFilesUploaded={handleFilesUploaded}
              currentUserId={currentUserId}
              maxFiles={5}
            />
          </div>

          {attachments.length > 0 && (
            <div className="space-y-2">
              <p className="text-gray-300 text-sm font-medium">Attached files:</p>
              {attachments.map((file, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-800 p-2 rounded">
                  <span className="text-sm text-gray-300">{file.name}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeAttachment(index)}
                    className="text-red-400 hover:text-red-300"
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          )}
          
          <div className="flex justify-between items-center">
            <span className="text-gray-400 text-sm">
              {content.length}/2000 characters
            </span>
            <div className="flex gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsOpen(false)}
                className="border-gray-600 text-gray-300"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={!content.trim() || loading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {loading ? 'Posting...' : 'Post'}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePostModal;
