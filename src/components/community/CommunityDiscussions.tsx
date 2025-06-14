
import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, TrendingUp } from 'lucide-react';
import { useCommunityPosts } from '@/hooks/useCommunityPosts';
import CreatePostModal from './CreatePostModal';
import PostCard from './PostCard';
import PostCategories from './PostCategories';
import TrendingHashtags from './TrendingHashtags';
import DirectMessaging from '@/components/messaging/DirectMessaging';

interface CommunityDiscussionsProps {
  currentUser: User;
}

const CommunityDiscussions = ({ currentUser }: CommunityDiscussionsProps) => {
  const { posts, loading, createPost, toggleLike } = useCommunityPosts();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [hashtagFilter, setHashtagFilter] = useState<string | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<any>(null);
  const [showMessaging, setShowMessaging] = useState(false);

  const filteredPosts = posts.filter(post => {
    const categoryMatch = selectedCategory === 'all' || post.category === selectedCategory;
    const hashtagMatch = !hashtagFilter || post.content.toLowerCase().includes(`#${hashtagFilter.toLowerCase()}`);
    return categoryMatch && hashtagMatch;
  });

  const handleCreatePost = async (content: string, category?: string) => {
    return await createPost(content, category);
  };

  const handleHashtagClick = (hashtag: string) => {
    setHashtagFilter(hashtag);
    setSelectedCategory('all'); // Reset category filter when filtering by hashtag
  };

  const handleMentionClick = (mention: string) => {
    console.log('Clicked mention:', mention);
    // TODO: Navigate to user profile or open user info modal
  };

  const handleMessageUser = (profile: any) => {
    setSelectedProfile(profile);
    setShowMessaging(true);
  };

  const clearFilters = () => {
    setHashtagFilter(null);
    setSelectedCategory('all');
  };

  const getDisplayName = (profile: any) => {
    if (profile.first_name || profile.last_name) {
      return `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
    }
    return profile.username || 'Unknown User';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">Community Discussions</h2>
        </div>
        <div className="text-center text-gray-400 py-8">
          <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Loading discussions...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main content */}
        <div className="lg:col-span-3 space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Users className="h-6 w-6" />
                Community Discussions
              </h2>
              <p className="text-gray-400 mt-1">Share knowledge, ask questions, and connect with fellow VFX artists</p>
            </div>
            <CreatePostModal onCreatePost={handleCreatePost} />
          </div>

          {/* Filters */}
          <div className="space-y-4">
            <PostCategories 
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
            />
            
            {(hashtagFilter || selectedCategory !== 'all') && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">Active filters:</span>
                {hashtagFilter && (
                  <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-sm">
                    #{hashtagFilter}
                  </span>
                )}
                {selectedCategory !== 'all' && (
                  <span className="bg-purple-500/20 text-purple-400 px-2 py-1 rounded text-sm">
                    {selectedCategory}
                  </span>
                )}
                <button 
                  onClick={clearFilters}
                  className="text-gray-400 hover:text-white text-sm underline"
                >
                  Clear filters
                </button>
              </div>
            )}
          </div>

          {/* Posts */}
          {filteredPosts.length === 0 ? (
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
                {posts.length === 0 && <CreatePostModal onCreatePost={handleCreatePost} />}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredPosts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onToggleLike={toggleLike}
                  onHashtagClick={handleHashtagClick}
                  onMentionClick={handleMentionClick}
                  onMessageUser={handleMessageUser}
                  currentUserId={currentUser.id}
                />
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <TrendingHashtags onHashtagClick={handleHashtagClick} />
          
          <Card className="bg-gray-900/80 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white text-sm">Community Guidelines</CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-gray-400 space-y-2">
              <p>• Be respectful and constructive</p>
              <p>• Use relevant hashtags (#vfx #3d #animation)</p>
              <p>• Share knowledge and help others</p>
              <p>• No spam or self-promotion only</p>
              <p>• Credit original work and sources</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Direct Messaging Modal */}
      {selectedProfile && (
        <DirectMessaging
          currentUserId={currentUser.id}
          recipientId={selectedProfile.id}
          recipientName={getDisplayName(selectedProfile)}
          recipientAvatar={selectedProfile.avatar_url}
          open={showMessaging}
          onOpenChange={setShowMessaging}
        />
      )}
    </>
  );
};

export default CommunityDiscussions;
