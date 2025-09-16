import { Header } from "@/components/layout/Header";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { WeeklyOverview } from "@/components/dashboard/WeeklyOverview";
import { NutritionSummary } from "@/components/nutrition/NutritionSummary";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Star, TrendingUp } from "lucide-react";
import heroImage from "@/assets/hero-image.jpg";

const Index = () => {
  const stats = {
    totalMeals: 18,
    weeklyPlans: 3,
    activeRecipes: 42,
    shoppingItems: 7,
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-hero">
        <div className="absolute inset-0 bg-black/20" />
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="relative container mx-auto px-4 py-24 text-center">
          <h1 className="text-5xl font-bold text-white mb-6 leading-tight">
            Plan, Cook, Enjoy
            <br />
            <span className="text-primary-glow">Your Perfect Meals</span>
          </h1>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Discover, plan, and track your meals with our comprehensive UK meal planning app. 
            From barcode scanning to nutrition tracking, we've got your food journey covered.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-primary hover:bg-white/90 shadow-lg">
              <Calendar className="mr-2 h-5 w-5" />
              Start Meal Planning
            </Button>
            <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
              Explore Recipes
            </Button>
          </div>
        </div>
      </section>

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Stats Overview */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold">Dashboard Overview</h2>
            <Badge variant="outline" className="flex items-center gap-2 bg-success/10 text-success border-success/20">
              <TrendingUp className="h-4 w-4" />
              Improving
            </Badge>
          </div>
          <StatsCards stats={stats} />
        </section>

        {/* Main Content Grid */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            <WeeklyOverview />
            
            {/* Recent Activity */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4">Recent Activity</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/30">
                    <div className="h-10 w-10 rounded-full bg-gradient-primary flex items-center justify-center">
                      <Star className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Rated "Salmon & Vegetables" ⭐⭐⭐⭐⭐</p>
                      <p className="text-sm text-muted-foreground">2 hours ago</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/30">
                    <div className="h-10 w-10 rounded-full bg-gradient-secondary flex items-center justify-center">
                      <Clock className="h-5 w-5 text-secondary-foreground" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Added "Quick Chicken Curry" to recipes</p>
                      <p className="text-sm text-muted-foreground">Yesterday</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/30">
                    <div className="h-10 w-10 rounded-full bg-gradient-accent flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-accent-foreground" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Completed weekly meal plan</p>
                      <p className="text-sm text-muted-foreground">2 days ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            <QuickActions />
            <NutritionSummary />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
