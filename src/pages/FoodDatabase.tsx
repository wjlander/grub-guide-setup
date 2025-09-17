import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { BarcodeScanner } from "@/components/barcode/BarcodeScanner";
import { useToast } from "@/hooks/use-toast";
import { OpenFoodFactsService } from "@/services/openFoodFacts";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { 
  Scan, 
  Package, 
  Plus, 
  Search,
  Apple,
  Wheat,
  Beef,
  Loader2,
  Download
} from "lucide-react";

interface FoodItem {
  id: string;
  barcode: string;
  name: string;
  brand?: string;
  calories_per_100g: number;
  protein_per_100g: number;
  carbs_per_100g: number;
  fat_per_100g: number;
  fiber_per_100g?: number;
  sugar_per_100g?: number;
  sodium_per_100g?: number;
  serving_size?: number;
  serving_unit?: string;
  image_url?: string;
  categories?: string[];
  is_public?: boolean;
}

const getCategoryIcon = (categories?: string[]) => {
  if (!categories || categories.length === 0) return Package;
  
  const category = categories[0].toLowerCase();
  if (category.includes('fruit')) return Apple;
  if (category.includes('bread') || category.includes('cereal')) return Wheat;
  if (category.includes('meat') || category.includes('fish')) return Beef;
  return Package;
};

const getPrimaryCategory = (categories?: string[]) => {
  if (!categories || categories.length === 0) return 'Food';
  return categories[0];
};

const getCategoryColor = (categories?: string[]) => {
  if (!categories || categories.length === 0) return 'bg-gray-100 text-gray-800';
  
  const category = categories[0].toLowerCase();
  switch (true) {
    case 'fruits': return Apple;
    case 'bakery': return Wheat;
    case 'meat': return Beef;
    default: return Package;
  }
};

export default function FoodDatabase() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<FoodItem[]>([]);
  const { toast } = useToast();
  const { user } = useAuth();

  const loadFoodItems = async () => {
    const { data, error } = await supabase
      .from('food_items')
      .select('*')
      .order('name');

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load food items",
        variant: "destructive",
      });
      return;
    }

    setFoodItems(data || []);
  };

  const handleBarcodeScanned = async (barcode: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to scan barcodes",
        variant: "destructive",
      });
      return;
    }

    // First check if item exists in our database
    const { data: existingItem } = await supabase
      .from('food_items')
      .select('*')
      .eq('barcode', barcode)
      .single();

    if (existingItem) {
      toast({
        title: "Food Item Found",
        description: `Found: ${existingItem.name}${existingItem.brand ? ` by ${existingItem.brand}` : ''}`,
      });
      return;
    }

    // If not found, search Open Food Facts
    setIsSearching(true);
    try {
      const foodItem = await OpenFoodFactsService.searchByBarcode(barcode);
      
      if (foodItem) {
        // Add to our database
        const success = await OpenFoodFactsService.addToDatabase(foodItem, user.id);
        
        if (success) {
          toast({
            title: "Food Item Added",
            description: `Added: ${foodItem.name}${foodItem.brand ? ` by ${foodItem.brand}` : ''} to database`,
          });
          loadFoodItems(); // Refresh the list
        } else {
          toast({
            title: "Error",
            description: "Failed to add item to database",
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Item Not Found",
          description: "This item is not in the Open Food Facts database. Would you like to add it manually?",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to search for item",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
    
    setIsScannerOpen(false);
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    
    setIsSearching(true);
    try {
      const results = await OpenFoodFactsService.searchByName(searchTerm);
      setSearchResults(results);
      
      if (results.length === 0) {
        toast({
          title: "No Results",
          description: "No food items found for your search",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to search food items",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const addSearchResultToDatabase = async (foodItem: FoodItem) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to add food items",
        variant: "destructive",
      });
      return;
    }

    const success = await OpenFoodFactsService.addToDatabase(foodItem, user.id);
    
    if (success) {
      toast({
        title: "Food Item Added",
        description: `Added: ${foodItem.name} to your database`,
      });
      loadFoodItems();
    } else {
      toast({
        title: "Error",
        description: "Failed to add item to database",
        variant: "destructive",
      });
    }
  };

  const filteredItems = foodItems.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.categories?.some(cat => cat.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const displayItems = searchResults.length > 0 ? searchResults : filteredItems;

  React.useEffect(() => {
    loadFoodItems();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Food Database</h1>
            <p className="text-muted-foreground">
              Scan barcodes or search for food items using Open Food Facts
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={() => setIsScannerOpen(true)}
              className="bg-gradient-primary"
              disabled={isSearching}
            >
              {isSearching ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Scan className="h-4 w-4 mr-2" />
              )}
              {isSearching ? "Searching..." : "Scan Barcode"}
            </Button>
            <Button variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add Manual
            </Button>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex gap-2">
            <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search food items from Open Food Facts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
            <Button 
              onClick={handleSearch}
              disabled={isSearching || !searchTerm.trim()}
            >
              {isSearching ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </Button>
          </div>
          
          {searchResults.length > 0 && (
            <div className="mt-2 flex items-center gap-2">
              <Badge variant="outline">
                {searchResults.length} results from Open Food Facts
              </Badge>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => {
                  setSearchResults([]);
                  setSearchTerm("");
                }}
              >
                Clear Results
              </Button>
            </div>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {displayItems.map((item, index) => {
            const CategoryIcon = getCategoryIcon(item.categories);
            const isSearchResult = searchResults.length > 0;
            
            return (
              <Card key={item.id || `search-${index}`} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {item.image_url && (
                        <img 
                          src={item.image_url} 
                          alt={item.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                      )}
                      <CategoryIcon className="h-5 w-5 text-primary" />
                      <div>
                        <CardTitle className="text-lg">{item.name}</CardTitle>
                        {item.brand && (
                          <p className="text-sm text-muted-foreground">{item.brand}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <Badge variant="outline">{getPrimaryCategory(item.categories)}</Badge>
                      {isSearchResult && (
                        <Badge variant="secondary" className="text-xs">
                          <Download className="h-3 w-3 mr-1" />
                          Import
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-center p-2 bg-muted rounded">
                      <p className="font-medium">{item.calories_per_100g || 0}</p>
                      <p className="text-xs text-muted-foreground">Calories</p>
                    </div>
                    <div className="text-center p-2 bg-muted rounded">
                      <p className="font-medium">{item.protein_per_100g || 0}g</p>
                      <p className="text-xs text-muted-foreground">Protein</p>
                    </div>
                    <div className="text-center p-2 bg-muted rounded">
                      <p className="font-medium">{item.carbs_per_100g || 0}g</p>
                      <p className="text-xs text-muted-foreground">Carbs</p>
                    </div>
                    <div className="text-center p-2 bg-muted rounded">
                      <p className="font-medium">{item.fat_per_100g || 0}g</p>
                      <p className="text-xs text-muted-foreground">Fat</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    {isSearchResult ? (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => addSearchResultToDatabase(item)}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Add to Database
                      </Button>
                    ) : (
                      <Button variant="outline" size="sm" className="flex-1">
                        Add to Meal
                      </Button>
                    )}
                    <Button variant="outline" size="sm" className="flex-1">
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {displayItems.length === 0 && !isSearching && (
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No food items found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm ? "Try a different search term or scan a barcode" : "Scan a barcode or search to find food items"}
            </p>
            <Button onClick={() => setIsScannerOpen(true)} className="bg-gradient-primary">
              <Scan className="h-4 w-4 mr-2" />
              Scan Barcode
            </Button>
          </div>
        )}

        {isSearching && (
          <div className="text-center py-12">
            <Loader2 className="h-12 w-12 text-primary mx-auto mb-4 animate-spin" />
            <h3 className="text-lg font-semibold mb-2">Searching Open Food Facts</h3>
            <p className="text-muted-foreground">
              Looking for food items matching your search...
            </p>
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