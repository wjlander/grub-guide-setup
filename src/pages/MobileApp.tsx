import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Smartphone, Download, Zap, Camera, Bell, Wifi } from "lucide-react";

interface MobileFeature {
  icon: typeof Camera;
  title: string;
  description: string;
  status: "available" | "coming-soon" | "demo";
}

const mobileFeatures: MobileFeature[] = [
  {
    icon: Camera,
    title: "Barcode Scanning",
    description: "Use your phone's camera to scan food barcodes instantly",
    status: "available"
  },
  {
    icon: Bell,
    title: "Push Notifications",
    description: "Get reminders for meals, prep time, and expiry dates",
    status: "coming-soon"
  },
  {
    icon: Wifi,
    title: "Offline Support",
    description: "Access your meal plans and recipes without internet",
    status: "coming-soon"
  },
  {
    icon: Zap,
    title: "Native Performance",
    description: "Fast, responsive experience optimized for mobile",
    status: "available"
  }
];

export default function MobileApp() {
  const [copied, setCopied] = useState(false);

  const handleSetupInstructions = () => {
    const instructions = `
📱 UK Meal Planner Mobile App Setup

To run on your device:

1. Export to GitHub (use button in top-right)
2. Clone: git clone [your-repo-url]
3. Install: npm install
4. Add platforms:
   - iOS: npx cap add ios
   - Android: npx cap add android
5. Build: npm run build
6. Sync: npx cap sync
7. Run:
   - iOS: npx cap run ios
   - Android: npx cap run android

Requirements:
- iOS: Mac with Xcode
- Android: Android Studio

📖 Read more: https://lovable.dev/blogs/TODO
    `;

    navigator.clipboard.writeText(instructions);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-success text-success-foreground';
      case 'coming-soon': return 'bg-warning text-warning-foreground';
      case 'demo': return 'bg-info text-info-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available': return 'Available';
      case 'coming-soon': return 'Coming Soon';
      case 'demo': return 'Demo Ready';
      default: return 'Unknown';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <Smartphone className="h-16 w-16 mx-auto mb-4 text-primary" />
          <h1 className="text-3xl font-bold mb-2">Mobile App</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Your UK Meal Planner is ready for mobile! Built with Capacitor for native iOS and Android performance.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          {mobileFeatures.map((feature, index) => (
            <Card key={index} className="text-center">
              <CardHeader>
                <feature.icon className="h-8 w-8 mx-auto mb-2 text-primary" />
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  {feature.description}
                </p>
                <Badge className={getStatusColor(feature.status)}>
                  {getStatusText(feature.status)}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Get Started with Mobile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted/30 p-4 rounded-lg">
              <h4 className="font-medium mb-2">✅ Mobile Features Ready:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Responsive design for all screen sizes</li>
                <li>• Touch-optimized UI components</li>
                <li>• Camera barcode scanning capability</li>
                <li>• Offline-ready architecture</li>
                <li>• Native performance with Capacitor</li>
              </ul>
            </div>

            <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
              <h4 className="font-medium mb-2 text-primary">📋 Setup Instructions:</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Follow these steps to build and run the mobile app on your device:
              </p>
              <Button 
                onClick={handleSetupInstructions}
                className="w-full"
                variant={copied ? "outline" : "default"}
              >
                {copied ? "Copied to Clipboard!" : "Copy Setup Instructions"}
              </Button>
            </div>

            <div className="text-center">
              <p className="text-xs text-muted-foreground">
                📖 For detailed mobile development guidance, read our{" "}
                <a 
                  href="https://lovable.dev/blogs/TODO" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  mobile development blog post
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}