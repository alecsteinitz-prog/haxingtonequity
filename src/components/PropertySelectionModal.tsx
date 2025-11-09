import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Home, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface SavedProperty {
  id: string;
  property_address: string;
  property_info: string;
  property_specific_info: string;
  current_value: string;
  repairs_needed: boolean;
  repair_level: string;
  rehab_costs: string;
  arv_estimate: string;
  under_contract: boolean;
  owns_other_properties: boolean;
  created_at: string;
}

interface PropertySelectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectProperty: (property: SavedProperty) => void;
}

export const PropertySelectionModal = ({ 
  open, 
  onOpenChange, 
  onSelectProperty 
}: PropertySelectionModalProps) => {
  const [properties, setProperties] = useState<SavedProperty[]>([]);
  const [loading, setLoading] = useState(false);
  const [selecting, setSelecting] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (open && user) {
      fetchSavedProperties();
    }
  }, [open, user]);

  const fetchSavedProperties = async () => {
    if (!user) {
      toast.error("Please sign in to access saved properties");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('deal_analyses')
        .select('id, property_address, property_info, property_specific_info, current_value, repairs_needed, repair_level, rehab_costs, arv_estimate, under_contract, owns_other_properties, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setProperties(data || []);
    } catch (error) {
      console.error('Error fetching properties:', error);
      toast.error("Failed to load saved properties");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectProperty = async (property: SavedProperty) => {
    setSelecting(true);
    
    // Show loading toast
    toast.loading("Mapping property data...", { id: "mapping-fields" });
    
    // Simulate brief loading for UX
    await new Promise(resolve => setTimeout(resolve, 800));
    
    onSelectProperty(property);
    toast.dismiss("mapping-fields");
    toast.success("Property details imported successfully!", {
      duration: 3000,
    });
    
    setSelecting(false);
    onOpenChange(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Home className="w-5 h-5 text-[#6C1F2E]" />
            Select a Saved Property
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 mt-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-[#6C1F2E] mb-2" />
              <p className="text-sm text-muted-foreground">Loading your properties...</p>
            </div>
          ) : properties.length === 0 ? (
            <div className="text-center py-12">
              <Home className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-base font-medium text-foreground mb-1">🏠 No saved properties found</p>
              <p className="text-sm text-muted-foreground">
                Complete and submit a form to save properties for future use
              </p>
            </div>
          ) : (
            properties.map((property) => (
              <Card key={property.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-2 mb-3">
                        <Home className="w-4 h-4 text-[#6C1F2E] mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm mb-1">
                            {property.property_address || "No address provided"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Saved on {formatDate(property.created_at)}
                          </p>
                        </div>
                      </div>
                      
                      {/* Key property details */}
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {property.current_value && (
                          <div>
                            <span className="text-muted-foreground">Value: </span>
                            <span className="font-medium">{property.current_value}</span>
                          </div>
                        )}
                        {property.arv_estimate && (
                          <div>
                            <span className="text-muted-foreground">ARV: </span>
                            <span className="font-medium">{property.arv_estimate}</span>
                          </div>
                        )}
                        {property.rehab_costs && (
                          <div>
                            <span className="text-muted-foreground">Rehab: </span>
                            <span className="font-medium">{property.rehab_costs}</span>
                          </div>
                        )}
                        {property.under_contract !== null && (
                          <div>
                            <span className="text-muted-foreground">Status: </span>
                            <span className="font-medium">
                              {property.under_contract ? "Under Contract" : "Not Under Contract"}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <Button
                      onClick={() => handleSelectProperty(property)}
                      disabled={selecting}
                      size="sm"
                      className="bg-[#6C1F2E] hover:bg-[#821F2F] text-white font-semibold rounded-xl flex-shrink-0"
                    >
                      {selecting ? (
                        <>
                          <Loader2 className="w-3 h-3 animate-spin mr-1" />
                          Pasting...
                        </>
                      ) : (
                        "Paste Info"
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
