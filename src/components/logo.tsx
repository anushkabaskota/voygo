import { Compass } from "lucide-react";
import { cn } from "@/lib/utils";

const Logo = ({ className }: { className?: string }) => {
  return (
    <div
      className={cn(
        "flex items-center justify-center gap-2 text-2xl font-bold text-foreground font-headline",
        className
      )}
    >
      <Compass className="h-7 w-7 text-primary" />
      <span>voygo</span>
    </div>
  );
};

export default Logo;
