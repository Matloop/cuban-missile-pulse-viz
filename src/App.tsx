import React, { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
// Importe os componentes e dados necessários
import SplashScreen from "./components/SplashScreen";
import StarterSelection from "./components/StarterSelection";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import allFiguresData from './data/historicalFigures.json';
import { HistoricalFigure } from "./types/crisisDataTypes";
const queryClient = new QueryClient();
const App: React.FC = () => {
// Novo sistema de estado para o fluxo da aplicação
// 'splash': Tela de carregamento inicial
// 'starter': Tela de seleção de agente
// 'main': Aplicação principal
const [appState, setAppState] = useState<'splash' | 'starter' | 'main'>('splash');
// Estado para armazenar o ID do agente escolhido
const [initialFigureId, setInitialFigureId] = useState<string | null>(null);
// Função para avançar da SplashScreen para a seleção de Starter
const handleStart = () => {
setAppState('starter');
};
// Função para avançar da seleção de Starter para o jogo principal
const handleStarterSelect = (figureId: string) => {
setInitialFigureId(figureId); // Guarda o ID do agente escolhido
setAppState('main');
};
const renderContent = () => {
switch (appState) {
case 'splash':
return <SplashScreen onStart={handleStart} />
case 'starter':
    const starters = allFiguresData.filter(fig => (fig as any).isStarter) as HistoricalFigure[];
    return <StarterSelection starters={starters} onSelect={handleStarterSelect} />;
  
  case 'main':
    return (
      <BrowserRouter>
        <Routes>
          {/* Passa o ID do agente escolhido como prop para a página Index */}
          <Route path="/" element={<Index initialFigureId={initialFigureId} />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    );
  
  default:
    return <SplashScreen onStart={handleStart} />;
}
};
return (
<QueryClientProvider client={queryClient}>
<TooltipProvider>
<Toaster />
<Sonner />
{renderContent()}
</TooltipProvider>
</QueryClientProvider>
);
};
export default App;