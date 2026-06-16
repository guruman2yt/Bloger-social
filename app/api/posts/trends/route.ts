import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';

interface SuggestedTopic {
  topic: string;
  category: string;
  expectedCpc: number;
  volume: string;
  reason: string;
}

const OFFLINE_TRENDS_POOL: SuggestedTopic[] = [
  {
    topic: "The Future of Telehealth: Virtual Clinics and Remote Care in 2026",
    category: "Health",
    expectedCpc: 6.80,
    volume: "High",
    reason: "Surge in remote medicine technology and private health sector cloud migration."
  },
  {
    topic: "Top 10 Eco-Friendly Travel Destinations to Visit this Year",
    category: "Travel",
    expectedCpc: 4.50,
    volume: "Very High",
    reason: "Seasonal uptick in searches for carbon-neutral global vacation spots."
  },
  {
    topic: "Decentralized Finance (DeFi) Security Standards for Retail Investors",
    category: "Finance",
    expectedCpc: 12.50,
    volume: "High",
    reason: "Increased consumer interest in smart contract auditing and wallet safety."
  },
  {
    topic: "Building Resilient Smart Homes: IoT Protocol Comparison (Matter vs Zigbee)",
    category: "Technology",
    expectedCpc: 5.20,
    volume: "Medium-High",
    reason: "New smart home interoperability standards releasing in summer 2026."
  },
  {
    topic: "Remote Work Burnout: Self-Care Routines for Digital Nomads",
    category: "Lifestyle",
    expectedCpc: 3.80,
    volume: "High",
    reason: "Increasing corporate wellness focus on distributed and asynchronous teams."
  },
  {
    topic: "Passive Income Strategies: Monetizing Newsletter Subscriptions via Native Ads",
    category: "Monetization",
    expectedCpc: 9.50,
    volume: "Medium-High",
    reason: "Creator economy shifting from sponsorships to automated programatic newsletters."
  },
  {
    topic: "How to Build a Custom Static Site Generator in Go",
    category: "Development",
    expectedCpc: 7.20,
    volume: "Medium",
    reason: "Developer trend towards fast compilation speeds and lightweight binaries."
  }
];

export async function POST(request: NextRequest) {
  try {
    const { count = 5, category = 'all' } = await request.json();

    const targetCount = Math.max(1, Math.min(10, Number(count)));
    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey && apiKey !== 'YOUR_GEMINI_API_KEY' && apiKey.trim() !== '') {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
          model: 'gemini-2.5-flash',
          generationConfig: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: SchemaType.ARRAY,
              items: {
                type: SchemaType.OBJECT,
                properties: {
                  topic: { type: SchemaType.STRING },
                  category: { type: SchemaType.STRING },
                  expectedCpc: { type: SchemaType.NUMBER },
                  volume: { type: SchemaType.STRING },
                  reason: { type: SchemaType.STRING }
                },
                required: ['topic', 'category', 'expectedCpc', 'volume', 'reason']
              }
            }
          }
        });

        const prompt = `
        You are a global trend analyzer and search engine optimization (SEO) specialist.
        Identify exactly ${targetCount} highly trending, high-traffic topics that are popular in the world right now.
        ${category !== 'all' ? `All topics MUST belong to the category: "${category}".` : `Mix and match topics across diverse categories such as "Technology", "Health", "Finance", "Travel", "Lifestyle", "Development", "Design", "Monetization", "SEO".`}
        
        The topics must be popular search terms designed to get maximum organic traffic and have high commercial CPC (Cost Per Click) potential.
        
        Output them as a JSON list of objects containing:
        - topic: Catchy, publication-ready article title.
        - category: The category it belongs to (e.g. Technology, Health, Finance, Travel, Lifestyle, Development, etc.).
        - expectedCpc: Projected Google Search CPC value in USD (a decimal number, e.g. between 2.50 and 15.00).
        - volume: High, Very High, or Medium-High.
        - reason: A short 1-sentence explanation of why this topic is currently viral or trending.
        `;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        
        let cleanJsonText = responseText.trim();
        if (cleanJsonText.startsWith('```')) {
          cleanJsonText = cleanJsonText
            .replace(/^```(?:json)?\n?/i, '')
            .replace(/```$/i, '')
            .trim();
        }
        
        const suggestedTopics = JSON.parse(cleanJsonText) as SuggestedTopic[];
        return NextResponse.json({ success: true, topics: suggestedTopics.slice(0, targetCount) });
      } catch (err: any) {
        console.error('Failed to generate dynamic trends using Gemini:', err);
      }
    }

    // Offline / Fallback mode
    console.log('Using offline fallback database for trending topics...');
    let pool = OFFLINE_TRENDS_POOL;
    if (category !== 'all') {
      pool = OFFLINE_TRENDS_POOL.filter(t => t.category.toLowerCase() === category.toLowerCase());
      if (pool.length === 0) {
        pool = OFFLINE_TRENDS_POOL; // Fallback to entire pool if category has no offline matches
      }
    }
    
    // Shuffle the pool and return the requested count
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    return NextResponse.json({ success: true, topics: shuffled.slice(0, targetCount) });

  } catch (error: any) {
    console.error('Error in trends API route:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal server error' }, { status: 500 });
  }
}
