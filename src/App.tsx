import React, { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner, toast } from "@/components/ui/sonner";
import { AnimatePresence } from "framer-motion";

// Importe os componentes e dados necessários
import SplashScreen from "./components/SplashScreen";
import StarterSelection from "./components/StarterSelection";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import EventQuiz from "./components/EventQuiz"; // Importe o componente do Quiz

import allFiguresData from './data/historicalFigures.json';
import quizDataJson from './data/quizData.json'; // Importe os dados do Quiz

import { HistoricalFigure, QuizData } from "./types/crisisDataTypes";

const queryClient = new QueryClient();
const quizData = quizDataJson as Record<string, QuizData[]>;

const App: React.FC = () => {
  const [appState, setAppState] = useState<'splash' | 'starter' | 'main'>('splash');
  const [initialCollection, setInitialCollection] = useState<string[]>([]);
  
  // --- ESTADOS ELEVADOS ---
  const [lootboxTokens, setLootboxTokens] = useState<number>(100);
  const [currentQuiz, setCurrentQuiz] = useState<QuizData | null>(null);

  const handleStart = () => {
    setAppState('starter');
  };

  const handleStarterSelect = (figureId: string) => {
    setInitialCollection([figureId]);
    setAppState('main');
  };

  // --- NOVAS FUNÇÕES ---

  // Inicia um quiz com uma pergunta aleatória da categoria "geral"
  const handleStartGeneralQuiz = () => {
    const generalQuizzes = quizData.geral;
    if (generalQuizzes && generalQuizzes.length > 0) {
      const randomIndex = Math.floor(Math.random() * generalQuizzes.length);
      setCurrentQuiz(generalQuizzes[randomIndex]);
    }
  };

  // Lida com a conclusão do quiz
  const handleQuizComplete = (isCorrect: boolean) => {
    setCurrentQuiz(null); // Fecha o modal do quiz
    if (isCorrect) {
      setLootboxTokens(prev => prev + 1);
      toast.success("Resposta Correta!", {
        description: "Você ganhou 1 Chave de Análise.",
      });
    } else {
      toast.error("Resposta Incorreta.", {
        description: "Mais sorte na próxima vez!",
      });
    }
  };

  // Funções para Index manipular os tokens
  const addLootboxToken = () => setLootboxTokens(prev => prev + 1);
  const spendLootboxToken = () => setLootboxTokens(prev => prev > 0 ? prev - 1 : 0);

  const renderContent = () => {
    switch (appState) {
      case 'splash':
        return <SplashScreen onStart={handleStart} />;
      
      case 'starter':
        const figuresArray = Array.isArray(allFiguresData) ? allFiguresData : [];
        const starters = figuresArray.filter(fig => (fig as any).isStarter) as HistoricalFigure[];
        return <StarterSelection starters={starters} onSelect={handleStarterSelect} />;
      
      case 'main':
        return (
          <BrowserRouter>
            <Routes>
              {/* Passa os tokens e as funções como props para o Index */}
              <Route path="/" element={
                <Index 
                  initialCollection={initialCollection}
                  lootboxTokens={lootboxTokens}
                  onAddToken={addLootboxToken}
                  onSpendToken={spendLootboxToken}
                  onStartQuiz={handleStartGeneralQuiz}
                />} 
              />
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

        {/* Renderiza o quiz de forma condicional sobre toda a aplicação */}
        <AnimatePresence>
          {currentQuiz && (
            <EventQuiz quiz={currentQuiz} onComplete={handleQuizComplete} />
          )}
        </AnimatePresence>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;