import React, { useState, useEffect, useCallback } from "react";
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
import EventQuiz from "./components/EventQuiz";

import allFiguresData from './data/historicalFigures.json';
import quizDataJson from './data/quizData.json';

import { HistoricalFigure, QuizData } from "./types/crisisDataTypes";

const queryClient = new QueryClient();
const quizData = quizDataJson as Record<string, QuizData[]>;

// --- Chave para o localStorage do App ---
const APP_STATE_KEY = 'cubanCrisisAppState';


const App: React.FC = () => {
  // O estado inicial agora é 'loading' para dar tempo de verificar o localStorage
  const [appState, setAppState] = useState<'loading' | 'splash' | 'starter' | 'main'>('loading');
  const [initialCollection, setInitialCollection] = useState<string[]>([]);
  
  // --- ESTADOS ELEVADOS ---
  const [lootboxTokens, setLootboxTokens] = useState<number>(1);
  const [currentQuiz, setCurrentQuiz] = useState<QuizData | null>(null);


  // --- EFEITO PARA CARREGAR O ESTADO DO APP ---
  useEffect(() => {
    try {
      const savedStateJSON = localStorage.getItem(APP_STATE_KEY);
      if (savedStateJSON) {
        const savedState = JSON.parse(savedStateJSON);
        // Se o jogo já foi iniciado (tem uma coleção), vai direto para o 'main'
        if (savedState.appState === 'main' && savedState.initialCollection?.length > 0) {
          setInitialCollection(savedState.initialCollection);
          setLootboxTokens(savedState.lootboxTokens ?? 1); // Carrega os tokens ou usa 1 como padrão
          setAppState('main');
        } else {
          // Se não, vai para o fluxo normal de splash
          setAppState('splash');
        }
      } else {
        // Se não há nada salvo, começa do splash
        setAppState('splash');
      }
    } catch (error) {
      console.error("Falha ao carregar estado do App:", error);
      setAppState('splash'); // Em caso de erro, começa do splash
    }
  }, []); // Executa apenas uma vez


  // --- EFEITO PARA SALVAR O ESTADO DO APP ---
  useEffect(() => {
    // Só salva se o estado não for 'loading' ou 'splash' para evitar salvar estados transitórios
    if (appState !== 'loading' && appState !== 'splash') {
      const stateToSave = {
        appState,
        initialCollection,
        lootboxTokens,
      };
      localStorage.setItem(APP_STATE_KEY, JSON.stringify(stateToSave));
    }
  }, [appState, initialCollection, lootboxTokens]);


  const handleStart = () => {
    setAppState('starter');
  };

  const handleStarterSelect = (figureId: string) => {
    // Agora `handleStarterSelect` define tanto a coleção quanto o estado do app
    setInitialCollection([figureId]);
    setAppState('main');
  };

  const handleStartGeneralQuiz = () => {
    const generalQuizzes = quizData.geral;
    if (generalQuizzes && generalQuizzes.length > 0) {
      const randomIndex = Math.floor(Math.random() * generalQuizzes.length);
      setCurrentQuiz(generalQuizzes[randomIndex]);
    }
  };

  const handleQuizComplete = (isCorrect: boolean) => {
    setCurrentQuiz(null);
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

  const addLootboxToken = useCallback(() => setLootboxTokens(prev => prev + 1), []);
  const spendLootboxToken = useCallback(() => setLootboxTokens(prev => prev > 0 ? prev - 1 : 0), []);

  const renderContent = () => {
    // Enquanto carrega, não mostra nada para evitar "flicker"
    if (appState === 'loading') {
      return null; // Ou um spinner de loading em tela cheia
    }
    
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