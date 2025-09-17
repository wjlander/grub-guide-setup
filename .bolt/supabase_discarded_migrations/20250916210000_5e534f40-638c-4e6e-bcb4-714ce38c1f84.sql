-- Fix the function security issue by setting search_path
CREATE OR REPLACE FUNCTION public.generate_shopping_list_from_meal_plan(
  p_meal_plan_id UUID,
  p_shopping_list_name TEXT DEFAULT 'Generated Shopping List'
)
RETURNS UUID 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;