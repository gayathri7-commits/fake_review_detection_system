import { useState } from "react";
import { Search, Shield, ShieldAlert, ShieldCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { TrustGauge } from "@/components/TrustGauge";
import { RedFlagsList } from "@/components/RedFlagsList";
import { ReviewDistributionChart } from "@/components/ReviewDistributionChart";
import { ScoreBar } from "@/components/ScoreBar";
import { analyzeReview, type AnalysisResult } from "@/lib/analyzeReview";

const SAMPLE_REVIEWS = [
  "This is THE BEST product EVER!!! I absolutely love it, amazing quality, fantastic experience. Highly recommend to everyone!!! Buy now before it sells out!!!",
  "Decent headphones for the price. The bass response is solid around 20-40Hz range, though the mids can feel slightly recessed compared to my Audio-Technica M50x. Comfortable for 2-3 hour sessions, but the ear pads could use more breathable material. Cable is 1.5m which is fine for desk use.",
  "Great product. Good quality. Fast shipping. Exactly as described. Would buy again. Five stars. Love it. Highly recommend. Best purchase ever.",
];

export default function Index() {
  const [url, setUrl] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyze = () => {
    if (!reviewText.trim()) return;
    setIsAnalyzing(true);
    // Simulate processing delay
    setTimeout(() => {
      setResult(analyzeReview(reviewText));
      setIsAnalyzing(false);
    }, 1200);
  };

  const loadSample = (text: string) => {
    setReviewText(text);
    setResult(null);
  };

  const verdictConfig = {
    Verified: { icon: ShieldCheck, badgeClass: "bg-success/15 text-success border-success/30" },
    Suspicious: { icon: ShieldAlert, badgeClass: "bg-warning/15 text-warning border-warning/30" },
    "Likely Fake": { icon: ShieldAlert, badgeClass: "bg-destructive/15 text-destructive border-destructive/30" },
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto flex items-center gap-3 px-4 py-4 md:px-6">
          <Shield className="h-7 w-7 text-primary" />
          <div>
            <h1 className="text-lg font-bold text-foreground tracking-tight">ReviewGuard</h1>
            <p className="text-xs text-muted-foreground">AI-Powered Fake Review Detection</p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 md:px-6 space-y-8 max-w-6xl">
        {/* Input Section */}
        <Card className="shadow-md border-primary/10">
          <CardHeader>
            <CardTitle className="text-xl">Analyze a Review</CardTitle>
            <CardDescription>
              Paste a product URL or review text below to check its authenticity
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Product URL (optional)</label>
              <Input
                placeholder="https://amazon.com/product/..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="bg-background"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Review Text</label>
              <Textarea
                placeholder="Paste the review text here to analyze..."
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                className="min-h-[120px] bg-background resize-y"
              />
            </div>

            {/* Sample Reviews */}
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2">Try a sample:</p>
              <div className="flex flex-wrap gap-2">
                {["Fake Enthusiastic", "Genuine Detailed", "Generic Spam"].map((label, i) => (
                  <button
                    key={label}
                    onClick={() => loadSample(SAMPLE_REVIEWS[i])}
                    className="rounded-full border bg-muted px-3 py-1 text-xs font-medium text-muted-foreground hover:bg-secondary hover:text-secondary-foreground transition-colors"
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <Button
              onClick={handleAnalyze}
              disabled={!reviewText.trim() || isAnalyzing}
              className="w-full sm:w-auto gap-2"
              size="lg"
            >
              {isAnalyzing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
              {isAnalyzing ? "Analyzing..." : "Analyze Review"}
            </Button>
          </CardContent>
        </Card>

        {/* Results */}
        {result && (
          <div className="space-y-6 animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
            {/* Trust Score + Verdict */}
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="shadow-md">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Trust Score</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center py-4">
                  <div className="relative flex items-center justify-center">
                    <TrustGauge score={result.trustScore} />
                  </div>
                  <div className="mt-4">
                    {(() => {
                      const config = verdictConfig[result.verdict];
                      const Icon = config.icon;
                      return (
                        <Badge variant="outline" className={`gap-1.5 px-4 py-1.5 text-sm font-semibold ${config.badgeClass}`}>
                          <Icon className="h-4 w-4" />
                          {result.verdict}
                        </Badge>
                      );
                    })()}
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-md">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Review Distribution</CardTitle>
                  <CardDescription>Estimated distribution for this product</CardDescription>
                </CardHeader>
                <CardContent>
                  <ReviewDistributionChart data={result.realVsFake} />
                </CardContent>
              </Card>
            </div>

            {/* Analysis Breakdown */}
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="shadow-md">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Red Flags</CardTitle>
                  <CardDescription>{result.redFlags.length} issue{result.redFlags.length !== 1 ? "s" : ""} detected</CardDescription>
                </CardHeader>
                <CardContent>
                  <RedFlagsList flags={result.redFlags} />
                </CardContent>
              </Card>

              <Card className="shadow-md">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Detailed Breakdown</CardTitle>
                  <CardDescription>NLP analysis metrics</CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <ScoreBar
                    label="Emotional Language"
                    value={result.emotionalLanguageScore}
                    description="High emotional intensity can indicate manipulation"
                    inverted
                  />
                  <ScoreBar
                    label="Detail & Specificity"
                    value={result.detailScore}
                    description="Specific details suggest genuine experience"
                  />
                  <ScoreBar
                    label="Repetitiveness"
                    value={result.repetitivenessScore}
                    description="Repetitive phrasing is common in fake reviews"
                    inverted
                  />
                  <ScoreBar
                    label="Overall Authenticity"
                    value={result.authenticityScore}
                    description="Combined authenticity assessment"
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>

      <footer className="border-t mt-12">
        <div className="container mx-auto px-4 py-6 md:px-6 text-center text-xs text-muted-foreground">
          ReviewGuard uses NLP pattern analysis to detect potentially fake reviews. Results are simulated for demonstration purposes.
        </div>
      </footer>
    </div>
  );
}
