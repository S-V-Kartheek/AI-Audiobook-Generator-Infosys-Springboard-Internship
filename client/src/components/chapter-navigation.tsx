import { ScrollArea } from "@/components/ui/scroll-area";
import type { Chapter } from "@shared/schema";

interface ChapterNavigationProps {
  chapters: Chapter[];
  activeChapterId: string;
  onChapterClick: (chapterId: string) => void;
}

export function ChapterNavigation({
  chapters,
  activeChapterId,
  onChapterClick,
}: ChapterNavigationProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <ScrollArea className="h-[300px]">
      <div className="space-y-1">
        {chapters.map((chapter) => {
          const isActive = chapter.id === activeChapterId;
          
          return (
            <button
              key={chapter.id}
              onClick={() => onChapterClick(chapter.id)}
              className={`w-full text-left px-3 py-2 rounded-md text-sm transition-all hover-elevate active-elevate-2 ${
                isActive
                  ? "bg-accent text-accent-foreground font-medium"
                  : "text-foreground"
              }`}
              data-testid={`chapter-item-${chapter.id}`}
            >
              <div className="flex items-start justify-between gap-2">
                <span className="line-clamp-2 flex-1">{chapter.title}</span>
                <span className="text-xs text-muted-foreground flex-shrink-0">
                  {formatTime(chapter.timestamp)}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </ScrollArea>
  );
}
