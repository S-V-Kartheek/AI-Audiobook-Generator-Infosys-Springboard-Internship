# DocuTalksAI
An AI-powered platform that transforms documents into engaging, podcast-style audio content featuring chapter navigation, a retrieval-augmented generation (RAG) system for intelligent Q&A, an interactive 3D bot that explains concepts with emotional depth and expressive movement, and an integrated YouTube recommender companion.
## Features

- Document upload: PDF, DOCX, TXT, and images (OCR)
- AI rewrite: Produces clean, conversational markdown with headings
- Audio generation: TTS creates an `.mp3` with chapter navigation
- Chapters UI: Navigate sections and seek in audio
- Q&A panel: Local RAG over generated script 
- 3D bot that explains concepts and stores your chat in cache memory and respond based on previous chat
- YouTube recommender: Standalone app, integrated under `/youtube` in production

## Tech Stack

- Frontend: React + TypeScript + Vite + Tailwind
- Server: Express (TypeScript)
- AI rewrite: LM studio Model(mistral 7b) ,you can use gemini api based on the system gpu
- TTS: Python `gTTS`
- Extraction: `pdfplumber`, `python-docx`, `pytesseract` + `Pillow`
- Ollama 3.1 8b model for 3d bot

## Prerequisites

- Node.js 18+
- Python 3.10+ with `pip`
- Windows users: Tesseract OCR installed (for image OCR)
  - Typical path: `C:\Program Files\Tesseract-OCR\tesseract.exe`
-Mistral 7b model from LM studio 

## Environment Variables

Create `.env` in the project root (server reads from process env):
- `Eleven_Labs_API_KEY` 
- `GEMINI_API_KEY` or `GOOGLE_AI_API_KEY`: Google GenAI API key
- `PORT` (optional): server port (default 3000)

Client env variables (optional):

- `VITE_YOUTUBE_RECOMMENDER_URL`: Dev URL for the recommender (defaults to `http://localhost:5173/`)

## Setup

1. Install Node dependencies:
   - `npm install`
2. Install Python packages:
   - `python -m pip install pdfplumber pillow pytesseract python-docx gtts`
3. (Windows, OCR) Install Tesseract OCR and ensure it’s in the default path.

## Development

- Start dev server: `npm run dev`
  - Main app: `http://localhost:3000/`
  - 3d model viewer: `http://localhost:3000/3d`
  - YouTube recommender dev server: `http://localhost:5173/`
  - Dev redirect: visiting `http://localhost:3000/youtube` redirects to `http://localhost:5173/`

## Production Build & Run

1. Build: `npm run build`
   - Builds main client and the YouTube recommender subproject
2. Start: `npm start`
   - Main app served on `PORT` (default `3000`)
   - YouTube recommender served under `/youtube`

## Project Structure

- `client/`: React app
- `server/`: Express server, routes and integration
- `python/`: Text extraction and TTS scripts
- `shared/`: Shared TypeScript interfaces
- `youtube recommender ifsb/project/`: Recommender app (React + Vite)

## Common Commands

- Type check: `npm run check`
- Build: `npm run build`
- Start (prod): `npm start`

## Troubleshooting

- Missing Python deps: install via `pip` as listed above
- Image OCR failing on Windows: ensure Tesseract OCR is installed and accessible
- AI rewrite not working: verify `GEMINI_API_KEY` or `GOOGLE_AI_API_KEY` is set

## Security & Notes

- Do not commit secrets. Use environment variables securely.
- No third-party branding is included in production assets.
