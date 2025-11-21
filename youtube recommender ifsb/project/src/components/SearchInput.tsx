import { useState } from 'react';
import { Search, Sparkles } from 'lucide-react';

interface SearchInputProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
}

export default function SearchInput({ onSearch, isLoading }: SearchInputProps) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full mx-auto">
      <div className="relative bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden transition-all duration-200 focus-within:shadow-xl focus-within:border-blue-400">
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Describe what you want to learn... Try: 'machine learning fundamentals', 'React hooks explained', or 'quantum computing basics'"
          className="w-full px-6 py-5 pr-40 rounded-2xl focus:outline-none resize-none text-gray-900 placeholder-gray-400 text-base"
          rows={3}
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !query.trim()}
          className="absolute bottom-4 right-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-7 py-3 rounded-xl font-semibold shadow-md hover:shadow-lg hover:from-blue-700 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2.5"
        >
          {isLoading ? (
            <>
              <Sparkles size={20} className="animate-spin" />
              <span>Analyzing</span>
            </>
          ) : (
            <>
              <Search size={20} />
              <span>Analyze & Find</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
