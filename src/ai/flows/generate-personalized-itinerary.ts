'use server';

/**
 * @fileOverview Generates a personalized travel itinerary based on user preferences.
 *
 * - generatePersonalizedItinerary - A function that takes user preferences and generates a personalized itinerary.
 * - PersonalizedItineraryInput - The input type for the generatePersonalizedItinerary function.
 * - PersonalizedItineraryOutput - The return type for the generatePersonalizedItinerary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PersonalizedItineraryInputSchema = z.object({
  destination: z.string().describe('The desired travel destination.'),
  startDate: z.string().describe('The start date of the trip (YYYY-MM-DD).'),
  endDate: z.string().describe('The end date of the trip (YYYY-MM-DD).'),
  budget: z.number().describe('The budget for the entire trip in USD.'),
  interests: z
    .string()
    .describe(
      'A comma-separated list of interests, e.g., history, food, museums.'
    ),
  travelStyle: z
    .string()
    .describe(
      'A description of the desired travel style, e.g., adventurous, relaxing, luxurious.'
    ),
});

export type PersonalizedItineraryInput = z.infer<
  typeof PersonalizedItineraryInputSchema
>;

const PersonalizedItineraryOutputSchema = z.object({
  itinerary: z
    .string()
    .describe('A detailed travel itinerary as a markdown string.'),
});

export type PersonalizedItineraryOutput = z.infer<
  typeof PersonalizedItineraryOutputSchema
>;

export async function generatePersonalizedItinerary(
  input: PersonalizedItineraryInput
): Promise<PersonalizedItineraryOutput> {
  return generatePersonalizedItineraryFlow(input);
}

const personalizedItineraryPrompt = ai.definePrompt({
  name: 'personalizedItineraryPrompt',
  input: {schema: PersonalizedItineraryInputSchema},
  output: {schema: PersonalizedItineraryOutputSchema},
  prompt: `You are an expert travel planner. Generate a personalized travel itinerary based on the user's preferences.

Destination: {{{destination}}}
Start Date: {{{startDate}}}
End Date: {{{endDate}}}
Budget: {{{budget}}} USD
Interests: {{{interests}}}
Travel Style: {{{travelStyle}}}

Create a detailed itinerary, including daily activities, accommodation suggestions, and travel tips. The itinerary should be formatted as a markdown string.
`,
});

const generatePersonalizedItineraryFlow = ai.defineFlow(
  {
    name: 'generatePersonalizedItineraryFlow',
    inputSchema: PersonalizedItineraryInputSchema,
    outputSchema: PersonalizedItineraryOutputSchema,
  },
  async input => {
    const {output} = await personalizedItineraryPrompt(input);
    return output!;
  }
);
