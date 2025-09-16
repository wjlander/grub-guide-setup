import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { BarcodeScanner } from "@/components/barcode/BarcodeScanner";
import { useToast } from "@/hooks/use-toast";
import { 
  Scan, 
  Package, 
  Plus, 
  Search,
  Apple,
  Wheat,
  Beef
} from "lucide-react";

interface FoodItem {
  id: string;
  barcode: string;
  name: string;
  brand?: string;
  category: string;
  calories_per_100g: number;
  protein_per_100g: number;
  carbs_per_100g: number;
  fat_per_100g: number;
}

const mockFoodDatabase: Record<string, FoodItem> = {
  "1234567890123": {
    id: "1",
    barcode: "1234567890123",
    name: "Organic Bananas",
    brand: "Fresh & Best",
    category: "Fruits",
    calories_per_100g: 89,
    protein_per_100g: 1.1,
    carbs_per_100g: 23,
    fat_per_100g: 0.3,
  },
  "9876543210987": {
    id: "2", 
    barcode: "9876543210987",
    name: "Whole Wheat Bread",
    brand: "Baker's Choice",
    category: "Bakery",
    calories_per_100g: 247,
    protein_per_100g: 13,
    carbs_per_100g: 41,
    fat_per_100g: 4.2,
  },
};

const getCategoryIcon = (category: string) => {
  switch (category.toLowerCase()) {
    case 'fruits': return Apple;
    case 'bakery': return Wheat;
    case 'meat': return Beef;
    default: return Package;
  }
};

export default function FoodDatabase() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [foodItems, setFoodItems] = useState<FoodItem[]>(Object.values(mockFoodDatabase));
  const { toast } = useToast();

  const handleBarcodeScanned = (barcode: string) => {
    const foodItem = mockFoodDatabase[barcode];
    
    if (foodItem) {
      toast({
        title: "Food Item Found",
        description: `Found: ${foodItem.name} by ${foodItem.brand}`,
      });
      // In a real app, you'd add this to the user's food log or meal plan
    } else {
      toast({
        title: "Item Not Found",
        description: "This item is not in our database. Would you like to add it manually?",
        variant: "destructive",
      });
    }
    
    setIsScannerOpen(false);
  };

  const filteredItems = foodItems.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Food Database</h1>
            <p className="text-muted-foreground">
              Scan barcodes or search for food items
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={() => setIsScannerOpen(true)}
              className="bg-gradient-primary"
            >
              <Scan className="h-4 w-4 mr-2" />
              Scan Barcode
            </Button>
            <Button variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add Manual
            </Button>
          </div>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search food items, brands, or categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredItems.map((item) => {
            const CategoryIcon = getCategoryIcon(item.category);
            
            return (
              <Card key={item.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <CategoryIcon className="h-5 w-5 text-primary" />
                      <div>
                        <CardTitle className="text-lg">{item.name}</CardTitle>
                        {item.brand && (
                          <p className="text-sm text-muted-foreground">{item.brand}</p>
                        )}
                      </div>
                    </div>
                    <Badge variant="outline">{item.category}</Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-center p-2 bg-muted rounded">
                      <p className="font-medium">{item.calories_per_100g}</p>
                      <p className="text-xs text-muted-foreground">Calories</p>
                    </div>
                    <div className="text-center p-2 bg-muted rounded">
                      <p className="font-medium">{item.protein_per_100g}g</p>
                      <p className="text-xs text-muted-foreground">Protein</p>
                    </div>
                    <div className="text-center p-2 bg-muted rounded">
                      <p className="font-medium">{item.carbs_per_100g}g</p>
                      <p className="text-xs text-muted-foreground">Carbs</p>
                    </div>
                    <div className="text-center p-2 bg-muted rounded">
                      <p className="font-medium">{item.fat_per_100g}g</p>
                      <p className="text-xs text-muted-foreground">Fat</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      Add to Meal
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No food items found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search or scan a barcode to add new items
            </p>
            <Button onClick={() => setIsScannerOpen(true)} className="bg-gradient-primary">
              <Scan className="h-4 w-4 mr-2" />
              Scan Barcode
            </Button>
          </div>
        )}

        <BarcodeScanner
          isOpen={isScannerOpen}
          onClose={() => setIsScannerOpen(false)}
          onBarcodeScanned={handleBarcodeScanned}
        />
      </main>
    </div>
  );
}