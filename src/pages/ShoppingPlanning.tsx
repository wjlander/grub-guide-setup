import { Header } from "@/components/layout/Header";
import { ShoppingListGenerator } from "@/components/shopping/ShoppingListGenerator";
import { MealPlanningCalendar } from "@/components/planning/MealPlanningCalendar";
import { NutritionGoalsTracker } from "@/components/nutrition/NutritionGoalsTracker";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShoppingCart, Calendar, Target } from "lucide-react";

const ShoppingPlanning = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Planning & Shopping</h1>
          <p className="text-xl text-muted-foreground">
            Plan your meals, generate shopping lists, and track your nutrition goals
          </p>
        </div>

        <Tabs defaultValue="calendar" className="space-y-8">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="calendar" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Meal Calendar
            </TabsTrigger>
            <TabsTrigger value="shopping" className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              Shopping Lists
            </TabsTrigger>
            <TabsTrigger value="nutrition" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Nutrition Goals
            </TabsTrigger>
          </TabsList>

          <TabsContent value="calendar">
            <MealPlanningCalendar />
          </TabsContent>

          <TabsContent value="shopping">
            <ShoppingListGenerator />
          </TabsContent>

          <TabsContent value="nutrition">
            <NutritionGoalsTracker />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default ShoppingPlanning;