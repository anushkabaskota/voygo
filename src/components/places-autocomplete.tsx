"use client";

import React, { useState, useEffect, useRef } from "react";
import PlacesAutocomplete, {
  geocodeByAddress,
  getLatLng,
} from "react-places-autocomplete";
import { Input } from "./ui/input";

interface PlacesAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
}

type Prediction = {
  description: string;
  place_id: string;
};

export default function PlacesAutocompleteComponent({
  value,
  onChange,
}: PlacesAutocompleteProps) {
  const [isGoogleMapsApiAvailable, setIsGoogleMapsApiAvailable] = useState(false);
  const [localInput, setLocalInput] = useState(value);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loadingPredictions, setLoadingPredictions] = useState(false);
  const debounceRef = useRef<number | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && window.google?.maps?.places) {
      setIsGoogleMapsApiAvailable(true);
    }
  }, []);

  useEffect(() => {
    setLocalInput(value);
  }, [value]);

  // Fetch suggestions from our server-side proxy to Google Places when Google script not available
  useEffect(() => {
    if (isGoogleMapsApiAvailable) return;

    if (debounceRef.current) {
      window.clearTimeout(debounceRef.current);
    }

    if (!localInput || localInput.length < 1) {
      setPredictions([]);
      return;
    }

    debounceRef.current = window.setTimeout(async () => {
      setLoadingPredictions(true);
      if (abortRef.current) {
        abortRef.current.abort();
      }
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const res = await fetch(`/api/places?input=${encodeURIComponent(localInput)}`, {
          signal: controller.signal,
        });
        const json = await res.json();
        setPredictions(json.predictions || []);
      } catch (err: any) {
        if (err.name !== "AbortError") console.error(err);
      } finally {
        setLoadingPredictions(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) {
        window.clearTimeout(debounceRef.current);
      }
      if (abortRef.current) {
        abortRef.current.abort();
      }
    };
  }, [localInput, isGoogleMapsApiAvailable]);

  const handleSelectFallback = async (prediction: Prediction) => {
    onChange(prediction.description);
    setPredictions([]);

    try {
      const res = await fetch(`/api/places/details?placeId=${encodeURIComponent(prediction.place_id)}`);
      if (!res.ok) {
        console.error("Error fetching place details");
        return;
      }
      const json = await res.json();
      if (json.location) {
        console.log("Successfully got latitude and longitude", json.location);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleInputChange = (val: string) => {
    setLocalInput(val);
    onChange(val);
  };

  if (!isGoogleMapsApiAvailable) {
    return (
      <div className="relative">
        <Input
          placeholder="e.g., Paris, France"
          value={localInput}
          onChange={(e) => handleInputChange(e.target.value)}
        />
        <div className="absolute z-10 w-full mt-1 bg-background border border-border rounded-md shadow-lg">
          {loadingPredictions && <div className="p-2">Loading...</div>}
          {predictions.map((p) => (
            <div
              key={p.place_id}
              className="bg-transparent p-2 cursor-pointer hover:bg-accent hover:text-accent-foreground"
              onClick={() => handleSelectFallback(p)}
            >
              <span>{p.description}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const handleSelect = async (address: string) => {
    onChange(address);
    try {
      const results = await geocodeByAddress(address);
      const latLng = await getLatLng(results[0]);
      console.log("Successfully got latitude and longitude", latLng);
    } catch (error) {
      console.error("Error", error);
    }
  };

  return (
    <PlacesAutocomplete
      value={value}
      onChange={onChange}
      onSelect={handleSelect}
    >
      {({ getInputProps, suggestions, getSuggestionItemProps, loading }) => (
        <div className="relative">
          <Input
            {...getInputProps({
              placeholder: "e.g., Paris, France",
            })}
          />
          <div className="absolute z-10 w-full mt-1 bg-background border border-border rounded-md shadow-lg">
            {loading && <div className="p-2">Loading...</div>}
            {suggestions.map((suggestion) => {
              const className = suggestion.active
                ? "bg-accent text-accent-foreground p-2 cursor-pointer"
                : "bg-transparent p-2 cursor-pointer";
              return (
                <div
                  {...getSuggestionItemProps(suggestion, {
                    className,
                  })}
                  key={suggestion.placeId}
                >
                  <span>{suggestion.description}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </PlacesAutocomplete>
  );
}
