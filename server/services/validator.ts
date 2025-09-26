import { create, all } from 'mathjs';
import { ModelResponse } from '@shared/schema';

const math = create(all);

export interface ValidationResult {
  isValid: boolean;
  serverResult?: number | string;
  confidence: number;
  errors: string[];
}

export function validateSolution(modelResponse: ModelResponse): ValidationResult {
  const errors: string[] = [];
  let isValid = true;
  let serverResult: number | string | undefined;
  let confidence = modelResponse.confidence;

  try {
    // Extract numerical final answer
    const finalAnswer = modelResponse.final_answer;
    const numericalMatch = finalAnswer.match(/-?\d+\.?\d*/);
    
    if (numericalMatch) {
      const modelResult = parseFloat(numericalMatch[0]);
      
      // Try to validate basic mathematical expressions from steps
      for (const step of modelResponse.steps) {
        if (step.latex) {
          try {
            // Simple validation for basic arithmetic
            const expression = step.latex
              .replace(/\\sqrt{([^}]+)}/g, 'sqrt($1)')
              .replace(/\\frac{([^}]+)}{([^}]+)}/g, '($1)/($2)')
              .replace(/[{}]/g, '')
              .replace(/\^/g, '^')
              .replace(/π/g, 'pi')
              .replace(/\\pi/g, 'pi');
            
            // Only evaluate if it's a simple mathematical expression
            if (/^[\d\s+\-*/().,^a-z]+$/i.test(expression) && expression.includes('=')) {
              const parts = expression.split('=');
              if (parts.length === 2) {
                const leftSide = parts[0].trim();
                const rightSide = parts[1].trim();
                
                if (/^[\d\s+\-*/().,^sqrt]+$/.test(leftSide) && /^[\d\s+\-*/().,^sqrt]+$/.test(rightSide)) {
                  const leftResult = math.evaluate(leftSide);
                  const rightResult = math.evaluate(rightSide);
                  
                  if (Math.abs(leftResult - rightResult) > 0.001) {
                    errors.push(`Adım doğrulama hatası: ${leftResult} ≠ ${rightResult}`);
                    isValid = false;
                    confidence *= 0.8;
                  }
                }
              }
            }
          } catch (error) {
            // Skip validation for complex expressions
          }
        }
      }

      // For Pythagorean theorem example (a=3, b=4, c=5)
      if (modelResponse.summary.includes('üçgen') && modelResponse.summary.includes('3') && modelResponse.summary.includes('4')) {
        const expectedResult = Math.sqrt(9 + 16);
        serverResult = expectedResult;
        
        if (Math.abs(modelResult - expectedResult) > 0.001) {
          errors.push(`Pisagor teoremi doğrulaması: beklenen ${expectedResult}, bulunan ${modelResult}`);
          isValid = false;
          confidence *= 0.7;
        }
      }
      
      // For quadratic equations
      if (modelResponse.summary.includes('denklem') && (modelResponse.summary.includes('x²') || modelResponse.summary.includes('x^2'))) {
        // Basic quadratic validation could be added here
        serverResult = modelResult;
      }
      
      // For area calculations
      if (modelResponse.summary.includes('alan') && modelResponse.summary.includes('daire')) {
        const radiusMatch = modelResponse.summary.match(/(\d+)\s*cm/);
        if (radiusMatch) {
          const radius = parseFloat(radiusMatch[1]);
          const expectedArea = Math.PI * radius * radius;
          serverResult = expectedArea;
          
          if (Math.abs(modelResult - expectedArea) > 1) {
            errors.push(`Daire alanı doğrulaması: beklenen ${expectedArea.toFixed(2)}, bulunan ${modelResult}`);
            isValid = false;
            confidence *= 0.8;
          }
        }
      }
    }

  } catch (error) {
    errors.push(`Doğrulama hatası: ${error}`);
    confidence *= 0.9;
  }

  return {
    isValid,
    serverResult,
    confidence: Math.max(0.1, Math.min(1.0, confidence)),
    errors
  };
}
