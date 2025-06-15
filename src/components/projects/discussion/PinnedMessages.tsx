
import { Pin } from "lucide-react";
import { ProjectMessage } from "@/hooks/useProjectMessages";
import { formatTimeAgo } from "@/utils/discussionUtils";
import { parseMessageContent } from "@/utils/discussionUtils";

interface PinnedMessagesProps {
  messages: ProjectMessage[];
  pinnedMessageIds: string[];
}

const PinnedMessages: React.FC<PinnedMessagesProps> = ({ messages, pinnedMessageIds }) => {
  if (pinnedMessageIds.length === 0) return null;

  const pinnedMessages = messages
    .filter(msg => pinnedMessageIds.includes(msg.id))
    .slice(0, 3);

  return (
    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
      <h4 className="text-yellow-300 font-medium mb-3 flex items-center gap-2">
        <Pin className="h-4 w-4" />
        Pinned Messages ({pinnedMessageIds.length})
      </h4>
      <div className="space-y-2">
        {pinnedMessages.map(msg => (
          <div key={msg.id} className="text-sm text-gray-300 bg-gray-800/50 rounded p-3 border-l-2 border-yellow-400">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-yellow-300">
                {msg.profiles?.first_name} {msg.profiles?.last_name}
              </span>
              <span className="text-xs text-gray-500">
                {formatTimeAgo(msg.created_at)}
              </span>
            </div>
            <p>{parseMessageContent(msg.content).content}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PinnedMessages;
