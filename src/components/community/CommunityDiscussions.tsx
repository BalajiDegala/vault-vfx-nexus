
import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, TrendingUp } from 'lucide-react';
import { useCommunityPosts } from '@/hooks/useCommunityPosts';
import CreatePostModal from './CreatePostModal';
import PostCard from './PostCard';

interface CommunityDiscussionsProps {
  currentUser: User;
}

const CommunityDiscussions = ({ currentUser }: CommunityDiscussionsProps) => {
  const { posts, loading, createPost, toggleLike } = useCommunityPosts();

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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Users className="h-6 w-6" />
            Community Discussions
          </h2>
          <p className="text-gray-400 mt-1">Share knowledge, ask questions, and connect with fellow VFX artists</p>
        </div>
        <CreatePostModal onCreatePost={createPost} />
      </div>

      {posts.length === 0 ? (
        <Card className="bg-gray-900/80 border-blue-500/20">
          <CardContent className="text-center py-12">
            <Users className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold text-white mb-2">Start the Conversation</h3>
            <p className="text-gray-400 mb-6">
              Be the first to share your thoughts, ask questions, or discuss VFX techniques with the community.
            </p>
            <CreatePostModal onCreatePost={createPost} />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onToggleLike={toggleLike}
              currentUserId={currentUser.id}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CommunityDiscussions;
