import { useState, useEffect } from "react";
import { ArrowLeft, Filter, SortAsc } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DealCard } from "@/components/DealCard";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface SavedDeal {
  id: string;
  property_address: string;
  funding_amount: string;
  property_type: string;
  current_value: string;
  arv_estimate: string;
  analysis_score: number;
  created_at: string;
}

export const MyDealsPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [deals, setDeals] = useState<SavedDeal[]>([]);
  const [filteredDeals, setFilteredDeals] = useState<SavedDeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<"date" | "roi" | "price">("date");
  const [filterType, setFilterType] = useState<string>("all");

  useEffect(() => {
    fetchSavedDeals();
  }, []);

  useEffect(() => {
    applyFiltersAndSort();
  }, [deals, sortBy, filterType]);

  const fetchSavedDeals = async () => {
    try {
      const devUserId = '00000000-0000-0000-0000-000000000001';
      
      const { data, error } = await supabase
        .from("deal_analyses")
        .select("*")
        .eq("user_id", devUserId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setDeals(data || []);
    } catch (error) {
      console.error("Error fetching saved deals:", error);
      toast({
        title: "Error",
        description: "Failed to load saved deals",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersAndSort = () => {
    let filtered = [...deals];

    // Apply property type filter
    if (filterType !== "all") {
      filtered = filtered.filter(deal => 
        deal.property_type.toLowerCase() === filterType.toLowerCase()
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "roi":
          return (b.analysis_score || 0) - (a.analysis_score || 0);
        case "price":
          const priceA = parseFloat(a.funding_amount.replace(/[^0-9.-]+/g, "")) || 0;
          const priceB = parseFloat(b.funding_amount.replace(/[^0-9.-]+/g, "")) || 0;
          return priceB - priceA;
        case "date":
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

    setFilteredDeals(filtered);
  };

  const convertToPropertyDeal = (deal: SavedDeal) => {
    const addressParts = deal.property_address.split(", ");
    const price = parseFloat(deal.funding_amount.replace(/[^0-9.-]+/g, "")) || 0;
    const arv = parseFloat(deal.arv_estimate?.replace(/[^0-9.-]+/g, "") || "0") || price * 1.1;

    return {
      id: deal.id,
      address: addressParts[0] || deal.property_address,
      city: addressParts[1] || "",
      state: addressParts[2] || "",
      price: price,
      arv: arv,
      roi: deal.analysis_score || 0,
      propertyType: deal.property_type,
      imageUrl: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80',
      beds: 3,
      baths: 2,
      sqft: 1500,
      lat: 0,
      lng: 0,
    };
  };

  // Get unique property types for filter
  const propertyTypes = Array.from(new Set(deals.map(d => d.property_type)));

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            onClick={() => {
              navigate('/', { state: { activeTab: 'discover' } });
              // Also try hash navigation as fallback
              window.location.hash = 'discover';
            }}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">My Saved Deals</h1>
            <p className="text-muted-foreground mt-1">
              {filteredDeals.length} {filteredDeals.length === 1 ? 'property' : 'properties'} saved
            </p>
          </div>
        </div>

        {/* Filters and Sorting */}
        <div className="flex flex-wrap gap-4 mb-6 p-4 bg-card rounded-lg border">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Filter by:</span>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Property Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {propertyTypes.map(type => (
                  <SelectItem key={type} value={type.toLowerCase()}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <SortAsc className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Sort by:</span>
            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Date Saved</SelectItem>
                <SelectItem value="roi">ROI (High to Low)</SelectItem>
                <SelectItem value="price">Price (High to Low)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {(filterType !== "all" || sortBy !== "date") && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setFilterType("all");
                setSortBy("date");
              }}
            >
              Clear Filters
            </Button>
          )}
        </div>

        {/* Deals Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-pulse text-muted-foreground">Loading your saved deals...</div>
          </div>
        ) : filteredDeals.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <h3 className="text-xl font-semibold mb-2">No saved deals yet</h3>
            <p className="text-muted-foreground mb-4">
              Start by exploring deals in the Discover tab
            </p>
            <Button onClick={() => window.location.href = "/"}>
              Discover Deals
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDeals.map((deal) => (
              <DealCard 
                key={deal.id} 
                deal={convertToPropertyDeal(deal)} 
                mode="copy"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
