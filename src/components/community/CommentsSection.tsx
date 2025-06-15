
import { useState, useEffect } from 'react';
import { useCommunityPosts } from '@/hooks/useCommunityPosts';
import { useCommentsAuth } from '@/hooks/useCommentsAuth';
import ErrorBoundary from './ErrorBoundary';
import CommentItem from './comments/CommentItem';
import CommentForm from './comments/CommentForm';
import CommentsLoadingState from './comments/CommentsLoadingState';
import CommentsEmptyState from './comments/CommentsEmptyState';
import AuthenticationAlert from './comments/AuthenticationAlert';
import ErrorAlert from './comments/ErrorAlert';

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
  const { isAuthenticated } = useCommentsAuth();

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
      
      // Defensive programming: ensure we have valid comments array
      if (Array.isArray(fetchedComments)) {
        setComments(fetchedComments);
        console.log('CommentsSection: Comments loaded successfully:', fetchedComments.length);
      } else {
        console.warn('CommentsSection: Invalid comments data received:', fetchedComments);
        setComments([]);
      }
    } catch (error) {
      console.error('CommentsSection: Error loading comments:', error);
      setError('Failed to load comments');
      setComments([]); // Reset to empty array on error
    } finally {
      setCommentsLoading(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newComment.trim() || !postId) {
      console.log('CommentsSection: Submission aborted - empty comment or no postId');
      return;
    }

    if (!isAuthenticated) {
      console.error('CommentsSection: User not authenticated, cannot submit comment');
      setError('You must be logged in to comment');
      return;
    }

    setLoading(true);
    setError(null);
    console.log('CommentsSection: Submitting comment:', { postId, content: newComment });
    
    try {
      const success = await addComment(postId, newComment);
      console.log('CommentsSection: Comment submission result:', success);
      
      if (success) {
        setNewComment('');
        // Add a small delay to ensure database consistency
        setTimeout(async () => {
          try {
            await loadComments();
            console.log('CommentsSection: Comment added successfully, comments reloaded');
          } catch (reloadError) {
            console.error('CommentsSection: Error reloading comments after submission:', reloadError);
            // Don't show error to user for reload failures, the comment was added successfully
          }
        }, 100);
      } else {
        console.error('CommentsSection: Failed to add comment (addComment returned false)');
        setError('Failed to post comment. Please try again.');
      }
    } catch (error) {
      console.error('CommentsSection: Comment submission error:', error);
      setError('Failed to post comment. An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (postId) {
      console.log('CommentsSection: postId changed, loading comments:', postId);
      loadComments();
    } else {
      // Reset state if no postId
      setComments([]);
      setCommentsLoading(false);
    }
  }, [postId]);

  if (commentsLoading) {
    return <CommentsLoadingState />;
  }

  return (
    <ErrorBoundary>
      <div className="space-y-4">
        {!isAuthenticated && <AuthenticationAlert />}
        {error && <ErrorAlert error={error} />}

        <CommentForm
          newComment={newComment}
          setNewComment={setNewComment}
          onSubmit={handleSubmitComment}
          loading={loading}
          isAuthenticated={isAuthenticated}
        />

        <div className="space-y-3">
          {comments.length === 0 ? (
            <CommentsEmptyState />
          ) : (
            comments.map((comment) => (
              <CommentItem key={comment.id} comment={comment} />
            ))
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default CommentsSection;
