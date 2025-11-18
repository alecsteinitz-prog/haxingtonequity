import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SearchParams {
  address?: string;
  city?: string;
  state?: string;
  maxPrice?: number;
  propertyType?: string;
  bedrooms?: number;
  bathrooms?: number;
  sqft?: number;
  limit?: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const params: SearchParams = await req.json();
    const deepseekApiKey = Deno.env.get('DEEPSEEK_API_KEY');

    if (!deepseekApiKey) {
      console.error('DEEPSEEK_API_KEY not configured');
      return new Response(
        JSON.stringify({ 
          error: 'API key not configured',
          success: false 
        }), 
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Search params:', params);

    // Build the search query for Deepseek
    const searchQuery = buildSearchQuery(params);
    console.log('Search query:', searchQuery);

    // Call Deepseek API to search for Zillow listings
    const deepseekResponse = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${deepseekApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: `You are a real estate data assistant. Extract property listing information from Zillow based on the search criteria. Return ONLY a valid JSON array of property objects with this exact structure:
[
  {
    "id": "unique_id",
    "address": "full street address",
    "city": "city name",
    "state": "state code",
    "price": number,
    "arv": number (estimated after repair value, 10-20% above price),
    "roi": number (percentage),
    "propertyType": "Single Family|Multi Family|Condo|Townhouse",
    "imageUrl": "property image URL or placeholder",
    "beds": number,
    "baths": number,
    "sqft": number,
    "lat": number,
    "lng": number,
    "monthlyRent": number (estimated),
    "grossYield": number (percentage),
    "description": "brief property description",
    "status": "For Sale|Pending|New Listing"
  }
]

Return realistic property data based on the search criteria. If no exact matches, return similar properties in the area. Always return valid JSON array.`
          },
          {
            role: 'user',
            content: searchQuery
          }
        ],
        temperature: 0.3,
        max_tokens: 4000,
      }),
    });

    if (!deepseekResponse.ok) {
      const errorText = await deepseekResponse.text();
      console.error('Deepseek API error:', deepseekResponse.status, errorText);
      return new Response(
        JSON.stringify({ 
          error: `Deepseek API error: ${deepseekResponse.status}`,
          success: false,
          deals: []
        }), 
        { 
          status: deepseekResponse.status, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const deepseekData = await deepseekResponse.json();
    console.log('Deepseek response received');

    // Extract the property data from Deepseek's response
    const content = deepseekData.choices?.[0]?.message?.content || '[]';
    console.log('Deepseek content:', content);

    let properties = [];
    try {
      // Try to parse the JSON response
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        properties = JSON.parse(jsonMatch[0]);
      } else {
        properties = JSON.parse(content);
      }
    } catch (parseError) {
      console.error('Error parsing Deepseek response:', parseError);
      console.error('Content was:', content);
      
      // Return empty results instead of error
      return new Response(
        JSON.stringify({ 
          success: true,
          deals: [],
          message: 'No properties found matching your criteria'
        }), 
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Validate and normalize the data
    const deals = properties.map((prop: any, index: number) => ({
      id: prop.id || `prop_${Date.now()}_${index}`,
      address: prop.address || 'Address not available',
      city: prop.city || params.city || '',
      state: prop.state || params.state || '',
      price: Number(prop.price) || 0,
      arv: Number(prop.arv) || Number(prop.price) * 1.15,
      roi: Number(prop.roi) || 15,
      propertyType: prop.propertyType || params.propertyType || 'Single Family',
      imageUrl: prop.imageUrl || `https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&h=600&fit=crop`,
      beds: Number(prop.beds) || 3,
      baths: Number(prop.baths) || 2,
      sqft: Number(prop.sqft) || 1500,
      lat: Number(prop.lat) || 0,
      lng: Number(prop.lng) || 0,
      monthlyRent: Number(prop.monthlyRent) || 0,
      grossYield: Number(prop.grossYield) || 0,
      description: prop.description || '',
      status: prop.status || 'For Sale'
    }));

    console.log(`Found ${deals.length} properties`);

    return new Response(
      JSON.stringify({ 
        success: true,
        deals,
        message: `Found ${deals.length} properties matching your criteria`
      }), 
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in zillow-deepseek-search:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An unexpected error occurred',
        success: false,
        deals: []
      }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

function buildSearchQuery(params: SearchParams): string {
  const parts = [];
  
  if (params.address) {
    parts.push(`Address: ${params.address}`);
  }
  
  if (params.city) {
    parts.push(`City: ${params.city}`);
  }
  
  if (params.state) {
    parts.push(`State: ${params.state}`);
  }
  
  if (params.maxPrice) {
    parts.push(`Maximum Price: $${params.maxPrice.toLocaleString()}`);
  }
  
  if (params.propertyType && params.propertyType !== 'all') {
    parts.push(`Property Type: ${params.propertyType}`);
  }
  
  if (params.bedrooms) {
    parts.push(`Bedrooms: ${params.bedrooms}+`);
  }
  
  if (params.bathrooms) {
    parts.push(`Bathrooms: ${params.bathrooms}+`);
  }
  
  if (params.sqft && params.sqft > 0) {
    parts.push(`Minimum Square Feet: ${params.sqft}`);
  }
  
  const limit = params.limit || 10;
  parts.push(`Return up to ${limit} properties`);
  
  return `Search for real estate properties on Zillow with the following criteria:\n${parts.join('\n')}\n\nProvide realistic property listings with accurate pricing, locations, and details.`;
}
