import OpenAI from 'openai';

export type Activity = {
  name: string;
  description: string;
  whyItMatches: string;
  costRange: string;
  link: string;
  coordinates: { lat: number; lng: number };
};

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateActivities(params: {
  hobbies: string[];
  zipCode: string;
}): Promise<Activity[]> {
  const { hobbies, zipCode } = params;

  const prompt = `Based on the following survey responses, suggest 5 fun activities the user can do in their local area:

Survey Responses:
- Hobbies: ${hobbies.join(', ')}
- Location (zip code): ${zipCode}

Please provide 5 specific, actionable activities that match their preferences and are available in their local area. For each activity, include:
1. Activity name
2. Brief description (1-2 sentences)
3. Why it matches their preferences
4. Estimated cost range (Free, $, $$, $$$)
5. A relevant website link where they can learn more or book the activity
6. Approximate coordinates (latitude and longitude) for the activity location

Format the response as a JSON array with objects containing: name, description, whyItMatches, costRange, link, coordinates (with lat and lng properties).`;

  const response = await client.chat.completions.create({
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content:
          'You are a helpful assistant that suggests local activities based on user preferences. Always respond with valid JSON only.',
      },
      { role: 'user', content: prompt },
    ],
    temperature: 0.7,
  });

  const text = response.choices[0]?.message?.content;
  if (!text) throw new Error('No response from OpenAI');

  // Parse JSON; tolerate extra text by extracting the first array.
  let activitiesUnknown: unknown;
  try {
    activitiesUnknown = JSON.parse(text);
  } catch {
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error('Failed to parse JSON array from OpenAI response');
    activitiesUnknown = JSON.parse(jsonMatch[0]);
  }

  const activities = Array.isArray(activitiesUnknown) ? (activitiesUnknown as Activity[]) : [];

  // Ensure coordinates exist; fallback to a default if missing.
  const baseLat = 40.7128;
  const baseLng = -74.006;

  return activities.map((activity, index) => {
    const coords = (activity as Activity).coordinates as { lat?: number; lng?: number } | undefined;
    if (!coords || typeof coords.lat !== 'number' || typeof coords.lng !== 'number') {
      const offset = (index - 2) * 0.01;
      return {
        ...activity,
        coordinates: { lat: baseLat + offset, lng: baseLng + offset },
      };
    }
    return activity;
  });
}

