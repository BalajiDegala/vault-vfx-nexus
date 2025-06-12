
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Loader2 } from "lucide-react";
import { useAvatarUpload } from "@/hooks/useAvatarUpload";

interface AvatarUploadProps {
  userId: string;
  currentAvatarUrl?: string | null;
  initials: string;
  onAvatarUpdate: (newUrl: string) => void;
}

const AvatarUpload = ({ userId, currentAvatarUrl, initials, onAvatarUpdate }: AvatarUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadAvatar, uploading } = useAvatarUpload();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    try {
      const newUrl = await uploadAvatar(file, userId);
      onAvatarUpdate(newUrl);
    } catch (error) {
      // Error is handled in the hook
    }
  };

  return (
    <div className="relative">
      <Avatar className="h-32 w-32 border-4 border-blue-500/30">
        <AvatarImage src={currentAvatarUrl || ""} />
        <AvatarFallback className="text-2xl bg-gradient-to-br from-blue-500 to-purple-600">
          {initials}
        </AvatarFallback>
      </Avatar>
      
      <Button 
        size="sm" 
        className="absolute -bottom-2 -right-2 rounded-full p-2"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
      >
        {uploading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Camera className="h-4 w-4" />
        )}
      </Button>
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
};

export default AvatarUpload;
