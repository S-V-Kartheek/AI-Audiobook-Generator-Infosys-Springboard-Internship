import { ChromaClient, Collection } from 'chromadb';
import { generateEmbedding, generateQueryEmbedding } from './embeddings';
import type { Chunk } from '../utils/chunker';

export interface SearchResult {
  text: string;
  metadata: {
    source: string;
    chunkIndex: number;
  };
  distance: number;
}

class VectorStore {
  private client: ChromaClient;
  private collection: Collection | null = null;
  private collectionName = 'rag_documents';

  constructor() {
    this.client = new ChromaClient();
  }

  async initialize() {
    try {
      this.collection = await this.client.getOrCreateCollection({
        name: this.collectionName,
        metadata: { 'hnsw:space': 'cosine' },
      });
    } catch (error) {
      console.error('Error initializing collection:', error);
      throw error;
    }
  }

  async addChunks(chunks: Chunk[]) {
    if (!this.collection) {
      await this.initialize();
    }

    const ids: string[] = [];
    const embeddings: number[][] = [];
    const documents: string[] = [];
    const metadatas: any[] = [];

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const embedding = await generateEmbedding(chunk.text);

      ids.push(`chunk_${chunk.metadata.source}_${chunk.metadata.chunkIndex}`);
      embeddings.push(embedding);
      documents.push(chunk.text);
      metadatas.push(chunk.metadata);
    }

    await this.collection!.add({
      ids,
      embeddings,
      documents,
      metadatas,
    });
  }

  async search(query: string, topK: number = 5): Promise<SearchResult[]> {
    if (!this.collection) {
      await this.initialize();
    }

    const queryEmbedding = await generateQueryEmbedding(query);

    const results = await this.collection!.query({
      queryEmbeddings: [queryEmbedding],
      nResults: topK,
    });

    const searchResults: SearchResult[] = [];

    if (results.documents && results.documents[0]) {
      for (let i = 0; i < results.documents[0].length; i++) {
        searchResults.push({
          text: results.documents[0][i] as string,
          metadata: results.metadatas?.[0]?.[i] as any,
          distance: results.distances?.[0]?.[i] || 0,
        });
      }
    }

    return searchResults;
  }

  async clearCollection() {
    if (this.collection) {
      await this.client.deleteCollection({ name: this.collectionName });
      this.collection = null;
    }
  }
}

export const vectorStore = new VectorStore();
