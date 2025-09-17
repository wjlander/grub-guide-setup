-- Create shopping list categories for better organization
CREATE TABLE public.shopping_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert default categories with aisle organization
INSERT INTO public.shopping_categories (name, sort_order) VALUES
  ('Produce', 1),
  ('Dairy & Eggs', 2),
  ('Meat & Seafood', 3),
  ('Bakery', 4),
  ('Pantry & Dry Goods', 5),
  ('Frozen Foods', 6),
  ('Beverages', 7),
  ('Health & Beauty', 8),
  ('Household Items', 9);

-- Add category_id to shopping_list_items
ALTER TABLE public.shopping_list_items 
ADD COLUMN category_id UUID REFERENCES public.shopping_categories(id);

-- Add cost tracking to shopping lists
ALTER TABLE public.shopping_list_items 
ADD COLUMN estimated_cost NUMERIC DEFAULT 0,
ADD COLUMN actual_cost NUMERIC DEFAULT 0;

-- Create meal plan calendar events table
CREATE TABLE public.meal_plan_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  meal_plan_id UUID REFERENCES public.meal_plans(id) ON DELETE CASCADE,
  recipe_id UUID REFERENCES public.recipes(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  date DATE NOT NULL,
  meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  start_time TIME,
  end_time TIME,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for shopping categories
ALTER TABLE public.shopping_categories ENABLE ROW LEVEL SECURITY;

-- Create policy for shopping categories (read-only for all users)
CREATE POLICY "Shopping categories are viewable by everyone" 
ON public.shopping_categories 
FOR SELECT 
USING (true);

-- Enable RLS for meal plan events
ALTER TABLE public.meal_plan_events ENABLE ROW LEVEL SECURITY;

-- Create policies for meal plan events
CREATE POLICY "Users can view their own meal plan events" 
ON public.meal_plan_events 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own meal plan events" 
ON public.meal_plan_events 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own meal plan events" 
ON public.meal_plan_events 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own meal plan events" 
ON public.meal_plan_events 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add trigger for automatic timestamp updates on meal plan events
CREATE TRIGGER update_meal_plan_events_updated_at
BEFORE UPDATE ON public.meal_plan_events
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to auto-generate shopping list from meal plan
CREATE OR REPLACE FUNCTION public.generate_shopping_list_from_meal_plan(
  p_meal_plan_id UUID,
  p_shopping_list_name TEXT DEFAULT 'Generated Shopping List'
)
RETURNS UUID AS $$
DECLARE
  v_user_id UUID;
  v_shopping_list_id UUID;
  v_ingredient RECORD;
BEGIN
  -- Get user_id from meal plan
  SELECT user_id INTO v_user_id 
  FROM meal_plans 
  WHERE id = p_meal_plan_id;
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Meal plan not found';
  END IF;
  
  -- Create new shopping list
  INSERT INTO shopping_lists (user_id, name)
  VALUES (v_user_id, p_shopping_list_name)
  RETURNING id INTO v_shopping_list_id;
  
  -- Aggregate ingredients from all meals in the meal plan
  FOR v_ingredient IN
    SELECT 
      ri.ingredient_name,
      ri.unit,
      SUM(ri.quantity * COALESCE(m.quantity, 1)) as total_quantity,
      ri.food_item_id
    FROM meals m
    JOIN recipes r ON m.recipe_id = r.id
    JOIN recipe_ingredients ri ON r.id = ri.recipe_id
    WHERE m.meal_plan_id = p_meal_plan_id
    GROUP BY ri.ingredient_name, ri.unit, ri.food_item_id
  LOOP
    -- Insert into shopping list items
    INSERT INTO shopping_list_items (
      user_id,
      shopping_list_id,
      item_name,
      quantity,
      unit,
      food_item_id
    ) VALUES (
      v_user_id,
      v_shopping_list_id,
      v_ingredient.ingredient_name,
      v_ingredient.total_quantity,
      v_ingredient.unit,
      v_ingredient.food_item_id
    );
  END LOOP;
  
  RETURN v_shopping_list_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;