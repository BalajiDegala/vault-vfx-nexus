
import { Button } from "@/components/ui/button";
import { Zap } from "lucide-react";

const quickReplies = ['Thanks!', 'Looks good!', 'Need revision', 'Approved', 'Working on it', 'Almost done'];

interface QuickRepliesProps {
  onQuickReply: (reply: string) => void;
}

const QuickReplies: React.FC<QuickRepliesProps> = ({ onQuickReply }) => (
  <div className="flex flex-wrap gap-2">
    {quickReplies.map(reply => (
      <Button
        key={reply}
        variant="outline"
        size="sm"
        onClick={() => onQuickReply(reply)}
        className="h-8 text-xs border-gray-600 text-gray-300 hover:bg-gray-700"
      >
        <Zap className="h-3 w-3 mr-1" />
        {reply}
      </Button>
    ))}
  </div>
);

export default QuickReplies;
