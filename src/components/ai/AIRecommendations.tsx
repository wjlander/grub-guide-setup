import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, Clock, Users, Calendar, RefreshCw } from "lucide-react";
import { Rating } from "@/components/ui/rating";

interface MealRecommendation {
  name: string;
  type: "breakfast" | "lunch" | "dinner";
  description: string;
  prepTime: number;
  cookTime: number;
  servings: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  ingredients: string[];
  tags: string[];
  reason: string;
}

interface AIRecommendationsProps {
  className?: string;
}

export function AIRecommendations({ className }: AIRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<MealRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const generateRecommendations = async () => {
    setIsLoading(true);
    
    try {
      console.log('Calling meal recommendations function...');
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase.functions.invoke('meal-recommendations', {
        body: {
          userId: user.id,
          preferences: {
            dietaryRestrictions: ['vegetarian'],
            preferredCuisines: ['british', 'mediterranean'],
            cookingTime: 'quick' // quick, medium, long
          },
          mealHistory: [
            { name: 'Chicken Caesar Salad', type: 'lunch', date: '2024-12-15' },
            { name: 'Beef Stir Fry', type: 'dinner', date: '2024-12-14' }
          ],
          nutritionalGoals: {
            dailyCalories: 2000,
            proteinTarget: 150,
            preferLowCarb: false
          }
        }
      });

      if (error) {
        throw error;
      }

      console.log('Function response:', data);

      if (data?.success && data?.recommendations) {
        setRecommendations(data.recommendations);
        toast({
          title: "AI Recommendations Generated",
          description: `Found ${data.recommendations.length} personalized meal suggestions`,
        });
      } else {
        throw new Error(data?.error || 'Failed to generate recommendations');
      }

    } catch (error) {
      console.error('Error generating recommendations:', error);
      
      // Fallback recommendations
      const fallbackRecommendations: MealRecommendation[] = [
        {
          name: "Mediterranean Quinoa Bowl",
          type: "lunch",
          description: "Protein-rich quinoa with fresh vegetables, feta, and olive oil dressing",
          prepTime: 15,
          cookTime: 20,
          servings: 2,
          calories: 420,
          protein: 18,
          carbs: 55,
          fat: 14,
          ingredients: ["quinoa", "cucumber", "tomatoes", "feta cheese", "olive oil", "lemon"],
          tags: ["vegetarian", "mediterranean", "high-protein"],
          reason: "Perfect balance of protein and complex carbs for sustained energy"
        },
        {
          name: "British Fish & Chips (Baked)",
          type: "dinner", 
          description: "Healthier baked version of the classic with crispy potatoes",
          prepTime: 10,
          cookTime: 35,
          servings: 4,
          calories: 485,
          protein: 32,
          carbs: 58,
          fat: 12,
          ingredients: ["white fish fillets", "potatoes", "flour", "breadcrumbs", "peas"],
          tags: ["british", "comfort-food", "baked"],
          reason: "Healthier take on British classic with great protein content"
        }
      ];
      
      setRecommendations(fallbackRecommendations);
      
      toast({
        title: "Using Offline Recommendations",
        description: "AI service unavailable, showing fallback suggestions",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    generateRecommendations();
  }, []);

  const getMealTypeColor = (type: string) => {
    switch (type) {
      case 'breakfast': return 'bg-gradient-secondary text-secondary-foreground';
      case 'lunch': return 'bg-gradient-primary text-primary-foreground';
      case 'dinner': return 'bg-gradient-accent text-accent-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const addToMealPlan = (meal: MealRecommendation) => {
    // In a real app, this would add to the user's meal plan
    toast({
      title: "Added to Meal Plan",
      description: `${meal.name} has been added to your meal plan`,
    });
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Meal Recommendations
          </CardTitle>
          <Button 
            variant="outline" 
            size="sm"
            onClick={generateRecommendations}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="text-center py-8">
            <Sparkles className="h-8 w-8 mx-auto mb-4 text-primary animate-pulse" />
            <p className="text-sm text-muted-foreground">
              AI is generating personalized recommendations...
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {recommendations.map((meal, index) => (
              <div key={index} className="border rounded-lg p-4 hover:bg-muted/30 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={`${getMealTypeColor(meal.type)} text-xs px-2 py-1 capitalize`}>
                        {meal.type}
                      </Badge>
                      <h4 className="font-medium">{meal.name}</h4>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{meal.description}</p>
                    <p className="text-xs text-primary italic">💡 {meal.reason}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                  <div className="flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    {meal.prepTime + meal.cookTime}min
                  </div>
                  <div className="flex items-center">
                    <Users className="w-3 h-3 mr-1" />
                    {meal.servings}
                  </div>
                  <div>{meal.calories} cal</div>
                  <div>{meal.protein}g protein</div>
                </div>

                <div className="flex flex-wrap gap-1 mb-3">
                  {meal.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs capitalize">
                      {tag.replace('-', ' ')}
                    </Badge>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => addToMealPlan(meal)}
                  >
                    <Calendar className="h-3 w-3 mr-1" />
                    Add to Plan
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    View Recipe
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}