import { useEffect, useRef, useState } from "react";
import { Send, MessageCircle, AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { ragService, type RAGResponse } from "@/lib/rag/ragService";
import type { RagIndexStatus } from "@/hooks/use-rag-indexer";

type Message = {
  role: "user" | "assistant";
  content: string;
  citations?: RAGResponse["citations"];
};

interface QnaPanelProps {
  documentKey: string;
  documentName: string;
  status: RagIndexStatus;
  error?: string | null;
}

export function QnaPanel({
  documentKey,
  documentName,
  status,
  error,
}: QnaPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages([]);
    setInput("");
  }, [documentKey]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const trimmedInput = input.trim();

    if (!trimmedInput || status !== "ready" || isLoading) {
      return;
    }

    const userMessage: Message = {
      role: "user",
      content: trimmedInput,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await ragService.answerQuestion(trimmedInput);

      const assistantMessage: Message = {
        role: "assistant",
        content: response.answer,
        citations: response.citations,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            err instanceof Error
              ? err.message
              : "Unable to generate an answer. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const disabledReason =
    status === "indexing"
      ? "Indexing the generated markdown..."
      : status === "error"
        ? "Indexing failed"
        : "";

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-foreground">
            Ask questions about: {documentName}
          </p>
          <p className="text-xs text-muted-foreground">
            Answers come from the generated podcast script using local embeddings.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          {status === "ready" && (
            <Badge variant="default" className="bg-emerald-600 hover:bg-emerald-600">
              Indexed
            </Badge>
          )}
          {status === "indexing" && (
            <Badge variant="outline" className="flex items-center gap-1 text-amber-600 border-amber-200">
              <Loader2 className="h-3 w-3 animate-spin" />
              Indexing
            </Badge>
          )}
          {status === "error" && (
            <Badge variant="destructive" className="flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              Error
            </Badge>
          )}
        </div>
      </div>

      {error && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="rounded-xl border bg-muted/20">
        <ScrollArea className="h-64 p-4 space-y-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground gap-2">
              <MessageCircle className="h-10 w-10 text-muted-foreground/40" />
              <p className="text-sm">
                {status === "ready"
                  ? "Ask your first question to start the conversation."
                  : disabledReason || "Preparing the knowledge base..."}
              </p>
            </div>
          )}

          {messages.map((message, index) => (
            <div
              key={`${message.role}-${index}`}
              className={`rounded-lg p-3 ${
                message.role === "user"
                  ? "bg-primary text-primary-foreground ml-auto max-w-[80%]"
                  : "bg-background border text-foreground mr-auto max-w-[85%]"
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              {message.citations && message.citations.length > 0 && (
                <div className="mt-3 border-t pt-2">
                  <p className="text-xs font-semibold mb-1 text-muted-foreground">
                    Sources
                  </p>
                  <ul className="space-y-1">
                    {message.citations.map((citation, idx) => (
                      <li key={`${citation.source}-${citation.chunkIndex}-${idx}`} className="text-xs text-muted-foreground">
                        <span className="font-medium">{citation.source}</span>
                        <span className="ml-2">
                          Chunk {citation.chunkIndex} • Similarity{" "}
                          {(1 - citation.distance).toFixed(3)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
          <div ref={endRef} />
        </ScrollArea>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-3 border-t p-4 sm:flex-row"
        >
          <Input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder={
              status === "ready"
                ? "Ask something about the generated script..."
                : disabledReason
            }
            disabled={status !== "ready" || isLoading}
          />
          <Button
            type="submit"
            disabled={status !== "ready" || isLoading || !input.trim()}
            className="whitespace-nowrap"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Thinking...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Ask
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}

