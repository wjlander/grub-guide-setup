import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

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
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const fitbitClientId = Deno.env.get('FITBIT_CLIENT_ID');
    const fitbitClientSecret = Deno.env.get('FITBIT_CLIENT_SECRET');

    if (!fitbitClientId || !fitbitClientSecret) {
      throw new Error('Fitbit credentials not configured');
    }

    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);
    const { userId, mealData } = await req.json();

    console.log('Logging meal to Fitbit for user:', userId);

    // Get user's Fitbit tokens
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('fitbit_access_token, fitbit_refresh_token, fitbit_user_id')
      .eq('user_id', userId)
      .single();

    if (profileError || !profile?.fitbit_access_token) {
      throw new Error('User not connected to Fitbit');
    }

    let accessToken = profile.fitbit_access_token;

    // Helper function to refresh token if needed
    const refreshToken = async () => {
      const refreshResponse = await fetch('https://api.fitbit.com/oauth2/token', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${btoa(`${fitbitClientId}:${fitbitClientSecret}`)}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: profile.fitbit_refresh_token,
        }).toString(),
      });

      if (!refreshResponse.ok) {
        throw new Error('Failed to refresh Fitbit token');
      }

      const refreshData = await refreshResponse.json();
      
      // Update tokens in database
      await supabase
        .from('profiles')
        .update({
          fitbit_access_token: refreshData.access_token,
          fitbit_refresh_token: refreshData.refresh_token,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);

      return refreshData.access_token;
    };

    // Try to log food to Fitbit
    const logFoodToFitbit = async (token: string) => {
      const fitbitFoodData = {
        foodName: mealData.name,
        brandName: mealData.brand || '',
        unitId: 147, // serving
        amount: mealData.servings || 1,
        calories: mealData.calories,
        mealTypeId: getFitbitMealTypeId(mealData.mealType),
        date: mealData.date || new Date().toISOString().split('T')[0],
      };

      const response = await fetch(`https://api.fitbit.com/1/user/${profile.fitbit_user_id}/foods/log.json`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(fitbitFoodData as any).toString(),
      });

      return response;
    };

    // First attempt with current token
    let response = await logFoodToFitbit(accessToken);

    // If token expired, refresh and try again
    if (response.status === 401) {
      console.log('Access token expired, refreshing...');
      accessToken = await refreshToken();
      response = await logFoodToFitbit(accessToken);
    }

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Fitbit API error:', errorData);
      throw new Error(`Fitbit API error: ${response.status} - ${errorData}`);
    }

    const fitbitResult = await response.json();
    console.log('Successfully logged meal to Fitbit:', fitbitResult);

    return new Response(JSON.stringify({ 
      success: true, 
      fitbitLogId: fitbitResult.foodLog?.logId,
      message: 'Meal logged to Fitbit successfully'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in fitbit-log-meal function:', error);
    
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// Helper function to map meal types to Fitbit meal type IDs
function getFitbitMealTypeId(mealType: string): number {
  const mealTypeMap: { [key: string]: number } = {
    'breakfast': 1,
    'morning-snack': 2,
    'lunch': 3,
    'afternoon-snack': 4,
    'dinner': 5,
    'evening-snack': 7,
  };
  
  return mealTypeMap[mealType] || 1; // Default to breakfast
}