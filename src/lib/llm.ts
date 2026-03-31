import Anthropic from "@anthropic-ai/sdk";
import { ScrapedData, AnalysisResult } from "./types";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT = `You are a social media content analyst. Given scraped Instagram content, return a JSON object with exactly these fields:

- title: catchy 3-5 word title capturing the essence of the content
- summary: 2-3 sentence description of what this content is about
- topics: array of lowercase topic tags (e.g. ["fitness", "morning routine", "productivity"])
- language: ISO 639-1 code (e.g. "en", "es", "hi")

Return ONLY valid JSON, no markdown fences, no explanation.`;

function buildUserMessage(data: ScrapedData): string {
  const parts = [
    `Content type: ${data.content_type}`,
    `Author: @${data.author}`,
    `Caption: ${data.caption || "(no caption)"}`,
  ];

  if (data.hashtags.length > 0) {
    parts.push(`Hashtags: ${data.hashtags.join(", ")}`);
  }

  return parts.join("\n");
}

export async function analyzeContent(
  data: ScrapedData
): Promise<AnalysisResult> {
  const userMessage = buildUserMessage(data);

  // Build message content — include image for posts with a display URL
  const content: Anthropic.Messages.ContentBlockParam[] = [
    { type: "text", text: userMessage },
  ];

  // Send images for posts (all carousel images) or reels (thumbnail)
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
            media_type: mediaType as "image/jpeg" | "image/png" | "image/webp" | "image/gif",
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
    platform: "instagram",
    content_type: data.content_type,
    title: parsed.title,
    summary: parsed.summary,
    topics: parsed.topics,
    author: data.author,
    language: parsed.language,
  };
}
