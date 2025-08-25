// src/App.tsx

import React, { useState, useEffect, useCallback, useRef } from "react"; // Adicionado useRef
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner, toast } from "@/components/ui/sonner";
import { AnimatePresence } from "framer-motion";

// Componentes e dados
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

const APP_STATE_KEY = 'cubanCrisisAppState';

const App: React.FC = () => {
  const [appState, setAppState] = useState<'loading' | 'splash' | 'starter' | 'main'>('loading');
  const [initialCollection, setInitialCollection] = useState<string[]>([]);
  const [lootboxTokens, setLootboxTokens] = useState<number>(1);
  const [currentQuiz, setCurrentQuiz] = useState<QuizData | null>(null);
  
  // --- MUDANÇA 1: Referência para o áudio e estado de controle ---
  const audioRef = useRef<HTMLAudioElement>(null);
  const [musicStarted, setMusicStarted] = useState(false);


  // Efeitos de salvar/carregar permanecem iguais...
  useEffect(() => {
    try {
      const savedStateJSON = localStorage.getItem(APP_STATE_KEY);
      if (savedStateJSON) {
        const savedState = JSON.parse(savedStateJSON);
        if (savedState.appState === 'main' && savedState.initialCollection?.length > 0) {
          setInitialCollection(savedState.initialCollection);
          setLootboxTokens(savedState.lootboxTokens ?? 1);
          setAppState('main');
        } else {
          setAppState('splash');
        }
      } else {
        setAppState('splash');
      }
    } catch (error) {
      console.error("Falha ao carregar estado do App:", error);
      setAppState('splash');
    }
  }, []);

  useEffect(() => {
    if (appState !== 'loading' && appState !== 'splash') {
      const stateToSave = { appState, initialCollection, lootboxTokens };
      localStorage.setItem(APP_STATE_KEY, JSON.stringify(stateToSave));
    }
  }, [appState, initialCollection, lootboxTokens]);

  
  // --- MUDANÇA 2: Função para iniciar o jogo E A MÚSICA ---
  const handleStart = async () => {
    // Tenta iniciar a música apenas na primeira vez
    if (!musicStarted && audioRef.current) {
      try {
        // Define o volume para o máximo
        audioRef.current.volume = 1.0; 
        // Inicia a música
        await audioRef.current.play();
        setMusicStarted(true);
      } catch (error) {
        console.error("Falha ao iniciar a música (o usuário precisa interagir com a página):", error);
      }
    }
    // Continua para a próxima tela
    setAppState('starter');
  };

  const handleStarterSelect = (figureId: string) => {
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
    if (appState === 'loading') {
      return null;
    }
    
    switch (appState) {
      case 'splash':
        // A nova função handleStart é passada aqui
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

        {/* --- MUDANÇA 3: Adição do elemento de áudio --- */}
        <audio ref={audioRef} src="/trilha-sonora.mp3" loop />
        
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