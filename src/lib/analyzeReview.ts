export interface RedFlag {
  label: string;
  description: string;
  severity: "low" | "medium" | "high";
}

export interface AnalysisResult {
  trustScore: number;
  verdict: "Verified" | "Suspicious" | "Likely Fake";
  redFlags: RedFlag[];
  emotionalLanguageScore: number;
  detailScore: number;
  repetitivenessScore: number;
  authenticityScore: number;
  realVsFake: { real: number; fake: number; uncertain: number };
}

const EMOTIONAL_WORDS = [
  "amazing", "incredible", "fantastic", "perfect", "love", "best", "worst",
  "horrible", "terrible", "awesome", "unbelievable", "outstanding", "miraculous",
  "life-changing", "absolutely", "totally", "completely", "definitely",
  "must-have", "game-changer", "revolutionary", "stunning", "flawless",
  "exceptional", "phenomenal", "magnificent", "superb", "disgraceful",
  "dreadful", "appalling", "sensational", "mind-blowing",
];

const GENERIC_PHRASES = [
  "highly recommend", "great product", "good quality", "fast shipping",
  "exactly as described", "would buy again", "five stars", "exceeded expectations",
  "value for money", "works great", "just what i needed", "does the job",
  "very happy", "very satisfied", "love it", "waste of money", "don't buy",
  "total garbage", "best purchase ever", "changed my life",
];

const FAKE_PATTERNS = [
  { regex: /!!!+/g, label: "Excessive Punctuation", desc: "Multiple exclamation marks suggest manufactured enthusiasm" },
  { regex: /(.{20,})\1+/gi, label: "Repetitive Phrasing", desc: "Same phrases repeated, common in automated reviews" },
  { regex: /\b(buy|purchase|order)\s+(now|today|immediately)\b/gi, label: "Urgency Language", desc: "Pushing immediate action is a common fake review tactic" },
  { regex: /\b(competitor|other brands?|unlike others?)\b/gi, label: "Competitor Mentions", desc: "Mentioning competitors unprompted suggests planted review" },
];

export function analyzeReview(text: string): AnalysisResult {
  const lower = text.toLowerCase();
  const words = lower.split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const redFlags: RedFlag[] = [];

  // Emotional language
  const emotionalCount = words.filter((w) =>
    EMOTIONAL_WORDS.some((ew) => w.includes(ew))
  ).length;
  const emotionalRatio = wordCount > 0 ? emotionalCount / wordCount : 0;
  const emotionalLanguageScore = Math.min(100, Math.round(emotionalRatio * 500));

  if (emotionalRatio > 0.15) {
    redFlags.push({ label: "Over-the-top Praise/Criticism", description: "Excessive emotional language detected — reviews with extreme sentiments are often fabricated", severity: "high" });
  } else if (emotionalRatio > 0.08) {
    redFlags.push({ label: "Heightened Emotional Tone", description: "Above-average emotional language may indicate bias", severity: "medium" });
  }

  // Generic phrases
  const genericCount = GENERIC_PHRASES.filter((p) => lower.includes(p)).length;
  if (genericCount >= 3) {
    redFlags.push({ label: "Generic Language", description: "Multiple generic phrases found — lacks specific product details", severity: "high" });
  } else if (genericCount >= 1) {
    redFlags.push({ label: "Common Phrasing", description: "Uses commonly seen generic review language", severity: "low" });
  }

  // Detail score (longer + more specific = higher)
  const hasNumbers = /\d/.test(text);
  const hasMeasurements = /\b(\d+\s*(inch|cm|mm|lb|kg|oz|ml|hour|day|week|month)s?)\b/i.test(text);
  const hasComparisons = /\b(compared to|better than|worse than|similar to|unlike)\b/i.test(text);
  let detailScore = Math.min(100, Math.round((wordCount / 80) * 50));
  if (hasNumbers) detailScore += 15;
  if (hasMeasurements) detailScore += 15;
  if (hasComparisons) detailScore += 10;
  detailScore = Math.min(100, detailScore);

  if (wordCount < 15) {
    redFlags.push({ label: "Lack of Detail", description: "Very short review with minimal product-specific information", severity: "medium" });
  }

  // Repetitiveness
  const sentences = text.split(/[.!?]+/).map((s) => s.trim().toLowerCase()).filter(Boolean);
  const uniqueSentences = new Set(sentences);
  const repetitivenessScore = sentences.length > 1 ? Math.round(((sentences.length - uniqueSentences.size) / sentences.length) * 100) : 0;
  if (repetitivenessScore > 30) {
    redFlags.push({ label: "Repetitive Content", description: "Significant repetition detected in the review text", severity: "medium" });
  }

  // Pattern checks
  FAKE_PATTERNS.forEach(({ regex, label, desc }) => {
    if (regex.test(text)) {
      redFlags.push({ label, description: desc, severity: "medium" });
    }
  });

  // All caps check
  const capsWords = words.filter((w) => w.length > 2 && w === w.toUpperCase() && /[A-Z]/.test(w));
  if (capsWords.length > 3) {
    redFlags.push({ label: "Excessive Caps", description: "Heavy use of ALL CAPS is common in inauthentic reviews", severity: "low" });
  }

  // Suspicious reviewer hint (simulated)
  if (wordCount > 5 && genericCount >= 2 && emotionalRatio > 0.1) {
    redFlags.push({ label: "Suspicious Reviewer Pattern", description: "Combination of generic language and excessive emotion matches known fake reviewer profiles", severity: "high" });
  }

  // Calculate trust score
  const flagPenalty = redFlags.reduce((sum, f) => sum + (f.severity === "high" ? 20 : f.severity === "medium" ? 12 : 5), 0);
  const baseScore = 85 - emotionalLanguageScore * 0.3 + detailScore * 0.3 - repetitivenessScore * 0.2;
  const trustScore = Math.max(0, Math.min(100, Math.round(baseScore - flagPenalty)));

  const authenticityScore = Math.max(0, 100 - emotionalLanguageScore - repetitivenessScore + detailScore) / 2;

  const verdict: AnalysisResult["verdict"] = trustScore >= 65 ? "Verified" : trustScore >= 35 ? "Suspicious" : "Likely Fake";

  // Simulated product-level distribution
  const fakeRatio = Math.max(5, Math.min(60, 65 - trustScore));
  const realVsFake = {
    real: 100 - fakeRatio - Math.round(fakeRatio * 0.3),
    fake: fakeRatio,
    uncertain: Math.round(fakeRatio * 0.3),
  };

  return {
    trustScore,
    verdict,
    redFlags,
    emotionalLanguageScore,
    detailScore,
    repetitivenessScore,
    authenticityScore: Math.round(Math.min(100, authenticityScore)),
    realVsFake,
  };
}
