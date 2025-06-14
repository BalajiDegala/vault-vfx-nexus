import { useCreateCommunityPost } from './mutations/useCreateCommunityPost';
import { useEditCommunityPost } from './mutations/useEditCommunityPost';
import { useDeleteCommunityPost } from './mutations/useDeleteCommunityPost';

// The UploadedFile type might not be needed here anymore if it's only used within the individual mutation hooks.
// However, if the parameters of createPost, editPost, deletePost are exposed directly
// from this hook and they use UploadedFile, it might still be needed, or the individual
// hook function types should be imported/re-exported.
// For now, let's assume the function signatures exposed by this hook remain the same.
// import { UploadedFile } from '@/types/community'; 

export const useCommunityPostMutations = (refreshPosts: () => Promise<void>) => {
  const { createPost } = useCreateCommunityPost(refreshPosts);
  const { editPost } = useEditCommunityPost(refreshPosts);
  const { deletePost } = useDeleteCommunityPost(refreshPosts);

  return {
    createPost,
    editPost,
    deletePost,
  };
};
