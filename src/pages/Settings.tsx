import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FitbitIntegration } from "@/components/integrations/FitbitIntegration";
import { Header } from "@/components/layout/Header";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Label } from "@/components/ui/label";

export default function Settings() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Settings</h1>
            <p className="text-muted-foreground">Manage your app preferences and integrations</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>
                  Customize the appearance of the application.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="theme">Theme</Label>
                  <ThemeToggle />
                </div>
              </CardContent>
            </Card>

            <div className="md:col-span-2">
              <FitbitIntegration />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}