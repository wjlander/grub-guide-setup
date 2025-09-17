import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Rating } from "@/components/ui/rating";
import { Share2, Heart, MessageCircle, Star, Clock, Users, ChefHat, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface SharedRecipe {
  id: string;
  recipe_id: string;
  user_id: string;
  is_public: boolean;
  featured: boolean;
  total_ratings: number;
  average_rating: number;
  created_at: string;
  recipe: {
    id: string;
    name: string;
    description?: string;
    prep_time?: number;
    cook_time?: number;
    servings?: number;
    image_url?: string;
    tags?: string[];
  };
}

interface RecipeComment {
  id: string;
  comment: string;
  created_at: string;
  user_id: string;
}

export function RecipeSharingCommunity() {
  const [sharedRecipes, setSharedRecipes] = useState<SharedRecipe[]>([]);
  const [mySharedRecipes, setMySharedRecipes] = useState<SharedRecipe[]>([]);
  const [featuredRecipes, setFeaturedRecipes] = useState<SharedRecipe[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<SharedRecipe | null>(null);
  const [comments, setComments] = useState<RecipeComment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [newRating, setNewRating] = useState(0);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [recipes, setRecipes] = useState<any[]>([]);
  const [selectedRecipeToShare, setSelectedRecipeToShare] = useState("");
  
  const { toast } = useToast();

  const loadCommunityRecipes = async () => {
    const { data, error } = await supabase
      .from('shared_recipes')
      .select(`
        *,
        recipe:recipes(*)
      `)
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load community recipes",
        variant: "destructive",
      });
      return;
    }

    setSharedRecipes(data || []);
  };

  const loadMySharedRecipes = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('shared_recipes')
      .select(`
        *,
        recipe:recipes(*)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load your shared recipes",
        variant: "destructive",
      });
      return;
    }

    setMySharedRecipes(data || []);
  };

  const loadFeaturedRecipes = async () => {
    const { data, error } = await supabase
      .from('shared_recipes')
      .select(`
        *,
        recipe:recipes(*)
      `)
      .eq('featured', true)
      .eq('is_public', true)
      .order('average_rating', { ascending: false })
      .limit(6);

    if (error) {
      console.error('Error loading featured recipes:', error);
      return;
    }

    setFeaturedRecipes(data || []);
  };

  const loadMyRecipes = async () => {
    const { data, error } = await supabase
      .from('recipes')
      .select('*')
      .order('name');

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load your recipes",
        variant: "destructive",
      });
      return;
    }

    setRecipes(data || []);
  };

  const loadRecipeComments = async (sharedRecipeId: string) => {
    const { data, error } = await supabase
      .from('recipe_comments')
      .select(`
        *
      `)
      .eq('shared_recipe_id', sharedRecipeId)
      .is('parent_comment_id', null)
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load comments",
        variant: "destructive",
      });
      return;
    }

    setComments(data || []);
  };

  const shareRecipe = async () => {
    if (!selectedRecipeToShare) {
      toast({
        title: "Error",
        description: "Please select a recipe to share",
        variant: "destructive",
      });
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to share recipes",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase
      .from('shared_recipes')
      .insert({
        recipe_id: selectedRecipeToShare,
        user_id: user.id,
        is_public: true
      });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to share recipe",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Recipe shared with the community!",
    });

    setIsShareDialogOpen(false);
    setSelectedRecipeToShare("");
    loadCommunityRecipes();
    loadMySharedRecipes();
  };

  const rateRecipe = async (sharedRecipeId: string, rating: number) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to rate recipes",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase
      .from('recipe_ratings')
      .upsert({
        shared_recipe_id: sharedRecipeId,
        user_id: user.id,
        rating
      });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to rate recipe",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Recipe rated successfully!",
    });

    // Reload recipes to reflect updated ratings
    loadCommunityRecipes();
    loadFeaturedRecipes();
  };

  const addComment = async () => {
    if (!newComment.trim() || !selectedRecipe) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to comment",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase
      .from('recipe_comments')
      .insert({
        shared_recipe_id: selectedRecipe.id,
        user_id: user.id,
        comment: newComment.trim()
      });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to add comment",
        variant: "destructive",
      });
      return;
    }

    setNewComment("");
    loadRecipeComments(selectedRecipe.id);
  };

  const openRecipeView = (recipe: SharedRecipe) => {
    setSelectedRecipe(recipe);
    setIsViewDialogOpen(true);
    loadRecipeComments(recipe.id);
  };

  const getTotalTime = (recipe: any) => {
    const prep = recipe.prep_time || 0;
    const cook = recipe.cook_time || 0;
    return prep + cook;
  };

  const getProfileName = (profile: any) => {
    return "Anonymous Chef"; // Simplified for now since we don't have profiles linked
  };

  useEffect(() => {
    loadCommunityRecipes();
    loadMySharedRecipes();
    loadFeaturedRecipes();
    loadMyRecipes();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Recipe Community</h2>
        
        <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Share2 className="mr-2 h-4 w-4" />
              Share Recipe
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Share a Recipe</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="recipe">Select Recipe</Label>
                <select 
                  id="recipe"
                  className="w-full p-2 border border-input rounded-md"
                  value={selectedRecipeToShare}
                  onChange={(e) => setSelectedRecipeToShare(e.target.value)}
                >
                  <option value="">Choose a recipe to share...</option>
                  {recipes.map(recipe => (
                    <option key={recipe.id} value={recipe.id}>
                      {recipe.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <Button onClick={shareRecipe} className="w-full">
                Share with Community
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="discover" className="space-y-6">
        <TabsList>
          <TabsTrigger value="discover">Discover</TabsTrigger>
          <TabsTrigger value="featured">Featured</TabsTrigger>
          <TabsTrigger value="my-shared">My Shared</TabsTrigger>
        </TabsList>

        <TabsContent value="discover" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Community Recipes</h3>
            <Badge variant="outline" className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {sharedRecipes.length} recipes shared
            </Badge>
          </div>

          {sharedRecipes.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <ChefHat className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No recipes shared yet</h3>
                <p className="text-muted-foreground">
                  Be the first to share a recipe with the community!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {sharedRecipes.map((sharedRecipe) => (
                <Card key={sharedRecipe.id} className="overflow-hidden hover:shadow-md transition-shadow">
                  <div className="relative">
                    {sharedRecipe.recipe.image_url ? (
                      <img
                        src={sharedRecipe.recipe.image_url}
                        alt={sharedRecipe.recipe.name}
                        className="w-full h-32 object-cover"
                      />
                    ) : (
                      <div className="w-full h-32 bg-muted flex items-center justify-center">
                        <ChefHat className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                    
                    {sharedRecipe.featured && (
                      <Badge className="absolute top-2 left-2 bg-yellow-500">
                        <Star className="mr-1 h-3 w-3" />
                        Featured
                      </Badge>
                    )}
                  </div>
                  
                  <CardContent className="p-4">
                    <h4 className="font-semibold mb-1">{sharedRecipe.recipe.name}</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      by {getProfileName(null)}
                    </p>
                    
                    {sharedRecipe.recipe.description && (
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {sharedRecipe.recipe.description}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                      {getTotalTime(sharedRecipe.recipe) > 0 && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {getTotalTime(sharedRecipe.recipe)}min
                        </div>
                      )}
                      
                      {sharedRecipe.recipe.servings && (
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {sharedRecipe.recipe.servings}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Rating 
                          value={sharedRecipe.average_rating || 0} 
                          readonly 
                          size="sm"
                        />
                        <span className="text-sm text-muted-foreground">
                          ({sharedRecipe.total_ratings})
                        </span>
                      </div>
                      
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => openRecipeView(sharedRecipe)}
                      >
                        View Recipe
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="featured" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Featured Recipes</h3>
            <Badge variant="outline" className="flex items-center gap-1">
              <TrendingUp className="h-4 w-4" />
              Top rated
            </Badge>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {featuredRecipes.map((sharedRecipe) => (
              <Card key={sharedRecipe.id} className="overflow-hidden border-yellow-200 hover:shadow-md transition-shadow">
                <div className="relative">
                  {sharedRecipe.recipe.image_url ? (
                    <img
                      src={sharedRecipe.recipe.image_url}
                      alt={sharedRecipe.recipe.name}
                      className="w-full h-32 object-cover"
                    />
                  ) : (
                    <div className="w-full h-32 bg-muted flex items-center justify-center">
                      <ChefHat className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                  
                  <Badge className="absolute top-2 left-2 bg-yellow-500">
                    <Star className="mr-1 h-3 w-3" />
                    Featured
                  </Badge>
                </div>
                
                <CardContent className="p-4">
                  <h4 className="font-semibold mb-1">{sharedRecipe.recipe.name}</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    by {getProfileName(null)}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Rating 
                        value={sharedRecipe.average_rating || 0} 
                        readonly 
                        size="sm"
                      />
                      <span className="text-sm text-muted-foreground">
                        ({sharedRecipe.total_ratings})
                      </span>
                    </div>
                    
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => openRecipeView(sharedRecipe)}
                    >
                      View Recipe
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="my-shared" className="space-y-4">
          <h3 className="text-lg font-semibold">My Shared Recipes</h3>

          {mySharedRecipes.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <Share2 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No shared recipes yet</h3>
                <p className="text-muted-foreground mb-4">
                  Share your recipes with the community to get feedback and ratings!
                </p>
                <Button onClick={() => setIsShareDialogOpen(true)}>
                  <Share2 className="mr-2 h-4 w-4" />
                  Share a Recipe
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {mySharedRecipes.map((sharedRecipe) => (
                <Card key={sharedRecipe.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <h4 className="font-semibold mb-2">{sharedRecipe.recipe.name}</h4>
                    
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Rating 
                          value={sharedRecipe.average_rating || 0} 
                          readonly 
                          size="sm"
                        />
                        <span className="text-sm text-muted-foreground">
                          ({sharedRecipe.total_ratings})
                        </span>
                      </div>
                      
                      {sharedRecipe.featured && (
                        <Badge className="bg-yellow-500">
                          <Star className="mr-1 h-3 w-3" />
                          Featured
                        </Badge>
                      )}
                    </div>
                    
                    <div className="text-sm text-muted-foreground">
                      Shared on {new Date(sharedRecipe.created_at).toLocaleDateString()}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Recipe View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {selectedRecipe && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedRecipe.recipe.name}</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                {selectedRecipe.recipe.image_url && (
                  <img
                    src={selectedRecipe.recipe.image_url}
                    alt={selectedRecipe.recipe.name}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                )}
                
                <div className="flex items-center justify-between">
                  <p className="text-muted-foreground">
                    by {getProfileName(null)}
                  </p>
                  
                  <div className="flex items-center gap-2">
                    <Rating 
                      value={newRating}
                      onValueChange={setNewRating}
                      size="sm"
                    />
                    <Button 
                      size="sm"
                      onClick={() => rateRecipe(selectedRecipe.id, newRating)}
                      disabled={newRating === 0}
                    >
                      Rate
                    </Button>
                  </div>
                </div>
                
                {selectedRecipe.recipe.description && (
                  <p className="text-muted-foreground">{selectedRecipe.recipe.description}</p>
                )}
                
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <MessageCircle className="h-4 w-4" />
                    Comments ({comments.length})
                  </h4>
                  
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <Textarea
                        placeholder="Add a comment..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        className="flex-1"
                        rows={2}
                      />
                      <Button onClick={addComment} disabled={!newComment.trim()}>
                        Post
                      </Button>
                    </div>
                    
                    {comments.map((comment) => (
                      <div key={comment.id} className="border-l-2 border-muted pl-4">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-sm">
                            {getProfileName(null)}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(comment.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm">{comment.comment}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}