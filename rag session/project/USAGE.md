# RAG Question Answering Bot - Usage Guide

## Features

### 1. Document Upload & Indexing
- **Upload Custom Documents**: Click "Upload Document" to select a markdown (.md) or text (.txt) file
- **Use Default Document**: Click "Index Default Document" to use the included podcast script
- **Re-indexing**: Click "New Document" button (top-right) to clear current embeddings and index a new document

### 2. How It Works

#### Indexing Process:
1. **Upload/Select** a document
2. System **chunks** the document (500 char chunks, 100 char overlap)
3. **E5-small-v2 embeddings** are generated for each chunk (runs in browser)
4. Embeddings are **stored in memory** for fast retrieval
5. Previous embeddings are **automatically cleared** when re-indexing

#### Question Answering:
1. User asks a question
2. System converts question to **query embedding**
3. **Searches** for top 5 most similar chunks using cosine similarity
4. Retrieved chunks sent to **GPT-4o-mini** as context
5. LLM generates answer **based only on the context**
6. Response includes **citations** with source chunks and similarity scores

### 3. Technical Stack
- **Embedding Model**: E5-small-v2 (via Transformers.js - runs in browser)
- **Vector Store**: In-memory with cosine similarity search
- **LLM**: OpenAI GPT-4o-mini
- **Frontend**: React + TypeScript + Tailwind CSS

### 4. Key Capabilities
- ✅ Upload new documents anytime
- ✅ Automatic clearing of old embeddings
- ✅ Client-side embedding generation (no server needed)
- ✅ Citation with similarity scores
- ✅ Context-aware answers (no hallucination)
- ✅ Fast in-memory vector search

### 5. Workflow Example

```
1. Click "Upload Document" → Select your markdown file
2. Click "Index [filename]" → Wait for embeddings (30-60 seconds)
3. Ask questions in the chat interface
4. Get answers with source citations
5. Click "New Document" to index a different file (old data cleared automatically)
```

## Notes
- First load downloads the E5-small-v2 model (~100MB, cached after first use)
- Embeddings are stored in memory only (cleared on refresh)
- Best for documents up to ~50,000 characters
- Supports markdown and plain text files
