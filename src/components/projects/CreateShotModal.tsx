
import logger from "@/lib/logger";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2 } from "lucide-react";

interface CreateShotModalProps {
  isOpen: boolean;
  onClose: () => void;
  sequenceId: string;
  onSuccess: () => void;
}

interface ShotFormData {
  name: string;
  description?: string;
  frame_start: number;
  frame_end: number;
}

const CreateShotModal = ({ isOpen, onClose, sequenceId, onSuccess }: CreateShotModalProps) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<ShotFormData>({
    defaultValues: {
      name: "",
      description: "",
      frame_start: 1001,
      frame_end: 1100,
    },
  });

  const onSubmit = async (data: ShotFormData) => {
    if (!sequenceId) {
      console.error('No sequence ID provided');
      toast({
        title: "Error",
        description: "Sequence ID is missing",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    logger.log('🎬 Creating shot with data:', { ...data, sequenceId });

    try {
      // Get the user's current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Session error:', sessionError);
        throw sessionError;
      }

      if (!session?.user) {
        console.error('No authenticated user found');
        toast({
          title: "Authentication Error",
          description: "You must be logged in to create shots",
          variant: "destructive",
        });
        return;
      }

      logger.log('👤 User authenticated:', session.user.id);

      // Create the shot
      const shotData = {
        sequence_id: sequenceId,
        name: data.name.trim(),
        description: data.description?.trim() || null,
        frame_start: data.frame_start,
        frame_end: data.frame_end,
        status: 'pending' as const,
      };

      logger.log('📝 Inserting shot data:', shotData);

      const { data: newShot, error } = await supabase
        .from("shots")
        .insert(shotData)
        .select()
        .single();

      if (error) {
        console.error('❌ Error creating shot:', error);
        console.error('Error details:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
        });
        
        let errorMessage = "Failed to create shot";
        
        if (error.code === '42501') {
          errorMessage = "Permission denied. You don't have access to create shots in this sequence.";
        } else if (error.code === '23503') {
          errorMessage = "Invalid sequence reference. Please try refreshing the page.";
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
        return;
      }

      logger.log('✅ Shot created successfully:', newShot);
      
      toast({
        title: "Success",
        description: `Shot "${data.name}" created successfully`,
      });
      
      form.reset();
      onSuccess();
      onClose();
      
    } catch (error) {
      console.error('❌ Unexpected error creating shot:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle>Create New Shot</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              rules={{ 
                required: "Shot name is required",
                minLength: { value: 1, message: "Name cannot be empty" }
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Shot Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="e.g., SH010, SH020_hero_walk"
                      className="bg-gray-800 border-gray-600 text-white"
                      disabled={loading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="frame_start"
                rules={{ 
                  required: "Start frame is required",
                  min: { value: 1, message: "Start frame must be at least 1" }
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Frame</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        className="bg-gray-800 border-gray-600 text-white"
                        disabled={loading}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 1001)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="frame_end"
                rules={{ 
                  required: "End frame is required",
                  validate: (value, { frame_start }) => 
                    value > frame_start || "End frame must be greater than start frame"
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Frame</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        className="bg-gray-800 border-gray-600 text-white"
                        disabled={loading}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 1100)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Brief description of this shot..."
                      className="bg-gray-800 border-gray-600 text-white resize-none"
                      rows={3}
                      disabled={loading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={loading}
                className="border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Create Shot
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateShotModal;
