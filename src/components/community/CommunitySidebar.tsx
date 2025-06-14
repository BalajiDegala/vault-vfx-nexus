
import TrendingHashtags from './TrendingHashtags';
import CommunityGuidelines from './CommunityGuidelines';

interface CommunitySidebarProps {
  onHashtagClick: (hashtag: string) => void;
}

const CommunitySidebar = ({ onHashtagClick }: CommunitySidebarProps) => {
  return (
    <div className="space-y-6">
      <TrendingHashtags onHashtagClick={onHashtagClick} />
      <CommunityGuidelines />
    </div>
  );
};

export default CommunitySidebar;
