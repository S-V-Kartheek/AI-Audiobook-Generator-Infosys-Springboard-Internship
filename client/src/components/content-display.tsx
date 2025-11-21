import { useState, useRef, useEffect } from "react";
import { Download, RotateCcw, MessageCircle, Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { ChapterNavigation } from "@/components/chapter-navigation";
import { AudioPlayer } from "@/components/audio-player";
import { MarkdownContent } from "@/components/markdown-content";
import { QnaPanel } from "@/components/qna-panel";
import { useRagIndexer } from "@/hooks/use-rag-indexer";
import type { Chapter } from "@shared/schema";

interface ContentDisplayProps {
  rewrittenMarkdown: string;
  chapters: Chapter[];
  audioPath: string;
  jobId: string;
  documentName: string;
  onReset: () => void;
}

export function ContentDisplay({
  rewrittenMarkdown,
  chapters,
  audioPath,
  jobId,
  documentName,
  onReset,
}: ContentDisplayProps) {
  const [activeChapterId, setActiveChapterId] = useState<string>(
    chapters[0]?.id || ""
  );
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [showQna, setShowQna] = useState(false);

  const { status: ragStatus, error: ragError } = useRagIndexer(
    rewrittenMarkdown,
    jobId,
    documentName
  );

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

      <Separator />

      <div className="space-y-4 rounded-xl border border-border/60 bg-card/30 p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-base font-semibold text-foreground">Need instant answers?</h3>
            <p className="text-sm text-muted-foreground">
              Chat with an AI assistant grounded in your freshly generated script.
            </p>
          </div>
          <Button
            variant={showQna ? "outline" : "default"}
            onClick={() => setShowQna((prev) => !prev)}
            disabled={ragStatus === "indexing"}
          >
            {ragStatus === "indexing" ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Preparing Q&A...
              </>
            ) : (
              <>
                <MessageCircle className="mr-2 h-4 w-4" />
                {showQna ? "Hide Q&A" : "Open Q&A"}
              </>
            )}
          </Button>
        </div>

        {ragStatus === "error" && (
          <div className="flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            <AlertTriangle className="mt-0.5 h-4 w-4" />
            <p>{ragError}</p>
          </div>
        )}

        {showQna && (
          <QnaPanel
            documentKey={jobId}
            documentName={documentName || "podcast-script.md"}
            status={ragStatus}
            error={ragError}
          />
        )}
      </div>
    </div>
  );
}
