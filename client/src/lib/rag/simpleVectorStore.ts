import { generateEmbedding, generateQueryEmbedding } from "./embeddings";
import type { Chunk } from "./chunker";

export interface SearchResult {
  text: string;
  metadata: {
    source: string;
    chunkIndex: number;
  };
  distance: number;
}

interface StoredChunk {
  id: string;
  text: string;
  embedding: number[];
  metadata: {
    source: string;
    chunkIndex: number;
  };
}

function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error("Vectors must have the same length");
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

class SimpleVectorStore {
  private chunks: StoredChunk[] = [];
  private initialized = false;

  async initialize() {
    if (!this.initialized) {
      this.initialized = true;
    }
  }

  async addChunks(chunks: Chunk[]) {
    for (const chunk of chunks) {
      const embedding = await generateEmbedding(chunk.text);

      this.chunks.push({
        id: `chunk_${chunk.metadata.source}_${chunk.metadata.chunkIndex}`,
        text: chunk.text,
        embedding,
        metadata: chunk.metadata,
      });
    }
  }

  async search(query: string, topK: number = 5): Promise<SearchResult[]> {
    if (this.chunks.length === 0) {
      return [];
    }

    const queryEmbedding = await generateQueryEmbedding(query);

    const results = this.chunks.map((chunk) => ({
      text: chunk.text,
      metadata: chunk.metadata,
      similarity: cosineSimilarity(queryEmbedding, chunk.embedding),
    }));

    results.sort((a, b) => b.similarity - a.similarity);

    return results.slice(0, topK).map((result) => ({
      text: result.text,
      metadata: result.metadata,
      distance: 1 - result.similarity,
    }));
  }

  clearCollection() {
    this.chunks = [];
    this.initialized = false;
  }

  getChunkCount(): number {
    return this.chunks.length;
  }

  isInitialized(): boolean {
    return this.initialized && this.chunks.length > 0;
  }
}

export const vectorStore = new SimpleVectorStore();

