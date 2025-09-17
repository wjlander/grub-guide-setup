import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const FITBIT_CLIENT_ID = '23TJDY';
    const FITBIT_REDIRECT_URI = 'https://wmqfonczkedrrdnfwpfc.supabase.co/functions/v1/fitbit-oauth-callback';

    const { userId } = await req.json();
    
    if (!userId) {
      return new Response(JSON.stringify({ 
        error: 'User ID is required' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Generate state parameter for security
    const state = `${crypto.randomUUID()}_${userId}`;
    
    const authUrl = new URL('https://www.fitbit.com/oauth2/authorize');
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('client_id', FITBIT_CLIENT_ID);
    authUrl.searchParams.set('redirect_uri', FITBIT_REDIRECT_URI);
    authUrl.searchParams.set('scope', 'nutrition profile weight activity heartrate sleep');
    authUrl.searchParams.set('state', state);

    return new Response(JSON.stringify({ 
      authUrl: authUrl.toString(),
      state 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in fitbit-oauth-start:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to generate auth URL' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});