import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

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
    // Get environment variables
    const FITBIT_CLIENT_ID = '23TJDY';
    const FITBIT_REDIRECT_URI = 'https://wmqfonczkedrrdnfwpfc.supabase.co/functions/v1/fitbit-oauth-callback';
    const SUPABASE_URL = 'https://wmqfonczkedrrdnfwpfc.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndtcWZvbmN6a2VkcnJkbmZ3cGZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwMzg3NTUsImV4cCI6MjA3MzYxNDc1NX0.5IagPSXfCArWiS-ySfwbZ6Bp_FH3RQSKjSEpkWslokA';

    // Get user ID from authorization header or request body
    let userId;
    
    // Try to get user from auth header first
    const authHeader = req.headers.get('authorization');
    if (authHeader) {
      const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      const { data: { user }, error } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
      if (user) {
        userId = user.id;
      }
    }
    
    // If no auth header, try to get from request body
    if (!userId) {
      try {
        const body = await req.json();
        userId = body.userId;
      } catch (e) {
        // If no body, generate a temporary state
        userId = 'temp_' + crypto.randomUUID();
      }
    }
    
    if (!userId) {
      return new Response(JSON.stringify({ 
        error: 'Authentication required' 
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
      error: error.message || 'Failed to generate auth URL' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});