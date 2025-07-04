
export interface CommunityPost {
  id: string;
  author_id: string;
  content: string;
  category?: string;
  likes_count: number;
  comments_count: number;
  bookmarks_count: number;
  created_at: string;
  updated_at?: string; 
  trending: boolean;
  attachments?: UploadedFile[];
  author_profile: {
    first_name: string;
    last_name: string;
    avatar_url: string;
  };
  mentioned_users?: string[];
  is_bookmarked?: boolean;
  is_liked?: boolean;
}

export interface Comment {
  id: string;
  post_id: string;
  author_id: string;
  content: string;
  created_at: string;
  author_profile: {
    first_name: string;
    last_name: string;
    avatar_url: string;
  };
}

export interface UploadedFile {
  name: string;
  url: string;
  type: string;
  size: number;
  fileId?: string; // Made optional for backwards compatibility, but should always be present for local storage files
}
