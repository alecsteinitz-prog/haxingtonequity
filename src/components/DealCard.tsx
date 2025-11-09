import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardFooter } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { MapPin, Bed, Bath, Maximize, TrendingUp, Save, Copy, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface PropertyDeal {
  id: string;
  address: string;
  city: string;
  state: string;
  price: number;
  arv: number;
  roi: number;
  propertyType: string;
  imageUrl: string;
  beds: number;
  baths: number;
  sqft: number;
  lat: number;
  lng: number;
}

interface DealCardProps {
  deal: PropertyDeal;
  mode?: "save" | "copy"; // New prop to control button behavior
  onDelete?: (dealId: string) => void; // Callback when deal is deleted
}

export const DealCard = ({ deal, mode = "save", onDelete }: DealCardProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const defaultFallbackImage = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80';

  const handleSaveDeal = async () => {
    setIsSaving(true);
    try {
      // TEMPORARY: Bypass auth for development
      const devUserId = '00000000-0000-0000-0000-000000000001'; // Using dev mode user ID (valid UUID format)
      
      // const { data: { user } } = await supabase.auth.getUser();
      // if (!user) {
      //   toast({
      //     title: "Authentication Required",
      //     description: "Please sign in to save deals",
      //     variant: "destructive",
      //   });
      //   return;
      // }

      // Save to deal_analyses table for future reference
      const { error } = await supabase.from("deal_analyses").insert({
        user_id: devUserId, // Using dev user ID instead of user.id
        property_address: `${deal.address}, ${deal.city}, ${deal.state}`,
        funding_amount: deal.price.toString(),
        property_type: deal.propertyType,
        current_value: deal.price.toString(),
        arv_estimate: deal.arv.toString(),
        analysis_score: Math.round(deal.roi),
        properties_count: "0",
        credit_score: "Not specified",
        funding_purpose: "Investment",
      });

      if (error) {
        console.error("Error saving deal:", error);
        throw error;
      }

      toast({
        title: "Deal Saved!",
        description: "Property saved to your analysis history",
        action: (
          <button
            onClick={() => navigate('/my-deals')}
            className="text-base font-medium underline whitespace-nowrap hover:text-primary transition-colors"
          >
            View My Deals
          </button>
        ),
      });
    } catch (error) {
      console.error("Error saving deal:", error);
      toast({
        title: "Error",
        description: "Failed to save deal. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopyInfo = async () => {
    const propertyInfo = `Property Address: ${deal.address}, ${deal.city}, ${deal.state}
Property Type: ${deal.propertyType}
Price: $${deal.price.toLocaleString()}
ARV (After Repair Value): $${deal.arv.toLocaleString()}
ROI: ${deal.roi}%
Bedrooms: ${deal.beds}
Bathrooms: ${deal.baths}
Square Feet: ${deal.sqft.toLocaleString()}`;

    try {
      await navigator.clipboard.writeText(propertyInfo);
      toast({
        title: "Property info copied",
        description: "You can now paste it into the Funding Eligibility Form.",
      });
    } catch (error) {
      console.error("Failed to copy:", error);
      toast({
        title: "Copy failed",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteDeal = async () => {
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from("deal_analyses")
        .delete()
        .eq("id", deal.id);

      if (error) {
        console.error("Error deleting deal:", error);
        throw error;
      }

      toast({
        title: "Property successfully removed from My Saved Deals.",
      });

      // Call the onDelete callback to update parent component
      if (onDelete) {
        onDelete(deal.id);
      }
    } catch (error) {
      console.error("Error deleting deal:", error);
      toast({
        title: "Error",
        description: "Failed to remove property. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative h-48 overflow-hidden bg-muted">
        {imageLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted">
            <div className="animate-pulse text-muted-foreground">Loading...</div>
          </div>
        )}
        <img
          src={imageError ? defaultFallbackImage : deal.imageUrl}
          alt={`${deal.address} - ${deal.propertyType}`}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            imageLoading ? 'opacity-0' : 'opacity-100'
          }`}
          onLoad={() => setImageLoading(false)}
          onError={() => {
            console.log(`Image failed to load for ${deal.address}, using fallback`);
            setImageError(true);
            setImageLoading(false);
          }}
          loading="lazy"
        />
        {imageError && (
          <div className="absolute bottom-2 left-2 text-xs bg-black/50 text-white px-2 py-1 rounded">
            Stock Image
          </div>
        )}
        <Badge className="absolute top-2 right-2 bg-primary/90 text-primary-foreground">
          <TrendingUp className="h-3 w-3 mr-1" />
          {deal.roi}% ROI
        </Badge>
      </div>
      
      <CardContent className="p-4 space-y-3">
        <div className="space-y-1">
          <h3 className="font-semibold text-lg line-clamp-1">{deal.address}</h3>
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {deal.city}, {deal.state}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <p className="text-muted-foreground">Price</p>
            <p className="font-semibold">${deal.price.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-muted-foreground">ARV</p>
            <p className="font-semibold">${deal.arv.toLocaleString()}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Bed className="h-4 w-4" />
            {deal.beds}
          </span>
          <span className="flex items-center gap-1">
            <Bath className="h-4 w-4" />
            {deal.baths}
          </span>
          <span className="flex items-center gap-1">
            <Maximize className="h-4 w-4" />
            {deal.sqft.toLocaleString()} sqft
          </span>
        </div>

        <Badge variant="outline">{deal.propertyType}</Badge>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        {mode === "copy" ? (
          <div className="flex gap-2 w-full">
            <Button 
              onClick={handleCopyInfo} 
              className="flex-1"
              variant="outline"
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy Info
            </Button>
            <Button 
              onClick={handleDeleteDeal}
              variant="destructive"
              size="icon"
              disabled={isDeleting}
              className="shrink-0"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <Button 
            onClick={handleSaveDeal} 
            className="w-full"
            disabled={isSaving}
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? "Saving..." : "Save to My Deals"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};
