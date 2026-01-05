"use server";

import { z } from "zod";
import { format } from "date-fns";
import {
  scrapeAndSummarizeTravelOptions,
  type ScrapeAndSummarizeTravelOptionsInput,
} from "@/ai/flows/scrape-and-summarize-travel-options";
import {
  generateItineraryTimeline,
  type GenerateItineraryTimelineInput,
} from "@/ai/flows/generate-itinerary-timeline";
import { FormSchema } from "@/lib/types";

export async function generateItineraryAction(
  values: z.infer<typeof FormSchema>
) {
  const validatedFields = FormSchema.safeParse(values);

  if (!validatedFields.success) {
    return { success: false, error: "Invalid form data." };
  }

  const { destination, dates, budget, interests, travelStyle } =
    validatedFields.data;
  const startDate = format(dates.from, "yyyy-MM-dd");
  const endDate = format(dates.to, "yyyy-MM-dd");

  try {
    // Step 1: Scrape and summarize travel options
    const scrapeInput: ScrapeAndSummarizeTravelOptionsInput = {
      destination,
      dates: `From ${startDate} to ${endDate}`,
      budget: `${budget} USD`,
      interests,
    };

    const scrapedData = await scrapeAndSummarizeTravelOptions(scrapeInput);

    // Step 2: Generate the itinerary timeline from the scraped data
    const preferences = `
      - Destination: ${destination}
      - Dates: From ${startDate} to ${endDate}
      - Budget: Approximately ${budget} USD
      - Interests: ${interests}
      - Travel Style: ${travelStyle}
    `;

    const timelineInput: GenerateItineraryTimelineInput = {
      travelOptions: scrapedData.travelOptionsSummary,
      accommodationOptions: scrapedData.accommodationOptionsSummary,
      touristAttractions: scrapedData.attractionOptionsSummary,
      preferences,
    };

    const itinerary = await generateItineraryTimeline(timelineInput);

    return { success: true, data: itinerary };
  } catch (error) {
    console.error("Error generating itinerary:", error);
    return {
      success: false,
      error: "Failed to generate itinerary. The AI agent may be unavailable.",
    };
  }
}
