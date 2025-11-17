import { useCallback, useState } from "react";
import { Upload, FileText, Image, File, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface FileUploadZoneProps {
  onFileSelect: (file: File) => void;
  isUploading: boolean;
  error?: string;
  onRetry?: () => void;
}

export function FileUploadZone({ onFileSelect, isUploading, error, onRetry }: FileUploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        onFileSelect(files[0]);
      }
    },
    [onFileSelect]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        onFileSelect(files[0]);
      }
    },
    [onFileSelect]
  );

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive" data-testid="alert-upload-error">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            {onRetry && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRetry}
                data-testid="button-retry"
              >
                Try Again
              </Button>
            )}
          </AlertDescription>
        </Alert>
      )}

      <div
        className={`p-8 border-2 border-dashed rounded-md transition-all bg-card ${
          isDragging
            ? "border-primary bg-accent/50"
            : "border-border hover-elevate"
        } ${isUploading ? "opacity-50 pointer-events-none" : ""}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        data-testid="zone-upload-drag-drop"
      >
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="p-4 rounded-full bg-primary/10">
            <Upload className="w-8 h-8 text-primary" />
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-foreground">
              {isUploading ? "Uploading..." : "Upload your document"}
            </h3>
            <p className="text-sm text-muted-foreground max-w-md">
              Drop your file here or click to browse. We'll extract the text and
              transform it into an engaging podcast narration.
            </p>
          </div>

          {!isUploading && (
            <>
              <input
                type="file"
                id="file-upload"
                className="hidden"
                accept=".pdf,.docx,.txt,.jpg,.jpeg,.png"
                onChange={handleFileInput}
                data-testid="input-file"
              />
              <label htmlFor="file-upload">
                <Button asChild data-testid="button-browse">
                  <span>Browse Files</span>
                </Button>
              </label>
            </>
          )}

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4 border-t w-full">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <FileText className="w-4 h-4" />
              <span>PDF, DOCX</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <File className="w-4 h-4" />
              <span>TXT</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Image className="w-4 h-4" />
              <span>JPG, PNG</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
