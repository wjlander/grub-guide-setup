import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Package, Plus, Edit2, Trash2, Scan } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ReadyMeal {
  id: string;
  name: string;
  brand?: string;
  barcode?: string;
  serving_size?: number;
  serving_unit?: string;
  calories_per_serving?: number;
  protein_per_serving?: number;
  carbs_per_serving?: number;
  fat_per_serving?: number;
  stock_quantity?: number;
  minimum_stock?: number;
  image_url?: string;
}

interface ReadyMealsManagerProps {
  onAddToMeal?: (meal: ReadyMeal) => void;
}

export function ReadyMealsManager({ onAddToMeal }: ReadyMealsManagerProps) {
  const [meals, setMeals] = useState<ReadyMeal[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMeal, setEditingMeal] = useState<ReadyMeal | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState<Partial<ReadyMeal>>({
    name: '',
    brand: '',
    barcode: '',
    serving_size: 100,
    serving_unit: 'g',
    calories_per_serving: 0,
    protein_per_serving: 0,
    carbs_per_serving: 0,
    fat_per_serving: 0,
    stock_quantity: 0,
    minimum_stock: 1,
    image_url: '',
  });
  const { toast } = useToast();

  const loadMeals = async () => {
    const { data, error } = await supabase
      .from('ready_meals')
      .select('*')
      .order('name');

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load ready meals",
        variant: "destructive",
      });
      return;
    }

    setMeals(data || []);
  };

  const handleSaveMeal = async () => {
    if (!formData.name?.trim()) {
      toast({
        title: "Error",
        description: "Meal name is required",
        variant: "destructive",
      });
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to save meals",
        variant: "destructive",
      });
      return;
    }

    const mealData = {
      ...formData,
      name: formData.name!, // Assert that name exists since we validated it above
      user_id: user.id,
      updated_at: new Date().toISOString(),
    };

    let error;
    if (editingMeal) {
      ({ error } = await supabase
        .from('ready_meals')
        .update(mealData)
        .eq('id', editingMeal.id));
    } else {
      ({ error } = await supabase
        .from('ready_meals')
        .insert(mealData));
    }

    if (error) {
      toast({
        title: "Error",
        description: `Failed to ${editingMeal ? 'update' : 'create'} ready meal`,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: `Ready meal ${editingMeal ? 'updated' : 'created'} successfully!`,
    });

    setIsDialogOpen(false);
    resetForm();
    loadMeals();
  };

  const handleDeleteMeal = async (mealId: string) => {
    const { error } = await supabase
      .from('ready_meals')
      .delete()
      .eq('id', mealId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete ready meal",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Ready meal deleted successfully!",
    });

    loadMeals();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      brand: '',
      barcode: '',
      serving_size: 100,
      serving_unit: 'g',
      calories_per_serving: 0,
      protein_per_serving: 0,
      carbs_per_serving: 0,
      fat_per_serving: 0,
      stock_quantity: 0,
      minimum_stock: 1,
      image_url: '',
    });
    setEditingMeal(null);
  };

  const openEditDialog = (meal: ReadyMeal) => {
    setEditingMeal(meal);
    setFormData(meal);
    setIsDialogOpen(true);
  };

  const filteredMeals = meals.filter(meal =>
    meal.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    meal.brand?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getLowStockBadge = (meal: ReadyMeal) => {
    if (meal.stock_quantity !== undefined && meal.minimum_stock !== undefined) {
      if (meal.stock_quantity <= meal.minimum_stock) {
        return <Badge variant="destructive">Low Stock</Badge>;
      }
    }
    return null;
  };

  useEffect(() => {
    loadMeals();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Ready Meals</h2>
        <Button onClick={() => { resetForm(); setIsDialogOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          Add Ready Meal
        </Button>
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search ready meals..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredMeals.map((meal) => (
          <Card key={meal.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" />
                  <div>
                    <CardTitle className="text-lg">{meal.name}</CardTitle>
                    {meal.brand && (
                      <p className="text-sm text-muted-foreground">{meal.brand}</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-1">
                  {getLowStockBadge(meal)}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => openEditDialog(meal)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive"
                    onClick={() => handleDeleteMeal(meal.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-center p-2 bg-muted rounded">
                  <p className="font-medium">{meal.calories_per_serving || 0}</p>
                  <p className="text-xs text-muted-foreground">Calories</p>
                </div>
                <div className="text-center p-2 bg-muted rounded">
                  <p className="font-medium">{meal.protein_per_serving || 0}g</p>
                  <p className="text-xs text-muted-foreground">Protein</p>
                </div>
                <div className="text-center p-2 bg-muted rounded">
                  <p className="font-medium">{meal.carbs_per_serving || 0}g</p>
                  <p className="text-xs text-muted-foreground">Carbs</p>
                </div>
                <div className="text-center p-2 bg-muted rounded">
                  <p className="font-medium">{meal.fat_per_serving || 0}g</p>
                  <p className="text-xs text-muted-foreground">Fat</p>
                </div>
              </div>
              
              {meal.stock_quantity !== undefined && (
                <div className="text-sm">
                  <span className="font-medium">Stock: </span>
                  <span className={meal.stock_quantity <= (meal.minimum_stock || 1) ? 'text-destructive' : ''}>
                    {meal.stock_quantity} units
                  </span>
                </div>
              )}
              
              <div className="flex gap-2">
                {onAddToMeal && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => onAddToMeal(meal)}
                  >
                    Add to Meal
                  </Button>
                )}
                <Button variant="outline" size="sm" className="flex-1">
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingMeal ? 'Edit' : 'Add'} Ready Meal
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 max-h-96 overflow-y-auto">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="meal_name">Meal Name *</Label>
                <Input
                  id="meal_name"
                  placeholder="e.g., Chicken Tikka Masala"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="brand">Brand</Label>
                <Input
                  id="brand"
                  placeholder="e.g., Ready Chef"
                  value={formData.brand}
                  onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="barcode">Barcode</Label>
                <Input
                  id="barcode"
                  placeholder="1234567890123"
                  value={formData.barcode}
                  onChange={(e) => setFormData(prev => ({ ...prev, barcode: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="serving_size">Serving Size</Label>
                <div className="flex gap-2">
                  <Input
                    id="serving_size"
                    type="number"
                    value={formData.serving_size}
                    onChange={(e) => setFormData(prev => ({ ...prev, serving_size: parseInt(e.target.value) || 0 }))}
                  />
                  <Input
                    value={formData.serving_unit}
                    onChange={(e) => setFormData(prev => ({ ...prev, serving_unit: e.target.value }))}
                    className="w-20"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="calories">Calories per Serving</Label>
                <Input
                  id="calories"
                  type="number"
                  value={formData.calories_per_serving}
                  onChange={(e) => setFormData(prev => ({ ...prev, calories_per_serving: parseInt(e.target.value) || 0 }))}
                />
              </div>
              <div>
                <Label htmlFor="protein">Protein (g)</Label>
                <Input
                  id="protein"
                  type="number"
                  step="0.1"
                  value={formData.protein_per_serving}
                  onChange={(e) => setFormData(prev => ({ ...prev, protein_per_serving: parseFloat(e.target.value) || 0 }))}
                />
              </div>
              <div>
                <Label htmlFor="carbs">Carbs (g)</Label>
                <Input
                  id="carbs"
                  type="number"
                  step="0.1"
                  value={formData.carbs_per_serving}
                  onChange={(e) => setFormData(prev => ({ ...prev, carbs_per_serving: parseFloat(e.target.value) || 0 }))}
                />
              </div>
              <div>
                <Label htmlFor="fat">Fat (g)</Label>
                <Input
                  id="fat"
                  type="number"
                  step="0.1"
                  value={formData.fat_per_serving}
                  onChange={(e) => setFormData(prev => ({ ...prev, fat_per_serving: parseFloat(e.target.value) || 0 }))}
                />
              </div>
              
              <div>
                <Label htmlFor="stock">Stock Quantity</Label>
                <Input
                  id="stock"
                  type="number"
                  value={formData.stock_quantity}
                  onChange={(e) => setFormData(prev => ({ ...prev, stock_quantity: parseInt(e.target.value) || 0 }))}
                />
              </div>
              <div>
                <Label htmlFor="min_stock">Minimum Stock</Label>
                <Input
                  id="min_stock"
                  type="number"
                  value={formData.minimum_stock}
                  onChange={(e) => setFormData(prev => ({ ...prev, minimum_stock: parseInt(e.target.value) || 1 }))}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="image_url">Image URL</Label>
              <Input
                id="image_url"
                placeholder="https://example.com/meal-image.jpg"
                value={formData.image_url}
                onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
              />
            </div>

            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveMeal}>
                {editingMeal ? 'Update' : 'Create'} Meal
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}