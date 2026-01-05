"use client";

import { useState, useTransition } from "react";
import type { z } from "zod";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";

import { useToast } from "@/hooks/use-toast";
import { type FormSchema } from "@/lib/types";
import { generateItineraryAction } from "@/app/actions";
import ItineraryForm from "@/components/itinerary-form";
import ItineraryDisplay from "@/components/itinerary-display";
import LoadingDisplay from "@/components/loading-display";
import Logo from "@/components/logo";
import { Button } from "@/components/ui/button";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import type { GenerateItineraryTimelineOutput } from "@/ai/flows/generate-itinerary-timeline";

type AppState = "form" | "loading" | "results" | "error";

export default function Home() {
  const [appState, setAppState] = useState<AppState>("form");
  const [itinerary, setItinerary] =
    useState<GenerateItineraryTimelineOutput | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const heroImage = PlaceHolderImages.find((img) => img.id === "hero");

  const handleFormSubmit = (data: z.infer<typeof FormSchema>) => {
    setAppState("loading");
    startTransition(async () => {
      const result = await generateItineraryAction(data);
      if (result.success) {
        setItinerary(result.data);
        setAppState("results");
      } else {
        const error =
          result.error || "An unexpected error occurred. Please try again.";
        setErrorMessage(error);
        setAppState("error");
        toast({
          variant: "destructive",
          title: "Failed to create itinerary",
          description: error,
        });
      }
    });
  };

  const resetForm = () => {
    setItinerary(null);
    setErrorMessage("");
    setAppState("form");
  };

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    in: { opacity: 1, y: 0 },
    out: { opacity: 0, y: -20 },
  };

  const pageTransition = {
    type: "tween",
    ease: "anticipate",
    duration: 0.5,
  };

  return (
    <main className="flex flex-col items-center min-h-screen w-full bg-background/80">
      <div className="w-full h-full flex flex-col items-center container mx-auto p-4 md:p-8">
        <header className="w-full flex justify-center items-center py-4 mb-8">
          <Logo />
        </header>

        <AnimatePresence mode="wait">
          {appState === "form" && (
            <motion.div
              key="form"
              initial="initial"
              animate="in"
              exit="out"
              variants={pageVariants}
              transition={pageTransition}
              className="w-full"
            >
              <section className="text-center mb-10">
                <div className="relative w-full max-w-4xl mx-auto h-64 md:h-96 rounded-2xl overflow-hidden shadow-2xl mb-8">
                  {heroImage && (
                    <Image
                      src={heroImage.imageUrl}
                      alt={heroImage.description}
                      data-ai-hint={heroImage.imageHint}
                      fill
                      className="object-cover"
                      priority
                    />
                  )}
                  <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center">
                    <h1 className="text-4xl md:text-6xl font-bold text-white mb-2 font-headline tracking-tight">
                      Craft Your Next Adventure
                    </h1>
                    <p className="text-lg md:text-xl text-white/90">
                      Let our AI build your perfect, personalized travel plan.
                    </p>
                  </div>
                </div>

                <ItineraryForm
                  onSubmit={handleFormSubmit}
                  isPending={isPending}
                />
              </section>
            </motion.div>
          )}

          {appState === "loading" && (
            <motion.div
              key="loading"
              initial="initial"
              animate="in"
              exit="out"
              variants={pageVariants}
              transition={pageTransition}
              className="w-full flex-grow flex items-center justify-center"
            >
              <LoadingDisplay />
            </motion.div>
          )}

          {appState === "results" && itinerary && (
            <motion.div
              key="results"
              initial="initial"
              animate="in"
              exit="out"
              variants={pageVariants}
              transition={pageTransition}
              className="w-full"
            >
              <ItineraryDisplay
                itinerary={itinerary}
                onReset={resetForm}
              />
            </motion.div>
          )}

          {appState === "error" && (
            <motion.div
              key="error"
              initial="initial"
              animate="in"
              exit="out"
              variants={pageVariants}
              transition={pageTransition}
              className="w-full text-center flex-grow flex flex-col items-center justify-center"
            >
              <div className="bg-destructive/10 border border-destructive/20 text-destructive p-8 rounded-lg max-w-lg">
                <h2 className="text-2xl font-bold mb-4 font-headline">
                  Something Went Wrong
                </h2>
                <p className="mb-6">{errorMessage}</p>
                <Button onClick={resetForm} variant="destructive">
                  Try Again
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
