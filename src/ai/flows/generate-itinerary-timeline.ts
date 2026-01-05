'use server';
/**
 * @fileOverview An AI agent that arranges travel options, accommodation, and points of interest into an interactive timeline based on user preferences.
 *
 * - generateItineraryTimeline - A function that handles the generation of the itinerary timeline.
 * - GenerateItineraryTimelineInput - The input type for the generateItineraryTimeline function.
 * - GenerateItineraryTimelineOutput - The return type for the generateItineraryTimeline function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateItineraryTimelineInputSchema = z.object({
  travelOptions: z.string().describe('Travel options including flights and trains, each with links and details.'),
  accommodationOptions: z.string().describe('Accommodation options including hotels and rentals, each with links and details.'),
  touristAttractions: z.string().describe('Tourist attractions and points of interest, each with key details and links.'),
  preferences: z.string().describe('User preferences for the itinerary, including dates, budget, and interests.'),
});

export type GenerateItineraryTimelineInput = z.infer<typeof GenerateItineraryTimelineInputSchema>;

const GenerateItineraryTimelineOutputSchema = z.object({
  timeline: z.string().describe('A structured timeline of the itinerary, including travel, accommodation, and attractions.'),
  routeMap: z.string().describe('A description of the route map for the itinerary.'),
});

export type GenerateItineraryTimelineOutput = z.infer<typeof GenerateItineraryTimelineOutputSchema>;

export async function generateItineraryTimeline(input: GenerateItineraryTimelineInput): Promise<GenerateItineraryTimelineOutput> {
  return generateItineraryTimelineFlow(input);
}

const generateItineraryTimelinePrompt = ai.definePrompt({
  name: 'generateItineraryTimelinePrompt',
  input: {schema: GenerateItineraryTimelineInputSchema},
  output: {schema: GenerateItineraryTimelineOutputSchema},
  prompt: `You are a professional travel planner creating a detailed, realistic travel itinerary.

Based on the following user preferences: {{{preferences}}}, arrange the following travel options: {{{travelOptions}}}, accommodation options: {{{accommodationOptions}}}, and tourist attractions: {{{touristAttractions}}} into a daily timeline and route map.

Use the specific names of hotels, restaurants, and attractions provided. Do not use generic phrases like "a luxury hotel" or "a local restaurant".

Create a timeline that incorporates travel, accommodation, and attractions in a sensible order, creating a comprehensive itinerary. Each day should be a list of activities.
Create a description of a route map that shows how to get to each thing in the timeline, and incorporate methods of transit.

Output the timeline, followed by the route map.
`,
});

const generateItineraryTimelineFlow = ai.defineFlow(
  {
    name: 'generateItineraryTimelineFlow',
    inputSchema: GenerateItineraryTimelineInputSchema,
    outputSchema: GenerateItineraryTimelineOutputSchema,
  },
  async input => {
    const {output} = await generateItineraryTimelinePrompt(input);
    return output!;
  }
);
