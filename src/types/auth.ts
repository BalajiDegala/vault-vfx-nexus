
import { Database } from "@/integrations/supabase/types";

export type AppRole = Database["public"]["Enums"]["app_role"];

export interface RoleOption {
  id: AppRole;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}
