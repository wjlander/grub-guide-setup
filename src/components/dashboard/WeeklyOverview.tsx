import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Users } from "lucide-react";

interface Meal {
  id: string;
  name: string;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  time: string;
  servings: number;
  prepTime: number;
  rating?: number;
}

interface DayPlan {
  date: string;
  day: string;
  meals: Meal[];
}

const weekPlan: DayPlan[] = [
  {
    date: "Mon 16",
    day: "Monday",
    meals: [
      { id: "1", name: "Overnight Oats", type: "breakfast", time: "8:00", servings: 2, prepTime: 5 },
      { id: "2", name: "Chicken Caesar Salad", type: "lunch", time: "12:30", servings: 1, prepTime: 15, rating: 5 },
      { id: "3", name: "Beef Stir Fry", type: "dinner", time: "19:00", servings: 4, prepTime: 25, rating: 4 },
    ],
  },
  {
    date: "Tue 17",
    day: "Tuesday", 
    meals: [
      { id: "4", name: "Greek Yogurt Bowl", type: "breakfast", time: "8:15", servings: 1, prepTime: 3 },
      { id: "5", name: "Tuna Sandwich", type: "lunch", time: "13:00", servings: 1, prepTime: 10 },
      { id: "6", name: "Salmon & Vegetables", type: "dinner", time: "18:30", servings: 2, prepTime: 30, rating: 5 },
    ],
  },
  {
    date: "Wed 18",
    day: "Wednesday",
    meals: [
      { id: "7", name: "Smoothie Bowl", type: "breakfast", time: "8:00", servings: 1, prepTime: 8 },
      { id: "8", name: "Soup & Bread", type: "lunch", time: "12:45", servings: 2, prepTime: 5 },
    ],
  },
];

const getMealTypeColor = (type: string) => {
  switch (type) {
    case 'breakfast': return 'bg-gradient-secondary text-secondary-foreground';
    case 'lunch': return 'bg-gradient-primary text-primary-foreground';
    case 'dinner': return 'bg-gradient-accent text-accent-foreground';
    case 'snack': return 'bg-muted text-muted-foreground';
    default: return 'bg-muted text-muted-foreground';
  }
};

export function WeeklyOverview() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>This Week's Meal Plan</CardTitle>
        <CardDescription>Your scheduled meals and preparation times</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {weekPlan.map((day) => (
            <div key={day.date} className="border rounded-lg p-4 hover:bg-muted/30 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-base">{day.date}</h4>
                <span className="text-sm text-muted-foreground">{day.meals.length} meals</span>
              </div>
              
              <div className="space-y-2">
                {day.meals.map((meal) => (
                  <div key={meal.id} className="flex items-center justify-between p-2 rounded-md hover:bg-background transition-colors">
                    <div className="flex items-center space-x-3">
                      <Badge className={`${getMealTypeColor(meal.type)} text-xs px-2 py-1`}>
                        {meal.type}
                      </Badge>
                      <div>
                        <p className="font-medium text-sm">{meal.name}</p>
                        <div className="flex items-center space-x-3 text-xs text-muted-foreground">
                          <span>{meal.time}</span>
                          <div className="flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {meal.prepTime}min
                          </div>
                          <div className="flex items-center">
                            <Users className="w-3 h-3 mr-1" />
                            {meal.servings}
                          </div>
                          {meal.rating && (
                            <div className="flex">
                              {'★'.repeat(meal.rating)}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {day.meals.length === 0 && (
                  <p className="text-sm text-muted-foreground italic">No meals planned</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}