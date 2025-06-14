
import { User, Building, Video, Shield } from "lucide-react";
import { Label } from "@/components/ui/label";
import { AppRole, RoleOption } from "@/types/auth";

interface RoleSelectionProps {
  selectedRole: AppRole | "";
  onRoleSelect: (role: AppRole) => void;
}

const RoleSelection = ({ selectedRole, onRoleSelect }: RoleSelectionProps) => {
  const roles: RoleOption[] = [
    {
      id: "artist" as AppRole,
      title: "Freelancer/Artist",
      description: "VFX Artist, Animator, or Technical Specialist",
      icon: User,
    },
    {
      id: "studio" as AppRole,
      title: "Studio",
      description: "VFX Studio or Production Company",
      icon: Building,
    },
    {
      id: "producer" as AppRole,
      title: "Producer",
      description: "Film Producer or Project Manager",
      icon: Video,
    },
    {
      id: "admin" as AppRole,
      title: "Admin",
      description: "Platform Administrator",
      icon: Shield,
    },
  ];

  return (
    <div>
      <Label className="text-lg font-semibold text-gray-300 mb-4 block">
        Select Your Role
      </Label>
      <div className="grid md:grid-cols-2 gap-3">
        {roles.map((role) => {
          const Icon = role.icon;
          return (
            <button
              key={role.id}
              type="button"
              onClick={() => onRoleSelect(role.id)}
              className={`p-4 rounded-lg border-2 transition-all text-left ${
                selectedRole === role.id
                  ? "border-blue-500 bg-blue-500/10"
                  : "border-gray-600 hover:border-gray-500"
              }`}
            >
              <Icon className={`h-6 w-6 mb-2 ${
                selectedRole === role.id ? "text-blue-400" : "text-gray-400"
              }`} />
              <h3 className={`font-bold mb-1 text-sm ${
                selectedRole === role.id ? "text-blue-400" : "text-white"
              }`}>
                {role.title}
              </h3>
              <p className="text-xs text-gray-400">{role.description}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default RoleSelection;
