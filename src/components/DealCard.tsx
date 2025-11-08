import { useState } from "react";
import { Card, CardContent, CardFooter } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { MapPin, Bed, Bath, Maximize, TrendingUp, Save } from "lucide-react";
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
}

export const DealCard = ({ deal }: DealCardProps) => {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveDeal = async () => {
    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to save deals",
          variant: "destructive",
        });
        return;
      }

      // Save to deal_analyses table for future reference
      const { error } = await supabase.from("deal_analyses").insert({
        user_id: user.id,
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

      if (error) throw error;

      toast({
        title: "Deal Saved!",
        description: "Property saved to your analysis history",
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

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative h-48 overflow-hidden">
        <img
          src={deal.imageUrl}
          alt={deal.address}
          className="w-full h-full object-cover"
        />
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
        <Button 
          onClick={handleSaveDeal} 
          className="w-full"
          disabled={isSaving}
        >
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? "Saving..." : "Save to My Deals"}
        </Button>
      </CardFooter>
    </Card>
  );
};
