
export const formatTimeAgo = (timestamp: string): string => {
  if (!timestamp) return '';
  const now = new Date();
  const time = new Date(timestamp);
  const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));

  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
  return `${Math.floor(diffInMinutes / 1440)}d ago`;
};

export const getInitials = (firstName?: string, lastName?: string): string => {
  return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase() || 'U';
};

export const parseMessageContent = (content: string) => {
  const replyMatch = content.match(/^@reply:(\w+)\s(.+)/);
  if (replyMatch) {
    return {
      isReply: true,
      replyToId: replyMatch[1],
      content: replyMatch[2]
    };
  }

  return {
    isReply: false,
    content: content,
  };
};

export const processMessageContent = (content: string) => {
  const mentionRegex = /@(\w+)/g;
  const hashtagRegex = /#(\w+)/g;

  let processedContent = content
    .replace(mentionRegex, `<span class="bg-blue-500/20 text-blue-300 px-1 rounded">@$1</span>`)
    .replace(hashtagRegex, `<span class="bg-purple-500/20 text-purple-300 px-1 rounded">#$1</span>`);

  return processedContent;
};

