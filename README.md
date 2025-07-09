This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Environment Setup

To use the ChatGPT API for generating local activities and Mapbox for displaying activity locations, you need to set up your API keys:

1. Create a `.env.local` file in the root directory
2. Add your API keys:
   ```
   OPENAI_API_KEY=your_actual_openai_api_key_here
   NEXT_PUBLIC_MAPBOX_API_KEY=your_actual_mapbox_token_here
   ```
3. Get your API keys from:
   - OpenAI: [OpenAI's platform](https://platform.openai.com/api-keys)
   - Mapbox: [Mapbox's platform](https://account.mapbox.com/access-tokens/)

## Features

- **Survey System**: Collects user preferences and location information
- **AI-Powered Recommendations**: Uses ChatGPT to generate personalized local activities
- **Interactive Map**: Displays activity locations with numbered pins using Mapbox
- **Activity Links**: Direct links to learn more or book activities
- **Responsive Design**: Works on desktop and mobile devices
- **Dark Mode Support**: Automatically adapts to user's system preferences

## How It Works

1. Users complete a 5-question survey about their preferences
2. The app sends survey responses to the ChatGPT API
3. AI generates 5 personalized local activities based on:
   - Indoor/outdoor preferences
   - Arts/crafts vs sports preferences
   - Exploration vs familiarity preferences
   - Current hobbies
   - Location (zip code & state)
4. Activities are displayed with descriptions, cost ranges, and explanations of why they match the user's preferences

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
