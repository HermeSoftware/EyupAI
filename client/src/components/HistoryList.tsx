import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, Eye, Trash2, ChevronLeft, ChevronRight, CheckCircle, TriangleAlert } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { type Solution } from "@shared/schema";

interface HistoryResponse {
  ok: boolean;
  solutions: Solution[];
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

export default function HistoryList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(10);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const offset = (currentPage - 1) * limit;

  const { data, isLoading, error } = useQuery<HistoryResponse>({
    queryKey: [`/api/history?limit=${limit}&offset=${offset}`],
    select: (data) => ({
      ...data,
      solutions: data.solutions.filter((solution) => {
        const matchesSearch = !searchTerm || 
          solution.questionText?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (solution.modelResponseJson as any)?.summary?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesSubject = selectedSubject === "all" || solution.subject === selectedSubject;
        
        return matchesSearch && matchesSubject;
      })
    })
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("DELETE", `/api/history/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/history"] });
      toast({
        title: "Başarılı",
        description: "Çözüm başarıyla silindi.",
      });
    },
    onError: (error) => {
      toast({
        title: "Hata",
        description: "Silme işleminde hata oluştu.",
        variant: "destructive",
      });
    },
  });

  const formatTimeAgo = (date: Date | string | null) => {
    if (!date) return "Bilinmeyen zaman";
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffMs = now.getTime() - dateObj.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return "Şimdi";
    if (diffMins < 60) return `${diffMins} dakika önce`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} saat önce`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} gün önce`;
  };

  const handleDelete = (id: string) => {
    if (confirm("Bu çözümü silmek istediğinizden emin misiniz?")) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="animate-pulse bg-muted/50 h-24 rounded-lg"></div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-destructive">Geçmiş yüklenirken hata oluştu.</p>
        </CardContent>
      </Card>
    );
  }

  const solutions = data?.solutions || [];

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Geçmişte ara..."
            className="pl-10"
            data-testid="search-history"
          />
        </div>
        
        <Select value={selectedSubject} onValueChange={setSelectedSubject}>
          <SelectTrigger className="w-48" data-testid="subject-filter">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tüm Dersler</SelectItem>
            <SelectItem value="matematik">Matematik</SelectItem>
            <SelectItem value="geometri">Geometri</SelectItem>
            <SelectItem value="fizik">Fizik</SelectItem>
            <SelectItem value="kimya">Kimya</SelectItem>
            <SelectItem value="biyoloji">Biyoloji</SelectItem>
            <SelectItem value="tarih">Tarih</SelectItem>
            <SelectItem value="edebiyat">Edebiyat</SelectItem>
          </SelectContent>
        </Select>

        <Button 
          variant="outline"
          className="text-destructive hover:bg-destructive/10 border-destructive/20"
          data-testid="bulk-delete"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Toplu Sil
        </Button>
      </div>

      {/* Solutions List */}
      <div className="space-y-4">
        {solutions.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">
                {searchTerm || selectedSubject !== "all" 
                  ? "Arama kriterlerinize uygun çözüm bulunamadı." 
                  : "Henüz çözüm geçmişiniz yok."}
              </p>
            </CardContent>
          </Card>
        ) : (
          solutions.map((solution) => {
            const modelResponse = solution.modelResponseJson as any;
            const confidencePercent = Math.round((solution.confidence || 0) * 100);

            return (
              <Card key={solution.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge 
                          className={`${subjectColors[solution.subject] || subjectColors.matematik} text-xs font-medium`}
                        >
                          {solution.subject.charAt(0).toUpperCase() + solution.subject.slice(1)}
                        </Badge>
                        <div className="flex items-center gap-1">
                          {solution.verified ? (
                            <>
                              <CheckCircle className="w-4 h-4 text-green-500" />
                              <span className="text-xs text-muted-foreground">{confidencePercent}%</span>
                            </>
                          ) : (
                            <>
                              <TriangleAlert className="w-4 h-4 text-yellow-500" />
                              <span className="text-xs text-muted-foreground">Kontrol edildi - {confidencePercent}%</span>
                            </>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {formatTimeAgo(solution.createdAt)}
                        </span>
                      </div>
                      <h3 className="font-medium text-foreground mb-1" data-testid={`solution-title-${solution.id}`}>
                        {modelResponse?.summary || solution.questionText || "İsimsiz Soru"}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Cevap: {modelResponse?.final_answer || "Cevap bulunamadı"}
                      </p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="p-2 hover:text-primary" 
                        title="Görüntüle"
                        data-testid={`view-${solution.id}`}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="p-2 hover:text-destructive" 
                        title="Sil"
                        onClick={() => handleDelete(solution.id)}
                        disabled={deleteMutation.isPending}
                        data-testid={`delete-${solution.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {solutions.length > 0 && (
        <div className="flex items-center justify-center mt-8">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              data-testid="previous-page"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            
            <div className="flex gap-1">
              {Array.from({ length: Math.min(3, Math.ceil(solutions.length / limit)) }).map((_, i) => {
                const pageNum = i + 1;
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(pageNum)}
                    className="w-10 h-10"
                    data-testid={`page-${pageNum}`}
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => p + 1)}
              disabled={solutions.length < limit}
              data-testid="next-page"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
