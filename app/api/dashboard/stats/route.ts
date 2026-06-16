import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';

export async function GET() {
  try {
    // 1. Fetch all ad metrics ordered by date
    const metrics = await prisma.adMetric.findMany({
      where: {
        network: {
          not: 'simulated'
        }
      },
      orderBy: { date: 'asc' },
    });

    // 2. Fetch general blog statistics
    const totalPostsCount = await prisma.post.count();
    const totalCommentsCount = await prisma.comment.count();
    const viewsAggregate = await prisma.post.aggregate({
      _sum: { views: true },
    });
    const totalViews = viewsAggregate._sum.views || 0;

    // 3. Group and aggregate metrics by date for chart usage
    const dailyMap: Record<string, {
      date: string;
      revenue: number;
      impressions: number;
      clicks: number;
      adsense: number;
      addstra: number;
      monetag: number;
      simulated: number;
      ctr: number;
    }> = {};

    metrics.forEach((m: any) => {
      const dateStr = m.date;
      if (!dailyMap[dateStr]) {
        dailyMap[dateStr] = {
          date: dateStr,
          revenue: 0,
          impressions: 0,
          clicks: 0,
          adsense: 0,
          addstra: 0,
          monetag: 0,
          simulated: 0,
          ctr: 0,
        };
      }

      const day = dailyMap[dateStr];
      day.revenue += m.revenue;
      day.impressions += m.impressions;
      day.clicks += m.clicks;

      // Group revenue contributions by network
      if (m.network === 'adsense') day.adsense += m.revenue;
      else if (m.network === 'addstra') day.addstra += m.revenue;
      else if (m.network === 'monetag') day.monetag += m.revenue;
      else if (m.network === 'simulated') day.simulated += m.revenue;
    });

    // Convert map to sorted array and compute CTR metrics
    const dailyChartData = Object.values(dailyMap)
      .sort((a: any, b: any) => a.date.localeCompare(b.date))
      .map((day: any) => {
        // Round numbers to avoid decimal issues in UI
        day.revenue = Math.round(day.revenue * 100) / 100;
        day.adsense = Math.round(day.adsense * 100) / 100;
        day.addstra = Math.round(day.addstra * 100) / 100;
        day.monetag = Math.round(day.monetag * 100) / 100;
        day.simulated = Math.round(day.simulated * 100) / 100;
        
        // Calculate daily CTR
        day.ctr = day.impressions > 0
          ? Math.round((day.clicks / day.impressions) * 10000) / 100
          : 0;
          
        return day;
      });

    // 4. Lifetime aggregate monetization statistics
    const aggregates = await prisma.adMetric.aggregate({
      where: {
        network: {
          not: 'simulated'
        }
      },
      _sum: {
        impressions: true,
        clicks: true,
        revenue: true,
      },
    });

    const totalImpressions = aggregates._sum.impressions || 0;
    const totalClicks = aggregates._sum.clicks || 0;
    const totalRevenue = aggregates._sum.revenue || 0;
    
    // Aggregate by network to see breakdown distributions
    const networkAggregates = await prisma.adMetric.groupBy({
      by: ['network'],
      where: {
        network: {
          not: 'simulated'
        }
      },
      _sum: {
        revenue: true,
        impressions: true,
        clicks: true,
      }
    });

    const networkBreakdown = networkAggregates.map((group: any) => ({
      network: group.network,
      revenue: Math.round((group._sum.revenue || 0) * 100) / 100,
      impressions: group._sum.impressions || 0,
      clicks: group._sum.clicks || 0,
    }));

    // 5. Aggregate views by category
    const categoryGroups = await prisma.post.groupBy({
      by: ['category'],
      _sum: { views: true },
      _count: { id: true },
      orderBy: { _sum: { views: 'desc' } }
    });

    const categoryStats = categoryGroups.map((g: any) => ({
      category: g.category,
      views: g._sum.views || 0,
      count: g._count.id
    }));

    // 6. Generate dynamic content recommendations for high-traffic optimized topics using Gemini
    const allPosts = await prisma.post.findMany({
      select: { title: true }
    });
    const existingTitles = allPosts.map((p: any) => p.title.toLowerCase());

    const RECOMMENDATIONS_POOL = [
      { topic: "Next.js Server Actions and Form Validation Best Practices", category: "Development", expectedCpc: 8.50, volume: "High" },
      { topic: "Building Glassmorphism Landing Pages with Tailwind CSS", category: "Design", expectedCpc: 4.20, volume: "Medium-High" },
      { topic: "A Complete Checklist for Google AdSense Approval in 2026", category: "Monetization", expectedCpc: 12.00, volume: "High" },
      { topic: "How to Optimize Core Web Vitals to Prevent SEO Penalties", category: "SEO", expectedCpc: 9.80, volume: "High" },
      { topic: "Deploying High-Performance Next.js Sites on Vercel Edge", category: "Development", expectedCpc: 7.30, volume: "Medium" },
      { topic: "Maximizing Publisher RPM using Monetag Multiplex Native Ads", category: "Monetization", expectedCpc: 10.50, volume: "High" },
      { topic: "A Practical Guide to Schema.org JSON-LD Structured Markup", category: "SEO", expectedCpc: 6.80, volume: "High" }
    ];

    let contentRecommendations = [];
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
                  volume: { type: SchemaType.STRING }
                },
                required: ['topic', 'category', 'expectedCpc', 'volume']
              }
            }
          }
        });

        const prompt = `
        You are a search engine marketing (SEM) and SEO traffic gap analyzer.
        Review the list of existing blog post titles in the database: ${JSON.stringify(existingTitles)}.
        Identify 3 brand new, highly trending technical/monetization topics in the web dev, web design, SEO, and ad monetization space that are NOT covered in the database titles.
        The topics must be designed to get maximum organic traffic and have high commercial CPC (Cost Per Click) potential in search engines.
        Output them as a JSON list of objects containing:
        - topic: Title/Topic of the proposed article.
        - category: One of "Development", "Design", "Monetization", "SEO", "Technology", "General".
        - expectedCpc: Expected search CPC value in USD (e.g. between 3.00 and 15.00).
        - volume: Expected search volume status (e.g. "High", "Medium-High", "Very High").
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
        contentRecommendations = JSON.parse(cleanJsonText);
      } catch (err) {
        console.error('Failed to generate dynamic recommendations using Gemini:', err);
        contentRecommendations = RECOMMENDATIONS_POOL.filter(
          (rec: any) => !existingTitles.some((title: any) => title.includes(rec.topic.toLowerCase()) || rec.topic.toLowerCase().includes(title))
        ).slice(0, 3);
      }
    } else {
      contentRecommendations = RECOMMENDATIONS_POOL.filter(
        (rec: any) => !existingTitles.some((title: any) => title.includes(rec.topic.toLowerCase()) || rec.topic.toLowerCase().includes(title))
      ).slice(0, 3);
    }

    return NextResponse.json({
      success: true,
      blogStats: {
        postsCount: totalPostsCount,
        commentsCount: totalCommentsCount,
        viewsCount: totalViews,
      },
      adStats: {
        impressions: totalImpressions,
        clicks: totalClicks,
        revenue: Math.round(totalRevenue * 100) / 100,
        averageCtr: totalImpressions > 0 ? Math.round((totalClicks / totalImpressions) * 10000) / 100 : 0,
      },
      chartData: dailyChartData,
      networkBreakdown,
      categoryStats,
      contentRecommendations
    });
  } catch (error) {
    console.error('Error generating dashboard stats API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
