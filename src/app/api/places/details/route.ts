import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const placeId = searchParams.get("placeId") || "";

  if (!process.env.GOOGLE_PLACES_API_KEY) {
    return NextResponse.json({ error: "Google Places API key not configured" }, { status: 500 });
  }

  if (!placeId) {
    return NextResponse.json({ error: "Missing placeId" }, { status: 400 });
  }

  const base = "https://maps.googleapis.com/maps/api/place/details/json";
  const url = `${base}?place_id=${encodeURIComponent(placeId)}&key=${process.env.GOOGLE_PLACES_API_KEY}&fields=formatted_address,geometry`;

  const res = await fetch(url);
  const data = await res.json();

  if (!res.ok) {
    return NextResponse.json({ error: data.error_message || "Google API error" }, { status: res.status });
  }

  const result = data.result || {};
  const location = result.geometry?.location || null;
  const address = result.formatted_address || null;

  return NextResponse.json({ location, address });
}
