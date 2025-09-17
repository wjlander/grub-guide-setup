export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      achievement_types: {
        Row: {
          created_at: string
          criteria: Json
          description: string
          icon: string | null
          id: string
          name: string
          reward_points: number | null
        }
        Insert: {
          created_at?: string
          criteria: Json
          description: string
          icon?: string | null
          id?: string
          name: string
          reward_points?: number | null
        }
        Update: {
          created_at?: string
          criteria?: Json
          description?: string
          icon?: string | null
          id?: string
          name?: string
          reward_points?: number | null
        }
        Relationships: []
      }
      food_items: {
        Row: {
          barcode: string | null
          brand: string | null
          calories_per_100g: number | null
          carbs_per_100g: number | null
          created_at: string | null
          fat_per_100g: number | null
          fiber_per_100g: number | null
          id: string
          is_public: boolean | null
          name: string
          protein_per_100g: number | null
          serving_size: number | null
          serving_unit: string | null
          sodium_per_100g: number | null
          sugar_per_100g: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          barcode?: string | null
          brand?: string | null
          calories_per_100g?: number | null
          carbs_per_100g?: number | null
          created_at?: string | null
          fat_per_100g?: number | null
          fiber_per_100g?: number | null
          id?: string
          is_public?: boolean | null
          name: string
          protein_per_100g?: number | null
          serving_size?: number | null
          serving_unit?: string | null
          sodium_per_100g?: number | null
          sugar_per_100g?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          barcode?: string | null
          brand?: string | null
          calories_per_100g?: number | null
          carbs_per_100g?: number | null
          created_at?: string | null
          fat_per_100g?: number | null
          fiber_per_100g?: number | null
          id?: string
          is_public?: boolean | null
          name?: string
          protein_per_100g?: number | null
          serving_size?: number | null
          serving_unit?: string | null
          sodium_per_100g?: number | null
          sugar_per_100g?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      meal_photos: {
        Row: {
          ai_analyzed_nutrition: Json | null
          created_at: string
          description: string | null
          id: string
          image_url: string
          meal_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_analyzed_nutrition?: Json | null
          created_at?: string
          description?: string | null
          id?: string
          image_url: string
          meal_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_analyzed_nutrition?: Json | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string
          meal_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "meal_photos_meal_id_fkey"
            columns: ["meal_id"]
            isOneToOne: false
            referencedRelation: "meals"
            referencedColumns: ["id"]
          },
        ]
      }
      meal_plan_events: {
        Row: {
          created_at: string
          date: string
          end_time: string | null
          id: string
          meal_plan_id: string | null
          meal_type: string
          notes: string | null
          recipe_id: string | null
          start_time: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date: string
          end_time?: string | null
          id?: string
          meal_plan_id?: string | null
          meal_type: string
          notes?: string | null
          recipe_id?: string | null
          start_time?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          end_time?: string | null
          id?: string
          meal_plan_id?: string | null
          meal_type?: string
          notes?: string | null
          recipe_id?: string | null
          start_time?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "meal_plan_events_meal_plan_id_fkey"
            columns: ["meal_plan_id"]
            isOneToOne: false
            referencedRelation: "meal_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meal_plan_events_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      meal_plans: {
        Row: {
          created_at: string | null
          end_date: string
          id: string
          name: string
          start_date: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          end_date: string
          id?: string
          name: string
          start_date: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          end_date?: string
          id?: string
          name?: string
          start_date?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      meals: {
        Row: {
          created_at: string | null
          date: string
          food_item_id: string | null
          id: string
          meal_name: string | null
          meal_plan_id: string
          meal_type: string
          notes: string | null
          quantity: number | null
          rating: number | null
          recipe_id: string | null
          unit: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          date: string
          food_item_id?: string | null
          id?: string
          meal_name?: string | null
          meal_plan_id: string
          meal_type: string
          notes?: string | null
          quantity?: number | null
          rating?: number | null
          recipe_id?: string | null
          unit?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          date?: string
          food_item_id?: string | null
          id?: string
          meal_name?: string | null
          meal_plan_id?: string
          meal_type?: string
          notes?: string | null
          quantity?: number | null
          rating?: number | null
          recipe_id?: string | null
          unit?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "meals_food_item_id_fkey"
            columns: ["food_item_id"]
            isOneToOne: false
            referencedRelation: "food_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meals_meal_plan_id_fkey"
            columns: ["meal_plan_id"]
            isOneToOne: false
            referencedRelation: "meal_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meals_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      nutrition_logs: {
        Row: {
          calories: number | null
          carbs: number | null
          created_at: string | null
          date: string
          fat: number | null
          fiber: number | null
          id: string
          meal_id: string | null
          protein: number | null
          sodium: number | null
          sugar: number | null
          user_id: string
        }
        Insert: {
          calories?: number | null
          carbs?: number | null
          created_at?: string | null
          date: string
          fat?: number | null
          fiber?: number | null
          id?: string
          meal_id?: string | null
          protein?: number | null
          sodium?: number | null
          sugar?: number | null
          user_id: string
        }
        Update: {
          calories?: number | null
          carbs?: number | null
          created_at?: string | null
          date?: string
          fat?: number | null
          fiber?: number | null
          id?: string
          meal_id?: string | null
          protein?: number | null
          sodium?: number | null
          sugar?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "nutrition_logs_meal_id_fkey"
            columns: ["meal_id"]
            isOneToOne: false
            referencedRelation: "meals"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string | null
          first_name: string | null
          fitbit_access_token: string | null
          fitbit_connected_at: string | null
          fitbit_refresh_token: string | null
          fitbit_user_id: string | null
          id: string
          last_name: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          fitbit_access_token?: string | null
          fitbit_connected_at?: string | null
          fitbit_refresh_token?: string | null
          fitbit_user_id?: string | null
          id?: string
          last_name?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          fitbit_access_token?: string | null
          fitbit_connected_at?: string | null
          fitbit_refresh_token?: string | null
          fitbit_user_id?: string | null
          id?: string
          last_name?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      ready_meals: {
        Row: {
          barcode: string | null
          brand: string | null
          calories_per_serving: number | null
          carbs_per_serving: number | null
          created_at: string | null
          fat_per_serving: number | null
          id: string
          image_url: string | null
          minimum_stock: number | null
          name: string
          protein_per_serving: number | null
          serving_size: number | null
          serving_unit: string | null
          stock_quantity: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          barcode?: string | null
          brand?: string | null
          calories_per_serving?: number | null
          carbs_per_serving?: number | null
          created_at?: string | null
          fat_per_serving?: number | null
          id?: string
          image_url?: string | null
          minimum_stock?: number | null
          name: string
          protein_per_serving?: number | null
          serving_size?: number | null
          serving_unit?: string | null
          stock_quantity?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          barcode?: string | null
          brand?: string | null
          calories_per_serving?: number | null
          carbs_per_serving?: number | null
          created_at?: string | null
          fat_per_serving?: number | null
          id?: string
          image_url?: string | null
          minimum_stock?: number | null
          name?: string
          protein_per_serving?: number | null
          serving_size?: number | null
          serving_unit?: string | null
          stock_quantity?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      recipe_comments: {
        Row: {
          comment: string
          created_at: string
          id: string
          parent_comment_id: string | null
          shared_recipe_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          comment: string
          created_at?: string
          id?: string
          parent_comment_id?: string | null
          shared_recipe_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          comment?: string
          created_at?: string
          id?: string
          parent_comment_id?: string | null
          shared_recipe_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recipe_comments_parent_comment_id_fkey"
            columns: ["parent_comment_id"]
            isOneToOne: false
            referencedRelation: "recipe_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipe_comments_shared_recipe_id_fkey"
            columns: ["shared_recipe_id"]
            isOneToOne: false
            referencedRelation: "shared_recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      recipe_ingredients: {
        Row: {
          created_at: string | null
          food_item_id: string | null
          id: string
          ingredient_name: string | null
          quantity: number
          recipe_id: string
          unit: string
        }
        Insert: {
          created_at?: string | null
          food_item_id?: string | null
          id?: string
          ingredient_name?: string | null
          quantity: number
          recipe_id: string
          unit: string
        }
        Update: {
          created_at?: string | null
          food_item_id?: string | null
          id?: string
          ingredient_name?: string | null
          quantity?: number
          recipe_id?: string
          unit?: string
        }
        Relationships: [
          {
            foreignKeyName: "recipe_ingredients_food_item_id_fkey"
            columns: ["food_item_id"]
            isOneToOne: false
            referencedRelation: "food_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipe_ingredients_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      recipe_ratings: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          rating: number
          shared_recipe_id: string | null
          user_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          rating: number
          shared_recipe_id?: string | null
          user_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          rating?: number
          shared_recipe_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recipe_ratings_shared_recipe_id_fkey"
            columns: ["shared_recipe_id"]
            isOneToOne: false
            referencedRelation: "shared_recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      recipes: {
        Row: {
          cook_time: number | null
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          instructions: string | null
          meal_times: string[] | null
          name: string
          prep_time: number | null
          servings: number | null
          tags: string[] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cook_time?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          instructions?: string | null
          meal_times?: string[] | null
          name: string
          prep_time?: number | null
          servings?: number | null
          tags?: string[] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cook_time?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          instructions?: string | null
          meal_times?: string[] | null
          name?: string
          prep_time?: number | null
          servings?: number | null
          tags?: string[] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      shared_meal_plans: {
        Row: {
          created_at: string | null
          created_by: string
          description: string | null
          id: string
          is_public: boolean | null
          original_plan_id: string | null
          title: string
          updated_at: string | null
          weeks_count: number | null
        }
        Insert: {
          created_at?: string | null
          created_by: string
          description?: string | null
          id?: string
          is_public?: boolean | null
          original_plan_id?: string | null
          title: string
          updated_at?: string | null
          weeks_count?: number | null
        }
        Update: {
          created_at?: string | null
          created_by?: string
          description?: string | null
          id?: string
          is_public?: boolean | null
          original_plan_id?: string | null
          title?: string
          updated_at?: string | null
          weeks_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "shared_meal_plans_original_plan_id_fkey"
            columns: ["original_plan_id"]
            isOneToOne: false
            referencedRelation: "meal_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      shared_recipes: {
        Row: {
          average_rating: number | null
          created_at: string
          featured: boolean | null
          id: string
          is_public: boolean | null
          recipe_id: string | null
          total_ratings: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          average_rating?: number | null
          created_at?: string
          featured?: boolean | null
          id?: string
          is_public?: boolean | null
          recipe_id?: string | null
          total_ratings?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          average_rating?: number | null
          created_at?: string
          featured?: boolean | null
          id?: string
          is_public?: boolean | null
          recipe_id?: string | null
          total_ratings?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "shared_recipes_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      shopping_categories: {
        Row: {
          created_at: string
          id: string
          name: string
          sort_order: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          sort_order?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          sort_order?: number | null
        }
        Relationships: []
      }
      shopping_list_items: {
        Row: {
          actual_cost: number | null
          category_id: string | null
          created_at: string | null
          estimated_cost: number | null
          food_item_id: string | null
          id: string
          is_purchased: boolean | null
          item_name: string
          quantity: number | null
          ready_meal_id: string | null
          shopping_list_id: string
          unit: string | null
          user_id: string
        }
        Insert: {
          actual_cost?: number | null
          category_id?: string | null
          created_at?: string | null
          estimated_cost?: number | null
          food_item_id?: string | null
          id?: string
          is_purchased?: boolean | null
          item_name: string
          quantity?: number | null
          ready_meal_id?: string | null
          shopping_list_id: string
          unit?: string | null
          user_id: string
        }
        Update: {
          actual_cost?: number | null
          category_id?: string | null
          created_at?: string | null
          estimated_cost?: number | null
          food_item_id?: string | null
          id?: string
          is_purchased?: boolean | null
          item_name?: string
          quantity?: number | null
          ready_meal_id?: string | null
          shopping_list_id?: string
          unit?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "shopping_list_items_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "shopping_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shopping_list_items_food_item_id_fkey"
            columns: ["food_item_id"]
            isOneToOne: false
            referencedRelation: "food_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shopping_list_items_ready_meal_id_fkey"
            columns: ["ready_meal_id"]
            isOneToOne: false
            referencedRelation: "ready_meals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shopping_list_items_shopping_list_id_fkey"
            columns: ["shopping_list_id"]
            isOneToOne: false
            referencedRelation: "shopping_lists"
            referencedColumns: ["id"]
          },
        ]
      }
      shopping_lists: {
        Row: {
          created_at: string | null
          id: string
          name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          achieved_at: string
          achievement_type_id: string | null
          id: string
          progress: Json | null
          user_id: string
        }
        Insert: {
          achieved_at?: string
          achievement_type_id?: string | null
          id?: string
          progress?: Json | null
          user_id: string
        }
        Update: {
          achieved_at?: string
          achievement_type_id?: string | null
          id?: string
          progress?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_achievement_type_id_fkey"
            columns: ["achievement_type_id"]
            isOneToOne: false
            referencedRelation: "achievement_types"
            referencedColumns: ["id"]
          },
        ]
      }
      work_schedules: {
        Row: {
          created_at: string | null
          id: string
          is_default: boolean | null
          name: string
          schedule: Json
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          name: string
          schedule: Json
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          name?: string
          schedule?: Json
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_shopping_list_from_meal_plan: {
        Args: { p_meal_plan_id: string; p_shopping_list_name?: string }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
