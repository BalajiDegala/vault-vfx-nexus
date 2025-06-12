
import { useState } from "react";
import { useForm } from "react-hook-form";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { X, Upload, Loader2 } from "lucide-react";
import { usePortfolio } from "@/hooks/usePortfolio";

interface PortfolioUploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  onSuccess: () => void;
}

interface FormData {
  title: string;
  description: string;
  category: string;
  file: FileList;
}

const categories = ["3D Animation", "VFX", "Motion Graphics", "Concept Art", "Modeling", "Texturing", "General"];

const PortfolioUploadModal = ({ open, onOpenChange, userId, onSuccess }: PortfolioUploadModalProps) => {
  const { uploadPortfolioItem, uploading } = usePortfolio(userId);
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>();

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const onSubmit = async (data: FormData) => {
    const file = data.file[0];
    if (!file) return;

    try {
      await uploadPortfolioItem(file, data.title, data.description, data.category, tags);
      reset();
      setTags([]);
      onSuccess();
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleClose = () => {
    reset();
    setTags([]);
    setNewTag("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl bg-gray-900 border-gray-600">
        <DialogHeader>
          <DialogTitle className="text-white">Add Portfolio Item</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <Label htmlFor="title" className="text-gray-300">Title *</Label>
            <Input
              id="title"
              {...register("title", { required: "Title is required" })}
              className="bg-gray-800/50 border-gray-600 text-white"
              placeholder="Enter portfolio item title"
            />
            {errors.title && (
              <p className="text-red-400 text-sm mt-1">{errors.title.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="description" className="text-gray-300">Description</Label>
            <Textarea
              id="description"
              {...register("description")}
              className="bg-gray-800/50 border-gray-600 text-white"
              placeholder="Describe your work..."
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="category" className="text-gray-300">Category *</Label>
            <select
              {...register("category", { required: "Category is required" })}
              className="w-full p-2 bg-gray-800/50 border border-gray-600 rounded-md text-white"
            >
              <option value="">Select a category</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            {errors.category && (
              <p className="text-red-400 text-sm mt-1">{errors.category.message}</p>
            )}
          </div>

          <div>
            <Label className="text-gray-300">Tags</Label>
            <div className="flex gap-2 mb-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add a tag"
                className="bg-gray-800/50 border-gray-600 text-white"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              />
              <Button type="button" onClick={addTag} variant="outline">
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {tags.map(tag => (
                <Badge key={tag} variant="outline" className="border-blue-500/30 text-blue-400">
                  {tag}
                  <X 
                    className="h-3 w-3 ml-1 cursor-pointer" 
                    onClick={() => removeTag(tag)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="file" className="text-gray-300">File *</Label>
            <Input
              id="file"
              type="file"
              {...register("file", { required: "File is required" })}
              className="bg-gray-800/50 border-gray-600 text-white"
              accept="image/*,video/*,.pdf,.zip,.rar"
            />
            {errors.file && (
              <p className="text-red-400 text-sm mt-1">{errors.file.message}</p>
            )}
            <p className="text-gray-400 text-sm mt-1">
              Supported formats: Images, Videos, PDF, ZIP, RAR (Max 50MB)
            </p>
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={uploading}>
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PortfolioUploadModal;
