const STOP_WORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from',
  'has', 'he', 'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the',
  'to', 'was', 'will', 'with', 'this', 'these', 'those', 'what',
  'which', 'who', 'when', 'where', 'why', 'how', 'i', 'you', 'we',
  'they', 'can', 'could', 'should', 'would', 'may', 'might', 'must',
  'have', 'had', 'do', 'does', 'did', 'been', 'being', 'am', 'or'
]);

const IMPORTANCE_BOOSTERS = [
  'learning', 'tutorial', 'explained', 'basics', 'introduction',
  'advanced', 'guide', 'course', 'lesson', 'fundamentals', 'theory',
  'practice', 'example', 'algorithm', 'method', 'technique', 'concept'
];

interface TermScore {
  term: string;
  tfIdf: number;
  frequency: number;
}

export function extractKeywords(text: string): string[] {
  const normalized = text.toLowerCase()
    .replace(/[^\w\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const words = normalized.split(' ');
  const totalWords = words.length;

  const phrases: string[] = [];
  for (let i = 0; i < words.length - 1; i++) {
    const bigram = `${words[i]} ${words[i + 1]}`;
    if (!STOP_WORDS.has(words[i]) && !STOP_WORDS.has(words[i + 1])) {
      phrases.push(bigram);
    }
  }

  for (let i = 0; i < words.length - 2; i++) {
    const trigram = `${words[i]} ${words[i + 1]} ${words[i + 2]}`;
    if (!STOP_WORDS.has(words[i]) && !STOP_WORDS.has(words[i + 2])) {
      phrases.push(trigram);
    }
  }

  const termFreq = new Map<string, number>();
  const allTerms: string[] = [];

  words.forEach(word => {
    if (word.length > 2 && !STOP_WORDS.has(word)) {
      allTerms.push(word);
      const count = termFreq.get(word) || 0;
      termFreq.set(word, count + 1);
    }
  });

  phrases.forEach(phrase => {
    allTerms.push(phrase);
    const count = termFreq.get(phrase) || 0;
    termFreq.set(phrase, count + 1);
  });

  const termScores: TermScore[] = [];

  termFreq.forEach((freq, term) => {
    const tf = freq / totalWords;

    const idf = Math.log(totalWords / (freq + 1));

    let tfIdf = tf * idf;

    if (term.includes(' ')) {
      tfIdf *= 2.5;
    }

    const words = term.split(' ');
    const hasImportantWord = words.some(w => IMPORTANCE_BOOSTERS.includes(w));
    if (hasImportantWord) {
      tfIdf *= 1.5;
    }

    if (freq > 1) {
      tfIdf *= (1 + Math.log(freq));
    }

    termScores.push({ term, tfIdf, frequency: freq });
  });

  termScores.sort((a, b) => b.tfIdf - a.tfIdf);

  return termScores.slice(0, 8).map(score => score.term);
}

export function generateSearchQueries(keywords: string[]): string[] {
  const queries: string[] = [];

  const templates = [
    '{keyword} explained',
    '{keyword} tutorial',
    'introduction to {keyword}',
    '{keyword} basics',
    'learn {keyword}',
    'understanding {keyword}',
    '{keyword} course'
  ];

  keywords.forEach((keyword, index) => {
    if (index < 6) {
      const template = templates[index % templates.length];
      queries.push(template.replace('{keyword}', keyword));
    }
  });

  return queries;
}
