import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { searchWeb, scrapeUrl, scrapeUnsplashImage } from '@/lib/web-scraper';
import { generateAIBlogPost } from '@/lib/generate-post';

export async function POST(request: NextRequest) {
  try {
    const { topic, searchWeb: runSearch = true, published = false } = await request.json();

    if (!topic || typeof topic !== 'string' || !topic.trim()) {
      return NextResponse.json({ success: false, error: 'Topic heading is required.' }, { status: 400 });
    }

    // 1. Gather up-to-date web research details if searchWeb is requested
    let webData = '';
    if (runSearch) {
      console.log(`Searching DuckDuckGo for: "${topic}"`);
      const searchResults = await searchWeb(topic);

      if (searchResults && searchResults.length > 0) {
        // Collect search result snippets
        const snippets = searchResults.map((r, i) => `[Result ${i + 1}] Title: ${r.title}\nSnippet: ${r.snippet}\nSource: ${r.url}`).join('\n\n');
        webData += `--- Search Results ---\n${snippets}\n\n`;

        // Scrape detailed text from the top 2 links to get deep facts
        const scrapePromises = searchResults.slice(0, 2).map(async (r) => {
          try {
            console.log(`Scraping content from URL: ${r.url}`);
            const text = await scrapeUrl(r.url);
            return `--- Content from ${r.title} (${r.url}) ---\n${text}`;
          } catch (err) {
            console.error(`Error scraping URL ${r.url}:`, err);
            return '';
          }
        });

        const detailedTexts = await Promise.all(scrapePromises);
        webData += detailedTexts.filter(Boolean).join('\n\n');
      }
    }

    // 2. Generate blog post contents via Gemini
    console.log(`Generating AI content for topic: "${topic}"`);
    const postData = await generateAIBlogPost(topic, webData);

    // 3. Scrape a matching premium cover image from Unsplash (excluding existing images to prevent duplication)
    console.log(`Fetching existing cover images from DB to prevent duplication...`);
    let excludeUrls: string[] = [];
    try {
      const existingImages = await prisma.post.findMany({
        select: { coverImage: true }
      });
      excludeUrls = existingImages.map(p => p.coverImage).filter(Boolean);
    } catch (dbErr) {
      console.warn('Failed to retrieve existing cover images for deduplication:', dbErr);
    }

    const searchKeyword = postData.coverImageQuery || postData.title || topic;
    console.log(`Scraping unique cover photo for keyword: "${searchKeyword}"`);
    const coverImage = await scrapeUnsplashImage(searchKeyword, excludeUrls);

    // 4. Generate a unique SEO slug
    let slug = postData.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const existingPost = await prisma.post.findUnique({ where: { slug } });
    if (existingPost) {
      slug = `${slug}-${Math.floor(Math.random() * 10000)}`;
    }

    // 5. Upload the post into SQLite
    const post = await prisma.post.create({
      data: {
        title: postData.title,
        slug,
        summary: postData.summary,
        content: postData.content,
        coverImage,
        category: postData.category || 'General',
        published,
        readTime: postData.readTime || 5,
        author: postData.author || 'Kevin Writer',
        createdAt: new Date(),
      },
    });

    console.log(`Successfully generated and saved blog post: "${post.title}" (ID: ${post.id})`);

    return NextResponse.json({
      success: true,
      message: 'Blog post generated and uploaded successfully.',
      post,
    });
  } catch (error: any) {
    console.error('Error in post generation route:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Internal server error during article generation.',
    }, { status: 500 });
  }
}
