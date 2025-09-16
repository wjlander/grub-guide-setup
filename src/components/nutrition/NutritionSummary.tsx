import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

interface NutritionGoal {
  name: string;
  current: number;
  target: number;
  unit: string;
  color: string;
}

const nutritionGoals: NutritionGoal[] = [
  { name: "Calories", current: 1650, target: 2000, unit: "kcal", color: "text-primary" },
  { name: "Protein", current: 85, target: 120, unit: "g", color: "text-success" },
  { name: "Carbs", current: 180, target: 250, unit: "g", color: "text-secondary" },
  { name: "Fat", current: 52, target: 67, unit: "g", color: "text-accent" },
];

export function NutritionSummary() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Today's Nutrition</CardTitle>
        <CardDescription>Track your daily nutritional goals</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {nutritionGoals.map((goal) => {
          const percentage = Math.min((goal.current / goal.target) * 100, 100);
          const isOverTarget = goal.current > goal.target;
          
          return (
            <div key={goal.name} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm">{goal.name}</span>
                <div className="flex items-center space-x-2">
                  <span className={`text-sm font-semibold ${goal.color}`}>
                    {goal.current}{goal.unit}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    / {goal.target}{goal.unit}
                  </span>
                  {isOverTarget && (
                    <Badge variant="secondary" className="text-xs">
                      Over
                    </Badge>
                  )}
                </div>
              </div>
              <Progress 
                value={percentage} 
                className="h-2"
                // Custom color would be implemented with CSS variables or custom Progress component
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{Math.round(percentage)}% of target</span>
                <span>{goal.target - goal.current}{goal.unit} remaining</span>
              </div>
            </div>
          );
        })}
        
        <div className="pt-4 border-t">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Overall Progress</span>
            <Badge variant="outline" className="bg-success/10 text-success">
              On Track
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}