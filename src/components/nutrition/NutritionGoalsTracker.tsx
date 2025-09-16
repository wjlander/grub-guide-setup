import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Target, TrendingUp, Calendar, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfDay, endOfDay } from "date-fns";

interface NutritionGoals {
  id: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sodium: number;
  sugar: number;
}

interface DailyNutrition {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sodium: number;
  sugar: number;
}

export function NutritionGoalsTracker() {
  const [goals, setGoals] = useState<NutritionGoals | null>(null);
  const [dailyNutrition, setDailyNutrition] = useState<DailyNutrition | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isGoalsDialogOpen, setIsGoalsDialogOpen] = useState(false);
  const [goalForm, setGoalForm] = useState({
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
    fiber: '',
    sodium: '',
    sugar: '',
  });

  const { toast } = useToast();

  const loadNutritionGoals = async () => {
    // For now, we'll store goals in localStorage since we don't have a goals table
    const storedGoals = localStorage.getItem('nutrition_goals');
    if (storedGoals) {
      setGoals(JSON.parse(storedGoals));
    }
  };

  const loadDailyNutrition = async () => {
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    
    const { data, error } = await supabase
      .from('nutrition_logs')
      .select('*')
      .eq('date', dateStr);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load nutrition data",
        variant: "destructive",
      });
      return;
    }

    if (data && data.length > 0) {
      // Sum up all nutrition entries for the day
      const totals = data.reduce((acc, entry) => ({
        calories: (acc.calories || 0) + (entry.calories || 0),
        protein: (acc.protein || 0) + (entry.protein || 0),
        carbs: (acc.carbs || 0) + (entry.carbs || 0),
        fat: (acc.fat || 0) + (entry.fat || 0),
        fiber: (acc.fiber || 0) + (entry.fiber || 0),
        sodium: (acc.sodium || 0) + (entry.sodium || 0),
        sugar: (acc.sugar || 0) + (entry.sugar || 0),
      }), {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        fiber: 0,
        sodium: 0,
        sugar: 0,
      });

      setDailyNutrition(totals);
    } else {
      setDailyNutrition({
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        fiber: 0,
        sodium: 0,
        sugar: 0,
      });
    }
  };

  const saveNutritionGoals = () => {
    const goalsData = {
      id: 'user_goals', // Simple ID for now
      calories: parseFloat(goalForm.calories) || 0,
      protein: parseFloat(goalForm.protein) || 0,
      carbs: parseFloat(goalForm.carbs) || 0,
      fat: parseFloat(goalForm.fat) || 0,
      fiber: parseFloat(goalForm.fiber) || 0,
      sodium: parseFloat(goalForm.sodium) || 0,
      sugar: parseFloat(goalForm.sugar) || 0,
    };

    localStorage.setItem('nutrition_goals', JSON.stringify(goalsData));
    setGoals(goalsData);
    setIsGoalsDialogOpen(false);

    toast({
      title: "Success",
      description: "Nutrition goals updated successfully!",
    });
  };

  const getProgressPercentage = (current: number, goal: number) => {
    if (goal === 0) return 0;
    return Math.min((current / goal) * 100, 100);
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return "bg-green-500";
    if (percentage >= 70) return "bg-yellow-500";
    return "bg-blue-500";
  };

  const nutritionItems = [
    { key: 'calories', label: 'Calories', unit: 'kcal', icon: '🔥' },
    { key: 'protein', label: 'Protein', unit: 'g', icon: '🥩' },
    { key: 'carbs', label: 'Carbs', unit: 'g', icon: '🍞' },
    { key: 'fat', label: 'Fat', unit: 'g', icon: '🥑' },
    { key: 'fiber', label: 'Fiber', unit: 'g', icon: '🌾' },
    { key: 'sodium', label: 'Sodium', unit: 'mg', icon: '🧂' },
    { key: 'sugar', label: 'Sugar', unit: 'g', icon: '🍯' },
  ];

  useEffect(() => {
    loadNutritionGoals();
    loadDailyNutrition();
  }, [selectedDate]);

  useEffect(() => {
    if (goals) {
      setGoalForm({
        calories: goals.calories.toString(),
        protein: goals.protein.toString(),
        carbs: goals.carbs.toString(),
        fat: goals.fat.toString(),
        fiber: goals.fiber.toString(),
        sodium: goals.sodium.toString(),
        sugar: goals.sugar.toString(),
      });
    }
  }, [goals]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Nutrition Goals & Tracking</h2>
        <div className="flex items-center gap-2">
          <Input
            type="date"
            value={format(selectedDate, 'yyyy-MM-dd')}
            onChange={(e) => setSelectedDate(new Date(e.target.value))}
            className="w-auto"
          />
          
          <Dialog open={isGoalsDialogOpen} onOpenChange={setIsGoalsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Settings className="mr-2 h-4 w-4" />
                Set Goals
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Set Nutrition Goals</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4">
                {nutritionItems.map(item => (
                  <div key={item.key}>
                    <Label htmlFor={item.key}>
                      {item.icon} {item.label} ({item.unit})
                    </Label>
                    <Input
                      id={item.key}
                      type="number"
                      placeholder="0"
                      value={goalForm[item.key as keyof typeof goalForm]}
                      onChange={(e) => setGoalForm(prev => ({
                        ...prev,
                        [item.key]: e.target.value
                      }))}
                    />
                  </div>
                ))}
              </div>
              <Button onClick={saveNutritionGoals} className="w-full">
                Save Goals
              </Button>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {!goals ? (
        <Card>
          <CardContent className="p-6 text-center">
            <Target className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Set Your Nutrition Goals</h3>
            <p className="text-muted-foreground mb-4">
              Define your daily nutrition targets to start tracking your progress
            </p>
            <Button onClick={() => setIsGoalsDialogOpen(true)}>
              <Settings className="mr-2 h-4 w-4" />
              Set Goals
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="detailed">Detailed</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {nutritionItems.slice(0, 4).map(item => {
                const current = dailyNutrition?.[item.key as keyof DailyNutrition] || 0;
                const goal = goals[item.key as keyof NutritionGoals];
                const percentage = getProgressPercentage(Number(current), Number(goal));
                
                return (
                  <Card key={item.key}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <span>{item.icon}</span>
                        {item.label}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {current.toFixed(1)}
                        <span className="text-sm font-normal text-muted-foreground">
                          /{goal} {item.unit}
                        </span>
                      </div>
                      <Progress 
                        value={percentage} 
                        className="mt-2"
                        // className={`mt-2 ${getProgressColor(percentage)}`}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        {percentage.toFixed(0)}% of goal
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Daily Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2">
                  {nutritionItems.map(item => {
                    const current = dailyNutrition?.[item.key as keyof DailyNutrition] || 0;
                    const goal = goals[item.key as keyof NutritionGoals];
                    const percentage = getProgressPercentage(Number(current), Number(goal));
                    
                    return (
                      <div key={item.key} className="flex items-center justify-between p-2 rounded bg-muted/30">
                        <div className="flex items-center gap-2">
                          <span>{item.icon}</span>
                          <span className="font-medium">{item.label}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm">
                            {current.toFixed(1)}/{goal} {item.unit}
                          </span>
                          <Badge 
                            variant={percentage >= 90 ? "default" : percentage >= 70 ? "secondary" : "outline"}
                          >
                            {percentage.toFixed(0)}%
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="detailed" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {nutritionItems.map(item => {
                const current = dailyNutrition?.[item.key as keyof DailyNutrition] || 0;
                const goal = goals[item.key as keyof NutritionGoals];
                const percentage = getProgressPercentage(Number(current), Number(goal));
                const remaining = Math.max(Number(goal) - Number(current), 0);
                
                return (
                  <Card key={item.key}>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <span>{item.icon}</span>
                        {item.label}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="text-center">
                        <div className="text-3xl font-bold">
                          {current.toFixed(1)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          of {goal} {item.unit} goal
                        </div>
                      </div>
                      
                      <Progress value={percentage} className="h-3" />
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="text-center">
                          <div className="font-semibold text-green-600">
                            {percentage.toFixed(0)}%
                          </div>
                          <div className="text-muted-foreground">Complete</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold text-orange-600">
                            {remaining.toFixed(1)} {item.unit}
                          </div>
                          <div className="text-muted-foreground">Remaining</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}