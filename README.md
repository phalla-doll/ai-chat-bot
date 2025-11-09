# AI Chat Bot

A modern, AI-powered chat bot application built with Next.js 16, React 19, and TypeScript. This project provides a foundation for building intelligent conversational interfaces with a beautiful, responsive UI.

## Features

- 🚀 Built with Next.js 16 (App Router)
- ⚛️ React 19 with TypeScript
- 🤖 AI-powered chatbot with Vercel AI SDK
- 💬 Real-time streaming chat interface
- 🎨 Modern UI with Tailwind CSS
- 🧩 shadcn/ui components
- 🔍 Biome for linting and formatting
- 🌙 Dark mode support
- 📱 Fully responsive design
- 🔧 Tool calling support (e.g., weather tool)
- 🎯 Multiple AI model support

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/)
- **UI Library**: React 19
- **Language**: TypeScript
- **AI SDK**: [Vercel AI SDK](https://sdk.vercel.ai/)
- **OpenAI Client**: [OpenAI SDK](https://github.com/openai/openai-node)
- **Styling**: Tailwind CSS 4
- **Components**: shadcn/ui
- **Linting/Formatting**: Biome
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm, yarn, pnpm, or bun package manager

### Installation

1. Clone the repository:
```bash
git clone https://github.com/phalla-doll/ai-chat-bot.git
cd ai-chat-bot
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

3. Set up environment variables:
   
   Create a `.env.local` file in the root directory:
   ```bash
   # ChatAnywhere compatible base URL
   OPENAI_BASE_URL=https://api.chatanywhere.tech/v1
   
   # Your ChatAnywhere API key (prefix sk-...)
   OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   
   # Default model (can be overridden in UI)
   CHAT_MODEL=gpt-4o-mini
   
   # Optional: Public default model for UI
   NEXT_PUBLIC_DEFAULT_MODEL=gpt-4o-mini
   ```

   **Note**: You can use any OpenAI-compatible API service. The example above uses ChatAnywhere, but you can use:
   - OpenAI directly: `OPENAI_BASE_URL=https://api.openai.com/v1`
   - Other compatible services
   
   Make sure to keep your API key secure and never commit it to version control!

4. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the application for production
- `npm run start` - Start the production server
- `npm run lint` - Run Biome linter
- `npm run format` - Format code with Biome

## Project Structure

```
ai-chat-bot/
├── src/
│   ├── app/
│   │   ├── actions/
│   │   │   └── chat.ts          # Server action for chat streaming
│   │   ├── api/
│   │   │   └── chat/
│   │   │       └── route.ts    # API route for chat endpoint
│   │   ├── layout.tsx           # Root layout
│   │   ├── page.tsx             # Home page
│   │   └── globals.css          # Global styles
│   ├── components/
│   │   ├── chatbot.tsx          # Main chatbot UI component
│   │   └── ui/                  # shadcn/ui components
│   └── lib/
│       ├── ai.ts                # AI provider configuration
│       └── utils.ts             # Utility functions
├── public/                      # Static assets
├── components.json              # shadcn/ui configuration
├── next.config.ts               # Next.js configuration
└── package.json                 # Dependencies and scripts
```

## Development

You can start editing the page by modifying `src/app/page.tsx`. The page auto-updates as you edit the file.

## Learn More

- [Next.js Documentation](https://nextjs.org/docs) - Learn about Next.js features and API
- [Learn Next.js](https://nextjs.org/learn) - Interactive Next.js tutorial
- [shadcn/ui Documentation](https://ui.shadcn.com/) - Component library documentation
- [Tailwind CSS Documentation](https://tailwindcss.com/docs) - Utility-first CSS framework

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

**Important**: Before deploying, make sure to add your environment variables in Vercel:
1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add `OPENAI_BASE_URL`, `OPENAI_API_KEY`, and `CHAT_MODEL`
4. Optionally add `NEXT_PUBLIC_DEFAULT_MODEL` if you want a default model in the UI

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Usage

Once the app is running, you can:

1. **Start chatting**: Type a message in the input field and press Enter or click Send
2. **Switch models**: Use the dropdown in the header to select different AI models
3. **Clear chat**: Click the trash icon to clear the conversation history
4. **Stop generation**: Click the Stop button while a response is being generated

The chatbot supports:
- **Streaming responses**: See responses appear in real-time
- **Tool calling**: The AI can use tools (like the weather tool) when appropriate
- **Multiple models**: Switch between different AI models on the fly
- **Error handling**: Graceful error messages if something goes wrong

## License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.
