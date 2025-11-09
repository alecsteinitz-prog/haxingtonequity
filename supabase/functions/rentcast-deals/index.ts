import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PropertySearchParams {
  city: string;
  state: string;
  maxPrice?: number;
  propertyType?: string;
  bedrooms?: number;
  bathrooms?: number;
  sqft?: number;
  limit?: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { city, state, maxPrice, propertyType, bedrooms, bathrooms, sqft, limit = 10 } = await req.json() as PropertySearchParams;
    
    console.log('Searching for properties:', { city, state, maxPrice, propertyType, bedrooms, bathrooms, sqft });

    const RENTCAST_API_KEY = Deno.env.get('RENTCAST_API_KEY');
    if (!RENTCAST_API_KEY) {
      throw new Error('RENTCAST_API_KEY not configured');
    }

    // Rentcast API endpoint for property search
    const url = new URL('https://api.rentcast.io/v1/properties');
    url.searchParams.append('city', city);
    url.searchParams.append('state', state);
    if (maxPrice) {
      url.searchParams.append('maxPrice', maxPrice.toString());
    }
    if (propertyType && propertyType !== 'all') {
      url.searchParams.append('propertyType', propertyType);
    }
    if (bedrooms) {
      url.searchParams.append('bedrooms', bedrooms.toString());
    }
    if (bathrooms) {
      url.searchParams.append('bathrooms', bathrooms.toString());
    }
    if (sqft) {
      url.searchParams.append('squareFootage', sqft.toString());
    }
    url.searchParams.append('limit', limit.toString());

    console.log('Calling Rentcast API:', url.toString());

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'X-Api-Key': RENTCAST_API_KEY,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Rentcast API error:', response.status, errorText);
      throw new Error(`Rentcast API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Rentcast API response received, processing properties...');

    // Transform Rentcast data and fetch rental estimates
    const dealsPromises = (data || []).map(async (property: any) => {
      let estimatedPrice = 0;
      let monthlyRent = 0;
      
      // Try to get rent estimate for better pricing
      try {
        const rentEstimateUrl = new URL('https://api.rentcast.io/v1/avm/rent/long-term');
        rentEstimateUrl.searchParams.append('address', property.formattedAddress);
        
        const rentResponse = await fetch(rentEstimateUrl.toString(), {
          method: 'GET',
          headers: {
            'X-Api-Key': RENTCAST_API_KEY,
            'Accept': 'application/json',
          },
        });
        
        if (rentResponse.ok) {
          const rentData = await rentResponse.json();
          monthlyRent = rentData.rent || 0;
          // Estimate property value using rent multiplier (typical 150-200x monthly rent)
          estimatedPrice = monthlyRent > 0 ? Math.round(monthlyRent * 175) : 0;
          console.log(`Rent estimate for ${property.formattedAddress}: $${monthlyRent}/mo, Est. value: $${estimatedPrice}`);
        }
      } catch (rentError) {
        console.log(`Could not fetch rent estimate for ${property.formattedAddress}`);
      }
      
      return {
        id: property.id || property.formattedAddress,
        address: property.addressLine1 || property.formattedAddress,
        city: property.city || city,
        state: property.state || state,
        price: estimatedPrice,
        arv: estimatedPrice > 0 ? Math.round(estimatedPrice * 1.15) : 0,
        roi: monthlyRent > 0 && estimatedPrice > 0 ? Math.round((monthlyRent * 12 / estimatedPrice) * 100) : 25,
        propertyType: property.propertyType || 'Apartment',
        imageUrl: property.photos?.[0] || 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800',
        beds: property.bedrooms || 0,
        baths: property.bathrooms || 0,
        sqft: property.squareFootage || 0,
        lat: property.latitude || 0,
        lng: property.longitude || 0,
        monthlyRent: monthlyRent,
      };
    });
    
    const deals = await Promise.all(dealsPromises);

    return new Response(
      JSON.stringify({ 
        deals,
        success: true,
        message: '✅ Rentcast API connected successfully'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in rentcast-deals function:', error);
    
    // Provide more specific error messages
    let userMessage = error.message;
    if (error.message.includes('billing/subscription-inactive')) {
      userMessage = 'Rentcast API subscription is inactive. Please activate your subscription at https://app.rentcast.io/app/api';
    } else if (error.message.includes('auth/api-key-invalid')) {
      userMessage = 'Rentcast API key is invalid. Please check your API key configuration.';
    }
    
    return new Response(
      JSON.stringify({ 
        error: userMessage,
        deals: [],
        success: false
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 // Return 200 with empty deals to avoid frontend errors
      }
    );
  }
});
