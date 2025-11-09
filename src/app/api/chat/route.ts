import { NextRequest } from "next/server";
import { vercelOpenAI } from "@/lib/ai";
import { streamText, type CoreMessage, tool, convertToModelMessages } from "ai";
import { z } from "zod";

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

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);

  if (!body || !Array.isArray(body.messages)) {
    return new Response(JSON.stringify({ error: "Invalid body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const model = body.model ?? DEFAULT_MODEL;

  // Basic validation (prevent massive prompts)
  // UIMessages have a 'parts' array, so we need to extract text from parts
  const totalLength = body.messages.reduce((sum: number, m: any) => {
    if (m.parts && Array.isArray(m.parts)) {
      return sum + m.parts.reduce((partSum: number, part: any) => {
        if (part.type === 'text' && typeof part.text === 'string') {
          return partSum + part.text.length;
        }
        return partSum;
      }, 0);
    }
    // Fallback for other formats
    if (typeof m.content === 'string') {
      return sum + m.content.length;
    }
    return sum;
  }, 0);

  if (totalLength > 200_000) {
    return new Response(JSON.stringify({ error: "Input too large" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Convert UIMessages to ModelMessages
  const modelMessages = convertToModelMessages(
    body.messages.map(({ id, ...message }) => message),
    {
      tools: {
        getWeather: getWeatherTool,
      },
    }
  );

  // streamText produces a streaming response
  const result = streamText({
    model: vercelOpenAI(model),
    messages: modelMessages,
    tools: {
      getWeather: getWeatherTool,
    },
  });

  return result.toUIMessageStreamResponse();
}

