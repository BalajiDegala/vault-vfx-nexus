
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const POST_CATEGORIES = [
  { id: 'all', label: 'All Posts', color: 'bg-gray-500' },
  { id: 'techniques', label: 'Techniques', color: 'bg-purple-500' },
  { id: 'feedback', label: 'Feedback', color: 'bg-green-500' },
  { id: 'showcase', label: 'Showcase', color: 'bg-orange-500' },
  { id: 'tutorials', label: 'Tutorials', color: 'bg-blue-500' },
  { id: 'jobs', label: 'Jobs', color: 'bg-red-500' },
  { id: 'general', label: 'General', color: 'bg-gray-400' }
];

interface PostCategoriesProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

const PostCategories = ({ selectedCategory, onCategoryChange }: PostCategoriesProps) => {
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {POST_CATEGORIES.map((category) => (
        <Badge
          key={category.id}
          variant={selectedCategory === category.id ? "default" : "outline"}
          className={`cursor-pointer transition-colors ${
            selectedCategory === category.id 
              ? `${category.color} text-white` 
              : 'border-gray-600 text-gray-300 hover:bg-gray-700'
          }`}
          onClick={() => onCategoryChange(category.id)}
        >
          {category.label}
        </Badge>
      ))}
    </div>
  );
};

export default PostCategories;
