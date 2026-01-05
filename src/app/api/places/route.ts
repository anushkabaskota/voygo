import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const input = searchParams.get("input") || "";

  if (!process.env.GOOGLE_PLACES_API_KEY) {
    return NextResponse.json({ error: "Google Places API key not configured" }, { status: 500 });
  }

  if (!input || input.length < 1) {
    return NextResponse.json({ predictions: [] });
  }

  const base = "https://maps.googleapis.com/maps/api/place/autocomplete/json";
  const url = `${base}?input=${encodeURIComponent(input)}&key=${process.env.GOOGLE_PLACES_API_KEY}&language=en`;

  const res = await fetch(url);
  const data = await res.json();

  if (!res.ok) {
    return NextResponse.json({ error: data.error_message || "Google API error" }, { status: res.status });
  }

  return NextResponse.json({ predictions: data.predictions || [] });
}
