
import { Badge } from "@/components/ui/badge";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Users } from "lucide-react";

interface DiscussionHeaderProps {
  messageCount: number;
  onlineUserCount: number;
}

const DiscussionHeader: React.FC<DiscussionHeaderProps> = ({ messageCount, onlineUserCount }) => (
  <CardHeader>
    <CardTitle className="text-white flex items-center justify-between">
      <div className="flex items-center gap-2">
        <MessageSquare className="h-5 w-5" />
        Team Discussion
        <Badge variant="outline" className="text-xs">{messageCount} messages</Badge>
      </div>
      <div className="flex items-center gap-2">
        <Users className="h-4 w-4 text-green-400" />
        <span className="text-sm text-green-400">{onlineUserCount} online</span>
      </div>
    </CardTitle>
  </CardHeader>
);

export default DiscussionHeader;
