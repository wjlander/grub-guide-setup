import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Plus, Edit2, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format, addDays, startOfWeek, isSameDay } from "date-fns";

interface MealPlanEvent {
  id: string;
  title: string;
  date: string;
  meal_type: string;
  start_time?: string;
  end_time?: string;
  notes?: string;
  recipe_id?: string;
  recipe?: {
    name: string;
    prep_time?: number;
    cook_time?: number;
  };
}

interface Recipe {
  id: string;
  name: string;
  prep_time?: number;
  cook_time?: number;
}

const MEAL_TYPES = [
  { value: 'breakfast', label: 'Breakfast', color: 'bg-orange-100 text-orange-800' },
  { value: 'lunch', label: 'Lunch', color: 'bg-green-100 text-green-800' },
  { value: 'dinner', label: 'Dinner', color: 'bg-blue-100 text-blue-800' },
  { value: 'snack', label: 'Snack', color: 'bg-purple-100 text-purple-800' },
];

export function MealPlanningCalendar() {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [events, setEvents] = useState<MealPlanEvent[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<MealPlanEvent | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    meal_type: '',
    start_time: '',
    end_time: '',
    notes: '',
    recipe_id: '',
  });

  const { toast } = useToast();

  const weekDays = Array.from({ length: 7 }, (_, i) => 
    addDays(startOfWeek(currentWeek, { weekStartsOn: 1 }), i)
  );

  const loadEvents = async () => {
    const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
    const weekEnd = addDays(weekStart, 6);

    const { data, error } = await supabase
      .from('meal_plan_events')
      .select(`
        *,
        recipe:recipes(name, prep_time, cook_time)
      `)
      .gte('date', format(weekStart, 'yyyy-MM-dd'))
      .lte('date', format(weekEnd, 'yyyy-MM-dd'))
      .order('date')
      .order('start_time');

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load meal events",
        variant: "destructive",
      });
      return;
    }

    setEvents(data || []);
  };

  const loadRecipes = async () => {
    const { data, error } = await supabase
      .from('recipes')
      .select('id, name, prep_time, cook_time')
      .order('name');

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load recipes",
        variant: "destructive",
      });
      return;
    }

    setRecipes(data || []);
  };

  const handleSaveEvent = async () => {
    if (!formData.title || !formData.meal_type || !selectedDate) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to create meal events",
        variant: "destructive",
      });
      return;
    }

    const eventData = {
      user_id: user.id,
      title: formData.title,
      date: format(selectedDate, 'yyyy-MM-dd'),
      meal_type: formData.meal_type,
      start_time: formData.start_time || null,
      end_time: formData.end_time || null,
      notes: formData.notes || null,
      recipe_id: formData.recipe_id === 'no-recipe' ? null : formData.recipe_id || null,
    };

    let error;
    if (editingEvent) {
      ({ error } = await supabase
        .from('meal_plan_events')
        .update(eventData)
        .eq('id', editingEvent.id));
    } else {
      ({ error } = await supabase
        .from('meal_plan_events')
        .insert(eventData));
    }

    if (error) {
      toast({
        title: "Error",
        description: `Failed to ${editingEvent ? 'update' : 'create'} meal event`,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: `Meal event ${editingEvent ? 'updated' : 'created'} successfully!`,
    });

    setIsDialogOpen(false);
    resetForm();
    loadEvents();
  };

  const handleDeleteEvent = async (eventId: string) => {
    const { error } = await supabase
      .from('meal_plan_events')
      .delete()
      .eq('id', eventId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete meal event",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Meal event deleted successfully!",
    });

    loadEvents();
  };

  const resetForm = () => {
    setFormData({
      title: '',
      meal_type: '',
      start_time: '',
      end_time: '',
      notes: '',
      recipe_id: 'no-recipe',
    });
    setEditingEvent(null);
    setSelectedDate(null);
  };

  const openEditDialog = (event: MealPlanEvent) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      meal_type: event.meal_type,
      start_time: event.start_time || '',
      end_time: event.end_time || '',
      notes: event.notes || '',
      recipe_id: event.recipe_id || 'no-recipe',
    });
    setSelectedDate(new Date(event.date));
    setIsDialogOpen(true);
  };

  const openCreateDialog = (date: Date) => {
    resetForm();
    setSelectedDate(date);
    setIsDialogOpen(true);
  };

  const getEventsForDate = (date: Date) => {
    return events.filter(event => isSameDay(new Date(event.date), date));
  };

  const getMealTypeColor = (mealType: string) => {
    return MEAL_TYPES.find(type => type.value === mealType)?.color || 'bg-gray-100 text-gray-800';
  };

  useEffect(() => {
    loadEvents();
    loadRecipes();
  }, [currentWeek]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Meal Planning Calendar</h2>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={() => setCurrentWeek(addDays(currentWeek, -7))}
          >
            Previous Week
          </Button>
          <Button 
            variant="outline"
            onClick={() => setCurrentWeek(new Date())}
          >
            This Week
          </Button>
          <Button 
            variant="outline"
            onClick={() => setCurrentWeek(addDays(currentWeek, 7))}
          >
            Next Week
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-4">
        {weekDays.map((date) => {
          const dayEvents = getEventsForDate(date);
          
          return (
            <Card key={date.toISOString()} className="min-h-[300px]">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">
                    {format(date, 'EEE dd/MM')}
                  </CardTitle>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => openCreateDialog(date)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {dayEvents.map((event) => (
                  <div
                    key={event.id}
                    className="p-2 rounded-md bg-muted/30 group hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <Badge variant="secondary" className={getMealTypeColor(event.meal_type)}>
                        {MEAL_TYPES.find(t => t.value === event.meal_type)?.label}
                      </Badge>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0"
                          onClick={() => openEditDialog(event)}
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0 text-destructive"
                          onClick={() => handleDeleteEvent(event.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    
                    <h4 className="font-medium text-sm">{event.title}</h4>
                    
                    {event.start_time && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {event.start_time}
                        {event.end_time && ` - ${event.end_time}`}
                      </div>
                    )}
                    
                    {event.recipe && (
                      <div className="text-xs text-primary">
                        Recipe: {event.recipe.name}
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingEvent ? 'Edit' : 'Add'} Meal Event
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Meal Title *</Label>
              <Input
                id="title"
                placeholder="e.g., Grilled Chicken Salad"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="meal_type">Meal Type *</Label>
              <Select 
                value={formData.meal_type} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, meal_type: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select meal type" />
                </SelectTrigger>
                <SelectContent>
                  {MEAL_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="recipe">Recipe (Optional)</Label>
              <Select 
                value={formData.recipe_id} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, recipe_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a recipe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no-recipe">No recipe</SelectItem>
                  {recipes.map(recipe => (
                    <SelectItem key={recipe.id} value={recipe.id}>
                      {recipe.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="start_time">Start Time</Label>
                <Input
                  id="start_time"
                  type="time"
                  value={formData.start_time}
                  onChange={(e) => setFormData(prev => ({ ...prev, start_time: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="end_time">End Time</Label>
                <Input
                  id="end_time"
                  type="time"
                  value={formData.end_time}
                  onChange={(e) => setFormData(prev => ({ ...prev, end_time: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Additional notes..."
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSaveEvent} className="flex-1">
                {editingEvent ? 'Update' : 'Create'} Event
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}