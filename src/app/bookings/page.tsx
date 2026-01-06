
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plane, Hotel, MapPin, ExternalLink, ArrowLeft } from 'lucide-react';
import type { GenerateItineraryTimelineOutput } from '@/ai/flows/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Logo from '@/components/logo';

function extractLinks(text: string): { url: string; text: string }[] {
  if (!text) return [];
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  const links = [];
  let match;
  while ((match = linkRegex.exec(text)) !== null) {
    links.push({ text: match[1], url: match[2] });
  }
  return links;
}

export default function BookingsPage() {
  const [itinerary, setItinerary] = useState<GenerateItineraryTimelineOutput | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedData = sessionStorage.getItem('itineraryData');
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        setItinerary(parsedData);
      } catch (e) {
        console.error("Failed to parse itinerary data from session storage", e);
      }
    }
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading your booking options...</p>
      </div>
    );
  }

  if (!itinerary) {
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

  const travelLinks = extractLinks(itinerary.travelOptions);
  const accommodationLinks = extractLinks(itinerary.accommodationOptions);
  const attractionLinks = extractLinks(itinerary.touristAttractions);

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
              Here are the links to book your travel, accommodation, and activities.
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
                {travelLinks.length > 0 ? (
                  <ul className="space-y-4">
                    {travelLinks.map((link, index) => (
                      <li key={index} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                        <span className="font-medium">{link.text}</span>
                        <Button asChild variant="ghost" size="sm">
                          <a href={link.url} target="_blank" rel="noopener noreferrer">
                            Book Now <ExternalLink className="ml-2 h-4 w-4" />
                          </a>
                        </Button>
                      </li>
                    ))}
                  </ul>
                ) : <p className="text-muted-foreground">No travel links were found.</p>}
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
                {accommodationLinks.length > 0 ? (
                  <ul className="space-y-4">
                    {accommodationLinks.map((link, index) => (
                      <li key={index} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                        <span className="font-medium">{link.text}</span>
                        <Button asChild variant="ghost" size="sm">
                          <a href={link.url} target="_blank" rel="noopener noreferrer">
                            Book Now <ExternalLink className="ml-2 h-4 w-4" />
                          </a>
                        </Button>
                      </li>
                    ))}
                  </ul>
                ) : <p className="text-muted-foreground">No accommodation links were found.</p>}
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
                {attractionLinks.length > 0 ? (
                  <ul className="space-y-4">
                    {attractionLinks.map((link, index) => (
                      <li key={index} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                        <span className="font-medium">{link.text}</span>
                        <Button asChild variant="ghost" size="sm">
                          <a href={link.url} target="_blank" rel="noopener noreferrer">
                            View Details <ExternalLink className="ml-2 h-4 w-4" />
                          </a>
                        </Button>
                      </li>
                    ))}
                  </ul>
                ) : <p className="text-muted-foreground">No attraction links were found.</p>}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
