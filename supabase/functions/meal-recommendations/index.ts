import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function callOpenAIWithRetry(openAIApiKey: string, prompt: string, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'You are a helpful nutritionist and meal planning assistant specialized in UK cuisine and ingredients.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.7,
          max_tokens: 2000,
        }),
      });

      if (response.status === 429 && attempt < maxRetries) {
        // Rate limited, wait with exponential backoff
        const delay = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
        console.log(`Rate limited, retrying in ${delay}ms (attempt ${attempt}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      if (attempt === maxRetries) {
        throw error;
      }
      console.log(`Attempt ${attempt} failed, retrying...`, error);
    }
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const { userId, preferences = {}, mealHistory = [], nutritionalGoals = {} } = await req.json();

    console.log('Generating meal recommendations for user:', userId);

    // Create meal recommendation prompt
    const prompt = `You are a professional nutritionist and meal planning expert. Generate 3 personalized meal recommendations based on the following information:

User Preferences: ${JSON.stringify(preferences)}
Recent Meal History: ${JSON.stringify(mealHistory.slice(-10))}
Nutritional Goals: ${JSON.stringify(nutritionalGoals)}

Requirements:
1. Suggest varied meals (breakfast, lunch, dinner)
2. Consider user's dietary restrictions and preferences
3. Ensure nutritional balance based on their goals
4. Avoid recently eaten meals to provide variety
5. Include UK-available ingredients

Respond with a JSON array of exactly 3 meal suggestions, each containing:
{
  "name": "Meal name",
  "type": "breakfast/lunch/dinner",
  "description": "Brief description",
  "prepTime": number in minutes,
  "cookTime": number in minutes,
  "servings": number,
  "calories": estimated calories per serving,
  "protein": grams per serving,
  "carbs": grams per serving,
  "fat": grams per serving,
  "ingredients": ["ingredient1", "ingredient2"],
  "tags": ["dietary-tag", "cuisine-type"],
  "reason": "Why this meal is recommended for the user"
}

Ensure all meals are practical for UK cooking and shopping.`;

    const data = await callOpenAIWithRetry(openAIApiKey, prompt);
    let recommendations;

    try {
      recommendations = JSON.parse(data.choices[0].message.content);
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
      // Fallback recommendations
      recommendations = [
        {
          name: "Overnight Oats with Berries",
          type: "breakfast",
          description: "Creamy oats with fresh berries and nuts",
          prepTime: 5,
          cookTime: 0,
          servings: 1,
          calories: 350,
          protein: 12,
          carbs: 55,
          fat: 8,
          ingredients: ["rolled oats", "milk", "berries", "honey"],
          tags: ["vegetarian", "quick", "healthy"],
          reason: "Perfect for busy mornings with balanced nutrition"
        }
      ];
    }

    console.log('Generated recommendations:', recommendations);

    return new Response(JSON.stringify({ 
      success: true, 
      recommendations,
      generatedAt: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in meal-recommendations function:', error);
    
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message,
      // Provide fallback recommendations
      recommendations: [
        {
          name: "Quick Veggie Stir Fry",
          type: "dinner",
          description: "Fresh vegetables in a savory sauce",
          prepTime: 10,
          cookTime: 15,
          servings: 2,
          calories: 280,
          protein: 8,
          carbs: 35,
          fat: 12,
          ingredients: ["mixed vegetables", "soy sauce", "garlic", "ginger"],
          tags: ["vegetarian", "quick", "healthy"],
          reason: "Balanced and quick meal option"
        }
      ]
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});