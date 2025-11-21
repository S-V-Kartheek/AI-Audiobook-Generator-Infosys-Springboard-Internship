import { useState } from 'react';
import { Youtube, Lightbulb, TrendingUp, Brain, Zap, ChevronDown, ChevronUp } from 'lucide-react';
import SearchInput from './components/SearchInput';
import VideoCard from './components/VideoCard';
import AlgorithmInfo from './components/AlgorithmInfo';
import { extractKeywords, generateSearchQueries } from './utils/keywordExtractor';
import { searchMultipleQueries } from './services/youtubeService';
import { YouTubeVideo } from './types/youtube';

function App() {
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [queries, setQueries] = useState<string[]>([]);
  const [showAlgorithm, setShowAlgorithm] = useState(false);

  const handleSearch = async (userInput: string) => {
    setIsLoading(true);
    setVideos([]);
    setKeywords([]);
    setQueries([]);

    try {
      const extractedKeywords = extractKeywords(userInput);
      setKeywords(extractedKeywords);

      const searchQueries = generateSearchQueries(extractedKeywords);
      setQueries(searchQueries);

      const results = await searchMultipleQueries(searchQueries);
      setVideos(results);
    } catch (error) {
      console.error('Error during search:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <nav className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-red-500 to-red-600 p-2 rounded-lg">
                <Youtube size={28} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Audiobook Generator-Youtube Recommendation</h1>
                <p className="text-xs text-gray-500">Intelligent Learning Assistant</p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Brain size={16} className="text-blue-600" />
                <span>TF-IDF Algorithm</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap size={16} className="text-yellow-600" />
                <span>Multi-factor Scoring</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-12">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-4xl font-bold text-gray-900 mb-3">
              Discover Quality Learning Content
            </h2>
            <p className="text-gray-600 text-lg">
              AI-powered recommendations using advanced NLP and engagement analysis
            </p>
          </div>

          <div className="mb-10">
            <SearchInput onSearch={handleSearch} isLoading={isLoading} />
          </div>

          {keywords.length > 0 && (
            <div className="mb-8 bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-gray-50 to-white px-6 py-4 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900">AI Analysis Results</h3>
              </div>
              <div className="p-6">
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-1.5 bg-amber-100 rounded-lg">
                      <Lightbulb size={18} className="text-amber-600" />
                    </div>
                    <h4 className="font-semibold text-gray-800">Key Concepts (TF-IDF Extracted)</h4>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {keywords.map((keyword, index) => (
                      <span
                        key={index}
                        className="bg-gradient-to-r from-amber-50 to-yellow-50 text-amber-900 px-4 py-2 rounded-lg text-sm font-medium border border-amber-200 shadow-sm"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-1.5 bg-blue-100 rounded-lg">
                      <TrendingUp size={18} className="text-blue-600" />
                    </div>
                    <h4 className="font-semibold text-gray-800">Generated Search Queries</h4>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {queries.map((query, index) => (
                      <span
                        key={index}
                        className="bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-900 px-4 py-2 rounded-lg text-sm border border-blue-200 shadow-sm"
                      >
                        {query}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {isLoading && (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600"></div>
              </div>
              <p className="mt-6 text-gray-700 font-medium text-lg">Analyzing content and scoring videos...</p>
              <p className="mt-2 text-gray-500 text-sm">Using TF-IDF extraction and multi-factor ranking</p>
            </div>
          )}

          {!isLoading && videos.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-200">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Top Recommendations
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">{videos.length} videos ranked by AI scoring</p>
                </div>
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 px-4 py-2 rounded-lg border border-blue-200">
                  <p className="text-xs text-gray-600 font-medium">Sorted by</p>
                  <p className="text-sm font-bold text-blue-900">Multi-Factor Quality Score</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {videos.map((video) => (
                  <VideoCard key={video.id} video={video} />
                ))}
              </div>
            </div>
          )}

          {!isLoading && videos.length === 0 && keywords.length > 0 && (
            <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
              <Youtube size={64} className="mx-auto text-gray-300 mb-4" />
              <p className="text-lg text-gray-700 font-medium">No videos found</p>
              <p className="text-gray-500 mt-2">Try adjusting your search query or topic</p>
            </div>
          )}

          <div className="mt-16">
            <button
              onClick={() => setShowAlgorithm(!showAlgorithm)}
              className="mx-auto flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium transition-colors mb-6"
            >
              <span className="text-lg">Learn About Our AI Algorithms</span>
              {showAlgorithm ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
            {showAlgorithm && <AlgorithmInfo />}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
