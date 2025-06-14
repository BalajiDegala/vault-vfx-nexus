import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, MessageSquare } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useCommunityPosts } from '@/hooks/useCommunityPosts';
import ErrorBoundary from './ErrorBoundary';

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
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { fetchComments, addComment } = useCommunityPosts();

  const loadComments = async () => {
    if (!postId) {
      console.error('CommentsSection: No postId provided.');
      setCommentsLoading(false);
      return;
    }

    try {
      setCommentsLoading(true);
      setError(null);
      console.log('CommentsSection: Loading comments for post:', postId);
      const fetchedComments = await fetchComments(postId);
      setComments(fetchedComments);
      console.log('CommentsSection: Comments loaded:', fetchedComments.length, fetchedComments);
    } catch (error) {
      console.error('CommentsSection: Error loading comments:', error);
      setError('Failed to load comments');
    } finally {
      setCommentsLoading(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('CommentsSection: handleSubmitComment triggered.');
    if (!newComment.trim() || !postId) {
      console.log('CommentsSection: Comment submission aborted. Reason: Empty comment or no postId.', { newComment, postId });
      return;
    }

    setLoading(true);
    setError(null);
    console.log('CommentsSection: Submitting comment for postId:', postId, 'Content:', newComment);
    
    try {
      const success = await addComment(postId, newComment);
      console.log('CommentsSection: addComment result:', success);
      
      if (success) {
        setNewComment('');
        await loadComments(); // Reload comments after adding
      } else {
        console.error('CommentsSection: Failed to post comment (returned false from addComment).');
        setError('Failed to post comment. Please try again.');
      }
    } catch (error) {
      console.error('CommentsSection: Error submitting comment:', error);
      setError('Failed to post comment. An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (postId) {
      console.log('CommentsSection: postId changed or component mounted with postId:', postId);
      loadComments();
    }
  }, [postId]);

  if (commentsLoading) {
    return (
      <div className="space-y-4">
        <div className="text-center text-gray-400 py-4">
          <MessageSquare className="h-6 w-6 mx-auto mb-2 animate-pulse" />
          Loading comments...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="text-center text-red-400 py-4">
          <p>{error}</p>
          <Button onClick={loadComments} variant="outline" size="sm" className="mt-2">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="space-y-4">
        <form onSubmit={handleSubmitComment} className="flex gap-2">
          <Textarea
            placeholder="Write a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="bg-gray-800 border-gray-600 text-white resize-none"
            rows={2}
            disabled={loading}
          />
          <Button
            type="submit"
            disabled={!newComment.trim() || loading}
            className="bg-blue-600 hover:bg-blue-700 self-end"
          >
            {loading ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>

        <div className="space-y-3">
          {comments.length === 0 ? (
            <div className="text-center text-gray-400 py-4">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
              No comments yet. Be the first to comment!
            </div>
          ) : (
            comments.map((comment) => {
              const authorName = `${comment.author_profile?.first_name || ''} ${comment.author_profile?.last_name || ''}`.trim() || 'Anonymous';
              const avatarFallback = authorName.split(' ').map(n => n[0]).join('').toUpperCase() || 'A';
              
              return (
                <div key={comment.id} className="flex space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={comment.author_profile?.avatar_url} />
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
            })
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default CommentsSection;
