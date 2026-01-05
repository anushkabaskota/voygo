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
  ChevronDown,
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

type TimelineItem = {
  text: string;
  type: "travel" | "accommodation" | "activity";
  icon: React.ElementType;
};

type DayEntry = {
  title: string;
  items: TimelineItem[];
};

const iconMap = {
  travel: Plane,
  accommodation: Hotel,
  activity: MapPin,
};

const parseTimeline = (timeline: string): DayEntry[] => {
  if (!timeline) return [];

  const entries: DayEntry[] = [];
  const dayBlocks = timeline.split(/(?=^Day \d+.*$)/im);

  dayBlocks.forEach((block) => {
    const lines = block.trim().split('\n');
    if (lines.length === 0 || !lines[0].trim().startsWith("Day")) return;

    const title = lines.shift()!.trim();
    const items: TimelineItem[] = [];

    lines.forEach(line => {
      const trimmedLine = line.trim().replace(/^- /, "");
      if (!trimmedLine) return;
      
      let type: TimelineItem['type'] = "activity";

      if (trimmedLine.toLowerCase().includes("arrive") || trimmedLine.toLowerCase().includes("flight") || trimmedLine.toLowerCase().includes("train")) {
        type = "travel";
      } else if (trimmedLine.toLowerCase().includes("check in") || trimmedLine.toLowerCase().includes("accommodation")) {
        type = "accommodation";
      }

      items.push({
        text: trimmedLine,
        type: type,
        icon: iconMap[type],
      });
    });

    if (title || items.length > 0) {
      entries.push({ title: title || `Day ${entries.length + 1}`, items });
    }
  });

  return entries;
};

export default function ItineraryDisplay({
  itinerary,
  onReset,
}: ItineraryDisplayProps) {
  const parsedTimeline = useMemo(
    () => parseTimeline(itinerary.timeline),
    [itinerary.timeline]
  );

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
              {parsedTimeline.length > 0 ? (
                 <Accordion type="single" collapsible defaultValue="day-0" className="w-full">
                  {parsedTimeline.map((day, dayIndex) => (
                    <AccordionItem value={`day-${dayIndex}`} key={dayIndex}>
                      <AccordionTrigger className="text-xl font-headline text-primary hover:no-underline">
                        {day.title}
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="pl-4 border-l-2 border-primary/20 space-y-6 pt-4">
                          {day.items.map((item, itemIndex) => {
                            const Icon = item.icon;
                            return (
                              <div key={itemIndex} className="flex items-start gap-4 relative">
                                <div className="absolute -left-[27px] top-1 z-10 bg-background p-1.5 rounded-full border">
                                  <Icon className="h-4 w-4 text-accent" />
                                </div>
                                <p className="pt-0.5 text-foreground/90">{item.text}</p>
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
                  The AI couldn't generate a detailed daily timeline. Here's the raw output:
                  <br /><br />
                  <span className="whitespace-pre-wrap bg-muted/50 p-4 rounded-md block">{itinerary.timeline}</span>
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
