Great choice. Here’s a full Next.js (App Router, TypeScript) integration using Vercel AI SDK with ChatAnywhere’s OpenAI‑compatible base, including server actions, streaming UI, tool calls, and model switching.

Plan

1. Install deps and set environment variables for ChatAnywhere

2. Create a Vercel AI SDK provider wired to ChatAnywhere’s base URL

3. Build a server chat action supporting streaming and tool calls

4. Create a client chat UI using useChat from Vercel AI SDK

5. Add model switching and cover security/edge cases

6. Install + env
Install the SDKs and set your environment.

npm install ai openai zod

Create .env.local# ChatAnywhere compatible base

OPENAI_BASE_URL=https://api.chatanywhere.tech/v1

# Or: https://api.chatanywhere.org/v1

# Your ChatAnywhere API key (prefix sk-...)

OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Default model (can be overridden in UI)

CHAT_MODEL=gpt-4o-mini

2. lib/ai.ts — provider for Vercel AI SDK
Wire the SDK to use OpenAI client with ChatAnywhere baseURL.

// lib/ai.ts

import OpenAI from "openai";

import { createOpenAI } from "ai";

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

3. app/actions/chat.ts — server action with tools + streaming
This uses the Vercel AI SDK’s streamText with the OpenAI provider. Includes an example “weather” tool to demonstrate tool calling.

// app/actions/chat.ts

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

  const totalLength = input.messages.reduce((sum, m) => sum + (typeof m.content === "string" ? m.content.length : 0), 0);

  if (totalLength > 200_000) {

    throw new Error("Input too large");

  }

  // streamText produces an AIStreamResponse which Vercel AI client can consume

  const result = await streamText({

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

4. app/api/chat/route.ts — API route proxying chatAction
If you prefer calling from client via fetch, expose a route that returns the streamed response.

// app/api/chat/route.ts

import { NextRequest } from "next/server";

import { chatAction } from "@/app/actions/chat";

export const runtime = "edge";

export async function POST(req: NextRequest) {

  const body = await req.json().catch(() => null);

  if (!body || !Array.isArray(body.messages)) {

    return new Response(JSON.stringify({ error: "Invalid body" }), { status: 400 });

  }

  const model: string | undefined = body.model;

  const res = await chatAction({ messages: body.messages, model });

  return res;

}

5. app/page.tsx — client UI using useChat
The Vercel AI SDK hook handles streaming tokens, message state, abort, and tool calling routing automatically.

// app/page.tsx

"use client";

import { useChat } from "ai/react";

import { useState } from "react";

export default function HomePage() {

  const [model, setModel] = useState<string>(process.env.NEXT_PUBLIC_DEFAULT_MODEL ?? "");

  const { messages, input, handleInputChange, handleSubmit, isLoading, error, stop, setMessages } = useChat({

    api: "/api/chat",

    // Send model in the body each request

    body: { model: model || undefined },

    // Optional: initial system prompt

    initialMessages: [

      { id: "sys-0", role: "system", content: "You are a helpful assistant." },

    ],

  });

  const onClear = () => setMessages([

    { id: "sys-0", role: "system", content: "You are a helpful assistant." },

  ]);

  return (

    <main className="max-w-2xl mx-auto p-6 space-y-4">

      <h1 className="text-2xl font-semibold">ChatAnywhere + Vercel AI SDK</h1>

      <div className="flex gap-2">

        <select

          className="border rounded px-2 py-1"

          value={model}

          onChange={(e) => setModel(e.target.value)}

        >

          <option value="">Default ({process.env.NEXT_PUBLIC_DEFAULT_MODEL ?? "gpt-4o-mini"})</option>

          <option value="gpt-4o-mini">gpt-4o-mini</option>

          <option value="gpt-5-mini">gpt-5-mini</option>

          <option value="deepseek-r1">deepseek-r1</option>

          <option value="deepseek-v3">deepseek-v3</option>

        </select>

        <button className="px-3 py-1 border rounded" onClick={onClear}>Clear</button>

        <button className="px-3 py-1 border rounded" onClick={stop} disabled={!isLoading}>Stop</button>

      </div>

      <div className="space-y-3">

        {messages.map((m) => (

          <div key={m.id} className="border rounded p-3">

            <div className="text-xs text-gray-500 mb-1">{m.role.toUpperCase()}</div>

            <div className="whitespace-pre-wrap">{m.content}</div>

          </div>

        ))}

      </div>

      <form

        onSubmit={(e) => {

          e.preventDefault();

          handleSubmit(e);

        }}

        className="flex gap-2"

      >

        <input

          className="flex-1 border rounded px-3 py-2"

          placeholder="Ask something..."

          value={input}

          onChange={handleInputChange}

        />

        <button

          className="px-4 py-2 rounded bg-black text-white disabled:opacity-50"

          disabled={isLoading}

          type="submit"

        >

          {isLoading ? "Generating…" : "Send"}

        </button>

      </form>

      {error && (

        <div className="text-red-600 text-sm">Error: {error.message}</div>

      )}

    </main>

  );

}

Optional: expose NEXT_PUBLIC_DEFAULT_MODEL
If you want a visible default model in the UI:NEXT_PUBLIC_DEFAULT_MODEL=gpt-4o-mini

Notes, security and edge cases

- Keep OPENAI_API_KEY on the server only. Never expose it client-side.

- Rate limits and availability: Free keys have per‑IP and per‑key daily caps. Handle 429/503 gracefully; use stop() and retries/backoff as needed.

- Models: Any supported model name from the README works (e.g., deepseek-r1, deepseek-v3, gpt-5-mini). Reasoning models may stream slower and can intermittently be unavailable.

- Deploy on Vercel: Add OPENAI_BASE_URL and OPENAI_API_KEY in Project Settings → Environment Variables. Rebuild after changes.

- Tools: You can add more tool definitions via tool({ … }) and they’ll be invoked automatically by the model when relevant. Always validate tool inputs with zod and never log sensitive data.

Want me to add image understanding or embeddings with the Vercel AI SDK as well? I can extend this to handle images and file uploads.