import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { WifiOff } from 'lucide-react';

export function FitbitIntegration() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <WifiOff className="h-5 w-5 text-gray-400" />
          Fitbit Integration
        </CardTitle>
        <CardDescription>
          Fitbit integration is currently disabled for maintenance.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>Status:</span>
            <Badge variant="secondary">
              Disabled
            </Badge>
          </div>
        </div>
        
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600">
            Fitbit integration is temporarily disabled. We're working on improvements to provide a better experience.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export default FitbitIntegration;