"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Compass } from "lucide-react";

const messages = [
  "Analyzing your travel preferences...",
  "Scouring the web for flight deals...",
  "Finding the coziest accommodations...",
  "Discovering hidden gems and attractions...",
  "Mapping out your daily adventures...",
  "Assembling your personalized timeline...",
];

export default function LoadingDisplay() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % messages.length);
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center text-center p-4">
      <div className="relative w-24 h-24 mb-6">
        <Compass className="w-full h-full text-primary/30" />
        <motion.div
          className="absolute inset-0"
          animate={{ rotate: 360 }}
          transition={{
            loop: Infinity,
            ease: "linear",
            duration: 10,
          }}
        >
          <Compass className="w-full h-full text-primary" />
        </motion.div>
      </div>
      <h2 className="text-2xl font-bold mb-4 font-headline text-foreground">
        Building Your Perfect Trip...
      </h2>
      <div className="h-6 w-full max-w-md text-center">
        <AnimatePresence mode="wait">
          <motion.p
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5 }}
            className="text-muted-foreground"
          >
            {messages[index]}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
}
