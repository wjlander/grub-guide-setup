import * as React from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatingProps {
  value: number;
  onValueChange?: (value: number) => void;
  maxRating?: number;
  readonly?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Rating({ 
  value, 
  onValueChange, 
  maxRating = 5, 
  readonly = false,
  size = "md",
  className 
}: RatingProps) {
  const [hoverValue, setHoverValue] = React.useState<number | null>(null);
  
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5", 
    lg: "w-6 h-6"
  };

  const handleClick = (rating: number) => {
    if (!readonly && onValueChange) {
      onValueChange(rating);
    }
  };

  const handleMouseEnter = (rating: number) => {
    if (!readonly) {
      setHoverValue(rating);
    }
  };

  const handleMouseLeave = () => {
    if (!readonly) {
      setHoverValue(null);
    }
  };

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {Array.from({ length: maxRating }, (_, index) => {
        const rating = index + 1;
        const isFilled = rating <= (hoverValue ?? value);
        
        return (
          <Star
            key={rating}
            className={cn(
              sizeClasses[size],
              "transition-colors duration-150",
              isFilled 
                ? "fill-yellow-400 text-yellow-400" 
                : "text-muted-foreground",
              !readonly && "cursor-pointer hover:scale-110 transition-transform"
            )}
            onClick={() => handleClick(rating)}
            onMouseEnter={() => handleMouseEnter(rating)}
            onMouseLeave={handleMouseLeave}
          />
        );
      })}
    </div>
  );
}