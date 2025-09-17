import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { SearchAndFilter } from "@/components/search/SearchAndFilter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Rating } from "@/components/ui/rating";
import { Clock, Users, Plus, ChefHat } from "lucide-react";
import { RecipeForm } from "@/components/recipes/RecipeForm";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Recipe {
  id: string;
  name: string;
  description?: string;
  prep_time?: number;
  cook_time?: number;
  servings?: number;
  rating?: number;
  tags?: string[];
  meal_times?: string[];
  image_url?: string;
  instructions?: string;
}

// Real recipes from database

export default function Recipes() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    mealTypes: [],
    dietaryRestrictions: [],
    prepTime: null,
    rating: null,
  });
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const { toast } = useToast();

  const loadRecipes = async () => {
    const { data, error } = await supabase
      .from('recipes')
      .select('*')
      .order('name');

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load recipes",
        variant: "destructive",
      });
      return;
    }

    setRecipes(data || []);
  };

  const filteredRecipes = recipes.filter((recipe) => {
    // Search term filter
    const matchesSearch = recipe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         recipe.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         recipe.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         recipe.meal_times?.some(time => time.toLowerCase().includes(searchTerm.toLowerCase()));

    // Meal type filter
    const matchesMealType = filters.mealTypes.length === 0 || 
                           filters.mealTypes.some(type => 
                             recipe.tags?.includes(type) || 
                             recipe.meal_times?.includes(type)
                           );

    // Dietary restrictions filter
    const matchesDietary = filters.dietaryRestrictions.length === 0 ||
                          filters.dietaryRestrictions.some(restriction => recipe.tags?.includes(restriction));

    // Prep time filter
    const totalTime = (recipe.prep_time || 0) + (recipe.cook_time || 0);
    const matchesPrepTime = !filters.prepTime || 
                           (totalTime >= filters.prepTime.min && totalTime <= filters.prepTime.max);

    // Rating filter - skip rating filter for now since we don't have ratings in the DB
    const matchesRating = true;

    return matchesSearch && matchesMealType && matchesDietary && matchesPrepTime && matchesRating;
  });

  useEffect(() => {
    loadRecipes();
  }, []);

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
          <Button 
            className="bg-gradient-primary"
            onClick={() => { setEditingRecipe(null); setIsFormOpen(true); }}
          >
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
            <Card key={recipe.id} className="hover:shadow-lg transition-shadow cursor-pointer group"
                  onClick={() => { setEditingRecipe(recipe); setIsFormOpen(true); }}>
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
                    {recipe.prep_time || 0}m prep
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {recipe.cook_time || 0}m cook
                  </div>
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-1" />
                    {recipe.servings || 1}
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-1">
                  {recipe.meal_times?.slice(0, 2).map((mealTime) => (
                    <Badge key={mealTime} variant="default" className="text-xs capitalize">
                      {mealTime}
                    </Badge>
                  ))}
                  {recipe.tags?.slice(0, 2).map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs capitalize">
                      {tag}
                    </Badge>
                  ))}
                  {(recipe.meal_times?.length || 0) + (recipe.tags?.length || 0) > 4 && (
                    <Badge variant="outline" className="text-xs">
                      +{((recipe.meal_times?.length || 0) + (recipe.tags?.length || 0)) - 4} more
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
            <Button 
              className="bg-gradient-primary"
              onClick={() => { setEditingRecipe(null); setIsFormOpen(true); }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Recipe
            </Button>
          </div>
        )}

        <RecipeForm
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          recipe={editingRecipe}
          onSave={loadRecipes}
        />
      </main>
    </div>
  );
}