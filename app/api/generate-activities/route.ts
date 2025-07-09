import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { answers } = await request.json();
    
    const [indoorsOutdoors, artsSports, exploringFamiliar, hobbies, location] = answers;
    
    const prompt = `Based on the following survey responses, suggest 5 fun activities the user can do in their local area:

Survey Responses:
- Indoors/Outdoors preference: ${indoorsOutdoors}
- Arts/Crafts or Sports preference: ${artsSports}
- Exploring new places or familiar things: ${exploringFamiliar}
- Hobbies: ${hobbies}
- Location (zip code & state): ${location}

Please provide 5 specific, actionable activities that match their preferences and are available in their local area. For each activity, include:
1. Activity name
2. Brief description (1-2 sentences)
3. Why it matches their preferences
4. Estimated cost range (Free, $, $$, $$$)
5. A relevant website link where they can learn more or book the activity
6. Approximate coordinates (latitude and longitude) for the activity location

For the links, use these types of sources:
- For museums/attractions: Use their official website
- For parks/recreation: Use local government parks website or AllTrails
- For classes/workshops: Use local community center, library, or Eventbrite
- For restaurants/cafes: Use Yelp or Google Maps
- For sports/fitness: Use local gym websites or Meetup
- For arts/crafts: Use local art supply stores or community centers

For coordinates, provide realistic latitude and longitude values that would be within the user's local area based on their zip code and state.

Format the response as a JSON array with objects containing: name, description, whyItMatches, costRange, link, coordinates (with lat and lng properties).`;

    const response = await client.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that suggests local activities based on user preferences. Always respond with valid JSON."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
    });

    const activitiesText = response.choices[0]?.message?.content;
    
    if (!activitiesText) {
      throw new Error('No response from OpenAI');
    }

    // Parse the JSON response
    let activities;
    try {
      activities = JSON.parse(activitiesText);
    } catch {
      // If JSON parsing fails, try to extract JSON from the response
      const jsonMatch = activitiesText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        activities = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Failed to parse activities from OpenAI response');
      }
    }

    // Ensure all activities have valid coordinates
    const activitiesWithCoordinates = activities.map((activity: Record<string, unknown>, index: number) => {
      // If coordinates are missing or invalid, generate fallback coordinates
      const coords = activity.coordinates as { lat?: number; lng?: number } | undefined;
      if (!coords || 
          typeof coords.lat !== 'number' || 
          typeof coords.lng !== 'number') {
        
        // Generate coordinates within a reasonable radius of the user's location
        // This is a simple fallback - in a real app, you'd want to geocode the location
        const baseLat = 40.7128; // Default to NYC coordinates as fallback
        const baseLng = -74.0060;
        
        // Add some variation based on index to spread activities out
        const latOffset = (index - 2) * 0.01; // Spread activities north/south
        const lngOffset = (index - 2) * 0.01; // Spread activities east/west
        
        activity.coordinates = {
          lat: baseLat + latOffset,
          lng: baseLng + lngOffset
        };
      }
      
      return activity;
    });

    return NextResponse.json({ activities: activitiesWithCoordinates });
  } catch (error) {
    console.error('Error generating activities:', error);
    return NextResponse.json(
      { error: 'Failed to generate activities' },
      { status: 500 }
    );
  }
} 