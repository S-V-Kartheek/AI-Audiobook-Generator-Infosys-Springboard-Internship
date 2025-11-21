import { Brain, Target, TrendingUp, Zap } from 'lucide-react';

export default function AlgorithmInfo() {
  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl shadow-xl p-8 text-white">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold mb-2">How Our AI Works</h3>
        <p className="text-slate-300">Advanced algorithms powering your recommendations</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Brain size={24} className="text-blue-400" />
            </div>
            <h4 className="text-lg font-bold">TF-IDF Extraction</h4>
          </div>
          <p className="text-slate-300 text-sm leading-relaxed mb-3">
            Term Frequency-Inverse Document Frequency algorithm analyzes your input to identify the most important concepts and phrases.
          </p>
          <ul className="space-y-2 text-sm text-slate-400">
            <li className="flex items-start gap-2">
              <span className="text-blue-400 mt-0.5">•</span>
              <span>Extracts single words, bigrams, and trigrams</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400 mt-0.5">•</span>
              <span>Filters out stop words and noise</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400 mt-0.5">•</span>
              <span>Boosts educational keywords</span>
            </li>
          </ul>
        </div>

        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-cyan-500/20 rounded-lg">
              <Target size={24} className="text-cyan-400" />
            </div>
            <h4 className="text-lg font-bold">Smart Query Generation</h4>
          </div>
          <p className="text-slate-300 text-sm leading-relaxed mb-3">
            Transforms extracted concepts into optimized search queries using pattern templates.
          </p>
          <ul className="space-y-2 text-sm text-slate-400">
            <li className="flex items-start gap-2">
              <span className="text-cyan-400 mt-0.5">•</span>
              <span>Multiple query variations per concept</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyan-400 mt-0.5">•</span>
              <span>Educational-focused templates</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyan-400 mt-0.5">•</span>
              <span>Maximizes result diversity</span>
            </li>
          </ul>
        </div>

        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <TrendingUp size={24} className="text-purple-400" />
            </div>
            <h4 className="text-lg font-bold">Multi-Factor Scoring</h4>
          </div>
          <p className="text-slate-300 text-sm leading-relaxed mb-3">
            Comprehensive quality scoring using multiple weighted factors.
          </p>
          <ul className="space-y-2 text-sm text-slate-400">
            <li className="flex items-start gap-2">
              <span className="text-purple-400 mt-0.5">•</span>
              <span><strong>Views:</strong> Log-normalized (weight: 3x)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-400 mt-0.5">•</span>
              <span><strong>Duration:</strong> Optimal 5-15 min (weight: 2x)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-400 mt-0.5">•</span>
              <span><strong>Engagement:</strong> Like ratio analysis (weight: 4x)</span>
            </li>
          </ul>
        </div>

        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-amber-500/20 rounded-lg">
              <Zap size={24} className="text-amber-400" />
            </div>
            <h4 className="text-lg font-bold">Recency Boost</h4>
          </div>
          <p className="text-slate-300 text-sm leading-relaxed mb-3">
            Recent content gets priority to ensure relevance and up-to-date information.
          </p>
          <ul className="space-y-2 text-sm text-slate-400">
            <li className="flex items-start gap-2">
              <span className="text-amber-400 mt-0.5">•</span>
              <span><strong>0-30 days:</strong> +5 bonus points</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-400 mt-0.5">•</span>
              <span><strong>31-90 days:</strong> +3 bonus points</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-400 mt-0.5">•</span>
              <span><strong>91-365 days:</strong> +1 bonus point</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="mt-8 p-6 bg-blue-500/10 rounded-xl border border-blue-500/30">
        <h4 className="font-bold text-blue-300 mb-2 text-center">Final Score Formula</h4>
        <p className="text-center font-mono text-sm text-slate-300">
          Score = (log₁₀(views) × 3) + (duration_score × 2) + (engagement_score × 4) + recency_boost
        </p>
      </div>
    </div>
  );
}
