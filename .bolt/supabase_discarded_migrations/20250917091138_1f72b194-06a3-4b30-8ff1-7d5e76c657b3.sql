-- Add meal_times column to recipes table
ALTER TABLE recipes ADD COLUMN meal_times text[] DEFAULT '{}';

-- Add work schedule table for user schedules
CREATE TABLE work_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  schedule jsonb NOT NULL, -- stores weekly schedule with times
  is_default boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on work_schedules
ALTER TABLE work_schedules ENABLE ROW LEVEL SECURITY;

-- Create policies for work_schedules
CREATE POLICY "Users can view their own work schedules" 
ON work_schedules 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own work schedules" 
ON work_schedules 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own work schedules" 
ON work_schedules 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own work schedules" 
ON work_schedules 
FOR DELETE 
USING (auth.uid() = user_id);

-- Make recipes, food_items, and ready_meals shared by all users
-- Update RLS policies to allow public access

-- Update recipes policies to allow public read access
DROP POLICY IF EXISTS "Users can view their own recipes" ON recipes;
CREATE POLICY "Recipes are viewable by everyone" 
ON recipes 
FOR SELECT 
USING (true);

-- Update food_items policies to allow public read access  
DROP POLICY IF EXISTS "Users can view their own food items and public ones" ON food_items;
CREATE POLICY "Food items are viewable by everyone" 
ON food_items 
FOR SELECT 
USING (true);

-- Update ready_meals policies to allow public read access
DROP POLICY IF EXISTS "Users can view their own ready meals" ON ready_meals;
CREATE POLICY "Ready meals are viewable by everyone" 
ON ready_meals 
FOR SELECT 
USING (true);

-- Allow all authenticated users to insert/update/delete recipes, food_items, and ready_meals
CREATE POLICY "Authenticated users can insert recipes" 
ON recipes 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update any recipe" 
ON recipes 
FOR UPDATE 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete any recipe" 
ON recipes 
FOR DELETE 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert food items" 
ON food_items 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update any food item" 
ON food_items 
FOR UPDATE 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete any food item" 
ON food_items 
FOR DELETE 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert ready meals" 
ON ready_meals 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update any ready meal" 
ON ready_meals 
FOR UPDATE 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete any ready meal" 
ON ready_meals 
FOR DELETE 
USING (auth.uid() IS NOT NULL);

-- Add table for shared meal plans that users can copy
CREATE TABLE shared_meal_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  original_plan_id uuid REFERENCES meal_plans(id) ON DELETE CASCADE,
  created_by uuid NOT NULL,
  title text NOT NULL,
  description text,
  weeks_count integer DEFAULT 1,
  is_public boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on shared_meal_plans
ALTER TABLE shared_meal_plans ENABLE ROW LEVEL SECURITY;

-- Create policies for shared_meal_plans
CREATE POLICY "Shared meal plans are viewable by everyone" 
ON shared_meal_plans 
FOR SELECT 
USING (is_public = true);

CREATE POLICY "Users can create shared meal plans" 
ON shared_meal_plans 
FOR INSERT 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own shared meal plans" 
ON shared_meal_plans 
FOR UPDATE 
USING (auth.uid() = created_by);

-- Add trigger to update updated_at on work_schedules
CREATE TRIGGER update_work_schedules_updated_at
BEFORE UPDATE ON work_schedules
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Add trigger to update updated_at on shared_meal_plans
CREATE TRIGGER update_shared_meal_plans_updated_at
BEFORE UPDATE ON shared_meal_plans
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();