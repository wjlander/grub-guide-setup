import { Header } from "@/components/layout/Header";
import { ShoppingListGenerator } from "@/components/shopping/ShoppingListGenerator";
import { MealPlanningCalendar } from "@/components/planning/MealPlanningCalendar";
import { NutritionGoalsTracker } from "@/components/nutrition/NutritionGoalsTracker";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShoppingCart, Calendar, Target, Clock, Copy } from "lucide-react";
import { WorkScheduleManager } from "@/components/planning/WorkScheduleManager";

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
          <TabsList className="grid w-full grid-cols-5">
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
            <TabsTrigger value="schedules" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Work Schedules
            </TabsTrigger>
            <TabsTrigger value="shared" className="flex items-center gap-2">
              <Copy className="h-4 w-4" />
              Shared Plans
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

          <TabsContent value="schedules">
            <WorkScheduleManager />
          </TabsContent>

          <TabsContent value="shared">
            <div className="text-center py-12">
              <Copy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Shared Meal Plans</h3>
              <p className="text-muted-foreground">
                Browse and copy meal plans shared by other users
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default ShoppingPlanning;