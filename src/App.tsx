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
  const [appState, setAppState] = useState<'splash' | 'starter' | 'main'>('splash');
  const [initialCollection, setInitialCollection] = useState<string[]>([]);

  const handleStart = () => {
    setAppState('starter');
  };

  const handleStarterSelect = (figureId: string) => {
    setInitialCollection([figureId]);
    setAppState('main');
  };

  const renderContent = () => {
    switch (appState) {
      case 'splash':
        return <SplashScreen onStart={handleStart} />;
      
      case 'starter':
        // CORREÇÃO: Garante que allFiguresData é tratado como um array
        const figuresArray = Array.isArray(allFiguresData) ? allFiguresData : [];
        const starters = figuresArray.filter(fig => (fig as any).isStarter) as HistoricalFigure[];
        return <StarterSelection starters={starters} onSelect={handleStarterSelect} />;
      
      case 'main':
        return (
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index initialCollection={initialCollection} />} />
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