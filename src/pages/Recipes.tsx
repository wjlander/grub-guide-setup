import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { SearchAndFilter } from "@/components/search/SearchAndFilter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Rating } from "@/components/ui/rating";
import { Clock, Users, Plus, ChefHat } from "lucide-react";

interface Recipe {
  id: string;
  name: string;
  description: string;
  prepTime: number;
  cookTime: number;
  servings: number;
  rating?: number;
  tags: string[];
  imageUrl?: string;
}

// Mock data for demonstration
const mockRecipes: Recipe[] = [
  {
    id: "1",
    name: "Chicken Caesar Salad",
    description: "Fresh romaine lettuce with grilled chicken, parmesan, and homemade caesar dressing",
    prepTime: 15,
    cookTime: 10,
    servings: 2,
    rating: 5,
    tags: ["lunch", "high-protein", "quick"],
  },
  {
    id: "2", 
    name: "Beef Stir Fry",
    description: "Tender beef strips with mixed vegetables in a savory sauce",
    prepTime: 20,
    cookTime: 15,
    servings: 4,
    rating: 4,
    tags: ["dinner", "high-protein", "vegetables"],
  },
  {
    id: "3",
    name: "Overnight Oats",
    description: "Creamy oats with berries and nuts, perfect for busy mornings",
    prepTime: 5,
    cookTime: 0,
    servings: 1,
    rating: 4,
    tags: ["breakfast", "vegetarian", "quick"],
  },
  {
    id: "4",
    name: "Salmon & Vegetables",
    description: "Baked salmon fillet with roasted seasonal vegetables",
    prepTime: 15,
    cookTime: 25,
    servings: 2,
    rating: 5,
    tags: ["dinner", "high-protein", "healthy"],
  },
];

export default function Recipes() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    mealTypes: [],
    dietaryRestrictions: [],
    prepTime: null,
    rating: null,
  });

  const filteredRecipes = mockRecipes.filter((recipe) => {
    // Search term filter
    const matchesSearch = recipe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         recipe.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         recipe.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

    // Meal type filter
    const matchesMealType = filters.mealTypes.length === 0 || 
                           filters.mealTypes.some(type => recipe.tags.includes(type));

    // Dietary restrictions filter
    const matchesDietary = filters.dietaryRestrictions.length === 0 ||
                          filters.dietaryRestrictions.some(restriction => recipe.tags.includes(restriction));

    // Prep time filter
    const totalTime = recipe.prepTime + recipe.cookTime;
    const matchesPrepTime = !filters.prepTime || 
                           (totalTime >= filters.prepTime.min && totalTime <= filters.prepTime.max);

    // Rating filter
    const matchesRating = !filters.rating || (recipe.rating && recipe.rating >= filters.rating);

    return matchesSearch && matchesMealType && matchesDietary && matchesPrepTime && matchesRating;
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Recipes</h1>
            <p className="text-muted-foreground">
              Discover and manage your favorite recipes
            </p>
          </div>
          <Button className="bg-gradient-primary">
            <Plus className="h-4 w-4 mr-2" />
            Add Recipe
          </Button>
        </div>

        <div className="mb-6">
          <SearchAndFilter
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            filters={filters}
            onFiltersChange={setFilters}
            placeholder="Search recipes by name, ingredients, or tags..."
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredRecipes.map((recipe) => (
            <Card key={recipe.id} className="hover:shadow-lg transition-shadow cursor-pointer group">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg group-hover:text-primary transition-colors">
                    {recipe.name}
                  </CardTitle>
                  {recipe.rating && (
                    <Rating value={recipe.rating} readonly size="sm" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {recipe.description}
                </p>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <ChefHat className="w-4 h-4 mr-1" />
                    {recipe.prepTime}m prep
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {recipe.cookTime}m cook
                  </div>
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-1" />
                    {recipe.servings}
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-1">
                  {recipe.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs capitalize">
                      {tag}
                    </Badge>
                  ))}
                  {recipe.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{recipe.tags.length - 3} more
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredRecipes.length === 0 && (
          <div className="text-center py-12">
            <ChefHat className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No recipes found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || Object.values(filters).some(f => f && (Array.isArray(f) ? f.length > 0 : true))
                ? "Try adjusting your search or filters"
                : "Get started by adding your first recipe"
              }
            </p>
            <Button className="bg-gradient-primary">
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Recipe
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}