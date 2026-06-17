import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';

export interface GeneratedPost {
  title: string;
  summary: string;
  category: string;
  content: string;
  readTime: number;
  author: string;
  coverImageQuery?: string;
}

const OFFLINE_AUTHORS = [
  'Sarah Jenkins',
  'Alex Mercer',
  'Devon Carter',
  'Elena Rostova',
  'Marcus Vance',
  'Chloe Tan',
  'Liam Gallagher',
  'Zara Patel',
  'Aidan O\'Connor',
  'Yuki Tanaka',
  'Lucas Silva'
];

export async function generateAIBlogPost(topic: string, webData: string): Promise<GeneratedPost> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY' || apiKey.trim() === '') {
    console.warn('GEMINI_API_KEY is not set. Generating high-quality fallback offline content.');
    
    const randomAuthor = OFFLINE_AUTHORS[Math.floor(Math.random() * OFFLINE_AUTHORS.length)];
    
    return {
      title: `Automated Guide: ${topic}`,
      summary: `An automated post discussing the key concepts, challenges, and implementation strategies for ${topic}.`,
      category: 'Development',
      author: randomAuthor,
      content: `### Introduction to ${topic}

This article was generated in **Offline Mode** because no \`GEMINI_API_KEY\` is configured in your \`.env\` file yet. 

To activate the live AI generator (which scrapes DuckDuckGo search results, retrieves real-time facts, and uses Gemini 2.5 Flash to write a 1,000+ word custom post):
1. Visit [Google AI Studio](https://aistudio.google.com/) and create a **free API key** (no credit card required).
2. Open your \`.env\` file and add the variable:
   \`\`\`env
   GEMINI_API_KEY="your_actual_api_key_here"
   \`\`\`
3. Restart your development server.

---

### Core Principles of ${topic}

Implementing ${topic} successfully requires focusing on three foundational pillars:
1. **Accurate Fact Gathering**: Scraping high-relevance pages and cleaning HTML tags.
2. **Context Synthesis**: Prompting the LLM to output clean, structured layouts.
3. **Structured Schemas**: Compiling JSON formats for clean database storage.

Here is a code snippet demonstrating basic web scraping structure in Node.js:

\`\`\`typescript
import * as cheerio from 'cheerio';

async function scrapeContent(url: string) {
  const response = await fetch(url);
  const html = await response.text();
  const $ = cheerio.load(html);
  
  // Clean up standard non-article tags
  $('script, style, nav, footer').remove();
  return $('body').text().trim().substring(0, 1000);
}
\`\`\`

### SEO & Layout Considerations

Ensure that your layout maintains standard heading hierarchies (\`##\` and \`###\`) and utilizes responsive cover images from Unsplash matching the target topic keywords to ensure a premium user experience.

### Conclusion

Automating blog creation with web scraping and AI is a powerful workflow to keep content fresh. Set up your free Gemini key to see the live generator crawl search results and write fully custom articles!`,
      readTime: 4
    };
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const prompt = `
You are an expert technical blog writer and SEO copywriter.
Write a high-quality, comprehensive, and engaging technical blog post based on the following topic and up-to-date web research details.

Topic/Heading: "${topic}"

Up-to-date Web Research Content:
${webData || 'No search results available. Write based on your knowledge base.'}

Requirements for the blog post:
1. **Title**: Catchy, SEO-optimized heading.
2. **Summary**: A concise 1-2 sentence SEO meta description.
3. **Category**: Assign the best matching category for this topic (e.g. Technology, Health, Finance, Travel, Lifestyle, Science, Entertainment, Sports, Space, Gaming, Business, Development, SEO, etc.). The category must be a capitalized, single word or short phrase, and highly relevant to the post content.
4. **Content**: A detailed, in-depth, and well-structured article (minimum 800-1000 words). Use markdown/HTML formatting for subheadings (e.g. ###, ##), bullet points, and clean syntax highlighted code blocks (using \`\`\`language) to make it look premium and easy to read. Include explanations, examples, and best practices. All paragraphs MUST be separated by exactly two newlines (\n\n) to ensure proper paragraph rendering. Any JSON or raw data structures mentioned in the text MUST be enclosed within proper syntax-highlighted code blocks (e.g., \`\`\`json) to avoid raw presentation.
5. **Read Time**: Calculate the approximate reading time in minutes (based on 200 words per minute).
6. **Author**: Generate a realistic, professional writer/editor name (e.g. 'Sarah Jenkins', 'Alex Mercer', 'Devon Carter') that suits the article's category and tone.
7. **Cover Image Query**: Generate a highly specific 2-3 word keyword search query/phrase (in English) suitable for fetching a high-quality, relevant cover photo on Unsplash (e.g. "autonomous vehicle", "telehealth nurse", "wallet keys", "green forest trail"). Do not output generic categories, but rather concrete search terms related to the core topic.
`;

  const modelsToTry = ['gemini-2.5-flash'];
  let lastError: any = null;

  for (const modelName of modelsToTry) {
    const maxAttempts = 3;
    let delay = 1500; // Start with 1.5s delay
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        console.log(`Attempting blog post generation using ${modelName} (Attempt ${attempt}/${maxAttempts})...`);
        const model = genAI.getGenerativeModel({
          model: modelName,
          generationConfig: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: SchemaType.OBJECT,
              properties: {
                title: { type: SchemaType.STRING },
                summary: { type: SchemaType.STRING },
                category: { type: SchemaType.STRING },
                content: { type: SchemaType.STRING },
                readTime: { type: SchemaType.INTEGER },
                author: { type: SchemaType.STRING },
                coverImageQuery: { type: SchemaType.STRING },
              },
              required: ['title', 'summary', 'category', 'content', 'readTime', 'author', 'coverImageQuery'],
            },
          }
        });

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        
        let cleanJsonText = responseText.trim();
        if (cleanJsonText.startsWith('```')) {
          cleanJsonText = cleanJsonText
            .replace(/^```(?:json)?\n?/i, '')
            .replace(/```$/i, '')
            .trim();
        }
        const postData = JSON.parse(cleanJsonText) as GeneratedPost;
        return postData;
      } catch (error: any) {
        lastError = error;
        console.warn(`API call failed for model ${modelName} on attempt ${attempt}: ${error.message || error}`);
        
        if (attempt < maxAttempts) {
          console.log(`Waiting ${delay}ms before retrying ${modelName}...`);
          await new Promise((resolve) => setTimeout(resolve, delay));
          delay *= 2;
        }
      }
    }
  }

  console.error('All generative model attempts failed. Last error:', lastError);
  const errMsg = lastError?.message || String(lastError);
  if (errMsg.includes('429') || errMsg.includes('Quota') || errMsg.includes('quota')) {
    throw new Error('Gemini API Quota Exceeded (429 Too Many Requests). You have reached the limit of your Gemini Free Tier API key (which has a limit of 15 requests/min and 20 requests/day on restricted free projects). Please upgrade to a Pay-as-you-go key in Google AI Studio, or wait a few minutes before trying again.');
  }
  throw new Error(`AI generation failed due to service errors. Please try again. details: ${errMsg}`);
}
