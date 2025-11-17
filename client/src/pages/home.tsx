import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { FileUploadZone } from "@/components/file-upload-zone";
import { ProcessingIndicator } from "@/components/processing-indicator";
import { ContentDisplay } from "@/components/content-display";
import { useToast } from "@/hooks/use-toast";
import type { ProcessingJob } from "@shared/schema";

export default function Home() {
  const [jobId, setJobId] = useState<string | null>(null);
  const { toast } = useToast();

  const { data: job, isLoading } = useQuery<ProcessingJob>({
    queryKey: ['/api/job', jobId],
    enabled: !!jobId,
    refetchInterval: (query) => {
      const data = query.state.data;
      if (!data || data.status === 'completed' || data.status === 'error') {
        return false;
      }
      return 2000;
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Upload failed');
      }

      return response.json();
    },
    onSuccess: (data: { jobId: string }) => {
      setJobId(data.jobId);
      queryClient.invalidateQueries({ queryKey: ['/api/job', data.jobId] });
    },
    onError: (error: Error) => {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleFileUpload = (file: File) => {
    uploadMutation.mutate(file);
  };

  const handleReset = () => {
    setJobId(null);
    uploadMutation.reset();
  };

  const showUpload = !jobId || job?.status === 'error';
  const showProcessing = job && (job.status === 'extracting' || job.status === 'rewriting' || job.status === 'generating_audio');
  const showContent = job?.status === 'completed';

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-semibold text-foreground">Document to Podcast</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Transform your documents into engaging audio narration
          </p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {showUpload && (
          <FileUploadZone
            onFileSelect={handleFileUpload}
            isUploading={uploadMutation.isPending}
            error={job?.error}
            onRetry={handleReset}
          />
        )}

        {showProcessing && job && (
          <ProcessingIndicator status={job.status} progress={job.progress} />
        )}

        {showContent && job && (
          <ContentDisplay
            rewrittenMarkdown={job.rewrittenMarkdown || ''}
            chapters={job.chapters || []}
            audioPath={job.audioPath || ''}
            onReset={handleReset}
          />
        )}
      </main>
    </div>
  );
}
