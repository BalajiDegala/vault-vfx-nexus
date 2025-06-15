
interface DiscussionAnalyticsProps {
  messageCount: number;
  pinnedCount: number;
  likedCount: number;
  onlineCount: number;
}

const DiscussionAnalytics: React.FC<DiscussionAnalyticsProps> = ({
  messageCount, pinnedCount, likedCount, onlineCount
}) => (
  <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700">
    <h4 className="text-white font-medium mb-4">Discussion Analytics</h4>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
      <div className="space-y-1">
        <p className="text-2xl font-bold text-blue-400">{messageCount}</p>
        <p className="text-gray-400 text-xs">Messages</p>
      </div>
      <div className="space-y-1">
        <p className="text-2xl font-bold text-yellow-400">{pinnedCount}</p>
        <p className="text-gray-400 text-xs">Pinned</p>
      </div>
      <div className="space-y-1">
        <p className="text-2xl font-bold text-red-400">{likedCount}</p>
        <p className="text-gray-400 text-xs">Reactions</p>
      </div>
      <div className="space-y-1">
        <p className="text-2xl font-bold text-green-400">{onlineCount}</p>
        <p className="text-gray-400 text-xs">Online</p>
      </div>
    </div>
  </div>
);

export default DiscussionAnalytics;
