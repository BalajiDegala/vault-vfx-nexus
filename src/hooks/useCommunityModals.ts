
import { useState } from 'react';
import { CommunityPost, UploadedFile } from '@/types/community';

export interface ModalState {
  isEditModalOpen: boolean;
  postToEdit: CommunityPost | null;
  isDeleteDialogOpen: boolean;
  postIdToDelete: string | null;
  attachmentsToDelete: UploadedFile[] | undefined;
  showMessaging: boolean;
  selectedProfile: any | null; // Consider defining a Profile type if not already available globally
}

export interface ModalActions {
  openEditModal: (post: CommunityPost) => void;
  closeEditModal: () => void;
  openDeleteDialog: (postId: string, attachments: UploadedFile[] | undefined) => void;
  closeDeleteDialog: () => void;
  openMessagingModal: (profile: any) => void;
  closeMessagingModal: () => void;
}

export const useCommunityModals = (): ModalState & ModalActions => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [postToEdit, setPostToEdit] = useState<CommunityPost | null>(null);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [postIdToDelete, setPostIdToDelete] = useState<string | null>(null);
  const [attachmentsToDelete, setAttachmentsToDelete] = useState<UploadedFile[] | undefined>(undefined);

  const [showMessaging, setShowMessaging] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<any | null>(null);

  const openEditModal = (post: CommunityPost) => {
    setPostToEdit(post);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setPostToEdit(null);
  };

  const openDeleteDialog = (postId: string, attachments: UploadedFile[] | undefined) => {
    setPostIdToDelete(postId);
    setAttachmentsToDelete(attachments);
    setIsDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
    setPostIdToDelete(null);
    setAttachmentsToDelete(undefined);
  };

  const openMessagingModal = (profile: any) => {
    setSelectedProfile(profile);
    setShowMessaging(true);
  };

  const closeMessagingModal = () => {
    setShowMessaging(false);
    // It's good practice to clear the selected profile when closing the modal
    // However, DirectMessaging might handle this based on its 'open' prop.
    // If DirectMessaging doesn't clear it, uncommenting this is safer.
    // setSelectedProfile(null);
  };

  return {
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
  };
};

