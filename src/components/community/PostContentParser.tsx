
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface PostContentParserProps {
  content: string;
  onHashtagClick?: (hashtag: string) => void;
  onMentionClick?: (mention: string) => void;
}

const PostContentParser = ({ content, onHashtagClick, onMentionClick }: PostContentParserProps) => {
  const parseContent = (text: string) => {
    const parts = text.split(/(\s+)/);
    
    return parts.map((part, index) => {
      // Handle hashtags
      if (part.startsWith('#') && part.length > 1) {
        const hashtag = part.substring(1);
        return (
          <Badge 
            key={index}
            variant="secondary"
            className="bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 cursor-pointer mx-1"
            onClick={() => onHashtagClick?.(hashtag)}
          >
            #{hashtag}
          </Badge>
        );
      }
      
      // Handle mentions
      if (part.startsWith('@') && part.length > 1) {
        const mention = part.substring(1);
        return (
          <span
            key={index}
            className="text-blue-400 hover:text-blue-300 cursor-pointer font-medium"
            onClick={() => onMentionClick?.(mention)}
          >
            @{mention}
          </span>
        );
      }
      
      return <span key={index}>{part}</span>;
    });
  };

  return <div className="whitespace-pre-wrap">{parseContent(content)}</div>;
};

export default PostContentParser;
