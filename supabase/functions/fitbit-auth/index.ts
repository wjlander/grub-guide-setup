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

    if (!fitbitClientId || !fitbitClientSecret || !supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing required environment variables');
    }

    // Always use service role client - no user auth required for OAuth flow
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
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

      const redirectUri = `${supabaseUrl}/functions/v1/fitbit-auth`;

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
          redirect_uri: redirectUri,
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
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              text-align: center; 
              padding: 50px 20px; 
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              margin: 0;
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .container {
              max-width: 400px;
              background: white;
              padding: 40px 30px;
              border-radius: 15px;
              box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            }
            .success { 
              color: #22c55e; 
              font-size: 28px; 
              margin-bottom: 20px; 
            }
            .message {
              color: #374151;
              font-size: 16px;
              line-height: 1.5;
              margin-bottom: 20px;
            }
            .countdown {
              color: #6b7280;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="success">✅ Success!</div>
            <div class="message">
              <strong>Your Fitbit account has been connected!</strong><br>
              You can now close this window and return to the UK Meal Planner app.
            </div>
            <div class="countdown">This window will close automatically in <span id="timer">5</span> seconds...</div>
          </div>
          <script>
            let countdown = 5;
            const timer = document.getElementById('timer');
            
            const interval = setInterval(() => {
              countdown--;
              if (timer) timer.textContent = countdown.toString();
              
              if (countdown <= 0) {
                clearInterval(interval);
                try {
                  window.close();
                } catch (e) {
                  console.log('Could not close window automatically');
                  if (timer) timer.parentElement.textContent = 'Please close this window manually.';
                }
              }
            }, 1000);
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
      // For POST requests, we need to validate the user is authenticated
      const authHeader = req.headers.get('Authorization');
      if (!authHeader) {
        return new Response(JSON.stringify({ 
          success: false, 
          error: 'Authorization header required for POST requests' 
        }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

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
      console.log('Redirect URI:', redirectUri);

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