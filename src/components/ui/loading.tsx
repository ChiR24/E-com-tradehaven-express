import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg";
  fullScreen?: boolean;
}

const sizeMap = {
  sm: "h-4 w-4",
  md: "h-8 w-8",
  lg: "h-12 w-12",
};

export function Loading({
  size = "md",
  fullScreen = false,
  className,
  ...props
}: LoadingProps) {
  const containerClasses = cn(
    "flex items-center justify-center",
    {
      "fixed inset-0 bg-black/50 z-50": fullScreen,
    },
    className
  );

  return (
    <div className={containerClasses} {...props}>
      <Loader2 className={cn("animate-spin text-primary", sizeMap[size])} />
    </div>
  );
} 