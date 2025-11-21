import { useState, useEffect, useRef } from 'react';
import { Send, FileText, Loader2, BookOpen, AlertCircle, Upload, RefreshCw } from 'lucide-react';
import { vectorStore } from './services/simpleVectorStore';
import { ragService, type RAGResponse } from './services/ragService';
import { chunkMarkdown } from './utils/chunker';
import podcastScriptRaw from './data/podcast-script.md?raw';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  citations?: RAGResponse['citations'];
}

function App() {
  console.log('App component rendering...');
  const [appError, setAppError] = useState<string | null>(null);
  const podcastScript = podcastScriptRaw;
  console.log('Podcast script loaded, length:', podcastScript?.length);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isIndexing, setIsIndexing] = useState(false);
  const [isIndexed, setIsIndexed] = useState(false);
  const [currentDocument, setCurrentDocument] = useState<string>('');
  const [documentName, setDocumentName] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setCurrentDocument(content);
      setDocumentName(file.name);
    };
    reader.readAsText(file);
  };

  const indexDocument = async (documentContent?: string, docName?: string) => {
    setIsIndexing(true);
    try {
      vectorStore.clearCollection();
      await vectorStore.initialize();

      const content = documentContent || currentDocument || podcastScript;
      const name = docName || documentName || 'default-document.md';

      const chunks = chunkMarkdown(content, name, 500, 100);

      setMessages([{
        role: 'assistant',
        content: `Processing ${chunks.length} chunks from "${name}" and generating embeddings. This may take a minute...`
      }]);

      await vectorStore.addChunks(chunks);

      setIsIndexed(true);
      setMessages([{
        role: 'assistant',
        content: `Document indexed successfully! I've processed ${chunks.length} chunks from "${name}". You can now ask me questions about it.`
      }]);
    } catch (error) {
      console.error('Error indexing document:', error);
      setMessages([{
        role: 'assistant',
        content: `Error indexing document: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`
      }]);
      setIsIndexed(false);
    } finally {
      setIsIndexing(false);
    }
  };

  const reindexDocument = () => {
    setIsIndexed(false);
    setMessages([]);
    vectorStore.clearCollection();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !isIndexed) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await ragService.answerQuestion(input);

      const assistantMessage: Message = {
        role: 'assistant',
        content: response.answer,
        citations: response.citations
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error getting answer:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error while processing your question.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (appError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg border border-red-200 p-8 max-w-md">
          <div className="flex items-center gap-3 text-red-600 mb-4">
            <AlertCircle className="w-8 h-8" />
            <h2 className="text-xl font-bold">Application Error</h2>
          </div>
          <p className="text-slate-700">{appError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-4xl mx-auto p-6 h-screen flex flex-col">
        <div className="bg-white rounded-lg shadow-lg border border-slate-200 flex flex-col h-full overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <BookOpen className="w-8 h-8" />
                <div>
                  <h1 className="text-2xl font-bold">RAG Question Answering Bot</h1>
                  <p className="text-blue-100 text-sm mt-1">
                    {isIndexed && documentName
                      ? `Chatting about "${documentName}"`
                      : 'Upload and index a document to start'}
                  </p>
                </div>
              </div>
              {isIndexed && (
                <button
                  onClick={reindexDocument}
                  className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                  title="Index a new document"
                >
                  <RefreshCw className="w-4 h-4" />
                  New Document
                </button>
              )}
            </div>
          </div>

          {!isIndexed ? (
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="text-center max-w-xl">
                <FileText className="w-16 h-16 mx-auto text-blue-600 mb-4" />
                <h2 className="text-xl font-semibold text-slate-800 mb-2">
                  Index Your Document
                </h2>
                <p className="text-slate-600 mb-6">
                  Upload a markdown or text document, or use the default podcast script. The system will generate embeddings for RAG-based question answering.
                </p>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".md,.txt"
                  className="hidden"
                />

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isIndexing}
                    className="bg-slate-600 hover:bg-slate-700 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 justify-center"
                  >
                    <Upload className="w-5 h-5" />
                    Upload Document
                  </button>

                  <button
                    onClick={() => indexDocument()}
                    disabled={isIndexing}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 justify-center"
                  >
                    {isIndexing ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Indexing...
                      </>
                    ) : (
                      <>
                        <FileText className="w-5 h-5" />
                        {currentDocument ? `Index "${documentName}"` : 'Index Default Document'}
                      </>
                    )}
                  </button>
                </div>

                {currentDocument && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-700">
                      Document "{documentName}" loaded ({currentDocument.length} characters)
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-4 ${
                        message.role === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 text-slate-800'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{message.content}</p>
                      {message.citations && message.citations.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-slate-300">
                          <p className="text-xs font-semibold text-slate-600 mb-2">Sources:</p>
                          <div className="space-y-1">
                            {message.citations.map((citation, idx) => (
                              <div key={idx} className="text-xs text-slate-600">
                                <span className="font-medium">
                                  {citation.source} (Chunk {citation.chunkIndex})
                                </span>
                                <span className="text-slate-500 ml-2">
                                  Similarity: {(1 - citation.distance).toFixed(3)}
                                </span>
                                <p className="text-slate-500 mt-1 italic">{citation.text}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-slate-100 rounded-lg p-4">
                      <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <form onSubmit={handleSubmit} className="p-4 border-t border-slate-200">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask a question about the podcast..."
                    className="flex-1 px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={isLoading}
                  />
                  <button
                    type="submit"
                    disabled={isLoading || !input.trim()}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
