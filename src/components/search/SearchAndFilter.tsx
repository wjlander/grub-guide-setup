import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Filter, X } from "lucide-react";

interface FilterOptions {
  mealTypes: string[];
  dietaryRestrictions: string[];
  prepTime: { min: number; max: number } | null;
  rating: number | null;
}

interface SearchAndFilterProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  placeholder?: string;
}

const mealTypeOptions = ["breakfast", "lunch", "dinner", "snack"];
const dietaryOptions = ["vegetarian", "vegan", "gluten-free", "dairy-free", "low-carb", "high-protein"];
const prepTimeOptions = [
  { label: "Quick (< 15 min)", min: 0, max: 15 },
  { label: "Medium (15-30 min)", min: 15, max: 30 },
  { label: "Long (30+ min)", min: 30, max: 999 },
];

export function SearchAndFilter({
  searchTerm,
  onSearchChange,
  filters,
  onFiltersChange,
  placeholder = "Search meals, recipes, ingredients..."
}: SearchAndFilterProps) {
  const [open, setOpen] = useState(false);

  const hasActiveFilters = 
    filters.mealTypes.length > 0 || 
    filters.dietaryRestrictions.length > 0 || 
    filters.prepTime !== null || 
    filters.rating !== null;

  const clearAllFilters = () => {
    onFiltersChange({
      mealTypes: [],
      dietaryRestrictions: [],
      prepTime: null,
      rating: null,
    });
  };

  const toggleMealType = (type: string) => {
    const newTypes = filters.mealTypes.includes(type)
      ? filters.mealTypes.filter(t => t !== type)
      : [...filters.mealTypes, type];
    onFiltersChange({ ...filters, mealTypes: newTypes });
  };

  const toggleDietary = (restriction: string) => {
    const newRestrictions = filters.dietaryRestrictions.includes(restriction)
      ? filters.dietaryRestrictions.filter(r => r !== restriction)
      : [...filters.dietaryRestrictions, restriction];
    onFiltersChange({ ...filters, dietaryRestrictions: newRestrictions });
  };

  const setPrepTime = (timeRange: { min: number; max: number } | null) => {
    onFiltersChange({ ...filters, prepTime: timeRange });
  };

  const setRating = (rating: number | null) => {
    onFiltersChange({ ...filters, rating });
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={placeholder}
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filters
              {hasActiveFilters && (
                <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                  {filters.mealTypes.length + filters.dietaryRestrictions.length + 
                   (filters.prepTime ? 1 : 0) + (filters.rating ? 1 : 0)}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-4" align="end">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Filters</h4>
                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                    Clear all
                  </Button>
                )}
              </div>

              <div className="space-y-3">
                <div>
                  <h5 className="text-sm font-medium mb-2">Meal Type</h5>
                  <div className="flex flex-wrap gap-2">
                    {mealTypeOptions.map((type) => (
                      <Badge
                        key={type}
                        variant={filters.mealTypes.includes(type) ? "default" : "outline"}
                        className="cursor-pointer capitalize"
                        onClick={() => toggleMealType(type)}
                      >
                        {type}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h5 className="text-sm font-medium mb-2">Dietary</h5>
                  <div className="space-y-2">
                    {dietaryOptions.map((restriction) => (
                      <div key={restriction} className="flex items-center space-x-2">
                        <Checkbox
                          id={restriction}
                          checked={filters.dietaryRestrictions.includes(restriction)}
                          onCheckedChange={() => toggleDietary(restriction)}
                        />
                        <label htmlFor={restriction} className="text-sm capitalize cursor-pointer">
                          {restriction}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h5 className="text-sm font-medium mb-2">Prep Time</h5>
                  <div className="space-y-2">
                    {prepTimeOptions.map((option) => (
                      <div key={option.label} className="flex items-center space-x-2">
                        <Checkbox
                          checked={filters.prepTime?.min === option.min && filters.prepTime?.max === option.max}
                          onCheckedChange={(checked) => 
                            setPrepTime(checked ? { min: option.min, max: option.max } : null)
                          }
                        />
                        <label className="text-sm cursor-pointer">{option.label}</label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h5 className="text-sm font-medium mb-2">Minimum Rating</h5>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <Badge
                        key={rating}
                        variant={filters.rating === rating ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => setRating(filters.rating === rating ? null : rating)}
                      >
                        {rating}★
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {filters.mealTypes.map((type) => (
            <Badge key={type} variant="secondary" className="flex items-center gap-1">
              <span className="capitalize">{type}</span>
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => toggleMealType(type)} 
              />
            </Badge>
          ))}
          {filters.dietaryRestrictions.map((restriction) => (
            <Badge key={restriction} variant="secondary" className="flex items-center gap-1">
              <span className="capitalize">{restriction}</span>
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => toggleDietary(restriction)} 
              />
            </Badge>
          ))}
          {filters.prepTime && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <span>
                {filters.prepTime.max === 999 ? `${filters.prepTime.min}+ min` : `${filters.prepTime.min}-${filters.prepTime.max} min`}
              </span>
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => setPrepTime(null)} 
              />
            </Badge>
          )}
          {filters.rating && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <span>{filters.rating}★+</span>
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => setRating(null)} 
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}