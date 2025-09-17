import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Wifi, WifiOff } from 'lucide-react';

interface FitbitIntegrationProps {
  isConnected?: boolean;
  onConnectionChange?: (connected: boolean) => void;
}

export function FitbitIntegration({ isConnected = false, onConnectionChange }: FitbitIntegrationProps) {
  const [connecting, setConnecting] = useState(false);
  const [connected, setConnected] = useState(isConnected);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleConnect = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to connect your Fitbit account.",
        variant: "destructive",
      });
      return;
    }

    setConnecting(true);
    try {
      const { data, error } = await supabase.functions.invoke('fitbit-auth', {
        body: { userId: user.id }
      });

      if (error) throw error;

      if (data?.authUrl) {
        // Open Fitbit OAuth in new window
        window.open(data.authUrl, 'fitbit-auth', 'width=600,height=700');
        
        // Listen for successful connection
        const checkConnection = setInterval(async () => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('fitbit_access_token')
            .eq('user_id', user.id)
            .single();
            
          if (profile?.fitbit_access_token) {
            setConnected(true);
            onConnectionChange?.(true);
            clearInterval(checkConnection);
            toast({
              title: "Fitbit Connected!",
              description: "Your Fitbit account has been successfully connected.",
            });
          }
        }, 2000);

        // Stop checking after 5 minutes
        setTimeout(() => clearInterval(checkConnection), 300000);
      }
    } catch (error) {
      console.error('Fitbit connection error:', error);
      toast({
        title: "Connection Failed",
        description: "Failed to connect to Fitbit. Please try again.",
        variant: "destructive",
      });
    } finally {
      setConnecting(false);
    }
  };

  const logMealToFitbit = async (mealData: any) => {
    if (!user || !connected) {
      toast({
        title: "Fitbit Not Connected",
        description: "Please connect your Fitbit account first.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('fitbit-log-meal', {
        body: { 
          userId: user.id,
          mealData: {
            name: mealData.name,
            calories: mealData.calories,
            mealType: mealData.meal_type,
            servings: mealData.servings || 1,
            date: mealData.date,
            brand: mealData.brand
          }
        }
      });

      if (error) throw error;

      toast({
        title: "Meal Logged to Fitbit",
        description: `${mealData.name} has been logged to your Fitbit account.`,
      });

      return data;
    } catch (error) {
      console.error('Fitbit meal logging error:', error);
      toast({
        title: "Logging Failed",
        description: "Failed to log meal to Fitbit. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {connected ? <Wifi className="h-5 w-5 text-green-500" /> : <WifiOff className="h-5 w-5 text-gray-400" />}
          Fitbit Integration
        </CardTitle>
        <CardDescription>
          Connect your Fitbit account to automatically sync meal data and nutrition information.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>Status:</span>
            <Badge variant={connected ? "default" : "secondary"}>
              {connected ? "Connected" : "Not Connected"}
            </Badge>
          </div>
          {!connected && (
            <Button 
              onClick={handleConnect} 
              disabled={connecting}
              className="bg-[#00B2A9] hover:bg-[#009590] text-white"
            >
              {connecting ? "Connecting..." : "Connect Fitbit"}
            </Button>
          )}
        </div>
        
        {connected && (
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <p className="text-sm text-green-800">
              ✓ Your Fitbit account is connected. Meals will automatically sync when marked as eaten.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Export the logging function for use in other components
export { FitbitIntegration as default };
export const useFitbitLogging = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const logMealToFitbit = async (mealData: any) => {
    if (!user) return;

    try {
      const { data, error } = await supabase.functions.invoke('fitbit-log-meal', {
        body: { 
          userId: user.id,
          mealData: {
            name: mealData.name,
            calories: mealData.calories,
            mealType: mealData.meal_type,
            servings: mealData.servings || 1,
            date: mealData.date,
            brand: mealData.brand
          }
        }
      });

      if (error) throw error;

      toast({
        title: "Meal Logged to Fitbit",
        description: `${mealData.name} has been logged to your Fitbit account.`,
      });

      return data;
    } catch (error) {
      console.error('Fitbit meal logging error:', error);
      toast({
        title: "Logging Failed",
        description: "Failed to log meal to Fitbit. Please try again.",
        variant: "destructive",
      });
    }
  };

  return { logMealToFitbit };
};