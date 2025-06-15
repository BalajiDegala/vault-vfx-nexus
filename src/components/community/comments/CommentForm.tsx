
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send } from 'lucide-react';

interface CommentFormProps {
  newComment: string;
  setNewComment: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
  isAuthenticated: boolean;
}

const CommentForm = ({ 
  newComment, 
  setNewComment, 
  onSubmit, 
  loading, 
  isAuthenticated 
}: CommentFormProps) => {
  return (
    <form onSubmit={onSubmit} className="flex gap-2">
      <Textarea
        placeholder={isAuthenticated ? "Write a comment..." : "Please log in to comment"}
        value={newComment}
        onChange={(e) => setNewComment(e.target.value)}
        className="bg-gray-800 border-gray-600 text-white resize-none"
        rows={2}
        disabled={loading || !isAuthenticated}
      />
      <Button
        type="submit"
        disabled={!newComment.trim() || loading || !isAuthenticated}
        className="bg-blue-600 hover:bg-blue-700 self-end"
      >
        {loading ? (
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
        ) : (
          <Send className="h-4 w-4" />
        )}
      </Button>
    </form>
  );
};

export default CommentForm;
