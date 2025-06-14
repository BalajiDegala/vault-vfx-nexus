
import { Fragment } from 'react';
import UserHoverCard from './UserHoverCard';

interface EnhancedPostContentParserProps {
  content: string;
  onHashtagClick?: (hashtag: string) => void;
  onMentionClick?: (mention: string) => void;
  currentUserId?: string;
  onMessageUser?: (profile: any) => void;
}

const EnhancedPostContentParser = ({ 
  content, 
  onHashtagClick, 
  onMentionClick,
  currentUserId,
  onMessageUser
}: EnhancedPostContentParserProps) => {
  const parseContent = (text: string) => {
    // Regex patterns for hashtags and mentions
    const hashtagRegex = /#(\w+)/g;
    const mentionRegex = /@(\w+)/g;
    
    const parts: Array<{ type: 'text' | 'hashtag' | 'mention'; content: string; match?: string }> = [];
    let lastIndex = 0;
    const allMatches: Array<{ type: 'hashtag' | 'mention'; index: number; length: number; match: string; content: string }> = [];
    
    // Find all hashtag matches
    let hashtagMatch;
    while ((hashtagMatch = hashtagRegex.exec(text)) !== null) {
      allMatches.push({
        type: 'hashtag',
        index: hashtagMatch.index,
        length: hashtagMatch[0].length,
        match: hashtagMatch[1],
        content: hashtagMatch[0]
      });
    }
    
    // Find all mention matches
    let mentionMatch;
    while ((mentionMatch = mentionRegex.exec(text)) !== null) {
      allMatches.push({
        type: 'mention',
        index: mentionMatch.index,
        length: mentionMatch[0].length,
        match: mentionMatch[1],
        content: mentionMatch[0]
      });
    }
    
    // Sort matches by index
    allMatches.sort((a, b) => a.index - b.index);
    
    // Build parts array
    allMatches.forEach((match) => {
      // Add text before the match
      if (match.index > lastIndex) {
        parts.push({
          type: 'text',
          content: text.slice(lastIndex, match.index)
        });
      }
      
      // Add the match
      parts.push({
        type: match.type,
        content: match.content,
        match: match.match
      });
      
      lastIndex = match.index + match.length;
    });
    
    // Add remaining text
    if (lastIndex < text.length) {
      parts.push({
        type: 'text',
        content: text.slice(lastIndex)
      });
    }
    
    return parts;
  };

  const parts = parseContent(content);

  return (
    <div className="text-gray-200 whitespace-pre-wrap">
      {parts.map((part, index) => {
        if (part.type === 'hashtag') {
          return (
            <button
              key={index}
              onClick={() => onHashtagClick?.(part.match!)}
              className="text-blue-400 hover:text-blue-300 hover:underline cursor-pointer"
            >
              {part.content}
            </button>
          );
        } else if (part.type === 'mention') {
          return (
            <UserHoverCard
              key={index}
              username={part.match!}
              currentUserId={currentUserId}
              onMessageUser={onMessageUser}
            >
              <button
                onClick={() => onMentionClick?.(part.match!)}
                className="text-purple-400 hover:text-purple-300 hover:underline cursor-pointer"
              >
                {part.content}
              </button>
            </UserHoverCard>
          );
        } else {
          return <Fragment key={index}>{part.content}</Fragment>;
        }
      })}
    </div>
  );
};

export default EnhancedPostContentParser;
