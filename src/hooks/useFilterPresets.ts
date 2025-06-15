
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AdvancedFilters, SavedFilterPreset } from "@/types/advancedFilters";

export const useFilterPresets = () => {
  const [savedPresets, setSavedPresets] = useState<SavedFilterPreset[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadSavedPresets();
  }, []);

  const loadSavedPresets = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("filter_presets")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSavedPresets((data as unknown as SavedFilterPreset[]) || []);
    } catch (error) {
      console.error("Error loading filter presets:", error);
    }
  };

  const saveFilterPreset = async (name: string, filters: AdvancedFilters) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { error } = await supabase
        .from("filter_presets")
        .insert({
          name,
          filters,
          user_id: user.id,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Filter preset saved successfully",
      });

      loadSavedPresets();
    } catch (error) {
      console.error("Error saving filter preset:", error);
      toast({
        title: "Error",
        description: "Failed to save filter preset",
        variant: "destructive",
      });
    }
  };

  const loadFilterPreset = (preset: SavedFilterPreset) => {
    toast({
      title: "Preset Loaded",
      description: `Applied filter preset: ${preset.name}`,
    });
    return preset.filters;
  };

  const deleteFilterPreset = async (presetId: string) => {
    try {
      const { error } = await supabase
        .from("filter_presets")
        .delete()
        .eq("id", presetId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Filter preset deleted successfully",
      });

      loadSavedPresets();
    } catch (error) {
      console.error("Error deleting filter preset:", error);
      toast({
        title: "Error",
        description: "Failed to delete filter preset",
        variant: "destructive",
      });
    }
  };

  return {
    savedPresets,
    saveFilterPreset,
    loadFilterPreset,
    deleteFilterPreset,
  };
};
