import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Rating } from "@/components/ui/rating";
import { Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface MealRatingDialogProps {
  mealName: string;
  currentRating?: number;
  onRatingSubmit: (rating: number, notes?: string) => void;
  children: React.ReactNode;
}

export function MealRatingDialog({ 
  mealName, 
  currentRating = 0, 
  onRatingSubmit,
  children 
}: MealRatingDialogProps) {
  const [rating, setRating] = useState(currentRating);
  const [notes, setNotes] = useState("");
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const handleSubmit = () => {
    if (rating === 0) {
      toast({
        title: "Rating Required",
        description: "Please select a rating before submitting.",
        variant: "destructive",
      });
      return;
    }

    onRatingSubmit(rating, notes);
    setOpen(false);
    toast({
      title: "Rating Saved",
      description: `You rated "${mealName}" ${rating} star${rating !== 1 ? 's' : ''}.`,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-400" />
            Rate "{mealName}"
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label>How was this meal?</Label>
            <div className="flex justify-center">
              <Rating 
                value={rating} 
                onValueChange={setRating}
                size="lg"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              placeholder="What did you think about this meal? Any improvements?"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} className="bg-gradient-primary">
              Save Rating
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}