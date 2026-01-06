
'use server';
/**
 * @fileOverview An AI agent that arranges travel options, accommodation, and points of interest into an interactive timeline based on user preferences.
 *
 * - generateItineraryTimeline - A function that handles the generation of the itinerary timeline.
 */

import {ai} from '@/ai/genkit';
import { GenerateItineraryTimelineInputSchema, ItineraryTimelineAISchema, GenerateItineraryTimelineOutputSchema, type GenerateItineraryTimelineInput, type GenerateItineraryTimelineOutput } from './types';


export async function generateItineraryTimeline(input: GenerateItineraryTimelineInput): Promise<GenerateItineraryTimelineOutput> {
  const result = await generateItineraryTimelineFlow(input);
  return {
    ...result,
    travelOptions: input.travelOptions,
    accommodationOptions: input.accommodationOptions,
    touristAttractions: input.touristAttractions,
  };
}

const generateItineraryTimelinePrompt = ai.definePrompt({
  name: 'generateItineraryTimelinePrompt',
  input: {schema: GenerateItineraryTimelineInputSchema},
  output: {schema: ItineraryTimelineAISchema},
  prompt: `You are a professional travel planner creating a detailed, realistic travel itinerary.

Based on the following user preferences: {{{preferences}}}, arrange the following travel options: {{{travelOptions}}}, accommodation options: {{{accommodationOptions}}}, and tourist attractions: {{{touristAttractions}}} into a daily timeline and route map.

Use the specific names of hotels, restaurants, and attractions provided. Do not use generic phrases like "a luxury hotel" or "a local restaurant".

Create a timeline that incorporates travel, accommodation, and attractions in a sensible order, creating a comprehensive itinerary. Each day should be a list of activities.
For each activity, determine its type: 'travel' (for flights, trains, etc.), 'accommodation' (for hotel check-ins), or 'activity' (for sightseeing, meals, etc.).

For each activity, provide an estimated cost in USD in the 'budget' field. If an activity is free, set the budget to 0.

Create a description of a route map that shows how to get to each thing in the timeline, and incorporate methods of transit.

Output the structured timeline and the route map description in the specified JSON format.
`,
});

const generateItineraryTimelineFlow = ai.defineFlow(
  {
    name: 'generateItineraryTimelineFlow',
    inputSchema: GenerateItineraryTimelineInputSchema,
    outputSchema: ItineraryTimelineAISchema,
  },
  async input => {
    const {output} = await generateItineraryTimelinePrompt(input);
    return output!;
  }
);
