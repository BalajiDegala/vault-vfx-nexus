
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { AtSign, Paperclip, Send, Smile } from "lucide-react";

const emojis = ['😀', '😂', '❤️', '👍', '👎', '🔥', '💯', '🎉', '🚀', '💪', '🎨', '✨'];

interface MessageInputProps {
  newMessage: string;
  onNewMessageChange: (value: string) => void;
  onSendMessage: () => void;
  selectedEmoji: string;
  onEmojiSelect: (emoji: string) => void;
}

const MessageInput: React.FC<MessageInputProps> = ({
  newMessage,
  onNewMessageChange,
  onSendMessage,
  selectedEmoji,
  onEmojiSelect
}) => {
  const [mentionUser, setMentionUser] = useState("");

  const handleMention = () => {
    if (mentionUser.trim()) {
      onNewMessageChange(`${newMessage}@${mentionUser} `);
      setMentionUser("");
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Textarea
            placeholder="Type your message... Use @username for mentions, #hashtag for topics"
            value={newMessage}
            onChange={(e) => onNewMessageChange(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), onSendMessage())}
            className="flex-1 bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 resize-none min-h-[60px]"
            rows={2}
          />
          {selectedEmoji && <div className="absolute top-2 right-2 text-lg">{selectedEmoji}</div>}
        </div>
        
        <div className="flex flex-col gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="border-gray-600"><Smile className="h-4 w-4" /></Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 bg-gray-800 border-gray-600">
              <div className="grid grid-cols-6 gap-2">
                {emojis.map(emoji => (
                  <Button key={emoji} variant="ghost" size="sm" onClick={() => onEmojiSelect(emoji)} className="h-8 text-lg hover:bg-gray-700">{emoji}</Button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
          <Button variant="outline" size="sm" className="border-gray-600"><Paperclip className="h-4 w-4" /></Button>
          <Button size="sm" onClick={onSendMessage} disabled={!newMessage.trim()} className="bg-blue-600 hover:bg-blue-700"><Send className="h-4 w-4" /></Button>
        </div>
      </div>
      
      <div className="flex gap-2">
        <Input
          type="text"
          placeholder="@username to mention..."
          value={mentionUser}
          onChange={(e) => setMentionUser(e.target.value)}
          className="flex-1 bg-gray-800/50 border border-gray-600 text-white text-sm h-8"
        />
        <Button variant="outline" size="sm" onClick={handleMention} className="border-gray-600 h-8"><AtSign className="h-3 w-3 mr-1" /> Mention</Button>
      </div>
    </div>
  );
};

export default MessageInput;
