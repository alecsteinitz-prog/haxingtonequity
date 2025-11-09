import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Upload, Send } from "lucide-react";

interface FeedbackModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  analysisId?: string;
}

export const FeedbackModal = ({ open, onOpenChange, analysisId }: FeedbackModalProps) => {
  const [feedbackType, setFeedbackType] = useState("");
  const [notes, setNotes] = useState("");
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();

  const handleScreenshotUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Screenshot must be less than 5MB");
        return;
      }
      setScreenshot(file);
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error("You must be logged in to submit feedback");
      return;
    }

    if (!feedbackType) {
      toast.error("Please select a feedback type");
      return;
    }

    if (!notes.trim()) {
      toast.error("Please provide some notes");
      return;
    }

    setSubmitting(true);

    try {
      let screenshotUrl = null;

      // Upload screenshot if provided
      if (screenshot) {
        const fileExt = screenshot.name.split('.').pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('documents')
          .upload(`feedback/${fileName}`, screenshot);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('documents')
          .getPublicUrl(`feedback/${fileName}`);

        screenshotUrl = publicUrl;
      }

      // Insert feedback submission
      const { error: insertError } = await supabase
        .from('feedback_submissions')
        .insert({
          user_id: user.id,
          analysis_id: analysisId || null,
          feedback_type: feedbackType,
          notes: notes.trim(),
          screenshot_url: screenshotUrl
        });

      if (insertError) throw insertError;

      toast.success("Thanks! Your feedback helps us improve your experience.");
      
      // Reset form
      setFeedbackType("");
      setNotes("");
      setScreenshot(null);
      onOpenChange(false);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error("Failed to submit feedback. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Send Feedback</DialogTitle>
          <DialogDescription>
            Help us improve by sharing your thoughts or reporting any issues you've encountered.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="feedback-type">Feedback Type</Label>
            <Select value={feedbackType} onValueChange={setFeedbackType}>
              <SelectTrigger id="feedback-type">
                <SelectValue placeholder="Select feedback type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bug">Bug Report</SelectItem>
                <SelectItem value="data_accuracy">Data Accuracy Issue</SelectItem>
                <SelectItem value="feature_request">Feature Request</SelectItem>
                <SelectItem value="ui_improvement">UI Improvement</SelectItem>
                <SelectItem value="general">General Feedback</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Tell us more about your experience or the issue you encountered..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={5}
              maxLength={2000}
            />
            <p className="text-xs text-muted-foreground">
              {notes.length}/2000 characters
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="screenshot">Screenshot (Optional)</Label>
            <div className="flex items-center gap-2">
              <input
                id="screenshot"
                type="file"
                accept="image/*"
                onChange={handleScreenshotUpload}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('screenshot')?.click()}
                className="w-full"
              >
                <Upload className="w-4 h-4 mr-2" />
                {screenshot ? screenshot.name : "Upload Screenshot"}
              </Button>
            </div>
            {screenshot && (
              <p className="text-xs text-muted-foreground">
                File size: {(screenshot.size / 1024).toFixed(2)} KB
              </p>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting || !feedbackType || !notes.trim()}
          >
            <Send className="w-4 h-4 mr-2" />
            {submitting ? "Sending..." : "Send Feedback"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
