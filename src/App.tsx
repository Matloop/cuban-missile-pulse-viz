// src/App.tsx

import React, { useState, useEffect, useCallback, useRef } from "react";
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
 // <--- NOVA IMPORTAÇÃO

import allFiguresData from './data/historicalFigures.json';
import quizDataJson from './data/quizData.json';
import { HistoricalFigure, QuizData } from "./types/crisisDataTypes";
import TutorialOverlay from "./components/TutorialOverlay";

const queryClient = new QueryClient();
const quizData = quizDataJson as Record<string, QuizData[]>;

const APP_STATE_KEY = 'cubanCrisisAppState';
const FIRST_LOOTBOX_OPENED_KEY = 'cubanCrisisFirstLootboxOpened'; // Chave para o tutorial

const App: React.FC = () => {
  const [appState, setAppState] = useState<'loading' | 'splash' | 'starter' | 'main'>('loading');
  const [initialCollection, setInitialCollection] = useState<string[]>([]);
  const [lootboxTokens, setLootboxTokens] = useState<number>(1);
  const [currentQuiz, setCurrentQuiz] = useState<QuizData | null>(null);
  
  // NOVO ESTADO: controla se o tutorial de abrir o primeiro cofre está ativo
  const [isFirstLootboxTutorial, setIsFirstLootboxTutorial] = useState<boolean>(false);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const [musicStarted, setMusicStarted] = useState(false);

  // Efeito para carregar o estado salvo
  useEffect(() => {
    try {
      const savedStateJSON = localStorage.getItem(APP_STATE_KEY);
      const firstLootboxOpened = localStorage.getItem(FIRST_LOOTBOX_OPENED_KEY) === 'true';

      if (savedStateJSON) {
        const savedState = JSON.parse(savedStateJSON);
        if (savedState.appState === 'main' && savedState.initialCollection?.length > 0) {
          setInitialCollection(savedState.initialCollection);
          setLootboxTokens(savedState.lootboxTokens ?? 1);
          setIsFirstLootboxTutorial(!firstLootboxOpened); // Ativa o tutorial se o cofre ainda não foi aberto
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

  // Efeito para salvar o estado
  useEffect(() => {
    if (appState !== 'loading' && appState !== 'splash') {
      const stateToSave = { appState, initialCollection, lootboxTokens };
      localStorage.setItem(APP_STATE_KEY, JSON.stringify(stateToSave));
    }
  }, [appState, initialCollection, lootboxTokens]);

  const handleStart = async () => {
    if (!musicStarted && audioRef.current) {
      try {
        audioRef.current.volume = 1.0; 
        await audioRef.current.play();
        setMusicStarted(true);
      } catch (error) {
        console.error("Falha ao iniciar a música:", error);
      }
    }
    setAppState('starter');
  };

  const handleStarterSelect = (figureId: string) => {
    setInitialCollection([figureId]);
    setIsFirstLootboxTutorial(true); // Ativa o tutorial ao selecionar o starter
    setAppState('main');
  };

  const spendLootboxToken = useCallback(() => {
    setLootboxTokens(prev => {
      const newTokens = prev > 0 ? prev - 1 : 0;
      // Se era o tutorial e o jogador gastou o token, o tutorial acabou.
      if (isFirstLootboxTutorial && newTokens < 1) {
        setIsFirstLootboxTutorial(false);
        localStorage.setItem(FIRST_LOOTBOX_OPENED_KEY, 'true');
      }
      return newTokens;
    });
  }, [isFirstLootboxTutorial]);

  const addLootboxToken = useCallback(() => setLootboxTokens(prev => prev + 1), []);
  const handleStartGeneralQuiz = () => { /* ... (código sem alterações) ... */ const generalQuizzes = quizData.geral; if (generalQuizzes && generalQuizzes.length > 0) { const randomIndex = Math.floor(Math.random() * generalQuizzes.length); setCurrentQuiz(generalQuizzes[randomIndex]); } };
  const handleQuizComplete = (isCorrect: boolean) => { setCurrentQuiz(null); if (isCorrect) { setLootboxTokens(prev => prev + 1); toast.success("Resposta Correta!", { description: "Você ganhou 1 Chave de Análise.", }); } else { toast.error("Resposta Incorreta.", { description: "Mais sorte na próxima vez!", }); } };
  
  const renderContent = () => {
    if (appState === 'loading') {
      return null;
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
                  onSpendToken={spendLootboxToken} // Passa a função que desativa o tutorial
                  onStartQuiz={handleStartGeneralQuiz}
                  isTutorialActive={isFirstLootboxTutorial} // Passa o estado do tutorial
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
        <audio ref={audioRef} src="/trilha-sonora.mp3" loop />
        
        {renderContent()}

        <AnimatePresence>
  {isFirstLootboxTutorial && appState === 'main' && (
    <TutorialOverlay onFinish={() => setIsFirstLootboxTutorial(false)} />
  )}
</AnimatePresence>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;