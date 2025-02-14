import { cn } from "@/lib/utils";

interface PasswordStrengthProps {
  password: string;
  className?: string;
}

interface Requirement {
  regex: RegExp;
  text: string;
}

const requirements: Requirement[] = [
  { regex: /.{8,}/, text: "At least 8 characters" },
  { regex: /[0-9]/, text: "At least one number" },
  { regex: /[a-z]/, text: "At least one lowercase letter" },
  { regex: /[A-Z]/, text: "At least one uppercase letter" },
  { regex: /[^A-Za-z0-9]/, text: "At least one special character" },
];

const strengthLevels = [
  { color: "bg-red-500", label: "Very Weak" },
  { color: "bg-orange-500", label: "Weak" },
  { color: "bg-yellow-500", label: "Medium" },
  { color: "bg-green-500", label: "Strong" },
  { color: "bg-emerald-500", label: "Very Strong" },
];

export function PasswordStrength({ password, className }: PasswordStrengthProps) {
  const meetsRequirement = (requirement: Requirement) =>
    requirement.regex.test(password);

  const getStrengthLevel = () => {
    const metRequirements = requirements.filter(meetsRequirement).length;
    return Math.min(Math.floor((metRequirements / requirements.length) * 5), 4);
  };

  const strengthLevel = getStrengthLevel();
  const { color, label } = strengthLevels[strengthLevel];

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex gap-1 h-1">
        {strengthLevels.map((_, index) => (
          <div
            key={index}
            className={cn(
              "h-full w-full rounded-full transition-colors",
              index <= strengthLevel ? color : "bg-gray-200"
            )}
          />
        ))}
      </div>
      <div className="flex justify-between text-xs text-gray-500">
        <span>Strength: {label}</span>
        <span>
          {requirements.filter(meetsRequirement).length}/{requirements.length}{" "}
          requirements met
        </span>
      </div>
      <ul className="space-y-1 text-xs">
        {requirements.map((requirement, index) => (
          <li
            key={index}
            className={cn(
              "transition-colors",
              meetsRequirement(requirement)
                ? "text-green-500"
                : "text-gray-500"
            )}
          >
            {requirement.text}
          </li>
        ))}
      </ul>
    </div>
  );
} 