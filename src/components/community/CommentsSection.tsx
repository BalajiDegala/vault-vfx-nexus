
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, MessageSquare, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useCommunityPosts } from '@/hooks/useCommunityPosts';
import { supabase } from '@/integrations/supabase/client';
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
  const [authDebugInfo, setAuthDebugInfo] = useState<any>(null);
  const { fetchComments, addComment } = useCommunityPosts();

  // Debug authentication state
  useEffect(() => {
    const checkAuthState = async () => {
      try {
        console.log('CommentsSection: Checking authentication state...');
        
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        console.log('CommentsSection: Session check result:', { session: !!session, sessionError });
        
        if (session?.user) {
          console.log('CommentsSection: User authenticated:', {
            userId: session.user.id,
            email: session.user.email,
            metadata: session.user.user_metadata
          });
          
          // Check if user has a profile
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
            
          console.log('CommentsSection: Profile check result:', { profile, profileError });
          
          setAuthDebugInfo({
            authenticated: true,
            userId: session.user.id,
            email: session.user.email,
            hasProfile: !!profile,
            profileError: profileError?.message
          });
        } else {
          console.log('CommentsSection: User not authenticated');
          setAuthDebugInfo({
            authenticated: false,
            sessionError: sessionError?.message
          });
        }
      } catch (error) {
        console.error('CommentsSection: Auth check error:', error);
        setAuthDebugInfo({
          authenticated: false,
          checkError: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    };
    
    checkAuthState();
  }, []);

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
      console.log('CommentsSection: Comments loaded successfully:', fetchedComments.length);
    } catch (error) {
      console.error('CommentsSection: Error loading comments:', error);
      setError('Failed to load comments');
    } finally {
      setCommentsLoading(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('CommentsSection: Comment submission started');
    console.log('CommentsSection: Auth debug info:', authDebugInfo);
    
    if (!newComment.trim() || !postId) {
      console.log('CommentsSection: Submission aborted - empty comment or no postId');
      return;
    }

    if (!authDebugInfo?.authenticated) {
      console.error('CommentsSection: User not authenticated, cannot submit comment');
      setError('You must be logged in to comment');
      return;
    }

    setLoading(true);
    setError(null);
    console.log('CommentsSection: Submitting comment:', {
      postId,
      content: newComment,
      userId: authDebugInfo.userId
    });
    
    try {
      const success = await addComment(postId, newComment);
      console.log('CommentsSection: Comment submission result:', success);
      
      if (success) {
        setNewComment('');
        await loadComments(); // Reload comments after adding
        console.log('CommentsSection: Comment added successfully, comments reloaded');
      } else {
        console.error('CommentsSection: Failed to add comment (addComment returned false)');
        setError('Failed to post comment. Please check your authentication and try again.');
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

  return (
    <ErrorBoundary>
      <div className="space-y-4">
        {/* Auth Debug Info (only show if there's an issue) */}
        {authDebugInfo && !authDebugInfo.authenticated && (
          <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3 text-red-400">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="h-4 w-4" />
              <span className="font-medium">Authentication Issue</span>
            </div>
            <p className="text-sm">You must be logged in to comment on posts.</p>
            {authDebugInfo.sessionError && (
              <p className="text-xs mt-1">Error: {authDebugInfo.sessionError}</p>
            )}
          </div>
        )}

        {error && (
          <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3 text-red-400">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmitComment} className="flex gap-2">
          <Textarea
            placeholder={authDebugInfo?.authenticated ? "Write a comment..." : "Please log in to comment"}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="bg-gray-800 border-gray-600 text-white resize-none"
            rows={2}
            disabled={loading || !authDebugInfo?.authenticated}
          />
          <Button
            type="submit"
            disabled={!newComment.trim() || loading || !authDebugInfo?.authenticated}
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
