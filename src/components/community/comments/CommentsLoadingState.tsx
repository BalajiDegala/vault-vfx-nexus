
import { MessageSquare } from 'lucide-react';

const CommentsLoadingState = () => {
  return (
    <div className="space-y-4">
      <div className="text-center text-gray-400 py-4">
        <MessageSquare className="h-6 w-6 mx-auto mb-2 animate-pulse" />
        Loading comments...
      </div>
    </div>
  );
};

export default CommentsLoadingState;
