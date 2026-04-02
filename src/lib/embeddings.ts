import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Generates a 1536-dimension embedding from text.
 * We combine summary + topics into one string for richer representation.
 */
export async function generateEmbedding(
  summary: string,
  topics: string[]
): Promise<number[]> {
  const input = `${summary} Topics: ${topics.join(", ")}`;

  const response = await openai.embeddings.create({
    model: "text-embedding-ada-002",
    input,
  });

  return response.data[0].embedding;
}
