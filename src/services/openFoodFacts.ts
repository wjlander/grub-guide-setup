interface OpenFoodFactsProduct {
  code: string;
  product: {
    product_name?: string;
    brands?: string;
    nutriments?: {
      'energy-kcal_100g'?: number;
      'proteins_100g'?: number;
      'carbohydrates_100g'?: number;
      'fat_100g'?: number;
      'fiber_100g'?: number;
      'sugars_100g'?: number;
      'sodium_100g'?: number;
    };
    serving_size?: string;
    image_url?: string;
    categories?: string;
  };
  status: number;
  status_verbose: string;
}

interface FoodItem {
  barcode: string;
  name: string;
  brand?: string;
  calories_per_100g?: number;
  protein_per_100g?: number;
  carbs_per_100g?: number;
  fat_per_100g?: number;
  fiber_per_100g?: number;
  sugar_per_100g?: number;
  sodium_per_100g?: number;
  serving_size?: number;
  serving_unit?: string;
  image_url?: string;
  categories?: string[];
}

export class OpenFoodFactsService {
  private static readonly BASE_URL = 'https://world.openfoodfacts.org/api/v2';
  
  static async searchByBarcode(barcode: string): Promise<FoodItem | null> {
    try {
      const response = await fetch(`${this.BASE_URL}/product/${barcode}.json`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: OpenFoodFactsProduct = await response.json();
      
      if (data.status === 0) {
        return null; // Product not found
      }
      
      return this.transformProduct(data);
    } catch (error) {
      console.error('Error fetching product from Open Food Facts:', error);
      return null;
    }
  }
  
  static async searchByName(query: string, page = 1, pageSize = 20): Promise<FoodItem[]> {
    try {
      const response = await fetch(
        `${this.BASE_URL}/search?search_terms=${encodeURIComponent(query)}&page=${page}&page_size=${pageSize}&json=true`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.products) {
        return [];
      }
      
      return data.products
        .map((product: any) => this.transformProduct({ product, status: 1, status_verbose: 'found', code: product.code }))
        .filter((item: FoodItem | null) => item !== null) as FoodItem[];
    } catch (error) {
      console.error('Error searching products from Open Food Facts:', error);
      return [];
    }
  }
  
  private static transformProduct(data: OpenFoodFactsProduct): FoodItem | null {
    const { product } = data;
    
    if (!product.product_name) {
      return null;
    }
    
    // Parse serving size
    let servingSize: number | undefined;
    let servingUnit = 'g';
    
    if (product.serving_size) {
      const match = product.serving_size.match(/(\d+(?:\.\d+)?)\s*([a-zA-Z]+)?/);
      if (match) {
        servingSize = parseFloat(match[1]);
        servingUnit = match[2] || 'g';
      }
    }
    
    // Parse categories
    const categories = product.categories 
      ? product.categories.split(',').map(cat => cat.trim()).slice(0, 3)
      : [];
    
    return {
      barcode: data.code,
      name: product.product_name,
      brand: product.brands,
      calories_per_100g: product.nutriments?.['energy-kcal_100g'],
      protein_per_100g: product.nutriments?.['proteins_100g'],
      carbs_per_100g: product.nutriments?.['carbohydrates_100g'],
      fat_per_100g: product.nutriments?.['fat_100g'],
      fiber_per_100g: product.nutriments?.['fiber_100g'],
      sugar_per_100g: product.nutriments?.['sugars_100g'],
      sodium_per_100g: product.nutriments?.['sodium_100g'] ? product.nutriments['sodium_100g'] * 1000 : undefined, // Convert g to mg
      serving_size: servingSize,
      serving_unit: servingUnit,
      image_url: product.image_url,
      categories,
    };
  }
  
  static async addToDatabase(foodItem: FoodItem, userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('food_items')
        .insert({
          user_id: userId,
          name: foodItem.name,
          brand: foodItem.brand,
          barcode: foodItem.barcode,
          calories_per_100g: foodItem.calories_per_100g,
          protein_per_100g: foodItem.protein_per_100g,
          carbs_per_100g: foodItem.carbs_per_100g,
          fat_per_100g: foodItem.fat_per_100g,
          fiber_per_100g: foodItem.fiber_per_100g,
          sugar_per_100g: foodItem.sugar_per_100g,
          sodium_per_100g: foodItem.sodium_per_100g,
          serving_size: foodItem.serving_size,
          serving_unit: foodItem.serving_unit,
          is_public: true, // Make imported items public by default
        });
      
      if (error) {
        console.error('Error adding food item to database:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error adding food item to database:', error);
      return false;
    }
  }
}

export default OpenFoodFactsService;