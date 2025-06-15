
export interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  category: 'commercial' | 'feature_film' | 'tv_show' | 'music_video' | 'documentary' | 'short_film';
  defaultBudgetRange: {
    min: number;
    max: number;
  };
  defaultTimeline: number; // days
  requiredSkills: string[];
  defaultMilestones: Array<{
    name: string;
    percentage: number;
    description: string;
  }>;
  securityLevel: 'Standard' | 'High' | 'Confidential';
  isCustom: boolean;
  createdBy?: string;
  createdAt: string;
}

export const DEFAULT_TEMPLATES: ProjectTemplate[] = [
  {
    id: 'commercial-basic',
    name: 'Commercial - Basic',
    description: 'Standard commercial project with basic VFX requirements',
    category: 'commercial',
    defaultBudgetRange: { min: 5000, max: 25000 },
    defaultTimeline: 14,
    requiredSkills: ['Compositing', 'Color Grading', 'Motion Graphics'],
    defaultMilestones: [
      { name: 'Pre-production', percentage: 20, description: 'Planning and asset preparation' },
      { name: 'Production', percentage: 50, description: 'Main VFX work' },
      { name: 'Post-production', percentage: 80, description: 'Refinements and polish' },
      { name: 'Final Delivery', percentage: 100, description: 'Client approval and delivery' }
    ],
    securityLevel: 'Standard',
    isCustom: false,
    createdAt: new Date().toISOString()
  },
  {
    id: 'feature-film',
    name: 'Feature Film',
    description: 'Large-scale feature film production with complex VFX requirements',
    category: 'feature_film',
    defaultBudgetRange: { min: 100000, max: 1000000 },
    defaultTimeline: 180,
    requiredSkills: ['3D Animation', 'VFX', 'Compositing', 'Simulation', 'Modeling', 'Texturing'],
    defaultMilestones: [
      { name: 'Pre-visualization', percentage: 10, description: 'Concept and previz work' },
      { name: 'Asset Creation', percentage: 30, description: '3D models and textures' },
      { name: 'Animation', percentage: 60, description: 'Character and object animation' },
      { name: 'Lighting & Rendering', percentage: 80, description: 'Final look development' },
      { name: 'Compositing', percentage: 95, description: 'Final composite and integration' },
      { name: 'Final Delivery', percentage: 100, description: 'Client approval and delivery' }
    ],
    securityLevel: 'High',
    isCustom: false,
    createdAt: new Date().toISOString()
  },
  {
    id: 'tv-show-episode',
    name: 'TV Show Episode',
    description: 'Television episode with moderate VFX requirements',
    category: 'tv_show',
    defaultBudgetRange: { min: 15000, max: 75000 },
    defaultTimeline: 45,
    requiredSkills: ['Compositing', 'VFX', 'Color Grading', 'Motion Graphics'],
    defaultMilestones: [
      { name: 'Preparation', percentage: 25, description: 'Shot breakdown and planning' },
      { name: 'VFX Production', percentage: 75, description: 'Main VFX work' },
      { name: 'Final Delivery', percentage: 100, description: 'Review and delivery' }
    ],
    securityLevel: 'Standard',
    isCustom: false,
    createdAt: new Date().toISOString()
  }
];
