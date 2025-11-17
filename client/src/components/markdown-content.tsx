import type { Chapter } from "@shared/schema";

interface MarkdownContentProps {
  content: string;
  chapters: Chapter[];
  activeChapterId: string;
}

export function MarkdownContent({
  content,
  chapters,
  activeChapterId,
}: MarkdownContentProps) {
  const lines = content.split("\n");
  const renderedContent: JSX.Element[] = [];
  let currentChapterIndex = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();

    if (trimmedLine.startsWith("#")) {
      const level = trimmedLine.match(/^#+/)?.[0].length || 1;
      const text = trimmedLine.replace(/^#+\s*/, "");

      const chapter = chapters[currentChapterIndex];
      const isActive = chapter?.id === activeChapterId;

      if (chapter && chapter.title === text) {
        const HeadingTag = `h${Math.min(level, 6)}` as keyof JSX.IntrinsicElements;
        
        renderedContent.push(
          <div
            key={`chapter-${i}`}
            id={`chapter-${chapter.id}`}
            className={`scroll-mt-4 transition-all ${
              isActive ? "bg-accent/30 -mx-2 px-2 py-1 rounded-md" : ""
            }`}
          >
            <HeadingTag
              className={`font-semibold text-foreground mb-3 pb-2 border-b ${
                level === 1
                  ? "text-xl"
                  : level === 2
                  ? "text-lg"
                  : "text-base"
              }`}
            >
              {text}
            </HeadingTag>
          </div>
        );
        currentChapterIndex++;
        continue;
      }
    }

    if (trimmedLine.startsWith("**") && trimmedLine.endsWith("**")) {
      const text = trimmedLine.slice(2, -2);
      renderedContent.push(
        <p key={`bold-${i}`} className="font-semibold text-foreground mb-2">
          {text}
        </p>
      );
    } else if (trimmedLine.startsWith("*") && trimmedLine.endsWith("*") && !trimmedLine.startsWith("**")) {
      const text = trimmedLine.slice(1, -1);
      renderedContent.push(
        <p key={`italic-${i}`} className="italic text-foreground mb-2">
          {text}
        </p>
      );
    } else if (trimmedLine.startsWith("-") || trimmedLine.startsWith("*")) {
      const text = trimmedLine.replace(/^[-*]\s*/, "");
      renderedContent.push(
        <li key={`li-${i}`} className="text-sm text-foreground ml-4 mb-1">
          {text}
        </li>
      );
    } else if (trimmedLine === "") {
      renderedContent.push(<div key={`space-${i}`} className="h-4" />);
    } else {
      renderedContent.push(
        <p key={`p-${i}`} className="text-sm text-foreground mb-3 leading-relaxed">
          {line}
        </p>
      );
    }
  }

  return (
    <div className="prose prose-sm max-w-none" data-testid="markdown-content">
      {renderedContent}
    </div>
  );
}
