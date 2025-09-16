import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Scan, Calendar, ShoppingCart } from "lucide-react";

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>Get started with common tasks</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3">
        <Button className="justify-start h-auto p-4 bg-gradient-primary hover:opacity-90 transition-opacity">
          <Plus className="mr-3 h-5 w-5" />
          <div className="text-left">
            <div className="font-semibold">Add New Meal</div>
            <div className="text-xs opacity-90">Plan today's lunch or dinner</div>
          </div>
        </Button>

        <Button variant="outline" className="justify-start h-auto p-4 border-2 hover:bg-muted/50 transition-colors">
          <Scan className="mr-3 h-5 w-5 text-primary" />
          <div className="text-left">
            <div className="font-semibold">Scan Barcode</div>
            <div className="text-xs text-muted-foreground">Add food items quickly</div>
          </div>
        </Button>

        <Button variant="outline" className="justify-start h-auto p-4 border-2 hover:bg-muted/50 transition-colors">
          <Calendar className="mr-3 h-5 w-5 text-secondary" />
          <div className="text-left">
            <div className="font-semibold">Create Meal Plan</div>
            <div className="text-xs text-muted-foreground">Plan next week's meals</div>
          </div>
        </Button>

        <Button variant="outline" className="justify-start h-auto p-4 border-2 hover:bg-muted/50 transition-colors">
          <ShoppingCart className="mr-3 h-5 w-5 text-accent" />
          <div className="text-left">
            <div className="font-semibold">Shopping List</div>
            <div className="text-xs text-muted-foreground">View or create list</div>
          </div>
        </Button>
      </CardContent>
    </Card>
  );
}