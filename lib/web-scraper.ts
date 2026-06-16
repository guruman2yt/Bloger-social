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

export async function scrapeUnsplashImage(keyword: string): Promise<string> {
  const defaultImages = [
    'https://images.unsplash.com/photo-1618401471353-b98aedd07871?w=800&auto=format&fit=crop&q=60', // Dev
    'https://images.unsplash.com/photo-1557683316-973673baf926?w=800&auto=format&fit=crop&q=60', // Design
    'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=800&auto=format&fit=crop&q=60', // Monetization
    'https://images.unsplash.com/photo-1562577309-4932fdd64cd1?w=800&auto=format&fit=crop&q=60'  // SEO
  ];
  
  try {
    const searchUrl = `https://unsplash.com/s/photos/${encodeURIComponent(keyword)}`;
    const response = await fetch(searchUrl, { headers: getHeaders() });
    if (!response.ok) {
      throw new Error(`Unsplash returned status ${response.status}`);
    }
    const html = await response.text();
    const $ = cheerio.load(html);
    
    let imageUrl = '';
    
    // Find all images and look for the first one that is a standard stock photo
    $('img').each((_, img) => {
      if (imageUrl) return; // Found
      const src = $(img).attr('src') || '';
      
      // Unsplash photos have specific image domain formats
      if (src.includes('images.unsplash.com/photo-') && !src.includes('profile-') && !src.includes('placeholder')) {
        // Parse basic URL and clean off excessive query parameters
        const baseUrl = src.split('?')[0];
        imageUrl = `${baseUrl}?w=800&auto=format&fit=crop&q=60`;
      }
    });

    if (imageUrl) {
      return imageUrl;
    }
  } catch (error) {
    console.error(`Unsplash image scraping error for keyword "${keyword}":`, error);
  }

  // Fallback to random default image
  return defaultImages[Math.floor(Math.random() * defaultImages.length)];
}
