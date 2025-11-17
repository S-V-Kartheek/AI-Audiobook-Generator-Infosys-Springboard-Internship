import { z } from "zod";

export interface Chapter {
  id: string;
  title: string;
  content: string;
  timestamp: number;
  level: number;
}

export interface ProcessingJob {
  id: string;
  status: 'extracting' | 'rewriting' | 'generating_audio' | 'completed' | 'error';
  progress: number;
  originalFilename: string;
  extractedText?: string;
  rewrittenMarkdown?: string;
  chapters?: Chapter[];
  audioPath?: string;
  error?: string;
}

export const uploadFileSchema = z.object({
  file: z.instanceof(File).refine(
    (file) => {
      const validTypes = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
        'image/jpeg',
        'image/jpg',
        'image/png'
      ];
      return validTypes.includes(file.type);
    },
    { message: 'Invalid file type. Please upload PDF, DOCX, TXT, or image files.' }
  ).refine(
    (file) => file.size <= 50 * 1024 * 1024,
    { message: 'File size must be less than 50MB' }
  ),
});

export type UploadFile = z.infer<typeof uploadFileSchema>;
