import { config } from 'dotenv';
config();

import '@/ai/flows/generate-personalized-itinerary.ts';
import '@/ai/flows/scrape-and-summarize-travel-options.ts';
import '@/ai/flows/generate-itinerary-timeline.ts';