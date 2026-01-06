
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plane, Hotel, MapPin, ExternalLink, ArrowLeft, Building, MountainSnow, Utensils } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import type { GenerateItineraryTimelineOutput } from '@/ai/flows/types';
import { type FormSchema } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Logo from '@/components/logo';
import { z } from 'zod';


type ItineraryData = {
  timeline: GenerateItineraryTimelineOutput;
  formData: z.infer<typeof FormSchema>;
};

interface BookingLink {
  name: string;
  url: string;
  icon: React.ReactNode;
}

// --- URL Generation Functions ---

function getTravelLinks(formData: z.infer<typeof FormSchema>): BookingLink[] {
  if (!formData?.destination || !formData.dates.from || !formData.dates.to) return [];
  
  const origin = "your location"; // Generic origin
  const destination = formData.destination;
  const departureDate = format(formData.dates.from, 'yyyy-MM-dd');
  const returnDate = format(formData.dates.to, 'yyyy-MM-dd');

  return [
    {
      name: 'Google Flights',
      url: `https://www.google.com/flights?q=Flights+to+${encodeURIComponent(destination)}+from+${encodeURIComponent(origin)}+on+${departureDate}+to+${returnDate}`,
      icon: <Plane className="h-8 w-8" />,
    },
    {
      name: 'Skyscanner',
      url: `https://www.skyscanner.com/transport/flights/from-any/${encodeURIComponent(destination.toLowerCase().replace(/\s/g, '-'))}/${departureDate}/${returnDate}/`,
      icon: <Plane className="h-8 w-8" />,
    },
  ];
}

function getAccommodationLinks(formData: z.infer<typeof FormSchema>, itinerary: GenerateItineraryTimelineOutput): BookingLink[] {
  if (!formData?.destination || !formData.dates.from || !formData.dates.to) return [];

  const destination = formData.destination;
  const checkinDate = format(formData.dates.from, 'yyyy-MM-dd');
  const checkoutDate = format(formData.dates.to, 'yyyy-MM-dd');
  const nights = differenceInDays(formData.dates.to, formData.dates.from);

  // Try to find a specific neighborhood from the itinerary
  const accommodationInfo = itinerary.timeline?.flatMap(day => day.items).find(item => item.type === 'accommodation')?.text;
  let query = destination;
  if (accommodationInfo) {
      // A simple heuristic to find a hotel name or area
      const hotelMatch = accommodationInfo.match(/(?:at|in|near|stay at)\s(.*?)(?:,|$|\.)/i);
      if (hotelMatch && hotelMatch[1]) {
        query = hotelMatch[1].trim() + ", " + destination;
      }
  }

  return [
    {
      name: 'Booking.com',
      url: `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(query)}&checkin=${checkinDate}&checkout=${checkoutDate}&group_adults=2`,
      icon: <Building className="h-8 w-8" />,
    },
    {
      name: 'Airbnb',
      url: `https://www.airbnb.com/s/${encodeURIComponent(query)}/homes?checkin=${checkinDate}&checkout=${checkoutDate}&adults=2`,
      icon: <Hotel className="h-8 w-8" />,
    },
  ];
}

function getAttractionLinks(formData: z.infer<typeof FormSchema>, itinerary: GenerateItineraryTimelineOutput): BookingLink[] {
    if (!formData?.destination) return [];

    const destination = formData.destination;
    
    const activityItems = itinerary.timeline?.flatMap(day => day.items).filter(item => item.type === 'activity') || [];

    const keywords = new Set<string>();
    const commonWords = new Set(['visit', 'explore', 'discover', 'tour', 'of', 'the', 'a', 'an', 'in', 'and', 'at', 'for', 'with', 'by', 'on', 'from', 'to']);

    activityItems.forEach(item => {
        // Attempt to extract proper nouns or things after verbs like "Visit", "Explore"
        const potentialLandmarkMatch = item.text.match(/(?:visit|explore|see|discover|tour)\s(the\s)?([\w\s\d'’]+)/i);
        if (potentialLandmarkMatch && potentialLandmarkMatch[2]) {
            let landmark = potentialLandmarkMatch[2].replace(/(\.|,)$/, '').trim();
            // Avoid adding generic terms
            if (landmark.toLowerCase() !== 'city' && landmark.toLowerCase() !== 'area' && landmark.split(' ').length < 4) {
                 keywords.add(landmark);
            }
        }
        
        // Also add capitalized words as a fallback
        const capitalizedWords = item.text.match(/\b([A-Z][a-z]{2,}(?:\s[A-Z][a-z]+)*)\b/g);
        if (capitalizedWords) {
            capitalizedWords.forEach(word => {
              if (!commonWords.has(word.toLowerCase()) && word.split(' ').length < 4) {
                 keywords.add(word.trim());
              }
            });
        }
    });

    const uniqueKeywords = Array.from(keywords);

    const links: BookingLink[] = [];

    links.push({
        name: 'GetYourGuide',
        url: `https://www.getyourguide.com/search?q=${encodeURIComponent(destination)}&activity_type=tour`,
        icon: <MountainSnow className="h-8 w-8" />,
    });

    links.push({
        name: 'Klook',
        url: `https://www.klook.com/search/things-to-do?query=${encodeURIComponent(destination)}`,
        icon: <MapPin className="h-8 w-8" />,
    });

    // Add a specific link for the first identified keyword, if any
    if (uniqueKeywords.length > 0) {
        const topKeyword = uniqueKeywords[0];
        links.push({
            name: `Tours for "${topKeyword}"`,
            url: `https://www.getyourguide.com/search?q=${encodeURIComponent(topKeyword)}`,
            icon: <Utensils className="h-8 w-8" />,
        });
    }

    return links;
}


export default function BookingsPage() {
  const [itineraryData, setItineraryData] = useState<ItineraryData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedData = sessionStorage.getItem('itineraryPayload');
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        // We need to parse date strings back into Date objects for the form data
        if(parsedData.formData.dates.from && parsedData.formData.dates.to) {
          parsedData.formData.dates.from = new Date(parsedData.formData.dates.from);
          parsedData.formData.dates.to = new Date(parsedData.formData.dates.to);
        }
        setItineraryData(parsedData);
      } catch (e) {
        console.error("Failed to parse itinerary data from session storage", e);
      }
    }
    setLoading(false);
  }, []);

  const renderLinks = (links: BookingLink[], title: string) => {
    if (links.length === 0) {
      return <p className="text-muted-foreground">No relevant booking options were found for {title.toLowerCase()}.</p>;
    }
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {links.map((link) => (
          <a
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            key={link.name}
            className="block p-4 bg-secondary/50 rounded-lg hover:bg-secondary transition-colors group"
          >
            <div className="flex items-center gap-4">
              <div className="text-primary bg-primary/10 p-3 rounded-full">
                {link.icon}
              </div>
              <div>
                <h3 className="font-semibold text-lg">{link.name}</h3>
                <p className="text-sm text-muted-foreground flex items-center">
                  Book on {link.name.split(' ')[0]} <ExternalLink className="ml-1.5 h-3 w-3 group-hover:translate-x-1 transition-transform" />
                </p>
              </div>
            </div>
          </a>
        ))}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading your booking options...</p>
      </div>
    );
  }

  if (!itineraryData?.timeline || !itineraryData?.formData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center">
        <h2 className="text-2xl font-bold mb-4">No Itinerary Found</h2>
        <p className="text-muted-foreground mb-6">
          Please generate an itinerary first to see your booking options.
        </p>
        <Button asChild>
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Planner
          </Link>
        </Button>
      </div>
    );
  }

  const { timeline, formData } = itineraryData;
  const travelLinks = getTravelLinks(formData);
  const accommodationLinks = getAccommodationLinks(formData, timeline);
  const attractionLinks = getAttractionLinks(formData, timeline);

  return (
    <main className="flex flex-col items-center min-h-screen w-full bg-background/80">
      <div className="w-full h-full flex flex-col items-center container mx-auto p-4 md:p-8">
        <header className="w-full flex justify-between items-center py-4 mb-8">
          <Logo />
           <Button asChild variant="outline">
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Itinerary
              </Link>
            </Button>
        </header>

        <div className="w-full max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-foreground font-headline mb-2">
              Book Your Trip
            </h1>
            <p className="text-lg text-muted-foreground">
              Here are personalized links to book your travel, accommodation, and activities.
              <br/>
              <span className="text-sm">Please note: Bookings are made on third-party websites.</span>
            </p>
          </div>

          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Plane className="h-6 w-6 text-primary" />
                  <span className="font-headline text-2xl">Travel Options</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {renderLinks(travelLinks, "Travel")}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Hotel className="h-6 w-6 text-primary" />
                  <span className="font-headline text-2xl">Accommodation</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {renderLinks(accommodationLinks, "Accommodation")}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <MapPin className="h-6 w-6 text-primary" />
                  <span className="font-headline text-2xl">Attractions & Activities</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {renderLinks(attractionLinks, "Attractions")}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
