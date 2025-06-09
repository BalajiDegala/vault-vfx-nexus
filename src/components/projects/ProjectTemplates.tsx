
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FileText, Zap, Clock, Users, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  category: "commercial" | "feature" | "series" | "music_video" | "game_cinematic";
  sequences: {
    name: string;
    shots: {
      name: string;
      tasks: string[];
    }[];
  }[];
  estimated_duration: string;
  team_size: number;
  difficulty: "beginner" | "intermediate" | "advanced" | "expert";
  rating: number;
  uses: number;
}

interface ProjectTemplatesProps {
  onSelectTemplate: (template: ProjectTemplate) => void;
  open: boolean;
  onClose: () => void;
}

const ProjectTemplates = ({ onSelectTemplate, open, onClose }: ProjectTemplatesProps) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const { toast } = useToast();

  const templates: ProjectTemplate[] = [
    {
      id: "commercial-basic",
      name: "Commercial - Basic Setup",
      description: "Standard 30-second commercial template with hero product shots",
      category: "commercial",
      sequences: [
        {
          name: "Opening",
          shots: [
            { name: "Product Reveal", tasks: ["Modeling", "Lighting", "Compositing"] },
            { name: "Hero Shot", tasks: ["Animation", "Lighting", "Rendering"] }
          ]
        },
        {
          name: "Features",
          shots: [
            { name: "Detail Close-ups", tasks: ["Modeling", "Texturing", "Lighting"] },
            { name: "Usage Demo", tasks: ["Animation", "FX", "Compositing"] }
          ]
        },
        {
          name: "Finale",
          shots: [
            { name: "Brand Logo", tasks: ["Motion Graphics", "Compositing"] }
          ]
        }
      ],
      estimated_duration: "2-3 weeks",
      team_size: 3,
      difficulty: "beginner",
      rating: 4.5,
      uses: 245
    },
    {
      id: "feature-action",
      name: "Feature Film - Action Sequence",
      description: "High-octane action sequence with VFX-heavy shots",
      category: "feature",
      sequences: [
        {
          name: "Setup",
          shots: [
            { name: "Wide Establishing", tasks: ["Environment", "Matte Painting", "Compositing"] },
            { name: "Character Introduction", tasks: ["Character Rigging", "Animation", "Lighting"] }
          ]
        },
        {
          name: "Action",
          shots: [
            { name: "Explosion FX", tasks: ["FX Simulation", "Lighting", "Compositing"] },
            { name: "Slow Motion", tasks: ["Animation", "FX", "Color Grading"] },
            { name: "Vehicle Chase", tasks: ["Rigid Body Sim", "Dust FX", "Compositing"] }
          ]
        },
        {
          name: "Resolution",
          shots: [
            { name: "Aftermath Wide", tasks: ["Environment", "Atmosphere", "Compositing"] }
          ]
        }
      ],
      estimated_duration: "3-4 months",
      team_size: 15,
      difficulty: "expert",
      rating: 4.8,
      uses: 89
    },
    {
      id: "series-episode",
      name: "TV Series - Episode Template",
      description: "Standard episode structure for ongoing series production",
      category: "series",
      sequences: [
        {
          name: "Teaser",
          shots: [
            { name: "Cold Open", tasks: ["Set Extension", "Compositing"] }
          ]
        },
        {
          name: "Act 1",
          shots: [
            { name: "Dialogue Scene", tasks: ["Set Extension", "Color Grading"] },
            { name: "Action Beat", tasks: ["FX", "Compositing"] }
          ]
        },
        {
          name: "Act 2",
          shots: [
            { name: "Major Sequence", tasks: ["Character Animation", "FX", "Compositing"] }
          ]
        }
      ],
      estimated_duration: "4-6 weeks",
      team_size: 8,
      difficulty: "intermediate",
      rating: 4.3,
      uses: 156
    },
    {
      id: "music-video",
      name: "Music Video - Performance",
      description: "Artist performance with creative visual effects",
      category: "music_video",
      sequences: [
        {
          name: "Intro",
          shots: [
            { name: "Artist Entrance", tasks: ["Lighting", "Color Grading"] }
          ]
        },
        {
          name: "Verse 1",
          shots: [
            { name: "Close-up Performance", tasks: ["Beauty Work", "Color Grading"] },
            { name: "Wide Performance", tasks: ["Set Extension", "Atmosphere"] }
          ]
        },
        {
          name: "Chorus",
          shots: [
            { name: "FX Heavy", tasks: ["Particle FX", "Lighting", "Compositing"] }
          ]
        }
      ],
      estimated_duration: "3-4 weeks",
      team_size: 5,
      difficulty: "intermediate",
      rating: 4.1,
      uses: 203
    },
    {
      id: "game-cinematic",
      name: "Game Cinematic - Trailer",
      description: "High-end game trailer with character animation and environments",
      category: "game_cinematic",
      sequences: [
        {
          name: "World Building",
          shots: [
            { name: "Environment Flythrough", tasks: ["Environment Modeling", "Lighting", "Atmosphere"] }
          ]
        },
        {
          name: "Character Showcase",
          shots: [
            { name: "Hero Character", tasks: ["Character Modeling", "Rigging", "Animation"] },
            { name: "Combat Demo", tasks: ["Animation", "FX", "Compositing"] }
          ]
        },
        {
          name: "Finale",
          shots: [
            { name: "Logo Reveal", tasks: ["Motion Graphics", "FX"] }
          ]
        }
      ],
      estimated_duration: "2-3 months",
      team_size: 12,
      difficulty: "advanced",
      rating: 4.7,
      uses: 134
    }
  ];

  const categories = [
    { value: "all", label: "All Templates" },
    { value: "commercial", label: "Commercial" },
    { value: "feature", label: "Feature Film" },
    { value: "series", label: "TV Series" },
    { value: "music_video", label: "Music Video" },
    { value: "game_cinematic", label: "Game Cinematic" }
  ];

  const filteredTemplates = selectedCategory === "all" 
    ? templates 
    : templates.filter(t => t.category === selectedCategory);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner": return "text-green-400";
      case "intermediate": return "text-yellow-400";
      case "advanced": return "text-orange-400";
      case "expert": return "text-red-400";
      default: return "text-gray-400";
    }
  };

  const handleSelectTemplate = (template: ProjectTemplate) => {
    onSelectTemplate(template);
    onClose();
    toast({
      title: "Template Applied",
      description: `${template.name} has been applied to your project structure.`,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-gray-900 border-blue-500/20">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white">
            Choose Project Template
          </DialogTitle>
          <p className="text-gray-400">
            Start with a proven project structure tailored to your production type
          </p>
        </DialogHeader>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map((category) => (
            <Button
              key={category.value}
              variant={selectedCategory === category.value ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category.value)}
              className={selectedCategory === category.value 
                ? "bg-blue-600 hover:bg-blue-700" 
                : "border-gray-600 text-gray-400 hover:text-white hover:border-gray-500"
              }
            >
              {category.label}
            </Button>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {filteredTemplates.map((template) => (
            <Card key={template.id} className="bg-gray-800/50 border-gray-600 hover:border-blue-500/40 transition-colors">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-white text-lg mb-2">{template.name}</CardTitle>
                    <p className="text-gray-400 text-sm mb-3">{template.description}</p>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {template.estimated_duration}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {template.team_size} people
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-yellow-400" />
                        {template.rating}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <Badge 
                      variant="outline" 
                      className={`mb-2 ${getDifficultyColor(template.difficulty)}`}
                    >
                      {template.difficulty}
                    </Badge>
                    <p className="text-xs text-gray-500">{template.uses} uses</p>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-3 mb-4">
                  <h4 className="text-white font-medium text-sm">Structure Preview:</h4>
                  {template.sequences.slice(0, 2).map((sequence, idx) => (
                    <div key={idx} className="bg-gray-700/30 rounded p-2">
                      <p className="text-blue-400 text-sm font-medium mb-1">{sequence.name}</p>
                      <div className="grid grid-cols-2 gap-2">
                        {sequence.shots.slice(0, 2).map((shot, shotIdx) => (
                          <div key={shotIdx} className="text-xs">
                            <p className="text-gray-300">{shot.name}</p>
                            <p className="text-gray-500">{shot.tasks.slice(0, 2).join(", ")}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  {template.sequences.length > 2 && (
                    <p className="text-gray-500 text-xs text-center">
                      +{template.sequences.length - 2} more sequences
                    </p>
                  )}
                </div>
                
                <Button 
                  onClick={() => handleSelectTemplate(template)}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Use This Template
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredTemplates.length === 0 && (
          <div className="text-center py-12">
            <FileText className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No templates found for this category.</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ProjectTemplates;
