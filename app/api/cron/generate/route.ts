import { NextRequest, NextResponse } from 'next/server';
import Parser from 'rss-parser';
import { prisma } from '@/lib/db';
import { scrapeUrl, scrapeUnsplashImage } from '@/lib/web-scraper';
import { generateAIBlogPost } from '@/lib/generate-post';

const parser = new Parser();

const RSS_FEEDS = [
  'https://techcrunch.com/feed/',
  'https://vercel.com/blog/feed',
  'https://css-tricks.com/feed/'
];

const FALLBACK_TOPICS = [
  'Next.js 16 features and performance enhancements in web design',
  'Modern CSS layout techniques including subgrid and container queries',
  'Optimizing display ad placement for maximum RPM without compromising UX',
  'Best practices for secure user authentication in React server components',
  'Strategies for achieving a perfect 100 lighthouse score on serverless blogs'
];

export async function GET(request: NextRequest) {
  return handleCron(request);
}

export async function POST(request: NextRequest) {
  return handleCron(request);
}

async function handleCron(request: NextRequest) {
  try {
    // 1. Enforce security check if CRON_SECRET is defined in environment variables
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      // Also allow passing via query parameter ?secret= for simple cron triggers
      const { searchParams } = new URL(request.url);
      const querySecret = searchParams.get('secret');
      if (querySecret !== cronSecret) {
        return NextResponse.json({ success: false, error: 'Unauthorized cron access.' }, { status: 401 });
      }
    }

    console.log('Starting automated cron blog post generator...');

    let topic = '';
    let scrapedSource = '';
    let sourceLink = '';

    // 2. Parse RSS feeds to find a fresh topic
    for (const feedUrl of RSS_FEEDS) {
      try {
        console.log(`Parsing RSS feed: ${feedUrl}`);
        const feed = await parser.parseURL(feedUrl);
        
        if (feed.items && feed.items.length > 0) {
          // Look for the first item we haven't written about yet
          for (const item of feed.items) {
            if (!item.title || !item.link) continue;
            
            // Check if title or similar slug exists in database
            const expectedSlug = item.title
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/(^-|-$)/g, '');
              
            const duplicate = await prisma.post.findFirst({
              where: {
                OR: [
                  { title: item.title },
                  { slug: expectedSlug }
                ]
              }
            });

            if (!duplicate) {
              topic = item.title;
              sourceLink = item.link;
              console.log(`Found a fresh topic from RSS: "${topic}" (${sourceLink})`);
              
              // Scrape the content of the article to extract up-to-date facts
              try {
                scrapedSource = await scrapeUrl(sourceLink);
              } catch (e) {
                console.warn(`Could not scrape original article body for ${sourceLink}:`, e);
              }
              break;
            }
          }
        }
      } catch (feedError) {
        console.error(`Error parsing feed ${feedUrl}:`, feedError);
      }
      
      if (topic) break; // Topic found, stop trying other feeds
    }

    // 3. Fallback: If all RSS feeds are duplicates or fail, pick a fallback topic
    if (!topic) {
      const randomIndex = Math.floor(Math.random() * FALLBACK_TOPICS.length);
      topic = FALLBACK_TOPICS[randomIndex];
      console.log(`No new RSS items found. Using fallback topic: "${topic}"`);
    }

    // 4. Generate structured article content using Gemini
    console.log(`Calling Gemini to generate content for cron topic: "${topic}"`);
    const postData = await generateAIBlogPost(topic, scrapedSource);

    // 5. Scrape Unsplash for category image
    console.log(`Scraping cover photo for category: "${postData.category || topic}"`);
    const coverImage = await scrapeUnsplashImage(postData.category || topic);

    // 6. Generate a unique slug
    let slug = postData.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const existingPost = await prisma.post.findUnique({ where: { slug } });
    if (existingPost) {
      slug = `${slug}-${Math.floor(Math.random() * 10000)}`;
    }

    // 7. Write to SQLite database
    const post = await prisma.post.create({
      data: {
        title: postData.title,
        slug,
        summary: postData.summary,
        content: postData.content,
        coverImage,
        category: postData.category || 'General',
        published: true, // Automated posts are published immediately
        readTime: postData.readTime || 5,
        author: postData.author || 'AI Content Automator',
        createdAt: new Date(),
      }
    });

    // 8. SQLite Maintenance & Metrics Pruning (Ensures DB stays under 500MB for years)
    try {
      console.log('Running SQLite database maintenance and pruning...');
      // Prune ad metrics older than 2 years (730 days)
      const twoYearsAgo = new Date();
      twoYearsAgo.setDate(twoYearsAgo.getDate() - 730);
      const twoYearsAgoStr = twoYearsAgo.toISOString().split('T')[0];
      
      const deletedMetrics = await prisma.adMetric.deleteMany({
        where: {
          date: {
            lt: twoYearsAgoStr
          }
        }
      });
      if (deletedMetrics.count > 0) {
        console.log(`Pruned ${deletedMetrics.count} old daily ad metrics older than 730 days.`);
      }

      // Reclaim deleted space and compact SQLite database file (SQLite only)
      const isSqlite = process.env.DATABASE_URL?.startsWith('file:') || process.env.DATABASE_URL?.includes('.db');
      if (isSqlite) {
        await prisma.$executeRawUnsafe('VACUUM;');
        console.log('Successfully compacted database using VACUUM.');
      } else {
        console.log('Skipping VACUUM command (running on PostgreSQL/Supabase).');
      }
    } catch (dbMaintenanceError) {
      console.error('Error during database maintenance:', dbMaintenanceError);
    }

    console.log(`Successfully completed daily cron. Created post: "${post.title}"`);

    return NextResponse.json({
      success: true,
      mode: sourceLink ? 'RSS Feed' : 'Fallback Topic',
      source: sourceLink || 'Knowledge base',
      post
    });

  } catch (error: any) {
    console.error('Error in daily automated cron generate route:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Internal server error during daily generation.'
    }, { status: 500 });
  }
}
