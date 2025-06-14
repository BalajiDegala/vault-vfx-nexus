
import { supabase } from "@/integrations/supabase/client";
import { AppRole } from "@/types/auth";

export const checkProfileExists = async (userId: string, maxAttempts = 10): Promise<boolean> => {
  for (let i = 0; i < maxAttempts; i++) {
    console.log(`Checking for profile (attempt ${i + 1})...`);
    
    const { data, error } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", userId)
      .single();

    if (!error && data) {
      console.log("Profile found!");
      return true;
    }
    
    // Wait 1 second before next attempt
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log("Profile not found after waiting");
  return false;
};

export const createProfileDirectly = async (
  userId: string, 
  email: string, 
  firstName: string, 
  lastName: string, 
  username: string
): Promise<boolean> => {
  console.log("Creating profile directly...");
  
  const { error } = await supabase
    .from("profiles")
    .insert({
      id: userId,
      email,
      first_name: firstName,
      last_name: lastName,
      username,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

  if (error) {
    console.error("Direct profile creation error:", error);
    return false;
  }

  console.log("Profile created directly!");
  return true;
};

export const assignRole = async (userId: string, role: AppRole): Promise<boolean> => {
  console.log(`Assigning role ${role} to user ${userId}`);
  
  const { error } = await supabase
    .from("user_roles")
    .insert({
      user_id: userId,
      role
    });

  if (error) {
    console.error("Role assignment error:", error);
    return false;
  }

  console.log("Role assigned successfully!");
  return true;
};

export const validateSignupForm = (
  email: string,
  password: string,
  confirmPassword: string
): { isValid: boolean; error?: string } => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(email)) {
    return { isValid: false, error: "Please enter a valid email address." };
  }

  if (password !== confirmPassword) {
    return { isValid: false, error: "Passwords do not match." };
  }

  if (password.length < 6) {
    return { isValid: false, error: "Password must be at least 6 characters long." };
  }

  return { isValid: true };
};
