import { useState } from 'react';
import { User } from '@supabase/supabase-js';
import { Users } from 'lucide-react';
import { useCommunityPosts } from '@/hooks/useCommunityPosts';
import DirectMessaging from '@/components/messaging/DirectMessaging';
import EditPostModal from './EditPostModal';
import DeleteConfirmationDialog from './DeleteConfirmationDialog';
import { CommunityPost, UploadedFile } from '@/types/community';

import CommunityHeader from './CommunityHeader';
import CommunityFilters from './CommunityFilters';
import CommunityPostList from './CommunityPostList';
import CommunitySidebar from './CommunitySidebar';

interface CommunityDiscussionsProps {
  currentUser: User;
}

const CommunityDiscussions = ({ currentUser }: CommunityDiscussionsProps) => {
  const { 
    posts, 
    loading, 
    createPost, 
    toggleLike, 
    editPost, 
    deletePost, 
    toggleBookmark
  } = useCommunityPosts();
  
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [hashtagFilter, setHashtagFilter] = useState<string | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<any>(null);
  const [showMessaging, setShowMessaging] = useState(false);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [postToEdit, setPostToEdit] = useState<CommunityPost | null>(null);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [postIdToDelete, setPostIdToDelete] = useState<string | null>(null);
  const [attachmentsToDelete, setAttachmentsToDelete] = useState<UploadedFile[] | undefined>(undefined);

  const filteredPosts = posts.filter(post => {
    const categoryMatch = selectedCategory === 'all' || post.category === selectedCategory;
    const hashtagMatch = !hashtagFilter || post.content.toLowerCase().includes(`#${hashtagFilter.toLowerCase()}`);
    return categoryMatch && hashtagMatch;
  });

  const handleCreatePost = async (content: string, category?: string, attachments?: UploadedFile[]) => {
    return await createPost(content, category, attachments);
  };

  const handleHashtagClick = (hashtag: string) => {
    setHashtagFilter(hashtag);
    setSelectedCategory('all'); // Reset category when a hashtag is clicked
  };

  const handleMentionClick = (mention: string) => {
    // Placeholder for mention click functionality if needed in the future
    console.log('Clicked mention:', mention);
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

  const handleEditPostRequest = (post: CommunityPost) => {
    setPostToEdit(post);
    setIsEditModalOpen(true);
  };

  const handleSaveEditedPost = async (
    postId: string,
    content: string,
    category: string,
    newAttachments: UploadedFile[],
    oldAttachments: UploadedFile[]
  ) => {
    const success = await editPost(postId, content, category, newAttachments, oldAttachments);
    if (success) {
      setIsEditModalOpen(false);
      setPostToEdit(null);
    }
    return success;
  };

  const handleDeletePostRequest = (postId: string, attachments: UploadedFile[] | undefined) => {
    setPostIdToDelete(postId);
    setAttachmentsToDelete(attachments);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeletePost = async () => {
    if (postIdToDelete) {
      const success = await deletePost(postIdToDelete, attachmentsToDelete);
      if (success) {
        setIsDeleteDialogOpen(false);
        setPostIdToDelete(null);
        setAttachmentsToDelete(undefined);
      }
    }
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
          <CommunityHeader 
            onCreatePost={handleCreatePost} 
            currentUserId={currentUser.id} 
          />
          
          <CommunityFilters
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            hashtagFilter={hashtagFilter}
            onClearFilters={clearFilters}
          />

          <CommunityPostList
            posts={posts}
            filteredPosts={filteredPosts}
            currentUser={currentUser}
            onCreatePost={handleCreatePost} // For the "Start the Conversation" button if no posts
            onToggleLike={toggleLike}
            onToggleBookmark={toggleBookmark}
            onHashtagClick={handleHashtagClick}
            onMentionClick={handleMentionClick}
            onMessageUser={handleMessageUser}
            onEditPost={handleEditPostRequest}
            onDeletePost={handleDeletePostRequest}
          />
        </div>

        {/* Sidebar */}
        <CommunitySidebar onHashtagClick={handleHashtagClick} />
      </div>

      {/* Modals and Dialogs */}
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

      <EditPostModal
        isOpen={isEditModalOpen}
        onClose={() => { setIsEditModalOpen(false); setPostToEdit(null); }}
        postToEdit={postToEdit}
        onSave={handleSaveEditedPost}
        currentUserId={currentUser.id}
      />

      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => { setIsDeleteDialogOpen(false); setPostIdToDelete(null); setAttachmentsToDelete(undefined); }}
        onConfirm={confirmDeletePost}
        itemName="this post"
      />
    </>
  );
};

export default CommunityDiscussions;
