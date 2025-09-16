import React, { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Camera, Upload, Image as ImageIcon, X, Edit3, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface MealPhoto {
  id: string;
  image_url: string;
  description?: string;
  ai_analyzed_nutrition?: any;
  created_at: string;
  meal?: {
    meal_name: string;
    date: string;
  };
}

export function PhotoMealLogger() {
  const [photos, setPhotos] = useState<MealPhoto[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<MealPhoto | null>(null);
  const [photoDescription, setPhotoDescription] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const loadPhotos = async () => {
    const { data, error } = await supabase
      .from('meal_photos')
      .select(`
        *,
        meal:meals(meal_name, date)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load meal photos",
        variant: "destructive",
      });
      return;
    }

    setPhotos(data || []);
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Error",
        description: "Please select a valid image file",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "Image file must be less than 5MB",
        variant: "destructive",
      });
      return;
    }

    await uploadPhoto(file);
  };

  const uploadPhoto = async (file: File) => {
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to upload photos",
          variant: "destructive",
        });
        return;
      }

      // Create unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      // Upload to Supabase storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('meal-photos')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        throw uploadError;
      }

      setUploadProgress(50);

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('meal-photos')
        .getPublicUrl(uploadData.path);

      setUploadProgress(75);

      // Save to database
      const { data: photoData, error: dbError } = await supabase
        .from('meal_photos')
        .insert({
          user_id: user.id,
          image_url: urlData.publicUrl,
          description: photoDescription || null
        })
        .select()
        .single();

      if (dbError) {
        throw dbError;
      }

      setUploadProgress(100);

      toast({
        title: "Success",
        description: "Meal photo uploaded successfully!",
      });

      setPhotoDescription("");
      setIsDialogOpen(false);
      loadPhotos();

    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to upload photo: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const deletePhoto = async (photoId: string, imageUrl: string) => {
    try {
      // Extract file path from URL
      const urlParts = imageUrl.split('/');
      const filePath = urlParts.slice(-2).join('/'); // user_id/filename

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('meal-photos')
        .remove([filePath]);

      if (storageError) {
        console.error('Storage delete error:', storageError);
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from('meal_photos')
        .delete()
        .eq('id', photoId);

      if (dbError) {
        throw dbError;
      }

      toast({
        title: "Success",
        description: "Photo deleted successfully",
      });

      loadPhotos();

    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to delete photo: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const openPhotoDialog = (photo?: MealPhoto) => {
    setSelectedPhoto(photo || null);
    setPhotoDescription(photo?.description || "");
    setIsDialogOpen(true);
  };

  React.useEffect(() => {
    loadPhotos();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Photo Meal Logger</h2>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => openPhotoDialog()}>
              <Camera className="mr-2 h-4 w-4" />
              Add Meal Photo
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload Meal Photo</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your meal..."
                  value={photoDescription}
                  onChange={(e) => setPhotoDescription(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Upload Photo</Label>
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  
                  {!isUploading ? (
                    <div className="space-y-2">
                      <div className="flex justify-center">
                        <ImageIcon className="h-10 w-10 text-muted-foreground" />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-muted-foreground">
                        PNG, JPG, WEBP up to 5MB
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        Choose File
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Uploading photo...
                      </p>
                      <Progress value={uploadProgress} className="w-full" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {photos.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <Camera className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No meal photos yet</h3>
            <p className="text-muted-foreground mb-4">
              Start logging your meals with photos to track your food journey
            </p>
            <Button onClick={() => openPhotoDialog()}>
              <Camera className="mr-2 h-4 w-4" />
              Add Your First Photo
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {photos.map((photo) => (
            <Card key={photo.id} className="overflow-hidden">
              <div className="relative">
                <img
                  src={photo.image_url}
                  alt={photo.description || "Meal photo"}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-2 right-2 flex gap-1">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="h-8 w-8 p-0 bg-black/50 hover:bg-black/70"
                    onClick={() => openPhotoDialog(photo)}
                  >
                    <Edit3 className="h-3 w-3 text-white" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="h-8 w-8 p-0 bg-red-500/80 hover:bg-red-500"
                    onClick={() => deletePhoto(photo.id, photo.image_url)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              
              <CardContent className="p-4">
                {photo.description && (
                  <p className="text-sm text-muted-foreground mb-2">
                    {photo.description}
                  </p>
                )}
                
                {photo.meal && (
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">
                      {photo.meal.meal_name}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(photo.meal.date).toLocaleDateString()}
                    </span>
                  </div>
                )}
                
                <div className="text-xs text-muted-foreground mt-2">
                  {new Date(photo.created_at).toLocaleDateString()} at{' '}
                  {new Date(photo.created_at).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </div>
                
                {photo.ai_analyzed_nutrition && (
                  <Badge variant="secondary" className="mt-2">
                    AI Analyzed
                  </Badge>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}