import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Calculator, Shapes, Atom, FlaskConical, Dna, Landmark, Book, Camera, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import FileUpload from "@/components/FileUpload";
import { apiRequest } from "@/lib/queryClient";
import { type SolveResponse, type Solution, type ModelResponse } from "@shared/schema";

interface SolveFormProps {
  onSolutionGenerated: (data: {
    solution: Solution;
    parsed: ModelResponse;
    verified: boolean;
  }) => void;
}

const subjects = [
  { id: "matematik", name: "Matematik", icon: Calculator },
  { id: "geometri", name: "Geometri", icon: Shapes },
  { id: "fizik", name: "Fizik", icon: Atom },
  { id: "kimya", name: "Kimya", icon: FlaskConical },
  { id: "biyoloji", name: "Biyoloji", icon: Dna },
  { id: "tarih", name: "Tarih", icon: Landmark },
  { id: "edebiyat", name: "Edebiyat", icon: Book },
];

export default function SolveForm({ onSolutionGenerated }: SolveFormProps) {
  const [selectedSubject, setSelectedSubject] = useState("matematik");
  const [level, setLevel] = useState<"primary" | "high">("high");
  const [text, setText] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { toast } = useToast();

  const solveMutation = useMutation({
    mutationFn: async (data: { text?: string; subject: string; level: string; file?: File }) => {
      const formData = new FormData();
      if (data.text) formData.append('text', data.text);
      formData.append('subject', data.subject);
      formData.append('level', data.level);
      if (data.file) formData.append('file', data.file);

      const response = await fetch('/api/solve', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response.json() as Promise<SolveResponse>;
    },
    onSuccess: (data) => {
      if (data.ok && data.solution && data.parsed) {
        onSolutionGenerated({
          solution: data.solution,
          parsed: data.parsed,
          verified: data.verified || false
        });
        
        toast({
          title: "Başarılı!",
          description: "Sorunuz başarıyla çözüldü.",
        });
        
        // Reset form
        setText("");
        setSelectedFile(null);
      } else {
        throw new Error(data.error || "Beklenmeyen hata");
      }
    },
    onError: (error) => {
      toast({
        title: "Hata",
        description: error.message || "Soru çözülürken hata oluştu.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (!text.trim() && !selectedFile) {
      toast({
        title: "Eksik Bilgi",
        description: "Lütfen bir soru metni girin veya fotoğraf yükleyin.",
        variant: "destructive",
      });
      return;
    }

    solveMutation.mutate({
      text: text.trim() || undefined,
      subject: selectedSubject,
      level,
      file: selectedFile || undefined,
    });
  };

  return (
    <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
      {/* Subject Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-foreground mb-3">Ders Seçimi</label>
        <div className="flex flex-wrap gap-2">
          {subjects.map((subject) => {
            const Icon = subject.icon;
            const isSelected = selectedSubject === subject.id;
            
            return (
              <button
                key={subject.id}
                onClick={() => setSelectedSubject(subject.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                  isSelected
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground border border-border hover:bg-accent"
                }`}
                data-testid={`subject-${subject.id}`}
              >
                <Icon className="w-4 h-4" />
                {subject.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Text Input */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-foreground mb-2">Soru Metni</label>
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full p-4 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-ring focus:border-transparent resize-none"
          rows={4}
          placeholder="Sorunuzu buraya yazın... (Örn: x^2 + 5x + 6 = 0 denklemini çözün)"
          data-testid="question-text"
        />
      </div>

      {/* File Upload Area */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-foreground mb-2">Veya Fotoğraf Yükleyin</label>
        <FileUpload 
          onFileSelect={setSelectedFile} 
          selectedFile={selectedFile} 
        />
      </div>

      {/* Level Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-foreground mb-3">Seviye</label>
        <div className="flex gap-4">
          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              name="level"
              value="primary"
              checked={level === "primary"}
              onChange={(e) => setLevel(e.target.value as "primary" | "high")}
              className="sr-only"
              data-testid="level-primary"
            />
            <div className="w-4 h-4 border-2 border-primary rounded-full mr-2 flex items-center justify-center">
              {level === "primary" && <div className="w-2 h-2 bg-primary rounded-full" />}
            </div>
            <span className="text-foreground">İlkokul/Ortaokul</span>
          </label>
          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              name="level"
              value="high"
              checked={level === "high"}
              onChange={(e) => setLevel(e.target.value as "primary" | "high")}
              className="sr-only"
              data-testid="level-high"
            />
            <div className="w-4 h-4 border-2 border-primary rounded-full mr-2 flex items-center justify-center">
              {level === "high" && <div className="w-2 h-2 bg-primary rounded-full" />}
            </div>
            <span className="text-foreground">Lise/Üniversite</span>
          </label>
        </div>
      </div>

      {/* Submit Button */}
      <Button
        onClick={handleSubmit}
        disabled={solveMutation.isPending}
        className="w-full py-4 bg-primary text-primary-foreground rounded-lg font-medium text-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
        data-testid="solve-button"
      >
        {solveMutation.isPending ? (
          <>
            <div className="animate-spin w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full mr-2" />
            Çözülüyor...
          </>
        ) : (
          <>
            <Wand2 className="w-5 h-5 mr-2" />
            Soruyu Çöz
          </>
        )}
      </Button>
    </div>
  );
}
