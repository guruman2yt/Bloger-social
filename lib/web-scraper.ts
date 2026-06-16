import * as cheerio from 'cheerio';

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15',
  'Mozilla/5.0 (X11; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/119.0'
];

function getHeaders() {
  const userAgent = USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
  return {
    'User-Agent': userAgent,
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept-Encoding': 'gzip, deflate, br',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
    'Cache-Control': 'max-age=0',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none',
    'Sec-Fetch-User': '?1'
  };
}

export async function searchWeb(query: string): Promise<Array<{ title: string; snippet: string; url: string }>> {
  try {
    const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
    const response = await fetch(url, { headers: getHeaders() });
    if (!response.ok) {
      throw new Error(`DuckDuckGo returned status ${response.status}`);
    }
    const html = await response.text();
    const $ = cheerio.load(html);
    const results: Array<{ title: string; snippet: string; url: string }> = [];

    $('.result__body').each((_, element) => {
      if (results.length >= 5) return;
      const titleEl = $(element).find('.result__title a');
      const title = titleEl.text().trim();
      const rawUrl = titleEl.attr('href') || '';
      
      // DuckDuckGo redirects out link, parse actual URL if redirecting
      let resultUrl = rawUrl;
      if (rawUrl.includes('uddg=')) {
        try {
          const parts = rawUrl.split('uddg=');
          if (parts[1]) {
            resultUrl = decodeURIComponent(parts[1].split('&')[0]);
          }
        } catch {
          // Fallback to raw URL
        }
      }

      const snippet = $(element).find('.result__snippet').text().trim();
      if (title && snippet && resultUrl) {
        results.push({ title, snippet, url: resultUrl });
      }
    });

    return results;
  } catch (error) {
    console.error('Web search scraping error:', error);
    return [];
  }
}

export async function scrapeUrl(url: string): Promise<string> {
  try {
    const response = await fetch(url, { headers: getHeaders() });
    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}, status: ${response.status}`);
    }
    const html = await response.text();
    const $ = cheerio.load(html);

    // Remove scripts, styles, navs, footer to clean up text content
    $('script, style, nav, footer, iframe, header, noscript, svg, aside').remove();

    // Prefer main article content if it exists
    let bodyText = '';
    const mainEl = $('article, main, #content, .content');
    if (mainEl.length > 0) {
      bodyText = mainEl.text();
    } else {
      bodyText = $('body').text();
    }

    // Clean up excessive whitespace
    const cleanText = bodyText
      .replace(/\s+/g, ' ')
      .replace(/\n+/g, '\n')
      .trim();

    return cleanText.substring(0, 5000); // Truncate to avoid context limit issues
  } catch (error) {
    console.error(`Scrape URL error for ${url}:`, error);
    return '';
  }
}

export async function scrapeUnsplashImage(keyword: string, excludeUrls: string[] = []): Promise<string> {
  const defaultImages = [
    'https://images.unsplash.com/photo-1618401471353-b98aedd07871?w=800&auto=format&fit=crop&q=60', // Dev
    'https://images.unsplash.com/photo-1557683316-973673baf926?w=800&auto=format&fit=crop&q=60', // Design
    'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=800&auto=format&fit=crop&q=60', // Monetization
    'https://images.unsplash.com/photo-1562577309-4932fdd64cd1?w=800&auto=format&fit=crop&q=60', // SEO
    'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&auto=format&fit=crop&q=60', // Tech
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=60', // Business
    'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&auto=format&fit=crop&q=60', // Website
    'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=800&auto=format&fit=crop&q=60', // UI Design
    'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&auto=format&fit=crop&q=60', // Teamwork
    'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&auto=format&fit=crop&q=60'  // Office
  ];

  // Helper to extract base image ID or URL prefix to avoid duplicates
  const getBaseUrl = (url: string) => url.split('?')[0].trim();
  const excludedBases = excludeUrls.map(getBaseUrl);

  // Build sequential query list to guarantee relevant results
  const queryTerms = [keyword];
  
  // If query is a long sentence/title, add a simplified 3-word prefix search
  const words = keyword.split(/\s+/);
  if (words.length > 3) {
    queryTerms.push(words.slice(0, 3).join(' '));
  }
  
  // Add broad fallback categories based on search content
  const lowerKeyword = keyword.toLowerCase();
  if (lowerKeyword.includes('health') || lowerKeyword.includes('medicine')) queryTerms.push('health');
  else if (lowerKeyword.includes('travel') || lowerKeyword.includes('vacation')) queryTerms.push('travel');
  else if (lowerKeyword.includes('finance') || lowerKeyword.includes('money') || lowerKeyword.includes('business')) queryTerms.push('finance');
  else if (lowerKeyword.includes('lifestyle') || lowerKeyword.includes('fitness')) queryTerms.push('lifestyle');
  else if (lowerKeyword.includes('development') || lowerKeyword.includes('code') || lowerKeyword.includes('tech')) queryTerms.push('technology');
  else queryTerms.push('abstract');

  for (const query of queryTerms) {
    try {
      const searchUrl = `https://unsplash.com/s/photos/${encodeURIComponent(query)}`;
      const response = await fetch(searchUrl, { headers: getHeaders() });
      if (response.ok) {
        const html = await response.text();
        const $ = cheerio.load(html);
        const imageUrls: string[] = [];
        
        $('img').each((_, img) => {
          const src = $(img).attr('src') || '';
          if (src.includes('images.unsplash.com/photo-') && !src.includes('profile-') && !src.includes('placeholder')) {
            const baseUrl = src.split('?')[0];
            imageUrls.push(`${baseUrl}?w=800&auto=format&fit=crop&q=60`);
          }
        });
        
        // Filter out any image that matches one of the excluded base URLs
        const uniqueImageUrls = imageUrls.filter(url => !excludedBases.includes(getBaseUrl(url)));
        
        if (uniqueImageUrls.length > 0) {
          // Select a random image from the top results to ensure variety
          const limit = Math.min(15, uniqueImageUrls.length);
          const randomIndex = Math.floor(Math.random() * limit);
          return uniqueImageUrls[randomIndex];
        }
      }
    } catch (error) {
      console.error(`Unsplash image scraping error for query "${query}":`, error);
    }
  }

  // Fallback to random default image that hasn't been used yet if possible
  const unusedDefaultImages = defaultImages.filter(url => !excludedBases.includes(getBaseUrl(url)));
  const finalPool = unusedDefaultImages.length > 0 ? unusedDefaultImages : defaultImages;
  return finalPool[Math.floor(Math.random() * finalPool.length)];
}
