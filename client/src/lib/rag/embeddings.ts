import { env, pipeline } from "@xenova/transformers";

env.allowLocalModels = false;
env.useBrowserCache = true;

let embeddingPipeline: any = null;

export async function initializeEmbeddings() {
  if (!embeddingPipeline) {
    embeddingPipeline = await pipeline("feature-extraction", "Xenova/e5-small-v2", {
      quantized: true,
    });
  }

  return embeddingPipeline;
}

export async function generateEmbedding(text: string): Promise<number[]> {
  const pipe = await initializeEmbeddings();
  const prefixedText = `passage: ${text}`;

  const output = await pipe(prefixedText, {
    pooling: "mean",
    normalize: true,
  });

  return Array.from(output.data);
}

export async function generateQueryEmbedding(query: string): Promise<number[]> {
  const pipe = await initializeEmbeddings();
  const prefixedQuery = `query: ${query}`;

  const output = await pipe(prefixedQuery, {
    pooling: "mean",
    normalize: true,
  });

  return Array.from(output.data);
}

