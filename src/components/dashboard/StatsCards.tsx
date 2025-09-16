import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, ChefHat, ShoppingCart, TrendingUp } from "lucide-react";

interface StatsCardsProps {
  stats: {
    totalMeals: number;
    weeklyPlans: number;
    activeRecipes: number;
    shoppingItems: number;
  };
}

export function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="transition-all duration-300 hover:shadow-card hover:-translate-y-1">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">This Week's Meals</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalMeals}</div>
          <p className="text-xs text-muted-foreground">
            +12% from last week
          </p>
        </CardContent>
      </Card>

      <Card className="transition-all duration-300 hover:shadow-card hover:-translate-y-1">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Plans</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.weeklyPlans}</div>
          <p className="text-xs text-muted-foreground">
            2 plans this month
          </p>
        </CardContent>
      </Card>

      <Card className="transition-all duration-300 hover:shadow-card hover:-translate-y-1">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Saved Recipes</CardTitle>
          <ChefHat className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.activeRecipes}</div>
          <p className="text-xs text-muted-foreground">
            +5 new this week
          </p>
        </CardContent>
      </Card>

      <Card className="transition-all duration-300 hover:shadow-card hover:-translate-y-1">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Shopping Items</CardTitle>
          <ShoppingCart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.shoppingItems}</div>
          <p className="text-xs text-muted-foreground">
            3 items needed
          </p>
        </CardContent>
      </Card>
    </div>
  );
}