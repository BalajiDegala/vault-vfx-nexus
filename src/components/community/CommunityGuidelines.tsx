
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const CommunityGuidelines = () => {
  return (
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
  );
};

export default CommunityGuidelines;
