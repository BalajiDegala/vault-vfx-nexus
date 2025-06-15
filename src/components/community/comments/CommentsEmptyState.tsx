
import { MessageSquare } from 'lucide-react';

const CommentsEmptyState = () => {
  return (
    <div className="text-center text-gray-400 py-4">
      <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
      No comments yet. Be the first to comment!
    </div>
  );
};

export default CommentsEmptyState;
