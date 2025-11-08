import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { DealCard } from "./DealCard";
import { Search, Filter, MapPin, DollarSign, Home, TrendingUp } from "lucide-react";
import { Label } from "./ui/label";
import { Slider } from "./ui/slider";

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

export const DiscoverDeals = () => {
  const [city, setCity] = useState("");
  const [maxBudget, setMaxBudget] = useState([500000]);
  const [propertyType, setPropertyType] = useState("all");
  const [minROI, setMinROI] = useState([15]);
  const [isSearching, setIsSearching] = useState(false);
  const [deals, setDeals] = useState<PropertyDeal[]>([]);
  const [showFilters, setShowFilters] = useState(true);

  const handleSearch = async () => {
    setIsSearching(true);
    // TODO: Integrate with real estate API
    // For now, showing mock data
    setTimeout(() => {
      setDeals([
        {
          id: "1",
          address: "123 Main Street",
          city: city || "Austin",
          state: "TX",
          price: 250000,
          arv: 320000,
          roi: 28,
          propertyType: "Single Family",
          imageUrl: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800",
          beds: 3,
          baths: 2,
          sqft: 1800,
          lat: 30.2672,
          lng: -97.7431
        },
        {
          id: "2",
          address: "456 Oak Avenue",
          city: city || "Austin",
          state: "TX",
          price: 180000,
          arv: 245000,
          roi: 36,
          propertyType: "Condo",
          imageUrl: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800",
          beds: 2,
          baths: 2,
          sqft: 1200,
          lat: 30.2672,
          lng: -97.7431
        },
        {
          id: "3",
          address: "789 Pine Road",
          city: city || "Austin",
          state: "TX",
          price: 350000,
          arv: 465000,
          roi: 33,
          propertyType: "Multi-Family",
          imageUrl: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800",
          beds: 4,
          baths: 3,
          sqft: 2400,
          lat: 30.2672,
          lng: -97.7431
        }
      ]);
      setIsSearching(false);
    }, 1500);
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Smart Deal Finder</h1>
        <p className="text-muted-foreground">
          Discover high-ROI investment properties from MLS and Zillow
        </p>
      </div>

      <Card>
        <CardHeader className="cursor-pointer" onClick={() => setShowFilters(!showFilters)}>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Search Filters
            </span>
            <Button variant="ghost" size="sm">
              {showFilters ? "Hide" : "Show"}
            </Button>
          </CardTitle>
        </CardHeader>
        {showFilters && (
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                <Label htmlFor="property-type" className="flex items-center gap-2">
                  <Home className="h-4 w-4" />
                  Property Type
                </Label>
                <Select value={propertyType} onValueChange={setPropertyType}>
                  <SelectTrigger id="property-type">
                    <SelectValue placeholder="Select type" />
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

            <Button 
              onClick={handleSearch} 
              className="w-full"
              disabled={isSearching}
            >
              <Search className="h-4 w-4 mr-2" />
              {isSearching ? "Searching..." : "Find Deals"}
            </Button>
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
              <DealCard key={deal.id} deal={deal} />
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
