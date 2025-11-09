"use server";

import { vercelOpenAI } from "@/lib/ai";
import { z } from "zod";
import { streamText, type CoreMessage, tool } from "ai";

const DEFAULT_MODEL = process.env.CHAT_MODEL ?? "gpt-4o-mini";

// Example tool: fetch current weather by city (mocked). Replace with real API.
const getWeatherTool = tool({
  description: "Get current weather for a city",
  parameters: z.object({
    city: z.string().min(1),
  }),
  // Tool function runs on server
  execute: async ({ city }) => {
    // In production, call a real weather API with proper key management
    const tempC = 30 + Math.floor(Math.random() * 6); // mock Phnom Penh vibes :)
    const cond = ["Sunny", "Cloudy", "Thunderstorm", "Rain"][Math.floor(Math.random() * 4)];
    return { city, tempC, condition: cond, humidity: 70, windKph: 8 };
  },
});

export async function chatAction(input: {
  messages: CoreMessage[];
  model?: string;
}) {
  const model = input.model ?? DEFAULT_MODEL;

  // Basic validation (prevent massive prompts)
  if (!Array.isArray(input.messages) || input.messages.length === 0) {
    throw new Error("messages[] is required");
  }

  const totalLength = input.messages.reduce(
    (sum, m) => sum + (typeof m.content === "string" ? m.content.length : 0),
    0,
  );

  if (totalLength > 200_000) {
    throw new Error("Input too large");
  }

  // streamText produces an AIStreamResponse which Vercel AI client can consume
  const result = streamText({
    model: vercelOpenAI(model),
    messages: input.messages,
    // You can enable reasoning models or system prompts here if needed
    // system: "You are a helpful assistant.",
    tools: {
      getWeather: getWeatherTool,
    },
  });

  return result.toAIStreamResponse();
}

