import { useState, useRef, useEffect } from "react";
import { Download, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { ChapterNavigation } from "@/components/chapter-navigation";
import { AudioPlayer } from "@/components/audio-player";
import { MarkdownContent } from "@/components/markdown-content";
import type { Chapter } from "@shared/schema";

interface ContentDisplayProps {
  rewrittenMarkdown: string;
  chapters: Chapter[];
  audioPath: string;
  onReset: () => void;
}

export function ContentDisplay({
  rewrittenMarkdown,
  chapters,
  audioPath,
  onReset,
}: ContentDisplayProps) {
  const [activeChapterId, setActiveChapterId] = useState<string>(
    chapters[0]?.id || ""
  );
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const currentChapter = chapters.find(
      (ch) =>
        currentTime >= ch.timestamp &&
        (chapters.indexOf(ch) === chapters.length - 1 ||
          currentTime < chapters[chapters.indexOf(ch) + 1].timestamp)
    );

    if (currentChapter && currentChapter.id !== activeChapterId) {
      setActiveChapterId(currentChapter.id);
    }
  }, [currentTime, chapters, activeChapterId]);

  const handleChapterClick = (chapterId: string) => {
    const chapter = chapters.find((ch) => ch.id === chapterId);
    if (chapter && audioRef.current) {
      audioRef.current.currentTime = chapter.timestamp;
      setActiveChapterId(chapterId);
      
      const element = document.getElementById(`chapter-${chapterId}`);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  const handleDownloadMarkdown = () => {
    const blob = new Blob([rewrittenMarkdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "podcast-script.md";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            Your Podcast is Ready
          </h2>
          <p className="text-sm text-muted-foreground">
            Listen to the audio or read the rewritten transcript
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadMarkdown}
            data-testid="button-download-markdown"
          >
            <Download className="w-4 h-4 mr-2" />
            Download Text
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onReset}
            data-testid="button-reset"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            New Upload
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-[280px,1fr] gap-6">
        <div className="space-y-4">
          <Card className="p-4">
            <h3 className="text-sm font-semibold text-foreground mb-3">
              Chapters
            </h3>
            <ChapterNavigation
              chapters={chapters}
              activeChapterId={activeChapterId}
              onChapterClick={handleChapterClick}
            />
          </Card>

          <Card className="p-4">
            <AudioPlayer
              audioPath={audioPath}
              audioRef={audioRef}
              onTimeUpdate={setCurrentTime}
              currentChapter={
                chapters.find((ch) => ch.id === activeChapterId)?.title || ""
              }
            />
          </Card>
        </div>

        <Card className="p-6">
          <ScrollArea className="h-[600px] pr-4">
            <MarkdownContent
              content={rewrittenMarkdown}
              chapters={chapters}
              activeChapterId={activeChapterId}
            />
          </ScrollArea>
        </Card>
      </div>
    </div>
  );
}
