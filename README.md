# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

## Google Places API 🔎

The destination input can use the Google Places API for autocomplete suggestions. To enable the server proxy endpoints added for Places, set the following environment variable in your environment (e.g., `.env.local`):

```
GOOGLE_PLACES_API_KEY=your_api_key_here
```

Restart the dev server after adding the variable.

## Gemini API 🤖

If you plan to use Google Gemini (or another LLM accessed via a service key), add your API key to `.env.local`:

```
GEMINI_API_KEY=your_gemini_api_key_here
```

Keep this key secret and do not commit it to source control.
