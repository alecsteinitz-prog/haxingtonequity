import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Gift, Copy, Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Input } from "./ui/input";

export const ReferralBanner = () => {
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchOrCreateReferralCode();
    }
  }, [user]);

  const fetchOrCreateReferralCode = async () => {
    if (!user) return;

    // Try to fetch existing code
    const { data, error } = await supabase
      .from("referral_codes")
      .select("code")
      .eq("user_id", user.id)
      .single();

    if (data) {
      setReferralCode(data.code);
    } else {
      // Create new code
      const newCode = `HE${user.id.substring(0, 8).toUpperCase()}`;
      const { data: newData, error: insertError } = await supabase
        .from("referral_codes")
        .insert({
          user_id: user.id,
          code: newCode
        })
        .select("code")
        .single();

      if (newData) {
        setReferralCode(newData.code);
      }
    }
  };

  const handleCopyCode = () => {
    if (referralCode) {
      navigator.clipboard.writeText(referralCode);
      toast({
        title: "Copied!",
        description: "Referral code copied to clipboard",
      });
    }
  };

  const handleShareLink = () => {
    if (referralCode) {
      const shareUrl = `${window.location.origin}?ref=${referralCode}`;
      
      if (navigator.share) {
        navigator.share({
          title: 'Join Haxington Equity',
          text: 'Get funded for your real estate deals!',
          url: shareUrl,
        }).catch(() => {
          // Fallback to copying
          navigator.clipboard.writeText(shareUrl);
          toast({
            title: "Link Copied!",
            description: "Share link copied to clipboard",
          });
        });
      } else {
        navigator.clipboard.writeText(shareUrl);
        toast({
          title: "Link Copied!",
          description: "Share link copied to clipboard",
        });
      }
    }
  };

  if (!user) return null;

  return (
    <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
      <CardContent className="py-4">
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <button className="w-full text-left flex items-center gap-3 group">
              <div className="p-2 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <Gift className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-foreground">Earn Rewards</p>
                <p className="text-sm text-muted-foreground">
                  Refer investors to Haxington Equity through your referral code
                </p>
              </div>
            </button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Your Referral Code</DialogTitle>
              <DialogDescription>
                Share your unique code with other investors and earn rewards when they join!
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="flex gap-2">
                <Input
                  value={referralCode || ""}
                  readOnly
                  className="font-mono text-lg text-center"
                />
                <Button onClick={handleCopyCode} size="icon">
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <Button onClick={handleShareLink} className="w-full" size="lg">
                <Share2 className="h-4 w-4 mr-2" />
                Share Link
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};
