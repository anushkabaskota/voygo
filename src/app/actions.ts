
"use server";

import { z } from "zod";
import { format } from "date-fns";
import {
  scrapeAndSummarizeTravelOptions,
  type ScrapeAndSummarizeTravelOptionsInput,
  type ScrapeAndSummarizeTravelOptionsOutput,
} from "@/ai/flows/scrape-and-summarize-travel-options";
import {
  generateItineraryTimeline,
} from "@/ai/flows/generate-itinerary-timeline";
import { type GenerateItineraryTimelineInput, type GenerateItineraryTimelineOutput } from "@/ai/flows/types";
import { FormSchema } from "@/lib/types";

// We need to return the scraped data along with the timeline
type ItineraryActionResult = {
  timeline: GenerateItineraryTimelineOutput;
  scrapedData: ScrapeAndSummarizeTravelOptionsOutput;
};

export async function generateItineraryAction(
  values: z.infer<typeof FormSchema>
): Promise<{ success: boolean; data?: ItineraryActionResult; error?: string }> {
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
      interests: interests.join(", "),
    };

    const scrapedData = await scrapeAndSummarizeTravelOptions(scrapeInput);

    // Step 2: Generate the itinerary timeline from the scraped data
    const preferences = `
      - Destination: ${destination}
      - Dates: From ${startDate} to ${endDate}
      - Budget: Approximately ${budget} USD
      - Interests: ${interests.join(", ")}
      - Travel Style: ${travelStyle.join(", ")}
    `;

    const timelineInput: GenerateItineraryTimelineInput = {
      travelOptions: scrapedData.travelOptionsSummary,
      accommodationOptions: scrapedData.accommodationOptionsSummary,
      touristAttractions: scrapedData.attractionOptionsSummary,
      preferences,
    };

    const timeline = await generateItineraryTimeline(timelineInput);

    return {
      success: true,
      data: {
        timeline: timeline,
        scrapedData: {
            travelOptionsSummary: scrapedData.travelOptionsSummary,
            accommodationOptionsSummary: scrapedData.accommodationOptionsSummary,
            attractionOptionsSummary: scrapedData.attractionOptionsSummary
        }
      },
    };
  } catch (error) {
    console.error("Error generating itinerary:", error);
    return {
      success: false,
      error: "Failed to generate itinerary. The AI agent may be unavailable.",
    };
  }
}
