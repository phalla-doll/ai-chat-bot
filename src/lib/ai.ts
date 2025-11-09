import OpenAI from "openai";
import { createOpenAI } from "@ai-sdk/openai";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("Missing OPENAI_API_KEY in env");
}

if (!process.env.OPENAI_BASE_URL) {
  throw new Error("Missing OPENAI_BASE_URL in env");
}

export const openaiClient = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL,
});

// Vercel AI SDK model provider using OpenAI client
export const vercelOpenAI = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
  baseURL: process.env.OPENAI_BASE_URL!,
});

