export interface Chunk {
  text: string;
  metadata: {
    source: string;
    chunkIndex: number;
  };
}

export function chunkMarkdown(
  content: string,
  source: string,
  chunkSize: number = 500,
  overlap: number = 100
): Chunk[] {
  const paragraphs = content
    .split(/\n\n+/)
    .map((paragraph) => paragraph.trim())
    .filter((paragraph) => paragraph.length > 0);

  const chunks: Chunk[] = [];
  let currentChunk = "";
  let chunkIndex = 0;

  for (const paragraph of paragraphs) {
    if (
      currentChunk.length + paragraph.length > chunkSize &&
      currentChunk.length > 0
    ) {
      chunks.push({
        text: currentChunk.trim(),
        metadata: {
          source,
          chunkIndex: chunkIndex++,
        },
      });

      const words = currentChunk.split(/\s+/);
      const overlapWords = words.slice(-Math.floor(overlap / 5));
      currentChunk = `${overlapWords.join(" ")} ${paragraph}`.trim();
    } else {
      currentChunk += `${currentChunk ? "\n\n" : ""}${paragraph}`;
    }
  }

  if (currentChunk.trim().length > 0) {
    chunks.push({
      text: currentChunk.trim(),
      metadata: {
        source,
        chunkIndex: chunkIndex++,
      },
    });
  }

  return chunks;
}

