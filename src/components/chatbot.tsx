"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useState, useEffect, useRef, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Spinner } from "@/components/ui/spinner";
import { Send, Trash2, Bot, User } from "lucide-react";
import { cn } from "@/lib/utils";

const DEFAULT_MODEL = process.env.NEXT_PUBLIC_DEFAULT_MODEL ?? "gpt-4o-mini";

const MODELS = [
  { value: "gpt-4o-mini", label: "GPT-4o Mini" },
  { value: "gpt-4o", label: "GPT-4o" },
  { value: "gpt-5-mini", label: "GPT-5 Mini" },
  { value: "deepseek-r1", label: "DeepSeek R1" },
  { value: "deepseek-v3", label: "DeepSeek V3" },
];

export default function ChatBot() {
  const [model, setModel] = useState<string>(DEFAULT_MODEL);
  const [input, setInput] = useState<string>("");
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        body: { model: model || undefined },
      }),
    [model],
  );

  const {
    messages,
    sendMessage,
    status,
    error,
    stop,
    setMessages,
  } = useChat({
    transport,
    messages: [
      {
        id: "sys-0",
        role: "system",
        parts: [{ type: "text", text: "You are a helpful assistant." }],
      },
    ],
  });

  const isLoading = status === "streaming" || status === "submitted";

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      const viewport = scrollRef.current.querySelector('[data-slot="scroll-area-viewport"]') as HTMLElement;
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight;
      }
    }
  }, [messages]);

  const onClear = () => {
    setMessages([
      {
        id: "sys-0",
        role: "system",
        parts: [{ type: "text", text: "You are a helpful assistant." }],
      },
    ]);
  };

  // Filter out system messages from display
  const displayMessages = messages.filter((m) => m.role !== "system");

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Header */}
      <Card className="rounded-none border-x-0 border-t-0">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-xl font-semibold">AI Chatbot</CardTitle>
          <div className="flex items-center gap-2">
            <Select value={model} onValueChange={setModel}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select model" />
              </SelectTrigger>
              <SelectContent>
                {MODELS.map((m) => (
                  <SelectItem key={m.value} value={m.value}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="icon"
              onClick={onClear}
              disabled={displayMessages.length === 0}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Messages Area */}
      <ScrollArea className="flex-1">
        <div ref={scrollRef}>
        <div className="mx-auto max-w-3xl space-y-4 p-6">
          {displayMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Bot className="mb-4 size-12 text-muted-foreground" />
              <h2 className="mb-2 text-lg font-semibold">
                Start a conversation
              </h2>
              <p className="text-sm text-muted-foreground">
                Ask me anything, and I'll do my best to help you!
              </p>
            </div>
          ) : (
            displayMessages
              .map((message) => {
                // TypeScript needs help understanding filtered messages
                if (message.role === "system") return null;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const msg = message as any;
                return (
                <div
                  key={msg.id}
                  className={cn(
                    "flex gap-4",
                    msg.role === "user" ? "justify-end" : "justify-start",
                  )}
                >
                  {msg.role === "assistant" && (
                    <Avatar className="size-8 shrink-0">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        <Bot className="size-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={cn(
                      "flex max-w-[80%] flex-col gap-2",
                      msg.role === "user" ? "items-end" : "items-start",
                    )}
                  >
                    <div
                      className={cn(
                        "rounded-lg px-4 py-3",
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted",
                      )}
                    >
                      <div className="whitespace-pre-wrap wrap-break-word text-sm">
                        {msg.parts
                          .filter((part: { type: string }) => part.type === "text")
                          .map((part: { type: "text"; text: string }) => part.text)
                          .join("")}
                      </div>
                    </div>
                    {msg.parts.some((part: { type: string }) => part.type === "tool") && (
                      <div className="space-y-2">
                        {msg.parts
                          .filter((part: { type: string }) => part.type === "tool")
                          .map((tool: { toolCallId: string; toolName: string; state: string; result?: unknown }) => (
                            <div
                              key={tool.toolCallId}
                              className="rounded-md border bg-muted/50 p-2 text-xs"
                            >
                              <div className="font-medium">Tool: {tool.toolName}</div>
                              {tool.state === "result" && tool.result != null && (
                                <div className="mt-1 text-muted-foreground">
                                  <pre className="text-xs">
                                    {JSON.stringify(tool.result, null, 2)}
                                  </pre>
                                </div>
                              )}
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                  {msg.role === "user" && (
                    <Avatar className="size-8 shrink-0">
                      <AvatarFallback className="bg-secondary">
                        <User className="size-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
                );
              })
              .filter((msg): msg is NonNullable<typeof msg> => msg !== null)
          )}
          {isLoading && (
            <div className="flex gap-4 justify-start">
              <Avatar className="size-8 shrink-0">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  <Bot className="size-4" />
                </AvatarFallback>
              </Avatar>
              <div className="flex max-w-[80%] flex-col gap-2 items-start">
                <div className="rounded-lg bg-muted px-4 py-3">
                  <Spinner className="size-4" />
                </div>
              </div>
            </div>
          )}
        </div>
        </div>
      </ScrollArea>

      {/* Input Area */}
      <Card className="rounded-none border-x-0 border-b-0">
        <CardContent className="p-4">
          {error && (
            <div className="mb-4 rounded-md border border-destructive bg-destructive/10 p-3 text-sm text-destructive">
              Error: {error.message}
            </div>
          )}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (input.trim()) {
                sendMessage({ text: input });
                setInput("");
              }
            }}
            className="flex gap-2"
          >
            <Input
              className="flex-1"
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
            />
            {isLoading ? (
              <Button
                type="button"
                variant="outline"
                onClick={stop}
                disabled={!isLoading}
              >
                <Spinner className="mr-2 size-4" />
                Stop
              </Button>
            ) : (
              <Button type="submit" disabled={isLoading || !input.trim()}>
                <Send className="size-4" />
              </Button>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

