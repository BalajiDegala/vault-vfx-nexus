
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MoreVertical } from "lucide-react";
import { getInitials } from '@/utils/messagingUtils';

interface DirectMessagingHeaderProps {
  recipientName: string;
  recipientAvatar?: string;
  otherUserTyping: boolean;
}

const DirectMessagingHeader: React.FC<DirectMessagingHeaderProps> = ({
  recipientName,
  recipientAvatar,
  otherUserTyping,
}) => {
  return (
    <DialogHeader className="p-4 border-b border-gray-700 flex-shrink-0">
      <DialogTitle className="text-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={recipientAvatar} />
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm">
              {getInitials(recipientName)}
            </AvatarFallback>
          </Avatar>
          <div>
            <span className="font-semibold">{recipientName}</span>
            {otherUserTyping && (
              <div className="text-xs text-blue-400 animate-pulse">typing...</div>
            )}
          </div>
        </div>
        <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DialogTitle>
    </DialogHeader>
  );
};

export default DirectMessagingHeader;
