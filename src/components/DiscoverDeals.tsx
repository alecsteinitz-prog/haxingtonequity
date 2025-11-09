import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { DealCard } from "./DealCard";
import { Search, Filter, MapPin, DollarSign, Home, TrendingUp, Bookmark } from "lucide-react";
import { Label } from "./ui/label";
import { Slider } from "./ui/slider";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
  monthlyRent?: number;
  grossYield?: number;
  isPartialMatch?: boolean;
}

export const DiscoverDeals = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [city, setCity] = useState("");
  const [state, setState] = useState("TX");
  const [country, setCountry] = useState("US");
  const [maxBudget, setMaxBudget] = useState([500000]);
  const [propertyType, setPropertyType] = useState("all");
  const [bedrooms, setBedrooms] = useState("any");
  const [bathrooms, setBathrooms] = useState("any");
  const [sqft, setSqft] = useState([0]);
  const [minROI, setMinROI] = useState([15]);
  const [isSearching, setIsSearching] = useState(false);
  const [deals, setDeals] = useState<PropertyDeal[]>([]);
  const [showFilters, setShowFilters] = useState(true);

  const handleSearch = async () => {
    setIsSearching(true);
    try {
      const { data, error } = await supabase.functions.invoke('rentcast-deals', {
        body: {
          city: city || "Austin",
          state: state,
          maxPrice: maxBudget[0],
          propertyType: propertyType === "all" ? undefined : propertyType,
          bedrooms: bedrooms !== "any" ? parseInt(bedrooms) : undefined,
          bathrooms: bathrooms !== "any" ? parseInt(bathrooms) : undefined,
          sqft: sqft[0] > 0 ? sqft[0] : undefined,
          limit: 20
        }
      });

      if (error) {
        console.error("Supabase function error:", error);
        toast({
          title: "Connection Error",
          description: "Failed to connect to the property search service. Please try again.",
          variant: "destructive",
        });
        setDeals([]);
        return;
      }

      // Check for API-level errors
      if (data?.error) {
        console.error("Rentcast API error:", data.error);
        toast({
          title: "API Error",
          description: data.error,
          variant: "destructive",
        });
        setDeals([]);
        return;
      }

      console.log("API Response:", data);
      console.log("Deals received:", data?.deals?.length || 0);

      // Success message
      if (data?.success && data?.message) {
        toast({
          title: "Success",
          description: `${data.message} - Found ${data?.deals?.length || 0} properties`,
        });
      }

      const allDeals = data?.deals || [];
      
      // Separate exact matches and near matches
      const exactMatches: PropertyDeal[] = [];
      const nearMatches: PropertyDeal[] = [];
      
      allDeals.forEach((deal: PropertyDeal) => {
        // Always show properties without price data
        if (!deal.price || deal.price === 0) {
          exactMatches.push(deal);
          return;
        }
        
        const withinBudget = deal.price <= maxBudget[0];
        const meetsROI = deal.roi >= minROI[0];
        
        if (withinBudget && meetsROI) {
          exactMatches.push(deal);
        } else {
          // Near match criteria: within 20% of budget OR within 5% of ROI
          const nearBudget = deal.price <= maxBudget[0] * 1.2;
          const nearROI = deal.roi >= minROI[0] - 5;
          
          if ((withinBudget && nearROI) || (meetsROI && nearBudget) || (nearBudget && nearROI)) {
            nearMatches.push({ ...deal, isPartialMatch: true });
          }
        }
      });
      
      // Prioritize exact matches, then show near matches if needed
      let finalDeals: PropertyDeal[] = [];
      let isShowingPartialMatches = false;
      
      if (exactMatches.length > 0) {
        finalDeals = exactMatches;
      } else if (nearMatches.length > 0) {
        finalDeals = nearMatches;
        isShowingPartialMatches = true;
      }

      setDeals(finalDeals);

      if (finalDeals.length === 0) {
        toast({
          title: "No Results",
          description: `No properties found in ${city || 'this area'}. Try a different location or adjust your filters.`,
        });
      } else if (isShowingPartialMatches) {
        toast({
          title: "Similar Opportunities",
          description: `We couldn't find exact matches, but here are ${finalDeals.length} similar properties. (Budget: $${maxBudget[0].toLocaleString()}, Min ROI: ${minROI[0]}%)`,
        });
      } else {
        toast({
          title: "Properties Found",
          description: `Found ${finalDeals.length} properties matching your criteria`,
        });
      }
    } catch (error) {
      console.error("Error fetching deals:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
      setDeals([]);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Smart Deal Finder</h1>
          <p className="text-muted-foreground">
            Discover high-ROI investment properties from MLS and Zillow
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => navigate('/my-deals')}
          className="flex items-center gap-2"
        >
          <Bookmark className="h-4 w-4" />
          My Saved Deals
        </Button>
      </div>

      <Card>
        <CardHeader className="cursor-pointer" onClick={() => setShowFilters(!showFilters)}>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Search Filters
          </CardTitle>
        </CardHeader>
        {showFilters && (
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="city" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  City
                </Label>
                <Input
                  id="city"
                  placeholder="Enter city name"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Select value={state} onValueChange={setState}>
                  <SelectTrigger id="state">
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AL">Alabama</SelectItem>
                    <SelectItem value="AK">Alaska</SelectItem>
                    <SelectItem value="AZ">Arizona</SelectItem>
                    <SelectItem value="AR">Arkansas</SelectItem>
                    <SelectItem value="CA">California</SelectItem>
                    <SelectItem value="CO">Colorado</SelectItem>
                    <SelectItem value="CT">Connecticut</SelectItem>
                    <SelectItem value="DE">Delaware</SelectItem>
                    <SelectItem value="FL">Florida</SelectItem>
                    <SelectItem value="GA">Georgia</SelectItem>
                    <SelectItem value="HI">Hawaii</SelectItem>
                    <SelectItem value="ID">Idaho</SelectItem>
                    <SelectItem value="IL">Illinois</SelectItem>
                    <SelectItem value="IN">Indiana</SelectItem>
                    <SelectItem value="IA">Iowa</SelectItem>
                    <SelectItem value="KS">Kansas</SelectItem>
                    <SelectItem value="KY">Kentucky</SelectItem>
                    <SelectItem value="LA">Louisiana</SelectItem>
                    <SelectItem value="ME">Maine</SelectItem>
                    <SelectItem value="MD">Maryland</SelectItem>
                    <SelectItem value="MA">Massachusetts</SelectItem>
                    <SelectItem value="MI">Michigan</SelectItem>
                    <SelectItem value="MN">Minnesota</SelectItem>
                    <SelectItem value="MS">Mississippi</SelectItem>
                    <SelectItem value="MO">Missouri</SelectItem>
                    <SelectItem value="MT">Montana</SelectItem>
                    <SelectItem value="NE">Nebraska</SelectItem>
                    <SelectItem value="NV">Nevada</SelectItem>
                    <SelectItem value="NH">New Hampshire</SelectItem>
                    <SelectItem value="NJ">New Jersey</SelectItem>
                    <SelectItem value="NM">New Mexico</SelectItem>
                    <SelectItem value="NY">New York</SelectItem>
                    <SelectItem value="NC">North Carolina</SelectItem>
                    <SelectItem value="ND">North Dakota</SelectItem>
                    <SelectItem value="OH">Ohio</SelectItem>
                    <SelectItem value="OK">Oklahoma</SelectItem>
                    <SelectItem value="OR">Oregon</SelectItem>
                    <SelectItem value="PA">Pennsylvania</SelectItem>
                    <SelectItem value="RI">Rhode Island</SelectItem>
                    <SelectItem value="SC">South Carolina</SelectItem>
                    <SelectItem value="SD">South Dakota</SelectItem>
                    <SelectItem value="TN">Tennessee</SelectItem>
                    <SelectItem value="TX">Texas</SelectItem>
                    <SelectItem value="UT">Utah</SelectItem>
                    <SelectItem value="VT">Vermont</SelectItem>
                    <SelectItem value="VA">Virginia</SelectItem>
                    <SelectItem value="WA">Washington</SelectItem>
                    <SelectItem value="WV">West Virginia</SelectItem>
                    <SelectItem value="WI">Wisconsin</SelectItem>
                    <SelectItem value="WY">Wyoming</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Select value={country} onValueChange={setCountry}>
                  <SelectTrigger id="country">
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="US">United States</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-base font-semibold">
                <Home className="h-5 w-5" />
                Property Features
              </Label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
                <div className="space-y-2">
                  <Label htmlFor="property-type">Property Type</Label>
                  <Select value={propertyType} onValueChange={setPropertyType}>
                    <SelectTrigger id="property-type">
                      <SelectValue placeholder="Any" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="single-family">Single Family</SelectItem>
                      <SelectItem value="multi-family">Multi-Family</SelectItem>
                      <SelectItem value="condo">Condo</SelectItem>
                      <SelectItem value="townhouse">Townhouse</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bedrooms">Bedrooms</Label>
                  <Select value={bedrooms} onValueChange={setBedrooms}>
                    <SelectTrigger id="bedrooms">
                      <SelectValue placeholder="Any" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any</SelectItem>
                      <SelectItem value="1">1+</SelectItem>
                      <SelectItem value="2">2+</SelectItem>
                      <SelectItem value="3">3+</SelectItem>
                      <SelectItem value="4">4+</SelectItem>
                      <SelectItem value="5">5+</SelectItem>
                      <SelectItem value="6">6+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bathrooms">Bathrooms</Label>
                  <Select value={bathrooms} onValueChange={setBathrooms}>
                    <SelectTrigger id="bathrooms">
                      <SelectValue placeholder="Any" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any</SelectItem>
                      <SelectItem value="1">1+</SelectItem>
                      <SelectItem value="2">2+</SelectItem>
                      <SelectItem value="3">3+</SelectItem>
                      <SelectItem value="4">4+</SelectItem>
                      <SelectItem value="5">5+</SelectItem>
                      <SelectItem value="6">6+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Square Feet: {sqft[0] > 0 ? `${sqft[0].toLocaleString()}+` : 'Any'}</Label>
                  <Slider
                    value={sqft}
                    onValueChange={setSqft}
                    min={0}
                    max={5000}
                    step={250}
                    className="w-full pt-2"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Max Budget: ${maxBudget[0].toLocaleString()}
              </Label>
              <Slider
                value={maxBudget}
                onValueChange={setMaxBudget}
                min={50000}
                max={1000000}
                step={10000}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Minimum ROI: {minROI[0]}%
              </Label>
              <Slider
                value={minROI}
                onValueChange={setMinROI}
                min={5}
                max={50}
                step={5}
                className="w-full"
              />
            </div>

            <div className="flex gap-3">
              <Button 
                onClick={handleSearch} 
                className="flex-1"
                disabled={isSearching}
              >
                <Search className="h-4 w-4 mr-2" />
                {isSearching ? "Searching..." : "Find Deals"}
              </Button>
              {(propertyType !== "all" || bedrooms !== "any" || bathrooms !== "any" || sqft[0] > 0 || maxBudget[0] < 1000000 || minROI[0] > 5) && (
                <Button 
                  onClick={() => {
                    setPropertyType("all");
                    setBedrooms("any");
                    setBathrooms("any");
                    setSqft([0]);
                    setMaxBudget([500000]);
                    setMinROI([15]);
                    setDeals([]);
                  }} 
                  variant="outline"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </CardContent>
        )}
      </Card>

      {deals.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">
            {deals.length} Properties Found
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {deals.map((deal) => (
              <div key={deal.id} className="relative">
                {deal.isPartialMatch && (
                  <div className="absolute top-2 left-2 z-10 bg-yellow-500/90 text-white px-2 py-1 rounded text-xs font-semibold">
                    Similar Match
                  </div>
                )}
                <DealCard deal={deal} />
              </div>
            ))}
          </div>
        </div>
      )}

      {deals.length === 0 && !isSearching && (
        <Card>
          <CardContent className="py-12 text-center">
            <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">
              Start your search to discover investment opportunities
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
