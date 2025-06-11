
import { useEffect } from 'react';
import { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

export const useTheme = (userRole: AppRole | null) => {
  useEffect(() => {
    if (!userRole) return;

    // Remove existing theme classes
    document.body.classList.remove('theme-artist', 'theme-studio', 'theme-producer', 'theme-admin');
    document.documentElement.classList.remove('theme-artist', 'theme-studio', 'theme-producer', 'theme-admin');

    // Apply role-specific theme class
    const themeClass = `theme-${userRole}`;
    document.body.classList.add(themeClass);
    document.documentElement.classList.add(themeClass);

    console.log(`Applied theme: ${themeClass}`);

    // Cleanup function
    return () => {
      document.body.classList.remove(themeClass);
      document.documentElement.classList.remove(themeClass);
    };
  }, [userRole]);

  const getThemeColors = (role: AppRole | null) => {
    switch (role) {
      case 'artist':
        return {
          primary: 'from-blue-500 to-purple-600',
          secondary: 'from-cyan-400 to-blue-500',
          accent: 'from-purple-500 to-pink-500',
          background: 'from-blue-50 to-purple-50',
          text: 'text-gray-800',
          surface: 'bg-white/90',
        };
      case 'studio':
        return {
          primary: 'from-blue-600 to-gray-700',
          secondary: 'from-green-500 to-blue-600',
          accent: 'from-purple-600 to-blue-600',
          background: 'from-gray-900 via-slate-900 to-black',
          text: 'text-white',
          surface: 'bg-gray-900/50',
        };
      case 'producer':
        return {
          primary: 'from-yellow-400 to-orange-500',
          secondary: 'from-orange-400 to-yellow-500',
          accent: 'from-yellow-600 to-orange-600',
          background: 'from-yellow-50 to-orange-50',
          text: 'text-amber-900',
          surface: 'bg-yellow-50/90',
        };
      case 'admin':
        return {
          primary: 'from-purple-600 to-blue-600',
          secondary: 'from-blue-600 to-purple-600',
          accent: 'from-green-500 to-blue-500',
          background: 'from-gray-900 via-slate-900 to-black',
          text: 'text-white',
          surface: 'bg-gray-900/50',
        };
      default:
        return {
          primary: 'from-gray-600 to-gray-700',
          secondary: 'from-gray-500 to-gray-600',
          accent: 'from-gray-400 to-gray-500',
          background: 'from-gray-100 to-gray-200',
          text: 'text-gray-800',
          surface: 'bg-white/90',
        };
    }
  };

  return { getThemeColors };
};
