import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";

interface SVGDiagramProps {
  svgContent: string;
  activeStep?: number | null;
  onStepHighlight?: (step: number) => void;
}

export default function SVGDiagram({ svgContent, activeStep, onStepHighlight }: SVGDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Parse and insert SVG
    const parser = new DOMParser();
    const svgDoc = parser.parseFromString(svgContent, 'image/svg+xml');
    const svgElement = svgDoc.documentElement;

    // Ensure proper styling
    svgElement.setAttribute('class', 'w-full h-auto border border-border/50 rounded bg-white');
    svgElement.setAttribute('viewBox', svgElement.getAttribute('viewBox') || '0 0 300 200');

    // Clear previous content and insert new SVG
    containerRef.current.innerHTML = '';
    containerRef.current.appendChild(svgElement);

    // Add step highlighting logic
    if (activeStep !== null && activeStep !== undefined) {
      const highlights = containerRef.current.querySelectorAll(`#step-${activeStep}-highlight, [data-step="${activeStep}"]`);
      
      // Hide all highlights first
      const allHighlights = containerRef.current.querySelectorAll('[id*="highlight"], [data-step]');
      allHighlights.forEach(el => {
        if (el instanceof SVGElement) {
          el.style.opacity = '0';
        }
      });

      // Show active step highlights
      highlights.forEach(el => {
        if (el instanceof SVGElement) {
          el.style.opacity = '1';
          el.style.fill = '#F59E0B';
        }
      });
    }
  }, [svgContent, activeStep]);

  // Generate step buttons based on available steps
  const availableSteps = svgContent.match(/step-(\d+)-highlight/g)?.map(match => 
    parseInt(match.replace('step-', '').replace('-highlight', ''))
  ) || [1, 2]; // Default to steps 1,2 if no specific highlights found

  return (
    <div className="space-y-4">
      {/* SVG Container */}
      <div 
        ref={containerRef} 
        className="bg-muted/30 rounded-lg p-4"
        data-testid="svg-diagram-container"
      />

      {/* Diagram Controls */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Adım Vurguları</span>
          <button 
            className="text-xs text-primary hover:underline"
            onClick={() => onStepHighlight?.(0)}
            data-testid="show-all-steps"
          >
            Tümünü Göster
          </button>
        </div>
        <div className="flex gap-2 flex-wrap">
          {availableSteps.map(stepNum => (
            <Button
              key={stepNum}
              variant={activeStep === stepNum ? "default" : "secondary"}
              size="sm"
              className="w-8 h-8 p-0 text-xs"
              onClick={() => onStepHighlight?.(stepNum)}
              data-testid={`step-highlight-${stepNum}`}
            >
              {stepNum}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
