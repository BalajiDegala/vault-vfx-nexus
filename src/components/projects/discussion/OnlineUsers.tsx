
import { Users } from "lucide-react";

interface OnlineUsersProps {
  onlineUsers: string[];
}

const OnlineUsers: React.FC<OnlineUsersProps> = ({ onlineUsers }) => (
  <div className="flex items-center gap-2 p-3 bg-gray-800/30 rounded-lg">
    <Users className="h-4 w-4 text-gray-400" />
    <span className="text-sm text-gray-400">Online now:</span>
    <div className="flex gap-2">
      {onlineUsers.map(user => (
        <div key={user} className="flex items-center gap-1">
          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
          <span className="text-sm text-gray-300">{user}</span>
        </div>
      ))}
    </div>
  </div>
);

export default OnlineUsers;
