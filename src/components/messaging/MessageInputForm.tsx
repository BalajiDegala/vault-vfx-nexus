
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";

interface MessageInputFormProps {
  newMessage: string;
  onNewMessageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  inputRef: React.RefObject<HTMLInputElement>;
  recipientName: string;
  isSendingDisabled: boolean;
}

const MessageInputForm: React.FC<MessageInputFormProps> = ({
  newMessage,
  onNewMessageChange,
  onSubmit,
  inputRef,
  recipientName,
  isSendingDisabled,
}) => {
  return (
    <form onSubmit={onSubmit} className="p-4 border-t border-gray-700 flex-shrink-0">
      <div className="flex gap-2">
        <Input
          ref={inputRef}
          value={newMessage}
          onChange={onNewMessageChange}
          placeholder={`Message ${recipientName}...`}
          className="bg-gray-800 border-gray-600 text-white rounded-full px-4"
          maxLength={1000}
        />
        <Button 
          type="submit" 
          size="sm" 
          disabled={isSendingDisabled}
          className="rounded-full px-3 bg-blue-600 hover:bg-blue-700"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </form>
  );
};

export default MessageInputForm;
