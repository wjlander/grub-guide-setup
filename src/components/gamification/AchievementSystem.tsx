import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Star, Target, Calendar, Gift } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  criteria: any;
  reward_points: number;
  achieved_at?: string;
  progress?: number;
}

interface UserStats {
  mealCount: number;
  recipeCount: number;
  photoCount: number;
  shoppingListsCompleted: number;
  nutritionDaysTracked: number;
  uniqueRecipesTried: number;
  cookingStreakDays: number;
  planningWeeks: number;
  totalPoints: number;
}

export function AchievementSystem() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userStats, setUserStats] = useState<UserStats>({
    mealCount: 0,
    recipeCount: 0,
    photoCount: 0,
    shoppingListsCompleted: 0,
    nutritionDaysTracked: 0,
    uniqueRecipesTried: 0,
    cookingStreakDays: 0,
    planningWeeks: 0,
    totalPoints: 0,
  });
  const [completedAchievements, setCompletedAchievements] = useState<Achievement[]>([]);
  const [inProgressAchievements, setInProgressAchievements] = useState<Achievement[]>([]);

  const { toast } = useToast();

  const loadAchievements = async () => {
    // Load achievement types
    const { data: achievementTypes, error: typesError } = await supabase
      .from('achievement_types')
      .select('*')
      .order('reward_points');

    if (typesError) {
      toast({
        title: "Error",
        description: "Failed to load achievements",
        variant: "destructive",
      });
      return;
    }

    // Load user achievements
    const { data: userAchievements, error: userError } = await supabase
      .from('user_achievements')
      .select(`
        *,
        achievement_type:achievement_types(*)
      `);

    if (userError) {
      console.error('Error loading user achievements:', userError);
    }

    // Calculate user stats
    await calculateUserStats();

    // Merge achievement types with user progress
    const enrichedAchievements = achievementTypes.map(achievement => {
      const userAchievement = userAchievements?.find(
        ua => ua.achievement_type_id === achievement.id
      );

      return {
        ...achievement,
        achieved_at: userAchievement?.achieved_at,
        progress: calculateProgress(achievement, userStats)
      };
    });

    setAchievements(enrichedAchievements);

    // Separate completed and in-progress achievements
    const completed = enrichedAchievements.filter(a => a.achieved_at);
    const inProgress = enrichedAchievements.filter(a => !a.achieved_at);

    setCompletedAchievements(completed);
    setInProgressAchievements(inProgress);

    // Calculate total points
    const totalPoints = completed.reduce((sum, achievement) => sum + achievement.reward_points, 0);
    setUserStats(prev => ({ ...prev, totalPoints }));
  };

  const calculateUserStats = async () => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Count meals
      const { count: mealCount } = await supabase
        .from('meals')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // Count recipes
      const { count: recipeCount } = await supabase
        .from('recipes')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // Count photos
      const { count: photoCount } = await supabase
        .from('meal_photos')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // Count completed shopping lists (simplified - count all lists for now)
      const { count: shoppingListsCompleted } = await supabase
        .from('shopping_lists')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // Count nutrition tracking days
      const { data: nutritionDays } = await supabase
        .from('nutrition_logs')
        .select('date')
        .eq('user_id', user.id);

      const uniqueNutritionDays = new Set(nutritionDays?.map(log => log.date)).size;

      // Count unique recipes tried (simplified)
      const { data: uniqueRecipes } = await supabase
        .from('meals')
        .select('recipe_id')
        .eq('user_id', user.id)
        .not('recipe_id', 'is', null);

      const uniqueRecipesTried = new Set(uniqueRecipes?.map(meal => meal.recipe_id)).size;

      // Calculate cooking streak (simplified - last 7 days with meals)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const { data: recentMeals } = await supabase
        .from('meals')
        .select('date')
        .eq('user_id', user.id)
        .gte('date', sevenDaysAgo.toISOString().split('T')[0]);

      const cookingDays = new Set(recentMeals?.map(meal => meal.date)).size;

      // Count meal planning weeks
      const { count: planningWeeks } = await supabase
        .from('meal_plans')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      setUserStats({
        mealCount: mealCount || 0,
        recipeCount: recipeCount || 0,
        photoCount: photoCount || 0,
        shoppingListsCompleted: shoppingListsCompleted || 0,
        nutritionDaysTracked: uniqueNutritionDays,
        uniqueRecipesTried,
        cookingStreakDays: cookingDays,
        planningWeeks: planningWeeks || 0,
        totalPoints: 0, // Will be calculated later
      });

    } catch (error) {
      console.error('Error calculating user stats:', error);
    }
  };

  const calculateProgress = (achievement: Achievement, stats: UserStats): number => {
    const criteria = achievement.criteria;
    let current = 0;
    let target = criteria.target || 1;

    switch (criteria.type) {
      case 'meal_count':
        current = stats.mealCount;
        break;
      case 'recipe_count':
        current = stats.recipeCount;
        break;
      case 'photo_count':
        current = stats.photoCount;
        break;
      case 'shopping_lists':
        current = stats.shoppingListsCompleted;
        break;
      case 'nutrition_days':
        current = stats.nutritionDaysTracked;
        break;
      case 'unique_recipes':
        current = stats.uniqueRecipesTried;
        break;
      case 'cooking_streak':
        current = stats.cookingStreakDays;
        break;
      case 'planning_weeks':
        current = stats.planningWeeks;
        break;
      default:
        current = 0;
    }

    return Math.min((current / target) * 100, 100);
  };

  const checkForNewAchievements = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    for (const achievement of inProgressAchievements) {
      if (achievement.progress >= 100 && !achievement.achieved_at) {
        // Award the achievement
        const { error } = await supabase
          .from('user_achievements')
          .insert({
            user_id: user.id,
            achievement_type_id: achievement.id
          });

        if (!error) {
          toast({
            title: "🎉 Achievement Unlocked!",
            description: `${achievement.icon} ${achievement.name} - ${achievement.reward_points} points earned!`,
          });
        }
      }
    }

    // Reload achievements to reflect changes
    loadAchievements();
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return "bg-green-500";
    if (progress >= 75) return "bg-yellow-500";
    return "bg-blue-500";
  };

  useEffect(() => {
    loadAchievements();
  }, []);

  useEffect(() => {
    if (inProgressAchievements.length > 0) {
      checkForNewAchievements();
    }
  }, [userStats]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Achievements</h2>
        <Badge variant="outline" className="flex items-center gap-2 bg-yellow-100 text-yellow-800 border-yellow-300">
          <Trophy className="h-4 w-4" />
          {userStats.totalPoints} Points
        </Badge>
      </div>

      {/* User Stats Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Your Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{userStats.mealCount}</div>
              <div className="text-sm text-muted-foreground">Meals Logged</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{userStats.recipeCount}</div>
              <div className="text-sm text-muted-foreground">Recipes Created</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{userStats.photoCount}</div>
              <div className="text-sm text-muted-foreground">Photos Uploaded</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{userStats.nutritionDaysTracked}</div>
              <div className="text-sm text-muted-foreground">Days Tracked</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="inprogress" className="space-y-4">
        <TabsList>
          <TabsTrigger value="inprogress">In Progress</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completedAchievements.length})</TabsTrigger>
          <TabsTrigger value="all">All Achievements</TabsTrigger>
        </TabsList>

        <TabsContent value="inprogress" className="space-y-4">
          {inProgressAchievements.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <Trophy className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">All achievements completed!</h3>
                <p className="text-muted-foreground">
                  Congratulations! You've completed all available achievements.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {inProgressAchievements.map((achievement) => (
                <Card key={achievement.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">{achievement.icon}</div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{achievement.name}</h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          {achievement.description}
                        </p>
                        
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span>Progress</span>
                            <span>{achievement.progress?.toFixed(0)}%</span>
                          </div>
                          <Progress 
                            value={achievement.progress || 0} 
                            className="h-2"
                          />
                        </div>
                        
                        <div className="flex items-center justify-between mt-2">
                          <Badge variant="outline" className="text-xs">
                            <Gift className="mr-1 h-3 w-3" />
                            {achievement.reward_points} pts
                          </Badge>
                          {achievement.progress && achievement.progress >= 100 && (
                            <Badge className="text-xs bg-green-100 text-green-800">
                              Ready to claim!
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {completedAchievements.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <Target className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No achievements yet</h3>
                <p className="text-muted-foreground">
                  Start using the app to unlock your first achievement!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {completedAchievements.map((achievement) => (
                <Card key={achievement.id} className="border-green-200 bg-green-50">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">{achievement.icon}</div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-green-800">{achievement.name}</h3>
                        <p className="text-sm text-green-600 mb-2">
                          {achievement.description}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <Badge className="text-xs bg-green-600">
                            <Trophy className="mr-1 h-3 w-3" />
                            Completed
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            <Gift className="mr-1 h-3 w-3" />
                            {achievement.reward_points} pts
                          </Badge>
                        </div>
                        
                        {achievement.achieved_at && (
                          <div className="text-xs text-muted-foreground mt-2">
                            Completed on {new Date(achievement.achieved_at).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {achievements.map((achievement) => (
              <Card 
                key={achievement.id} 
                className={achievement.achieved_at ? "border-green-200 bg-green-50" : ""}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">{achievement.icon}</div>
                    <div className="flex-1">
                      <h3 className={`font-semibold ${achievement.achieved_at ? 'text-green-800' : ''}`}>
                        {achievement.name}
                      </h3>
                      <p className={`text-sm mb-2 ${achievement.achieved_at ? 'text-green-600' : 'text-muted-foreground'}`}>
                        {achievement.description}
                      </p>
                      
                      {!achievement.achieved_at && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span>Progress</span>
                            <span>{achievement.progress?.toFixed(0)}%</span>
                          </div>
                          <Progress 
                            value={achievement.progress || 0} 
                            className="h-2"
                          />
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between mt-2">
                        <Badge variant="outline" className="text-xs">
                          <Gift className="mr-1 h-3 w-3" />
                          {achievement.reward_points} pts
                        </Badge>
                        {achievement.achieved_at && (
                          <Badge className="text-xs bg-green-600">
                            <Trophy className="mr-1 h-3 w-3" />
                            Completed
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}