"use client";

import React from "react";
import PlacesAutocomplete, {
  geocodeByAddress,
  getLatLng,
} from "react-places-autocomplete";
import { Input } from "./ui/input";

interface PlacesAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
}

export default function PlacesAutocompleteComponent({
  value,
  onChange,
}: PlacesAutocompleteProps) {
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
