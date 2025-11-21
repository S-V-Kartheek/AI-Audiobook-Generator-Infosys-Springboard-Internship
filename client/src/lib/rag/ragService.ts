import OpenAI from "openai";
import { vectorStore, type SearchResult } from "./simpleVectorStore";

export interface RAGResponse {
  answer: string;
  citations: {
    text: string;
    source: string;
    chunkIndex: number;
    distance: number;
  }[];
}

const MAX_CONTEXT_TOKENS = 3000;

class RAGService {
  private openai?: OpenAI;

  constructor() {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

    if (apiKey) {
      this.openai = new OpenAI({
        apiKey,
        dangerouslyAllowBrowser: true,
      });
    }
  }

  private ensureClient() {
    if (!this.openai) {
      throw new Error(
        "Missing VITE_OPENAI_API_KEY. Please set it in your client env to enable Q&A."
      );
    }
  }

  private trimContext(results: SearchResult[]): string {
    let context = "";
    let estimatedTokens = 0;

    for (const result of results) {
      const chunkTokens = Math.ceil(result.text.length / 4);

      if (estimatedTokens + chunkTokens > MAX_CONTEXT_TOKENS) {
        break;
      }

      context += `\n\n---\nSource: ${result.metadata.source}, Chunk: ${result.metadata.chunkIndex}\n${result.text}`;
      estimatedTokens += chunkTokens;
    }

    return context;
  }

  private buildPrompt(query: string, context: string): string {
    return `You are a helpful AI assistant that answers questions using ONLY the provided context.

If the context lacks the needed information, reply with: "I don't have enough information in the provided context to answer this question."

CONTEXT:
${context}

QUESTION: ${query}

ANSWER:`;
  }

  async answerQuestion(question: string, topK: number = 5): Promise<RAGResponse> {
    this.ensureClient();

    const searchResults = await vectorStore.search(question, topK);

    if (searchResults.length === 0) {
      return {
        answer: "No relevant information found in the knowledge base.",
        citations: [],
      };
    }

    const context = this.trimContext(searchResults);
    const prompt = this.buildPrompt(question, context);

    const completion = await this.openai!.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 500,
    });

    const answer = completion.choices[0]?.message?.content ?? "No answer generated.";

    const citations = searchResults.map((result) => ({
      text: `${result.text.substring(0, 200)}...`,
      source: result.metadata.source,
      chunkIndex: result.metadata.chunkIndex,
      distance: result.distance,
    }));

    return {
      answer,
      citations,
    };
  }
}

export const ragService = new RAGService();

