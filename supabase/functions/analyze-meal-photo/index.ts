import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not set');
    }

    const { imageUrl, description } = await req.json();

    if (!imageUrl) {
      return new Response(
        JSON.stringify({ 
          error: "Missing required field: imageUrl is required" 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    console.log("Analyzing meal photo:", imageUrl);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a nutrition expert analyzing meal photos. Analyze the image and provide nutritional estimates in JSON format. Return only valid JSON with the following structure:
            {
              "estimatedNutrition": {
                "calories": number,
                "protein": number,
                "carbs": number,
                "fat": number,
                "fiber": number,
                "sodium": number,
                "sugar": number
              },
              "identifiedFoods": ["food1", "food2"],
              "portionSize": "description",
              "confidence": "high|medium|low",
              "notes": "additional observations"
            }`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Analyze this meal photo and provide nutritional estimates. ${description ? `Additional context: ${description}` : ''}`
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageUrl
                }
              }
            ]
          }
        ],
        max_tokens: 500,
        temperature: 0.3
      }),
    });

    const data = await response.json();
    console.log("OpenAI response:", data);

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const analysisText = data.choices[0].message.content;
    console.log("Analysis text:", analysisText);

    try {
      // Parse the JSON response from OpenAI
      const analysis = JSON.parse(analysisText);
      
      return new Response(JSON.stringify({ 
        success: true,
        analysis 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    } catch (parseError) {
      console.error("Error parsing OpenAI response:", parseError);
      
      // Fallback: return basic analysis structure
      return new Response(JSON.stringify({ 
        success: true,
        analysis: {
          estimatedNutrition: {
            calories: 0,
            protein: 0,
            carbs: 0,
            fat: 0,
            fiber: 0,
            sodium: 0,
            sugar: 0
          },
          identifiedFoods: ["Unknown food items"],
          portionSize: "Unable to estimate",
          confidence: "low",
          notes: "Analysis could not be completed due to parsing error"
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

  } catch (error) {
    console.error('Error in analyze-meal-photo function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});