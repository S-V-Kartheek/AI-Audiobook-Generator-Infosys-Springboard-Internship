# r3f Virtual friend – Backend

Backend service for a real‑time, 3D virtual companion built with React Three Fiber. It orchestrates LLM chat, text‑to‑speech, lip‑sync, and web search for the frontend avatar experience.

## Demo & Frontend

- Frontend repository: [r3f-virtual-friend-frontend](https://github.com/wass08/r3f-virtual-friend-frontend)

## Key Features

- Conversational AI "virtual friend" with short‑term memory per session
- Pluggable LLM backends:
  - Google Gemini (preferred)
  - OpenRouter (OpenAI‑compatible models, e.g. `openai/gpt-4o-mini`)
  - we are using local LLM via Ollama (see notes in code)
- Multiple TTS engines:
  - Local: Piper TTS, Windows SAPI
  - Cloud: Azure Cognitive Services, ElevenLabs
- Lipsync generation using Rhubarb and FFmpeg for accurate mouth cues
- Simple web search proxy using Wikipedia + DuckDuckGo instant answers
- REST API designed to be consumed by a browser‑based 3D avatar frontend

## Tech Stack

- **Runtime:** Node.js (ES modules)
- **Framework:** Express
- **Language:** JavaScript (modern, async/await)
- **Other:** `node-fetch`, `cors`, `dotenv`, `nodemon`

## High‑Level Architecture

The backend exposes a small set of HTTP endpoints that the frontend calls for:

- `/chat` – generate character responses (JSON including text, facial expressions, and animations)
- `/tts/elevenlabs` – proxy ElevenLabs TTS with optional phoneme/word timestamps
- `/websearch` – simple knowledge lookup for the chat agent
- `/openrouter/chat` – generic OpenRouter proxy to avoid exposing API keys in the browser
- `/ttscheck` and `/transcribe` – utility endpoints for testing local TTS/STT pipelines

The service maintains per‑session chat history in memory and selects animations/expressions based on the generated text.

## Prerequisites

- Node.js 18+ and Yarn
- FFmpeg available on your PATH (or configured via `FFMPEG_EXE`)
- For the full audio pipeline, you will also need some or all of:
  - **Piper TTS** (local, recommended)
  - **Rhubarb Lip Sync**
  - **Windows SAPI** (built‑in on Windows, used for TTS/STT fallback)
  - Optional cloud services: **Google Gemini**, **OpenRouter**, **Azure TTS**, **ElevenLabs**

## Setup

1. **Clone and install dependencies**

   ```bash
   yarn
   ```

2. **Configure environment variables**

   Create a `.env` file (you can base it on `.env.example` if present) and set the variables you need for your setup. Common ones include:

   - Core
     - `PORT` – backend port (default: `3000`)
   - Gemini (recommended LLM)
     - `GEMINI_API_KEY`
     - `GEMINI_MODEL` (e.g. `gemini-1.5-flash`)
     - `GEMINI_VISION_MODEL` (optional, for image input)
   - OpenRouter (alternative hosted LLM)
     - `OPENROUTER_API_KEY`
     - `OPENROUTER_MODEL` (e.g. `openai/gpt-4o-mini`)
   - ElevenLabs TTS
     - `ELEVENLABS_API_KEY`
     - `ELEVENLABS_VOICE_ID` (optional, default voice if omitted)
     - `ELEVENLABS_MODEL_ID` (e.g. `eleven_turbo_v2_5`)
   - Azure TTS
     - `AZURE_TTS_KEY`
     - `AZURE_TTS_REGION` (e.g. `eastus`)
     - `AZURE_TTS_VOICE` (e.g. `en-US-AriaNeural`)
   - TTS selection and local engines
     - `TTS_ENGINE` – `azure`, `piper`, or `sapi` (default: `sapi`)
     - `PIPER_EXE` – path to `piper` executable if not on PATH
     - `PIPER_MODEL` – path to your `.onnx` voice model
     - `PIPER_SPEAKER`, `PIPER_LENGTH` – optional tuning parameters
     - `SAPI_VOICE` – optional, explicit Windows SAPI voice name
   - Tools
     - `FFMPEG_EXE` – path to `ffmpeg` if not on PATH
     - `OLLAMA_URL`, `OLLAMA_MODEL`, `OLLAMA_PATH` – optional, for local LLMs if re‑enabled

3. **Install and configure external tools**

   - **Piper TTS (local voice)**
     - Download Piper for your OS: <https://github.com/rhasspy/piper/releases>
     - Download a voice model (e.g. `en_US-amy-medium.onnx`)
     - Place the model file under a folder like `voices/` and point `PIPER_MODEL` to it
     - If `piper` is not on PATH, set `PIPER_EXE` in `.env`

   - **Rhubarb Lip Sync**
     - Download the Rhubarb binary: <https://github.com/DanielSWolf/rhubarb-lip-sync/releases>
     - Put the executable in `bin/` as:
       - `bin/rhubarb.exe` on Windows
       - `bin/rhubarb` on macOS/Linux

   - **FFmpeg**
     - Install FFmpeg and ensure `ffmpeg` is on your PATH, or set `FFMPEG_EXE` in `.env`.

## Running Locally

In one terminal, start the backend:

```bash
yarn dev
```

In a separate terminal (inside the frontend project), start the 3D client:

```bash
yarn dev
```

By default the backend listens on `http://localhost:3000` and the frontend on its configured dev port (see the frontend README).

## API Overview

- `GET /` – health check / simple hello message
- `POST /chat` – main chat endpoint
  - Request: `{ message: string, images?: string[], sessionId?: string, reset?: boolean }`
  - Response: `{ messages: [{ text, facialExpression, animation }] }`
- `POST /tts/elevenlabs` – proxy ElevenLabs TTS; returns base64 audio and optional timestamps
- `POST /openrouter/chat` – generic OpenRouter chat proxy
- `POST /websearch` – web search helper
- `GET /ttscheck` – quick check that TTS + FFmpeg are wired correctly
- `POST /transcribe` – basic speech‑to‑text via Windows SAPI

For detailed behavior and fallbacks, see `index.js`.
