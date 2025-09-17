import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

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
    const fitbitClientId = Deno.env.get('FITBIT_CLIENT_ID');
    const fitbitClientSecret = Deno.env.get('FITBIT_CLIENT_SECRET');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!fitbitClientId || !fitbitClientSecret) {
      throw new Error('Fitbit credentials not configured');
    }

    // Always use service role client to avoid auth issues
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);
    
    const url = new URL(req.url);
    const { searchParams } = url;

    // Handle OAuth callback (GET request with code parameter)
    if (req.method === 'GET' && searchParams.has('code')) {
      const authCode = searchParams.get('code');
      const state = searchParams.get('state'); // Contains user_id
      
      console.log('Processing Fitbit OAuth callback for user:', state);

      if (!authCode || !state) {
        throw new Error('Missing authorization code or state parameter');
      }

      // Exchange authorization code for access token
      const tokenResponse = await fetch('https://api.fitbit.com/oauth2/token', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${btoa(`${fitbitClientId}:${fitbitClientSecret}`)}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: fitbitClientId,
          grant_type: 'authorization_code',
          redirect_uri: `${supabaseUrl}/functions/v1/fitbit-auth`,
          code: authCode,
        }).toString(),
      });

      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text();
        console.error('Token exchange failed:', errorText);
        throw new Error(`Token exchange failed: ${tokenResponse.status} - ${errorText}`);
      }

      const tokenData = await tokenResponse.json();
      console.log('Token exchange successful, storing tokens for user:', state);
      
      // Store Fitbit tokens in user profile
      const { error: updateError } = await supabase
        .from('profiles')
        .upsert({
          user_id: state,
          fitbit_access_token: tokenData.access_token,
          fitbit_refresh_token: tokenData.refresh_token,
          fitbit_user_id: tokenData.user_id,
          fitbit_connected_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id'
        });

      if (updateError) {
        console.error('Error storing Fitbit tokens:', updateError);
        throw updateError;
      }

      console.log('Fitbit integration successful for user:', state);

      // Return success page HTML
      const successHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Fitbit Connected</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              text-align: center; 
              padding: 50px; 
              background: #f8f9fa;
            }
            .success { 
              color: #22c55e; 
              font-size: 24px; 
              margin-bottom: 20px; 
            }
            .container {
              max-width: 400px;
              margin: 0 auto;
              background: white;
              padding: 30px;
              border-radius: 10px;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="success">✅ Fitbit Connected Successfully!</div>
            <p>Your Fitbit account has been connected to UK Meal Planner.</p>
            <p>You can now close this window and return to the app.</p>
          </div>
          <script>
            // Close window after 3 seconds
            setTimeout(() => {
              try {
                window.close();
              } catch (e) {
                console.log('Could not close window automatically');
              }
            }, 3000);
          </script>
        </body>
        </html>
      `;
      
      return new Response(successHtml, {
        headers: { ...corsHeaders, 'Content-Type': 'text/html' },
        status: 200,
      });
    }

    // Handle POST request to generate OAuth URL
    if (req.method === 'POST') {
      const { userId } = await req.json();
      
      if (!userId) {
        throw new Error('User ID is required');
      }

      const redirectUri = `${supabaseUrl}/functions/v1/fitbit-auth`;
      const scope = 'nutrition weight heartrate activity location profile sleep';
      
      const authUrl = `https://www.fitbit.com/oauth2/authorize?` +
        `response_type=code&` +
        `client_id=${fitbitClientId}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `scope=${encodeURIComponent(scope)}&` +
        `state=${userId}`;

      console.log('Generated Fitbit auth URL for user:', userId);

      return new Response(JSON.stringify({ 
        success: true, 
        authUrl 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // Method not allowed
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Method not allowed' 
    }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in fitbit-auth function:', error);
    
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});