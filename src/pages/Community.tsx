import { Header } from "@/components/layout/Header";
import { PhotoMealLogger } from "@/components/logging/PhotoMealLogger";
import { AchievementSystem } from "@/components/gamification/AchievementSystem";
import { RecipeSharingCommunity } from "@/components/community/RecipeSharingCommunity";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Camera, Trophy, Users } from "lucide-react";

const Community = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Community & Achievements</h1>
          <p className="text-xl text-muted-foreground">
            Share recipes, track achievements, and log meals with photos
          </p>
        </div>

        <Tabs defaultValue="community" className="space-y-8">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="community" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Recipe Community
            </TabsTrigger>
            <TabsTrigger value="achievements" className="flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              Achievements
            </TabsTrigger>
            <TabsTrigger value="photos" className="flex items-center gap-2">
              <Camera className="h-4 w-4" />
              Photo Logger
            </TabsTrigger>
          </TabsList>

          <TabsContent value="community">
            <RecipeSharingCommunity />
          </TabsContent>

          <TabsContent value="achievements">
            <AchievementSystem />
          </TabsContent>

          <TabsContent value="photos">
            <PhotoMealLogger />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Community;