import { useEffect, useRef, useState } from "react";
import { chunkMarkdown } from "@/lib/rag/chunker";
import { vectorStore } from "@/lib/rag/simpleVectorStore";

export type RagIndexStatus = "idle" | "indexing" | "ready" | "error";

export function useRagIndexer(
  markdown: string,
  documentKey: string,
  documentName: string
) {
  const [status, setStatus] = useState<RagIndexStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const lastIndexedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!markdown?.trim()) {
      vectorStore.clearCollection();
      setStatus("idle");
      setError(null);
      lastIndexedRef.current = null;
      return;
    }

    if (lastIndexedRef.current === documentKey) {
      return;
    }

    let cancelled = false;

    const run = async () => {
      setStatus("indexing");
      setError(null);

      try {
        vectorStore.clearCollection();
        await vectorStore.initialize();

        const chunks = chunkMarkdown(
          markdown,
          documentName || `document-${documentKey}`
        );

        await vectorStore.addChunks(chunks);

        if (!cancelled) {
          lastIndexedRef.current = documentKey;
          setStatus("ready");
        }
      } catch (err) {
        if (!cancelled) {
          setStatus("error");
          setError(
            err instanceof Error
              ? err.message
              : "Failed to index the generated markdown."
          );
        }
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [markdown, documentKey, documentName]);

  return {
    status,
    error,
  };
}

