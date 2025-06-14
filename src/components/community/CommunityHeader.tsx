
import { Users } from 'lucide-react';
import CreatePostModal from './CreatePostModal';
import { UploadedFile } from '@/types/community';

interface CommunityHeaderProps {
  onCreatePost: (content: string, category?: string, attachments?: UploadedFile[]) => Promise<boolean | undefined>;
  currentUserId: string;
}

const CommunityHeader = ({ onCreatePost, currentUserId }: CommunityHeaderProps) => {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Users className="h-6 w-6" />
          Community Discussions
        </h2>
        <p className="text-gray-400 mt-1">Share knowledge, ask questions, and connect with fellow VFX artists</p>
      </div>
      <CreatePostModal onCreatePost={onCreatePost} currentUserId={currentUserId} />
    </div>
  );
};

export default CommunityHeader;
