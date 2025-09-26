import { Link } from "wouter";
import { Brain, Menu, ArrowLeft } from "lucide-react";
import HistoryList from "@/components/HistoryList";

export default function History() {
  return (
    <div className="bg-background text-foreground font-sans min-h-screen">
      {/* Header Navigation */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Brain className="text-primary-foreground text-lg" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">EyüpAI</h1>
                <p className="text-xs text-muted-foreground">Akıllı Soru Çözme Asistanı</p>
              </div>
            </div>
            <nav className="hidden md:flex items-center space-x-6">
              <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
                Ana Sayfa
              </Link>
              <button className="text-primary font-medium">Geçmiş</button>
              <button className="text-muted-foreground hover:text-foreground transition-colors">Ayarlar</button>
            </nav>
            <button className="md:hidden p-2 text-muted-foreground" data-testid="mobile-menu">
              <Menu />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex items-center mb-8">
          <Link href="/" className="p-2 hover:bg-accent rounded-lg transition-colors mr-3" data-testid="back-home">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h2 className="text-3xl font-bold text-foreground">Çözüm Geçmişi</h2>
        </div>

        <HistoryList />
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/30 mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Brain className="text-primary-foreground" />
              </div>
              <div>
                <p className="font-semibold text-foreground">EyüpAI</p>
                <p className="text-xs text-muted-foreground">Gemini AI ile güçlendirilmiştir</p>
              </div>
            </div>
            <div className="flex items-center space-x-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">Gizlilik</a>
              <a href="#" className="hover:text-foreground transition-colors">Kullanım Şartları</a>
              <a href="#" className="hover:text-foreground transition-colors">Destek</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
