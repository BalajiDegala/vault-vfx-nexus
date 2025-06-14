
import { User } from '@supabase/supabase-js';
import { Card, CardContent } from '@/components/ui/card';
import { Users } from 'lucide-react';
import PostCard from './PostCard';
import CreatePostModal from './CreatePostModal';
import { CommunityPost, UploadedFile } from '@/types/community';

interface CommunityPostListProps {
  posts: CommunityPost[]; // Full list to check if any posts exist at all
  filteredPosts: CommunityPost[];
  currentUser: User;
  onCreatePost: (content: string, category?: string, attachments?: UploadedFile[]) => Promise<boolean | undefined>;
  onToggleLike: (postId: string) => Promise<void>;
  onToggleBookmark: (postId: string) => Promise<boolean | void>;
  onHashtagClick: (hashtag: string) => void;
  onMentionClick: (mention: string) => void;
  onMessageUser: (profile: any) => void;
  onEditPost: (post: CommunityPost) => void;
  onDeletePost: (postId: string, attachments: UploadedFile[] | undefined) => void;
}

const CommunityPostList = ({
  posts,
  filteredPosts,
  currentUser,
  onCreatePost,
  onToggleLike,
  onToggleBookmark,
  onHashtagClick,
  onMentionClick,
  onMessageUser,
  onEditPost,
  onDeletePost,
}: CommunityPostListProps) => {
  if (filteredPosts.length === 0) {
    return (
      <Card className="bg-gray-900/80 border-blue-500/20">
        <CardContent className="text-center py-12">
          <Users className="h-16 w-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-xl font-semibold text-white mb-2">
            {posts.length === 0 ? 'Start the Conversation' : 'No posts match your filters'}
          </h3>
          <p className="text-gray-400 mb-6">
            {posts.length === 0 
              ? 'Be the first to share your thoughts, ask questions, or discuss VFX techniques with the community.'
              : 'Try adjusting your category or hashtag filters to see more posts.'
            }
          </p>
          {posts.length === 0 && <CreatePostModal onCreatePost={onCreatePost} currentUserId={currentUser.id} />}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {filteredPosts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          onToggleLike={onToggleLike}
          onToggleBookmark={onToggleBookmark}
          onHashtagClick={onHashtagClick}
          onMentionClick={onMentionClick}
          onMessageUser={onMessageUser}
          currentUserId={currentUser.id}
          onEditPost={onEditPost}
          onDeletePost={onDeletePost}
        />
      ))}
    </div>
  );
};

export default CommunityPostList;
