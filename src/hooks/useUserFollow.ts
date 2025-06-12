
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useUserFollow = (currentUserId: string | null, targetUserId: string) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (currentUserId && targetUserId && currentUserId !== targetUserId) {
      checkFollowStatus();
    }
  }, [currentUserId, targetUserId]);

  const checkFollowStatus = async () => {
    if (!currentUserId) return;
    
    try {
      const { data } = await supabase
        .from("user_follows")
        .select("id")
        .eq("follower_id", currentUserId)
        .eq("following_id", targetUserId)
        .single();

      setIsFollowing(!!data);
    } catch (error) {
      // No follow relationship found
      setIsFollowing(false);
    }
  };

  const toggleFollow = async () => {
    if (!currentUserId || currentUserId === targetUserId) return;

    setLoading(true);
    try {
      if (isFollowing) {
        const { error } = await supabase
          .from("user_follows")
          .delete()
          .eq("follower_id", currentUserId)
          .eq("following_id", targetUserId);

        if (error) throw error;
        setIsFollowing(false);
        
        toast({
          title: "Unfollowed",
          description: "You are no longer following this user"
        });
      } else {
        const { error } = await supabase
          .from("user_follows")
          .insert({
            follower_id: currentUserId,
            following_id: targetUserId
          });

        if (error) throw error;
        setIsFollowing(true);
        
        toast({
          title: "Following",
          description: "You are now following this user"
        });
      }
    } catch (error: any) {
      console.error('Error toggling follow:', error);
      toast({
        title: "Error",
        description: "Failed to update follow status",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return { isFollowing, loading, toggleFollow };
};
