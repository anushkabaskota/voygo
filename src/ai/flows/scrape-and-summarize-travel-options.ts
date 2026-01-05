'use server';

/**
 * @fileOverview This file defines a Genkit flow to scrape and summarize travel options based on user preferences.
 *
 * - scrapeAndSummarizeTravelOptions - A function that orchestrates the scraping and summarization of travel, accommodation, and attraction options.
 * - ScrapeAndSummarizeTravelOptionsInput - The input type for the scrapeAndSummarizeTravelOptions function.
 * - ScrapeAndSummarizeTravelOptionsOutput - The return type for the scrapeAndSummarizeTravelOptions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ScrapeAndSummarizeTravelOptionsInputSchema = z.object({
  destination: z.string().describe('The desired travel destination.'),
  dates: z.string().describe('The travel dates or date range.'),
  budget: z.string().describe('The budget for the trip.'),
  interests: z.string().describe('Specific interests or activities the user enjoys (e.g., hiking, museums, food).'),
  travelOptionsPrompt: z.string().optional().describe('Optional prompt for refining travel options search.'),
  accommodationOptionsPrompt: z.string().optional().describe('Optional prompt for refining accommodation options search.'),
  attractionOptionsPrompt: z.string().optional().describe('Optional prompt for refining attraction options search.'),
});

export type ScrapeAndSummarizeTravelOptionsInput = z.infer<typeof ScrapeAndSummarizeTravelOptionsInputSchema>;

const ScrapeAndSummarizeTravelOptionsOutputSchema = z.object({
  travelOptionsSummary: z.string().describe('A summary of available travel options, including links and details.'),
  accommodationOptionsSummary: z.string().describe('A summary of available accommodation options, including links and details.'),
  attractionOptionsSummary: z.string().describe('A summary of tourist attractions and points of interest, including links and details.'),
});

export type ScrapeAndSummarizeTravelOptionsOutput = z.infer<typeof ScrapeAndSummarizeTravelOptionsOutputSchema>;

export async function scrapeAndSummarizeTravelOptions(
  input: ScrapeAndSummarizeTravelOptionsInput
): Promise<ScrapeAndSummarizeTravelOptionsOutput> {
  return scrapeAndSummarizeTravelOptionsFlow(input);
}

const travelOptionsPrompt = ai.definePrompt({
  name: 'travelOptionsPrompt',
  input: {schema: ScrapeAndSummarizeTravelOptionsInputSchema},
  prompt: `You are an expert travel assistant. Your task is to find and summarize travel options based on the user's preferences.

  Destination: {{{destination}}}
  Dates: {{{dates}}}
  Budget: {{{budget}}}
  Interests: {{{interests}}}

  Summarize available travel options (flights, trains, buses) to {{{destination}}} for the given dates and budget. Include relevant links and details.
  Refine travel options search with: {{{travelOptionsPrompt}}}
  `,
});

const accommodationOptionsPrompt = ai.definePrompt({
  name: 'accommodationOptionsPrompt',
  input: {schema: ScrapeAndSummarizeTravelOptionsInputSchema},
  prompt: `You are an expert travel assistant. Your task is to find and summarize accommodation options based on the user's preferences.

  Destination: {{{destination}}}
  Dates: {{{dates}}}
  Budget: {{{budget}}}
  Interests: {{{interests}}}

  Summarize available accommodation options (hotels, hostels, rentals) in {{{destination}}} for the given dates and budget. Include relevant links and details.
  Refine accommodation options search with: {{{accommodationOptionsPrompt}}}
  `,
});

const attractionOptionsPrompt = ai.definePrompt({
  name: 'attractionOptionsPrompt',
  input: {schema: ScrapeAndSummarizeTravelOptionsInputSchema},
  prompt: `You are an expert travel assistant. Your task is to find and summarize tourist attractions and points of interest based on the user's preferences.

  Destination: {{{destination}}}
  Interests: {{{interests}}}

  Identify and summarize tourist attractions and points of interest in {{{destination}}} based on the user's interests. Include relevant links and details.
  Refine attraction options search with: {{{attractionOptionsPrompt}}}
  `,
});

const scrapeAndSummarizeTravelOptionsFlow = ai.defineFlow(
  {
    name: 'scrapeAndSummarizeTravelOptionsFlow',
    inputSchema: ScrapeAndSummarizeTravelOptionsInputSchema,
    outputSchema: ScrapeAndSummarizeTravelOptionsOutputSchema,
  },
  async input => {
    const [travelOptions, accommodationOptions, attractionOptions] = await Promise.all([
      travelOptionsPrompt(input),
      accommodationOptionsPrompt(input),
      attractionOptionsPrompt(input),
    ]);

    return {
      travelOptionsSummary: travelOptions.output!,
      accommodationOptionsSummary: accommodationOptions.output!,
      attractionOptionsSummary: attractionOptions.output!,
    };
  }
);
