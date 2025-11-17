import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import path from "path";
import fs from "fs";
import { promisify } from "util";
import { exec } from "child_process";
import { storage } from "./storage";
import { rewriteAsPodcastScript } from "./gemini";

const execAsync = promisify(exec);

const uploadsDir = path.join(process.cwd(), "uploads");
const audioDir = path.join(process.cwd(), "audio");

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

if (!fs.existsSync(audioDir)) {
  fs.mkdirSync(audioDir, { recursive: true });
}

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, uniqueSuffix + '-' + file.originalname);
    }
  }),
  limits: {
    fileSize: 50 * 1024 * 1024,
  }
});

async function processDocument(jobId: string, filePath: string, fileExtension: string) {
  try {
    await storage.updateJob(jobId, { status: 'extracting', progress: 10 });

    const pythonPath = 'python3';
    const extractorScript = path.join(process.cwd(), 'python', 'text_extractor.py');
    
    const { stdout: extractOutput } = await execAsync(
      `${pythonPath} "${extractorScript}" "${filePath}" "${fileExtension}"`
    );
    
    const extractResult = JSON.parse(extractOutput);
    
    if (!extractResult.success) {
      throw new Error(extractResult.error || 'Text extraction failed');
    }

    const extractedText = extractResult.text;
    await storage.updateJob(jobId, { 
      extractedText, 
      status: 'rewriting', 
      progress: 30 
    });

    const rewrittenMarkdown = await rewriteAsPodcastScript(extractedText);
    
    await storage.updateJob(jobId, { 
      rewrittenMarkdown, 
      status: 'generating_audio', 
      progress: 60 
    });

    const audioFileName = `${jobId}.mp3`;
    const audioPath = path.join(audioDir, audioFileName);
    const ttsScript = path.join(process.cwd(), 'python', 'tts_generator.py');
    
    const tempMarkdownPath = path.join(uploadsDir, `${jobId}.md`);
    fs.writeFileSync(tempMarkdownPath, rewrittenMarkdown);
    
    const { stdout: ttsOutput } = await execAsync(
      `${pythonPath} "${ttsScript}" "${tempMarkdownPath}" "${audioPath}"`
    );
    
    const ttsResult = JSON.parse(ttsOutput);
    
    if (fs.existsSync(tempMarkdownPath)) {
      fs.unlinkSync(tempMarkdownPath);
    }
    
    if (!ttsResult.success) {
      throw new Error(ttsResult.error || 'Audio generation failed');
    }

    await storage.updateJob(jobId, {
      chapters: ttsResult.chapters,
      audioPath: `/audio/${audioFileName}`,
      status: 'completed',
      progress: 100
    });

    fs.unlinkSync(filePath);

  } catch (error) {
    console.error('Processing error:', error);
    await storage.updateJob(jobId, {
      status: 'error',
      error: error instanceof Error ? error.message : 'Processing failed'
    });
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  app.use('/audio', (req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    next();
  }, (req, res, next) => {
    const filePath = path.join(audioDir, path.basename(req.path));
    if (fs.existsSync(filePath)) {
      res.sendFile(filePath);
    } else {
      res.status(404).json({ error: 'Audio file not found' });
    }
  });

  app.post('/api/upload', upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const fileExtension = path.extname(req.file.originalname).slice(1).toLowerCase();
      const validExtensions = ['pdf', 'docx', 'txt', 'jpg', 'jpeg', 'png'];
      
      if (!validExtensions.includes(fileExtension)) {
        fs.unlinkSync(req.file.path);
        return res.status(400).json({ 
          error: 'Invalid file type. Please upload PDF, DOCX, TXT, or image files.' 
        });
      }

      const job = await storage.createJob(req.file.originalname);

      processDocument(job.id, req.file.path, fileExtension);

      res.json({ jobId: job.id });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Upload failed' 
      });
    }
  });

  app.get('/api/job/:id', async (req, res) => {
    try {
      const job = await storage.getJob(req.params.id);
      
      if (!job) {
        return res.status(404).json({ error: 'Job not found' });
      }

      res.json(job);
    } catch (error) {
      console.error('Job retrieval error:', error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Failed to retrieve job' 
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
