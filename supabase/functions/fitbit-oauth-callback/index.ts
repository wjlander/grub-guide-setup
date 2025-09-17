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
    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    const error = url.searchParams.get('error');

    if (error) {
      return new Response(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Fitbit Connection Failed</title>
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
            .error { color: #dc2626; }
          </style>
        </head>
        <body>
          <h1 class="error">Connection Failed</h1>
          <p>Failed to connect to Fitbit: ${error}</p>
          <script>
            setTimeout(() => window.close(), 3000);
          </script>
        </body>
        </html>
      `, {
        headers: { 'Content-Type': 'text/html' },
      });
    }

    if (!code) {
      throw new Error('No authorization code received');
    }

    const FITBIT_CLIENT_ID = '23TJDY';
    const FITBIT_CLIENT_SECRET = '5a1bd13b96df8b06ae0e0b2c0954f01d';
    const FITBIT_REDIRECT_URI = 'https://wmqfonczkedrrdnfwpfc.supabase.co/functions/v1/fitbit-oauth-callback';
    const SUPABASE_URL = 'https://wmqfonczkedrrdnfwpfc.supabase.co';
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Missing Supabase service role key');
    }

    // Extract user ID from state parameter
    const userId = state?.split('_').pop();
    if (!userId) {
      throw new Error('User ID not found in state parameter');
    }

    // Exchange code for tokens
    const tokenResponse = await fetch('https://api.fitbit.com/oauth2/token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`${FITBIT_CLIENT_ID}:${FITBIT_CLIENT_SECRET}`)}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: FITBIT_CLIENT_ID,
        grant_type: 'authorization_code',
        redirect_uri: FITBIT_REDIRECT_URI,
        code: code,
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      throw new Error(`Token exchange failed: ${errorText}`);
    }

    const tokenData = await tokenResponse.json();

    // Get user info from Fitbit
    const userResponse = await fetch('https://api.fitbit.com/1/user/-/profile.json', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
      },
    });

    if (!userResponse.ok) {
      throw new Error('Failed to get Fitbit user profile');
    }

    const userData = await userResponse.json();

    // Create Supabase client with service role
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Store tokens in user profile
    const { error: updateError } = await supabase
      .from('profiles')
      .upsert({
        user_id: userId,
        fitbit_access_token: tokenData.access_token,
        fitbit_refresh_token: tokenData.refresh_token,
        fitbit_user_id: userData.user.encodedId,
        fitbit_connected_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

    if (updateError) {
      throw updateError;
    }

    // Return success page
    return new Response(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Fitbit Connected Successfully</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            text-align: center; 
            padding: 50px; 
            background: linear-gradient(135deg, #00B2A9, #4CAF50);
            color: white;
          }
          .success { color: #10b981; background: white; padding: 20px; border-radius: 10px; display: inline-block; }
          .loading { margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="success">
          <h1>✅ Fitbit Connected!</h1>
          <p>Your Fitbit account has been successfully connected.</p>
          <div class="loading">Closing window...</div>
        </div>
        <script>
          // Send success message to parent window
          if (window.opener) {
            window.opener.postMessage({ type: 'FITBIT_AUTH_SUCCESS' }, '*');
          }
          setTimeout(() => window.close(), 2000);
        </script>
      </body>
      </html>
    `, {
      headers: { 'Content-Type': 'text/html' },
    });

  } catch (error) {
    console.error('Error in fitbit-oauth-callback:', error);
    
    return new Response(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Fitbit Connection Error</title>
        <style>
          body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
          .error { color: #dc2626; }
        </style>
      </head>
      <body>
        <h1 class="error">Connection Failed</h1>
        <p>Error: ${error.message}</p>
        <script>
          if (window.opener) {
            window.opener.postMessage({ type: 'FITBIT_AUTH_ERROR', error: '${error.message}' }, '*');
          }
          setTimeout(() => window.close(), 3000);
        </script>
      </body>
      </html>
    `, {
      headers: { 'Content-Type': 'text/html' },
    });
  }
});