
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

interface CreateSequenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  onSuccess: () => void;
}

interface SequenceFormData {
  name: string;
  description?: string;
}

const CreateSequenceModal = ({ isOpen, onClose, projectId, onSuccess }: CreateSequenceModalProps) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<SequenceFormData>({
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const onSubmit = async (data: SequenceFormData) => {
    if (!projectId) {
      logger.error('No project ID provided');
      toast({
        title: "Error",
        description: "Project ID is missing",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    logger.log('🎬 Creating sequence with data:', { ...data, projectId });

    try {
      // Get the user's current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        logger.error('Session error:', sessionError);
        throw sessionError;
      }

      if (!session?.user) {
        logger.error('No authenticated user found');
        toast({
          title: "Authentication Error",
          description: "You must be logged in to create sequences",
          variant: "destructive",
        });
        return;
      }

      logger.log('👤 User authenticated:', session.user.id);

      // Get max order for this project
      const { data: existingSequences, error: fetchError } = await supabase
        .from("sequences")
        .select("order_index")
        .eq("project_id", projectId)
        .order("order_index", { ascending: false })
        .limit(1);

      if (fetchError) {
        logger.error('Error fetching existing sequences:', fetchError);
        // Continue anyway with default order
      }

      const maxOrder = existingSequences?.[0]?.order_index || 0;
      const newOrder = maxOrder + 1;

      logger.log('📊 Sequence order:', { maxOrder, newOrder });

      // Create the sequence
      const sequenceData = {
        project_id: projectId,
        name: data.name.trim(),
        description: data.description?.trim() || null,
        order_index: newOrder,
        status: 'planning' as const,
      };

      logger.log('📝 Inserting sequence data:', sequenceData);

      const { data: newSequence, error } = await supabase
        .from("sequences")
        .insert(sequenceData)
        .select()
        .single();

      if (error) {
        logger.error('❌ Error creating sequence:', error);
        logger.error('Error details:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
        });
        
        let errorMessage = "Failed to create sequence";
        
        if (error.code === '42501') {
          errorMessage = "Permission denied. You don't have access to create sequences in this project.";
        } else if (error.code === '23503') {
          errorMessage = "Invalid project reference. Please try refreshing the page.";
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

      logger.log('✅ Sequence created successfully:', newSequence);
      
      toast({
        title: "Success",
        description: `Sequence "${data.name}" created successfully`,
      });
      
      form.reset();
      onSuccess();
      onClose();
      
    } catch (error) {
      logger.error('❌ Unexpected error creating sequence:', error);
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
          <DialogTitle>Create New Sequence</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              rules={{ 
                required: "Sequence name is required",
                minLength: { value: 1, message: "Name cannot be empty" }
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sequence Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="e.g., Act_01, Opening_Scene"
                      className="bg-gray-800 border-gray-600 text-white"
                      disabled={loading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Brief description of this sequence..."
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
                Create Sequence
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateSequenceModal;
