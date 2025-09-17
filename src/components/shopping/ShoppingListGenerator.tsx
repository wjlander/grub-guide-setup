import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ShoppingCart, Plus, DollarSign, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface MealPlan {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
}

interface ShoppingListItem {
  id: string;
  item_name: string;
  quantity: number;
  unit: string;
  category_id?: string;
  estimated_cost: number;
  actual_cost: number;
  is_purchased: boolean;
  category?: {
    name: string;
    sort_order: number;
  };
}

interface ShoppingCategory {
  id: string;
  name: string;
  sort_order: number;
}

export function ShoppingListGenerator() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedMealPlan, setSelectedMealPlan] = useState<string>("");
  const [listName, setListName] = useState("");
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const [shoppingLists, setShoppingLists] = useState<any[]>([]);
  const [selectedList, setSelectedList] = useState<string>("");
  const [listItems, setListItems] = useState<ShoppingListItem[]>([]);
  const [categories, setCategories] = useState<ShoppingCategory[]>([]);
  const [totalCost, setTotalCost] = useState(0);
  const { toast } = useToast();

  const loadMealPlans = async () => {
    const { data, error } = await supabase
      .from('meal_plans')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      toast({
        title: "Error",
        description: "Failed to load meal plans",
        variant: "destructive",
      });
      return;
    }
    
    setMealPlans(data || []);
  };

  const loadShoppingLists = async () => {
    const { data, error } = await supabase
      .from('shopping_lists')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      toast({
        title: "Error",
        description: "Failed to load shopping lists",
        variant: "destructive",
      });
      return;
    }
    
    setShoppingLists(data || []);
  };

  const loadCategories = async () => {
    const { data, error } = await supabase
      .from('shopping_categories')
      .select('*')
      .order('sort_order');
    
    if (error) {
      toast({
        title: "Error",
        description: "Failed to load categories",
        variant: "destructive",
      });
      return;
    }
    
    setCategories(data || []);
  };

  const loadListItems = async (listId: string) => {
    const { data, error } = await supabase
      .from('shopping_list_items')
      .select(`
        *,
        category:shopping_categories(name, sort_order)
      `)
      .eq('shopping_list_id', listId)
      .order('created_at');
    
    if (error) {
      toast({
        title: "Error",
        description: "Failed to load shopping list items",
        variant: "destructive",
      });
      return;
    }
    
    setListItems(data || []);
    
    // Calculate total cost
    const total = data?.reduce((sum, item) => sum + (item.actual_cost || item.estimated_cost || 0), 0) || 0;
    setTotalCost(total);
  };

  const generateShoppingList = async () => {
    if (!selectedMealPlan || !listName) {
      toast({
        title: "Error",
        description: "Please select a meal plan and enter a list name",
        variant: "destructive",
      });
      return;
    }

    const { data, error } = await supabase.rpc('generate_shopping_list_from_meal_plan', {
      p_meal_plan_id: selectedMealPlan,
      p_shopping_list_name: listName
    });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to generate shopping list",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Shopping list generated successfully!",
    });

    setIsOpen(false);
    setSelectedMealPlan("");
    setListName("");
    loadShoppingLists();
  };

  const toggleItemPurchased = async (itemId: string, purchased: boolean) => {
    const { error } = await supabase
      .from('shopping_list_items')
      .update({ is_purchased: purchased })
      .eq('id', itemId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update item",
        variant: "destructive",
      });
      return;
    }

    setListItems(items => 
      items.map(item => 
        item.id === itemId ? { ...item, is_purchased: purchased } : item
      )
    );
  };

  const updateItemCost = async (itemId: string, cost: number) => {
    const { error } = await supabase
      .from('shopping_list_items')
      .update({ actual_cost: cost })
      .eq('id', itemId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update cost",
        variant: "destructive",
      });
      return;
    }

    setListItems(items => 
      items.map(item => 
        item.id === itemId ? { ...item, actual_cost: cost } : item
      )
    );

    // Recalculate total
    const newTotal = listItems.reduce((sum, item) => 
      sum + (item.id === itemId ? cost : (item.actual_cost || item.estimated_cost || 0)), 0
    );
    setTotalCost(newTotal);
  };

  const groupItemsByCategory = (items: ShoppingListItem[]) => {
    const grouped = items.reduce((acc, item) => {
      const categoryName = item.category?.name || 'Uncategorized';
      const sortOrder = item.category?.sort_order || 999;
      
      if (!acc[categoryName]) {
        acc[categoryName] = { items: [], sortOrder };
      }
      acc[categoryName].items.push(item);
      return acc;
    }, {} as Record<string, { items: ShoppingListItem[], sortOrder: number }>);

    return Object.entries(grouped).sort(([,a], [,b]) => a.sortOrder - b.sortOrder);
  };

  React.useEffect(() => {
    loadMealPlans();
    loadShoppingLists();
    loadCategories();
  }, []);

  React.useEffect(() => {
    if (selectedList) {
      loadListItems(selectedList);
    }
  }, [selectedList]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Shopping Lists</h2>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Generate from Meal Plan
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Generate Shopping List</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="mealplan">Select Meal Plan</Label>
                <Select value={selectedMealPlan} onValueChange={setSelectedMealPlan}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a meal plan" />
                  </SelectTrigger>
                  <SelectContent>
                    {mealPlans.map(plan => (
                      <SelectItem key={plan.id} value={plan.id}>
                        {plan.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="listname">Shopping List Name</Label>
                <Input
                  id="listname"
                  placeholder="e.g., Weekly Groceries"
                  value={listName}
                  onChange={(e) => setListName(e.target.value)}
                />
              </div>
              
              <Button onClick={generateShoppingList} className="w-full">
                <ShoppingCart className="mr-2 h-4 w-4" />
                Generate Shopping List
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="shoppinglist">Select Shopping List</Label>
          <Select value={selectedList} onValueChange={setSelectedList}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a shopping list" />
            </SelectTrigger>
            <SelectContent>
              {shoppingLists.map(list => (
                <SelectItem key={list.id} value={list.id}>
                  {list.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedList && listItems.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Shopping List Items</CardTitle>
                <Badge variant="outline" className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Total: £{totalCost.toFixed(2)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {groupItemsByCategory(listItems).map(([categoryName, { items }]) => (
                  <div key={categoryName}>
                    <div className="flex items-center gap-2 mb-3">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <h3 className="font-semibold text-primary">{categoryName}</h3>
                      <div className="flex-1 h-px bg-border" />
                    </div>
                    
                    <div className="space-y-2 ml-6">
                      {items.map(item => (
                        <div key={item.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/30">
                          <Checkbox
                            checked={item.is_purchased}
                            onCheckedChange={(checked) => 
                              toggleItemPurchased(item.id, checked as boolean)
                            }
                          />
                          
                          <div className="flex-1">
                            <span className={`font-medium ${item.is_purchased ? 'line-through text-muted-foreground' : ''}`}>
                              {item.item_name}
                            </span>
                            <span className="text-sm text-muted-foreground ml-2">
                              {item.quantity} {item.unit}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="£0.00"
                              className="w-20 h-8"
                              value={item.actual_cost || ''}
                              onChange={(e) => 
                                updateItemCost(item.id, parseFloat(e.target.value) || 0)
                              }
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}