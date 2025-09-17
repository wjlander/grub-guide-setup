-- Add user_id foreign key to shared_recipes to link to profiles
ALTER TABLE public.shared_recipes 
ADD CONSTRAINT shared_recipes_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add user_id foreign key to recipe_comments to link to profiles  
ALTER TABLE public.recipe_comments 
ADD CONSTRAINT recipe_comments_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add user_id foreign key to recipe_ratings to link to profiles
ALTER TABLE public.recipe_ratings 
ADD CONSTRAINT recipe_ratings_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;