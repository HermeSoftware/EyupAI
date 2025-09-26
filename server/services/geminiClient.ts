import { GoogleGenAI } from "@google/genai";
import { ModelResponse } from "@shared/schema";

const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY || "" 
});

export interface SolveProblemRequest {
  text?: string;
  imageBuffer?: Buffer;
  mimeType?: string;
  subject: string;
  level: string;
}

const SYSTEM_PROMPT = `Sen "EyüpAI" adında sabırlı, öğretici bir asistanısın. Her soruyu öğrenci seviyesinde (basit Türkçe) açıkla. Matematik/geometri için adımları numaralandır, her adımda neden yaptığını kısaça söyle. Cevabı mutlaka JSON formatında ver.

JSON formatı:
{
  "summary": "Sorunun kısa özeti (1 cümle)",
  "steps": [
    {
      "step": 1,
      "text": "Açıklama metni",
      "latex": "LaTeX formül (opsiyonel)",
      "svg_overlay_id": 1
    }
  ],
  "latex": "Ana formül LaTeX formatında",
  "diagram_svg": "SVG kodu veya null",
  "diagram_commands": null,
  "plot_data": null,
  "final_answer": "Son cevap",
  "hints": ["İpucu 1", "İpucu 2"],
  "confidence": 0.95
}

Türkçe, kısa ve öğretici ol. Matematiksel ifadeleri LaTeX ile yaz.`;

function buildUserPrompt(request: SolveProblemRequest): string {
  const { text, subject, level } = request;
  
  const subjectMap: Record<string, string> = {
    matematik: "matematik",
    geometri: "geometri", 
    fizik: "fizik",
    kimya: "kimya",
    biyoloji: "biyoloji",
    tarih: "tarih",
    edebiyat: "edebiyat/türkçe"
  };

  const levelMap: Record<string, string> = {
    primary: "ilkokul/ortaokul",
    high: "lise/üniversite"
  };

  const subjectName = subjectMap[subject] || "genel";
  const levelName = levelMap[level] || "lise";

  let prompt = `Konu: ${subjectName}. Seviye: ${levelName}.\n\n`;
  
  if (text) {
    prompt += `Soru: ${text}\n\n`;
  } else {
    prompt += `Fotoğraftaki soruyu analiz et.\n\n`;
  }

  prompt += `Lütfen:
1. Soruyu kısa özetle (1 cümle)
2. Her adımı numaralandır ve her adımın sonunda kısa "kontrol" ekle
3. LaTeX olarak ana formülleri ver
4. Eğer geometri ise, diagram_svg ile basit SVG çizimi üret
5. JSON formatında cevap ver

Özellikle ${subjectName} konusunda detaylı ve anlaşılır açıklama yap.`;

  return prompt;
}

function generateGeometrySVG(subject: string, text?: string): string | null {
  if (subject !== "geometri" && subject !== "matematik") return null;
  
  // Simple geometry SVG templates
  if (text?.includes("üçgen") || text?.includes("triangle")) {
    return `<svg viewBox="0 0 300 200" xmlns="http://www.w3.org/2000/svg">
      <polygon points="50,150 200,150 200,50" fill="none" stroke="#3B82F6" stroke-width="2"/>
      <text x="125" y="170" text-anchor="middle" class="text-sm fill-current">a</text>
      <text x="220" y="100" text-anchor="middle" class="text-sm fill-current">b</text>
      <text x="125" y="90" text-anchor="middle" class="text-sm fill-current font-bold">c</text>
      <path d="M185,150 L185,135 L200,135" fill="none" stroke="#3B82F6" stroke-width="1"/>
      <circle cx="200" cy="50" r="3" fill="#F59E0B" opacity="0" id="step-1-highlight"/>
      <circle cx="125" cy="100" r="3" fill="#F59E0B" opacity="0" id="step-2-highlight"/>
    </svg>`;
  }
  
  if (text?.includes("daire") || text?.includes("circle")) {
    return `<svg viewBox="0 0 300 200" xmlns="http://www.w3.org/2000/svg">
      <circle cx="150" cy="100" r="60" fill="none" stroke="#3B82F6" stroke-width="2"/>
      <line x1="150" y1="100" x2="210" y2="100" stroke="#3B82F6" stroke-width="1"/>
      <text x="180" y="95" text-anchor="middle" class="text-sm fill-current">r</text>
      <circle cx="150" cy="100" r="2" fill="#3B82F6"/>
      <circle cx="180" cy="100" r="3" fill="#F59E0B" opacity="0" id="step-1-highlight"/>
    </svg>`;
  }

  return null;
}

export async function solveProblem(request: SolveProblemRequest): Promise<ModelResponse> {
  try {
    const userPrompt = buildUserPrompt(request);
    
    const contents: any[] = [];
    
    // Add image if provided
    if (request.imageBuffer && request.mimeType) {
      contents.push({
        inlineData: {
          data: request.imageBuffer.toString("base64"),
          mimeType: request.mimeType,
        },
      });
    }
    
    // Add text prompt
    contents.push(userPrompt);

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: SYSTEM_PROMPT,
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            summary: { type: "string" },
            steps: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  step: { type: "number" },
                  text: { type: "string" },
                  latex: { type: "string" },
                  svg_overlay_id: { type: "number" }
                },
                required: ["step", "text"]
              }
            },
            latex: { type: "string" },
            diagram_svg: { type: "string" },
            final_answer: { type: "string" },
            hints: {
              type: "array",
              items: { type: "string" }
            },
            confidence: { type: "number" }
          },
          required: ["summary", "steps", "final_answer", "confidence"]
        },
      },
      contents: contents,
    });

    const rawJson = response.text;
    if (!rawJson) {
      throw new Error("Model boş cevap döndürdü");
    }

    let parsedResponse: ModelResponse;
    try {
      parsedResponse = JSON.parse(rawJson);
    } catch (parseError) {
      console.error("JSON parsing error:", parseError);
      console.error("Raw response:", rawJson);
      
      // Fallback: create a basic response
      parsedResponse = {
        summary: request.text ? `Soru: ${request.text.substring(0, 100)}...` : "Yüklenen fotoğraftaki soru",
        steps: [
          {
            step: 1,
            text: "Sorunuz analiz ediliyor. Lütfen daha basit bir ifade ile tekrar deneyin.",
            latex: "",
          }
        ],
        latex: "",
        final_answer: "Çözüm bulunamadı",
        hints: ["Soruyu daha net şekilde ifade etmeyi deneyin"],
        confidence: 0.1
      };
    }

    // Generate SVG if not provided by model
    if (!parsedResponse.diagram_svg && (request.subject === "geometri" || request.subject === "matematik")) {
      parsedResponse.diagram_svg = generateGeometrySVG(request.subject, request.text) || undefined;
    }

    // Ensure required fields have defaults
    parsedResponse.latex = parsedResponse.latex || "";
    parsedResponse.hints = parsedResponse.hints || [];
    parsedResponse.confidence = parsedResponse.confidence || 0.8;

    // Validate steps structure
    if (!Array.isArray(parsedResponse.steps)) {
      parsedResponse.steps = [
        {
          step: 1,
          text: parsedResponse.final_answer || "Çözüm tamamlandı",
          latex: parsedResponse.latex || ""
        }
      ];
    }

    return parsedResponse;

  } catch (error) {
    console.error("Gemini API error:", error);
    
    // Return error response
    return {
      summary: `Hata: ${request.text ? request.text.substring(0, 50) + "..." : "Fotoğraf sorusu"}`,
      steps: [
        {
          step: 1,
          text: `Üzgünüz, sorunuz işlenirken hata oluştu: ${error instanceof Error ? error.message : "Bilinmeyen hata"}`,
          latex: ""
        }
      ],
      latex: "",
      final_answer: "Hata nedeniyle çözüm üretilemedi",
      hints: ["Lütfen sorunuzu tekrar göndermeyi deneyin", "Fotoğraf net ve okunaklı olduğundan emin olun"],
      confidence: 0.0
    };
  }
}
