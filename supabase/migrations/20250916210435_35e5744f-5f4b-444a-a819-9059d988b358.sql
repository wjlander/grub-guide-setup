-- Create storage bucket for meal photos
INSERT INTO storage.buckets (id, name, public) VALUES ('meal-photos', 'meal-photos', true);

-- Create policies for meal photo uploads
CREATE POLICY "Users can view meal photos" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'meal-photos');

CREATE POLICY "Users can upload meal photos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'meal-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own meal photos" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'meal-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own meal photos" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'meal-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create meal photos table
CREATE TABLE public.meal_photos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  meal_id UUID REFERENCES public.meals(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  description TEXT,
  ai_analyzed_nutrition JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for meal photos
ALTER TABLE public.meal_photos ENABLE ROW LEVEL SECURITY;

-- Create policies for meal photos
CREATE POLICY "Users can view their own meal photos" 
ON public.meal_photos 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own meal photos" 
ON public.meal_photos 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own meal photos" 
ON public.meal_photos 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own meal photos" 
ON public.meal_photos 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create achievements system tables
CREATE TABLE public.achievement_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT,
  criteria JSONB NOT NULL,
  reward_points INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert default achievements
INSERT INTO public.achievement_types (name, description, icon, criteria, reward_points) VALUES
  ('First Meal', 'Log your first meal', '🍽️', '{"type": "meal_count", "target": 1}', 10),
  ('Cooking Streak', 'Cook meals for 7 consecutive days', '🔥', '{"type": "cooking_streak", "target": 7}', 50),
  ('Recipe Creator', 'Create your first recipe', '👨‍🍳', '{"type": "recipe_count", "target": 1}', 25),
  ('Nutrition Tracker', 'Track nutrition for 30 days', '📊', '{"type": "nutrition_days", "target": 30}', 100),
  ('Photo Logger', 'Upload 10 meal photos', '📸', '{"type": "photo_count", "target": 10}', 30),
  ('Variety Seeker', 'Try 20 different recipes', '🌈', '{"type": "unique_recipes", "target": 20}', 75),
  ('Shopping Pro', 'Complete 5 shopping lists', '🛒', '{"type": "shopping_lists", "target": 5}', 40),
  ('Meal Planner', 'Plan meals for 4 weeks', '📅', '{"type": "planning_weeks", "target": 4}', 60);

-- Create user achievements table
CREATE TABLE public.user_achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  achievement_type_id UUID REFERENCES public.achievement_types(id),
  achieved_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  progress JSONB DEFAULT '{}'::jsonb
);

-- Enable RLS for achievement tables
ALTER TABLE public.achievement_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

-- Create policies for achievements (read-only for achievement types)
CREATE POLICY "Achievement types are viewable by everyone" 
ON public.achievement_types 
FOR SELECT 
USING (true);

CREATE POLICY "Users can view their own achievements" 
ON public.user_achievements 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own achievements" 
ON public.user_achievements 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create recipe sharing and community tables
CREATE TABLE public.shared_recipes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  recipe_id UUID REFERENCES public.recipes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  is_public BOOLEAN DEFAULT true,
  featured BOOLEAN DEFAULT false,
  total_ratings INTEGER DEFAULT 0,
  average_rating NUMERIC(3,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.recipe_ratings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  shared_recipe_id UUID REFERENCES public.shared_recipes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(shared_recipe_id, user_id)
);

CREATE TABLE public.recipe_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  shared_recipe_id UUID REFERENCES public.shared_recipes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  comment TEXT NOT NULL,
  parent_comment_id UUID REFERENCES public.recipe_comments(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for community tables
ALTER TABLE public.shared_recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipe_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipe_comments ENABLE ROW LEVEL SECURITY;

-- Create policies for shared recipes
CREATE POLICY "Public shared recipes are viewable by everyone" 
ON public.shared_recipes 
FOR SELECT 
USING (is_public = true);

CREATE POLICY "Users can view their own shared recipes" 
ON public.shared_recipes 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own shared recipes" 
ON public.shared_recipes 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own shared recipes" 
ON public.shared_recipes 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create policies for recipe ratings
CREATE POLICY "Recipe ratings are viewable by everyone" 
ON public.recipe_ratings 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create recipe ratings" 
ON public.recipe_ratings 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ratings" 
ON public.recipe_ratings 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create policies for recipe comments
CREATE POLICY "Recipe comments are viewable by everyone" 
ON public.recipe_comments 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create recipe comments" 
ON public.recipe_comments 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments" 
ON public.recipe_comments 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Add triggers for automatic timestamp updates
CREATE TRIGGER update_meal_photos_updated_at
BEFORE UPDATE ON public.meal_photos
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_shared_recipes_updated_at
BEFORE UPDATE ON public.shared_recipes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_recipe_comments_updated_at
BEFORE UPDATE ON public.recipe_comments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to update recipe ratings when a new rating is added
CREATE OR REPLACE FUNCTION public.update_recipe_rating_stats()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE shared_recipes 
  SET 
    total_ratings = (
      SELECT COUNT(*) 
      FROM recipe_ratings 
      WHERE shared_recipe_id = NEW.shared_recipe_id
    ),
    average_rating = (
      SELECT AVG(rating)::numeric(3,2)
      FROM recipe_ratings 
      WHERE shared_recipe_id = NEW.shared_recipe_id
    )
  WHERE id = NEW.shared_recipe_id;
  
  RETURN NEW;
END;
$$;

-- Create trigger for rating updates
CREATE TRIGGER update_recipe_stats_on_rating
AFTER INSERT OR UPDATE OR DELETE ON public.recipe_ratings
FOR EACH ROW
EXECUTE FUNCTION public.update_recipe_rating_stats();