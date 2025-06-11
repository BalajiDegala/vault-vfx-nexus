
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

    console.log(`Applied luxury theme: ${themeClass}`);

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
          primary: 'from-purple-400 via-purple-500 to-pink-500',
          secondary: 'from-cyan-400 via-blue-500 to-purple-600',
          accent: 'from-purple-500 to-pink-500',
          background: 'from-purple-950 via-slate-900 to-gray-950',
          text: 'luxury-text',
          surface: 'luxury-bg-surface',
          glow: 'luxury-neon-glow',
          glass: 'luxury-glass',
          card: 'luxury-card',
          button: 'luxury-button-primary',
          gradient: 'luxury-gradient-primary',
        };
      case 'studio':
        return {
          primary: 'from-blue-400 via-blue-500 to-cyan-500',
          secondary: 'from-cyan-400 via-blue-500 to-indigo-600',
          accent: 'from-blue-500 to-cyan-500',
          background: 'from-blue-950 via-slate-900 to-gray-950',
          text: 'luxury-text',
          surface: 'luxury-bg-surface',
          glow: 'luxury-neon-glow',
          glass: 'luxury-glass',
          card: 'luxury-card',
          button: 'luxury-button-primary',
          gradient: 'luxury-gradient-primary',
        };
      case 'producer':
        return {
          primary: 'from-yellow-400 via-amber-500 to-orange-500',
          secondary: 'from-orange-400 via-yellow-500 to-amber-600',
          accent: 'from-yellow-500 to-orange-500',
          background: 'from-amber-950 via-yellow-900 to-orange-950',
          text: 'luxury-text',
          surface: 'luxury-bg-surface',
          glow: 'luxury-neon-glow',
          glass: 'luxury-glass',
          card: 'luxury-card',
          button: 'luxury-button-primary',
          gradient: 'luxury-gradient-primary',
        };
      case 'admin':
        return {
          primary: 'from-purple-400 via-violet-500 to-blue-500',
          secondary: 'from-blue-400 via-purple-500 to-pink-600',
          accent: 'from-green-400 to-blue-500',
          background: 'from-slate-950 via-gray-900 to-black',
          text: 'luxury-text',
          surface: 'luxury-bg-surface',
          glow: 'luxury-neon-glow',
          glass: 'luxury-glass',
          card: 'luxury-card',
          button: 'luxury-button-primary',
          gradient: 'luxury-gradient-primary',
        };
      default:
        return {
          primary: 'from-gray-500 to-gray-600',
          secondary: 'from-gray-400 to-gray-500',
          accent: 'from-gray-400 to-gray-500',
          background: 'from-gray-100 to-gray-200',
          text: 'text-gray-800',
          surface: 'bg-white/90',
          glow: 'shadow-gray-500/20',
          glass: 'bg-white/10',
          card: 'bg-white',
          button: 'bg-blue-500',
          gradient: 'bg-blue-500',
        };
    }
  };

  const getLuxuryEffects = (role: AppRole | null) => {
    return {
      glassEffect: 'luxury-glass',
      ultraGlass: 'ultra-glass',
      neonGlow: 'luxury-neon-glow',
      textGlow: 'luxury-text-glow',
      cardHover: 'luxury-card',
      borderGlow: 'luxury-border-glow',
      gradientPrimary: 'luxury-gradient-primary',
      gradientSurface: 'luxury-gradient-surface',
      scrollbar: 'luxury-scrollbar',
    };
  };

  return { getThemeColors, getLuxuryEffects };
};
