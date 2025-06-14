import { useState } from 'react';
import { User } from '@supabase/supabase-js';
import { Users } from 'lucide-react';
import { useCommunityPosts } from '@/hooks/useCommunityPosts';
import { useCommunityModals } from '@/hooks/useCommunityModals'; // Import the new hook
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

  const {
    isEditModalOpen,
    postToEdit,
    isDeleteDialogOpen,
    postIdToDelete,
    attachmentsToDelete,
    showMessaging,
    selectedProfile,
    openEditModal,
    closeEditModal,
    openDeleteDialog,
    closeDeleteDialog,
    openMessagingModal,
    closeMessagingModal,
  } = useCommunityModals();
  
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [hashtagFilter, setHashtagFilter] = useState<string | null>(null);
  // selectedProfile and showMessaging are now managed by useCommunityModals
  // isEditModalOpen, postToEdit, isDeleteDialogOpen, postIdToDelete, attachmentsToDelete are now managed by useCommunityModals

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

  // handleMessageUser is now openMessagingModal from the hook
  // const handleMessageUser = (profile: any) => {
  //   setSelectedProfile(profile);
  //   setShowMessaging(true);
  // };

  const clearFilters = () => {
    setHashtagFilter(null);
    setSelectedCategory('all');
  };
  
  const getDisplayName = (profile: any) => {
    if (!profile) return 'Unknown User'; // Guard against null profile
    if (profile.first_name || profile.last_name) {
      return `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
    }
    return profile.username || 'Unknown User';
  };

  // handleEditPostRequest is now openEditModal from the hook
  // const handleEditPostRequest = (post: CommunityPost) => {
  //   setPostToEdit(post);
  //   setIsEditModalOpen(true);
  // };

  const handleSaveEditedPost = async (
    postId: string,
    content: string,
    category: string,
    newAttachments: UploadedFile[],
    oldAttachments: UploadedFile[]
  ) => {
    const success = await editPost(postId, content, category, newAttachments, oldAttachments);
    if (success) {
      closeEditModal(); // Use hook's close function
    }
    return success;
  };

  // handleDeletePostRequest is now openDeleteDialog from the hook
  // const handleDeletePostRequest = (postId: string, attachments: UploadedFile[] | undefined) => {
  //   setPostIdToDelete(postId);
  //   setAttachmentsToDelete(attachments);
  //   setIsDeleteDialogOpen(true);
  // };

  const confirmDeletePost = async () => {
    if (postIdToDelete) { // postIdToDelete is from the hook
      const success = await deletePost(postIdToDelete, attachmentsToDelete); // attachmentsToDelete is from the hook
      if (success) {
        closeDeleteDialog(); // Use hook's close function
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
            onCreatePost={handleCreatePost}
            onToggleLike={toggleLike}
            onToggleBookmark={toggleBookmark}
            onHashtagClick={handleHashtagClick}
            onMentionClick={handleMentionClick}
            onMessageUser={openMessagingModal} // Use hook's function
            onEditPost={openEditModal} // Use hook's function
            onDeletePost={openDeleteDialog} // Use hook's function
          />
        </div>

        {/* Sidebar */}
        <CommunitySidebar onHashtagClick={handleHashtagClick} />
      </div>

      {/* Modals and Dialogs */}
      {selectedProfile && ( // selectedProfile is from the hook
        <DirectMessaging
          currentUserId={currentUser.id}
          recipientId={selectedProfile.id}
          recipientName={getDisplayName(selectedProfile)}
          recipientAvatar={selectedProfile.avatar_url}
          open={showMessaging} // showMessaging is from the hook
          onOpenChange={(newOpen: boolean) => {
            if (newOpen) {
              // This path implies something tried to open it.
              // If selectedProfile is already set, this is fine.
              // We will use `openMessagingModal` if profile exists.
              if (selectedProfile) openMessagingModal(selectedProfile);
            } else {
              closeMessagingModal();
            }
          }}
        />
      )}

      <EditPostModal
        isOpen={isEditModalOpen} // from hook
        onClose={closeEditModal} // from hook
        postToEdit={postToEdit} // from hook
        onSave={handleSaveEditedPost}
        currentUserId={currentUser.id}
      />

      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen} // from hook
        onClose={closeDeleteDialog} // from hook
        onConfirm={confirmDeletePost}
        itemName="this post"
      />
    </>
  );
};

export default CommunityDiscussions;
