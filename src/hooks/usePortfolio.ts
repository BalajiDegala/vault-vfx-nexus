
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Database } from "@/integrations/supabase/types";
import logger from "@/lib/logger";

type PortfolioItem = Database["public"]["Tables"]["portfolio_items"]["Row"];

export const usePortfolio = (userId: string) => {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchPortfolioItems();
  }, [userId]);

  const fetchPortfolioItems = async () => {
    try {
      const { data, error } = await supabase
        .from("portfolio_items")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      logger.error("Error fetching portfolio:", error);
    } finally {
      setLoading(false);
    }
  };

  const uploadPortfolioItem = async (file: File, title: string, description: string, category: string, tags: string[]) => {
    try {
      setUploading(true);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${userId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('portfolio')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('portfolio')
        .getPublicUrl(filePath);

      const isImage = file.type.startsWith('image/');
      
      const { error: insertError } = await supabase
        .from('portfolio_items')
        .insert({
          user_id: userId,
          title,
          description,
          category,
          tags,
          image_url: isImage ? data.publicUrl : null,
          file_url: data.publicUrl
        });

      if (insertError) throw insertError;

      toast({
        title: "Success",
        description: "Portfolio item added successfully"
      });

      fetchPortfolioItems();
    } catch (error: any) {
      logger.error('Error uploading portfolio item:', error);
      toast({
        title: "Error",
        description: "Failed to upload portfolio item",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const deletePortfolioItem = async (itemId: string, fileUrl: string) => {
    try {
      // Extract file path from URL
      const filePath = fileUrl.split('/').slice(-2).join('/');
      
      await supabase.storage
        .from('portfolio')
        .remove([filePath]);

      const { error } = await supabase
        .from('portfolio_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Portfolio item deleted successfully"
      });

      fetchPortfolioItems();
    } catch (error) {
      logger.error('Error deleting portfolio item:', error);
      toast({
        title: "Error",
        description: "Failed to delete portfolio item",
        variant: "destructive"
      });
    }
  };

  return { items, loading, uploading, uploadPortfolioItem, deletePortfolioItem, refreshItems: fetchPortfolioItems };
};
