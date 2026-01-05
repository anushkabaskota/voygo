"use client";

import { useMemo } from "react";
import {
  Plane,
  Hotel,
  MapPin,
  Map,
  Calendar,
  Sparkles,
  ArrowLeft,
  DollarSign,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { GenerateItineraryTimelineOutput } from "@/ai/flows/generate-itinerary-timeline";

interface ItineraryDisplayProps {
  itinerary: GenerateItineraryTimelineOutput;
  onReset: () => void;
}

const iconMap = {
  travel: Plane,
  accommodation: Hotel,
  activity: MapPin,
};

export default function ItineraryDisplay({
  itinerary,
  onReset,
}: ItineraryDisplayProps) {
  const parsedTimeline = useMemo(() => {
    if (!itinerary.timeline) return [];
    return itinerary.timeline.map((day) => ({
      ...day,
      items: day.items.map((item) => ({
        ...item,
        icon: iconMap[item.type] || MapPin,
      })),
    }));
  }, [itinerary.timeline]);

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-foreground font-headline mb-2">
          Your Adventure Awaits!
        </h1>
        <p className="text-lg text-muted-foreground">
          Here is your AI-generated personalized itinerary.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-6 w-6 text-primary" />
                <span className="font-headline text-2xl">Daily Timeline</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {parsedTimeline && parsedTimeline.length > 0 ? (
                <Accordion
                  type="single"
                  collapsible
                  defaultValue="day-0"
                  className="w-full"
                >
                  {parsedTimeline.map((day, dayIndex) => (
                    <AccordionItem value={`day-${dayIndex}`} key={dayIndex}>
                      <AccordionTrigger className="text-xl font-headline text-primary hover:no-underline">
                        {day.title}
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="pl-5 border-l-2 border-primary/20 space-y-6 pt-4">
                          {day.items.map((item, itemIndex) => {
                            const Icon = item.icon;
                            return (
                              <div
                                key={itemIndex}
                                className="flex items-start gap-4 relative"
                              >
                                <div className="absolute -left-[11px] top-1 z-10 bg-background p-1 rounded-full border">
                                  <Icon className="h-3 w-3 text-accent" />
                                </div>
                                <div className="ml-6 flex-1">
                                  <p className="text-foreground/90">{item.text}</p>
                                  {item.budget !== undefined && (
                                    <div className="flex items-center text-xs text-muted-foreground mt-1">
                                      <DollarSign className="h-3 w-3 mr-1" />
                                      <span>
                                        {item.budget > 0
                                          ? `Est. $${item.budget}`
                                          : "Free"}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              ) : (
                <p className="text-muted-foreground">
                  The AI couldn't generate a detailed daily timeline.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Map className="h-6 w-6 text-primary" />
                <span className="font-headline text-2xl">Route Map</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                {itinerary.routeMap}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-primary/10 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <Sparkles className="h-6 w-6" />
                <span className="font-headline text-xl">Powered by AI</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                This itinerary was generated by voygo AI. Remember to
                double-check bookings and opening times.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="text-center mt-12">
        <Button onClick={onReset} size="lg" variant="outline">
          <ArrowLeft className="mr-2 h-5 w-5" />
          Plan Another Trip
        </Button>
      </div>
    </div>
  );
}
