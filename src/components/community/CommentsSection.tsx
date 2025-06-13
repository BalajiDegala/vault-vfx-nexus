
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useCommunityPosts } from '@/hooks/useCommunityPosts';

interface Comment {
  id: string;
  post_id: string;
  author_id: string;
  content: string;
  created_at: string;
  author_profile: {
    first_name: string;
    last_name: string;
    avatar_url: string;
  };
}

interface CommentsSectionProps {
  postId: string;
}

const CommentsSection = ({ postId }: CommentsSectionProps) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const { fetchComments, addComment } = useCommunityPosts();

  const loadComments = async () => {
    const fetchedComments = await fetchComments(postId);
    setComments(fetchedComments);
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setLoading(true);
    const success = await addComment(postId, newComment);
    
    if (success) {
      setNewComment('');
      loadComments();
    }
    setLoading(false);
  };

  useEffect(() => {
    loadComments();
  }, [postId]);

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmitComment} className="flex gap-2">
        <Textarea
          placeholder="Write a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="bg-gray-800 border-gray-600 text-white resize-none"
          rows={2}
        />
        <Button
          type="submit"
          disabled={!newComment.trim() || loading}
          className="bg-blue-600 hover:bg-blue-700 self-end"
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>

      <div className="space-y-3">
        {comments.map((comment) => {
          const authorName = `${comment.author_profile.first_name} ${comment.author_profile.last_name}`.trim() || 'Anonymous';
          const avatarFallback = authorName.split(' ').map(n => n[0]).join('').toUpperCase();
          
          return (
            <div key={comment.id} className="flex space-x-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={comment.author_profile.avatar_url} />
                <AvatarFallback className="bg-gray-600 text-white text-xs">
                  {avatarFallback}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="bg-gray-800 rounded-lg p-3">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-medium text-white text-sm">{authorName}</span>
                    <span className="text-xs text-gray-400">
                      {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-gray-200 text-sm">{comment.content}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CommentsSection;
