
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Plus } from 'lucide-react';

interface CreatePostModalProps {
  onCreatePost: (content: string) => Promise<boolean>;
}

const CreatePostModal = ({ onCreatePost }: CreatePostModalProps) => {
  const [content, setContent] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setLoading(true);
    const success = await onCreatePost(content);
    
    if (success) {
      setContent('');
      setIsOpen(false);
    }
    setLoading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Create Post
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-gray-900 border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-white">Create New Discussion</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            placeholder="What's on your mind? Share your thoughts about VFX, techniques, or ask for advice..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="bg-gray-800 border-gray-600 text-white min-h-[120px]"
            maxLength={2000}
          />
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
