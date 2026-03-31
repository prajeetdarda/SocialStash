import Anthropic from "@anthropic-ai/sdk";
import { ScrapedData, AnalysisResult } from "./types";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT = `You are a social media content analyst. Given scraped content from any platform, return a JSON object with exactly these fields:

- title: catchy 3-5 word title capturing the essence of the content
- summary: 2-3 sentence description of what this content is about
- topics: array of lowercase topic tags (e.g. ["fitness", "morning routine", "productivity"])
- language: ISO 639-1 code (e.g. "en", "es", "hi")

If the scraped content is minimal or empty (e.g. the scraper was blocked), infer what you can from the URL, platform, and author. Still produce a title and topics even if you need to be generic.

Return ONLY valid JSON, no markdown fences, no explanation.`;

function buildUserMessage(data: ScrapedData): string {
  const parts = [
    `Platform: ${data.platform}`,
    `Content type: ${data.content_type}`,
    `URL: ${data.url}`,
    `Author: ${data.author}`,
  ];

  if (data.text_content) {
    // Truncate very long text to avoid token waste
    const text =
      data.text_content.length > 3000
        ? data.text_content.slice(0, 3000) + "..."
        : data.text_content;
    parts.push(`Content:\n${text}`);
  } else {
    parts.push("Content: (not available — scraper was likely blocked)");
  }

  if (data.hashtags.length > 0) {
    parts.push(`Hashtags: ${data.hashtags.join(", ")}`);
  }

  if (data.extra) {
    const useful = Object.entries(data.extra)
      .filter(([, v]) => v != null)
      .map(([k, v]) => `${k}: ${v}`)
      .join(", ");
    if (useful) parts.push(`Metadata: ${useful}`);
  }

  return parts.join("\n");
}

export async function analyzeContent(
  data: ScrapedData
): Promise<AnalysisResult> {
  const userMessage = buildUserMessage(data);

  const content: Anthropic.Messages.ContentBlockParam[] = [
    { type: "text", text: userMessage },
  ];

  // Send images (post carousel, video thumbnails) as base64
  if (data.display_urls?.length) {
    for (const imgUrl of data.display_urls) {
      try {
        const imgRes = await fetch(imgUrl);
        const buffer = Buffer.from(await imgRes.arrayBuffer());
        const base64 = buffer.toString("base64");
        const mediaType = imgRes.headers.get("content-type") || "image/jpeg";
        content.push({
          type: "image",
          source: {
            type: "base64",
            media_type: mediaType as
              | "image/jpeg"
              | "image/png"
              | "image/webp"
              | "image/gif",
            data: base64,
          },
        });
      } catch {
        // If one image fails, continue with the rest
      }
    }
  }

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content }],
  });

  const text =
    response.content[0].type === "text" ? response.content[0].text : "";
  const parsed = JSON.parse(text);

  return {
    source_url: data.url,
    platform: data.platform,
    content_type: data.content_type,
    title: parsed.title,
    summary: parsed.summary,
    topics: parsed.topics,
    author: data.author,
    language: parsed.language,
  };
}
