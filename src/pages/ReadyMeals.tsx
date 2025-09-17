import { Header } from "@/components/layout/Header";
import { ReadyMealsManager } from "@/components/meals/ReadyMealsManager";

const ReadyMeals = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Ready Meals</h1>
          <p className="text-xl text-muted-foreground">
            Manage your ready-to-eat meals and track stock levels
          </p>
        </div>

        <ReadyMealsManager />
      </main>
    </div>
  );
};

export default ReadyMeals;