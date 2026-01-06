import {z} from 'zod';

export const GenerateItineraryTimelineInputSchema = z.object({
  travelOptions: z.string().describe('Travel options including flights and trains, each with links and details.'),
  accommodationOptions: z.string().describe('Accommodation options including hotels and rentals, each with links and details.'),
  touristAttractions: z.string().describe('Tourist attractions and points of interest, each with key details and links.'),
  preferences: z.string().describe('User preferences for the itinerary, including dates, budget, and interests.'),
});

export type GenerateItineraryTimelineInput = z.infer<typeof GenerateItineraryTimelineInputSchema>;

const ActivitySchema = z.object({
  text: z.string().describe('A description of the activity.'),
  type: z.enum(['travel', 'accommodation', 'activity']).describe('The type of activity.'),
  budget: z.number().optional().describe('Estimated cost for this activity in USD.'),
});

const DayEntrySchema = z.object({
  title: z.string().describe('The title for the day, e.g., "Day 1: Arrival in Paris".'),
  items: z.array(ActivitySchema).describe('A list of activities for the day.'),
});

// This is the direct output from the AI.
export const ItineraryTimelineAISchema = z.object({
  timeline: z.array(DayEntrySchema).describe('A structured timeline of the itinerary, with each element representing a day.'),
  routeMap: z.string().describe('A description of the route map for the itinerary.'),
});

// We are extending the AI output to include the raw scraped data for the bookings page.
export const GenerateItineraryTimelineOutputSchema = ItineraryTimelineAISchema.extend({
  travelOptions: z.string().describe('The raw travel options summary markdown.'),
  accommodationOptions: z.string().describe('The raw accommodation options summary markdown.'),
  touristAttractions: z.string().describe('The raw tourist attractions summary markdown.'),
});


export type GenerateItineraryTimelineOutput = z.infer<typeof GenerateItineraryTimelineOutputSchema>;
