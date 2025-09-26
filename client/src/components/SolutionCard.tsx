import { useState } from "react";
import { CheckCircle, TriangleAlert, Share2, Trash2, ExpandIcon, HelpCircle, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { renderLatex } from "@/lib/latex";
import SVGDiagram from "@/components/SVGDiagram";
import { type Solution, type ModelResponse } from "@shared/schema";

interface SolutionCardProps {
  solution: Solution;
  parsed: ModelResponse;
  verified: boolean;
}

const subjectColors: Record<string, string> = {
  matematik: "bg-primary/10 text-primary",
  geometri: "bg-purple-100 text-purple-700",
  fizik: "bg-blue-100 text-blue-700", 
  kimya: "bg-orange-100 text-orange-700",
  biyoloji: "bg-green-100 text-green-700",
  tarih: "bg-brown-100 text-brown-700",
  edebiyat: "bg-pink-100 text-pink-700",
};

export default function SolutionCard({ solution, parsed, verified }: SolutionCardProps) {
  const [activeStep, setActiveStep] = useState<number | null>(null);

  const formatTimeAgo = (date: Date | string | null) => {
    if (!date) return "Bilinmeyen zaman";
    const now = new Date();
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return "Bilinmeyen zaman";
    const diffMs = now.getTime() - dateObj.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return "Şimdi";
    if (diffMins < 60) return `${diffMins} dakika önce`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} saat önce`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} gün önce`;
  };

  const confidencePercent = Math.round((solution.confidence || 0) * 100);

  return (
    <Card className="bg-card rounded-xl border border-border shadow-sm">
      {/* Solution Header */}
      <CardHeader className="p-6 border-b border-border">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <Badge 
                className={`${subjectColors[solution.subject] || subjectColors.matematik} text-xs font-medium`}
                data-testid="solution-subject"
              >
                {solution.subject.charAt(0).toUpperCase() + solution.subject.slice(1)}
              </Badge>
              <div className="flex items-center gap-1">
                {verified ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-xs text-muted-foreground">Doğrulandı ✓ {confidencePercent}%</span>
                  </>
                ) : (
                  <>
                    <TriangleAlert className="w-4 h-4 text-yellow-500" />
                    <span className="text-xs text-muted-foreground">Kontrol edildi - {confidencePercent}%</span>
                  </>
                )}
              </div>
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2" data-testid="solution-summary">
              {parsed.summary}
            </h3>
            <p className="text-muted-foreground text-sm">
              <span className="inline-block w-3 h-3 rounded-full bg-muted-foreground/20 mr-1" />
              <span data-testid="solution-time">{formatTimeAgo(solution.createdAt)}</span>
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" className="p-2" title="Paylaş" data-testid="share-button">
              <Share2 className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" className="p-2 hover:text-destructive" title="Sil" data-testid="delete-button">
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="flex flex-col lg:flex-row">
          {/* Steps Panel */}
          <div className="flex-1 p-6">
            <h4 className="text-lg font-semibold text-foreground mb-4">Çözüm Adımları</h4>
            
            <div className="space-y-4">
              {parsed.steps.map((step, index) => (
                <div
                  key={index}
                  className="step-card p-4 border border-border rounded-lg hover:shadow-md transition-all cursor-pointer"
                  onClick={() => setActiveStep(activeStep === step.step ? null : step.step)}
                  data-testid={`step-${step.step}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                      {step.step}
                    </div>
                    <div className="flex-1">
                      <p className="text-foreground mb-2">
                        {step.text}
                      </p>
                      {step.latex && (
                        <div className="bg-muted/50 p-3 rounded-md">
                          <div 
                            className="text-sm text-foreground"
                            dangerouslySetInnerHTML={{ __html: renderLatex(step.latex) }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Final Answer */}
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="font-semibold text-green-800">Final Cevap</span>
              </div>
              <p className="text-green-700 text-lg font-medium" data-testid="final-answer">
                {parsed.final_answer}
              </p>
            </div>

            {/* Hints */}
            {parsed.hints && parsed.hints.length > 0 && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="w-5 h-5 text-blue-600" />
                  <span className="font-semibold text-blue-800">İpuçları</span>
                </div>
                <ul className="text-blue-700 space-y-1">
                  {parsed.hints.map((hint, index) => (
                    <li key={index}>• {hint}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Additional Actions */}
            <div className="mt-6 flex gap-3">
              <Button variant="secondary" className="flex-1" data-testid="detailed-explanation">
                <ExpandIcon className="w-4 h-4 mr-2" />
                Detaylı Açıklama
              </Button>
              <Button variant="secondary" className="flex-1" data-testid="similar-question">
                <HelpCircle className="w-4 h-4 mr-2" />
                Benzer Soru
              </Button>
            </div>
          </div>

          {/* Diagram Panel */}
          {parsed.diagram_svg && (
            <div className="lg:w-96 border-t lg:border-t-0 lg:border-l border-border p-6">
              <h4 className="text-lg font-semibold text-foreground mb-4">Görsel Çözüm</h4>
              
              <SVGDiagram 
                svgContent={parsed.diagram_svg}
                activeStep={activeStep}
                onStepHighlight={setActiveStep}
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
