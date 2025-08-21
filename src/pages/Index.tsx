import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Eye, EyeOff, BookOpen, Clock, Key, FolderOpen, FastForward, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from "@/components/ui/sonner";

// Componentes
import NetworkVisualization from '../components/NetworkVisualization';
import Timeline from '../components/Timeline';
import InfoPanel from '../components/InfoPanel';
import RiskIndicator from '../components/RiskIndicator';
import AgentSelection from '../components/AgentSelection';
import BattleScreen from '../components/BattleScreen';
import MissileCrisisTetris from '../components/MissileCrisisTetris';
import FinalQuiz from '../components/Quiz'; 
import EventQuiz from '../components/EventQuiz'; 
import Collection from '../components/Collection';
import RhythmBattle from '@/components/RhythmBattle';
import TeamSelectionForBoss from '../components/TeamSelectionForBoss';
import Lootbox from '@/components/LootBox';
import BossBattle from '../components/BossBattle';

import { Button } from '../components/ui/button';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '../components/ui/resizable';

// Dados e Tipos
import crisisData from '../data/crisisData.json'; 
import allFiguresData from '../data/historicalFigures.json';
import opponentsData from '../data/opponents.json';
import quizQuestionsData from '../data/quizQuestions.json'; 
import { NetworkNode, DailyEvent, HistoricalFigure, DailyOpponent, QuizData } from '../types/crisisDataTypes';
import { theFinalBoss } from '../data/finalBoss'; 

const allFigures = allFiguresData as HistoricalFigure[];
const opponents = opponentsData as Record<string, DailyOpponent>;
const allQuizQuestions: Record<string, QuizData[]> = quizQuestionsData;

const CRISIS_DAYS_LIMIT = 10; 
const limitedCrisisEvents = crisisData.events.slice(0, CRISIS_DAYS_LIMIT);
const sortedCrisisDates = limitedCrisisEvents.map(event => event.date).sort();

// Chaves para salvar/carregar o estado do jogo no localStorage
const GAME_STATE_KEY = 'cubanCrisisGameState';
const CORRECTLY_ANSWERED_QUIZ_KEY = 'cubanCrisisCorrectlyAnsweredQuiz';

interface IndexProps {
  initialCollection: string[];
  lootboxTokens: number;
  onAddToken: () => void;
  onSpendToken: () => void;
  onStartQuiz: () => void;
}

const Index: React.FC<IndexProps> = ({ 
  initialCollection, 
  lootboxTokens, 
  onAddToken, 
  onSpendToken, 
  onStartQuiz: onStartQuizProp 
}) => {
  // --- Estados que serão persistidos ---
  const [selectedDate, setSelectedDate] = useState<string>(limitedCrisisEvents[0].date);
  const [userCollection, setUserCollection] = useState<HistoricalFigure[]>([]);
  const [highestUnlockedLevel, setHighestUnlockedLevel] = useState<number>(0);
  const [correctlyAnsweredIds, setCorrectlyAnsweredIds] = useState<number[]>([]);
  
  // Flag para garantir que o salvamento não aconteça antes do carregamento inicial
  const [isStateLoaded, setIsStateLoaded] = useState(false);
  
  // --- Outros estados de UI e de jogo ---
  const currentEventData = useMemo(() => limitedCrisisEvents.find(e => e.date === selectedDate), [selectedDate]);
  const [selectedNode, setSelectedNode] = useState<NetworkNode | null>(null);
  const [isTimelineVisible, setIsTimelineVisible] = useState(true);
  const isLastTimelineDay = useMemo(() => sortedCrisisDates.indexOf(selectedDate) === sortedCrisisDates.length - 1, [selectedDate]);
  const [showEventQuiz, setShowEventQuiz] = useState<boolean>(false);
  const [currentEventQuiz, setCurrentEventQuiz] = useState<QuizData | null>(null);
  const [showFinalQuiz, setShowFinalQuiz] = useState<boolean>(false); 
  const [showLootboxOpening, setShowLootboxOpening] = useState<boolean>(false);
  const [unlockedFigure, setUnlockedFigure] = useState<HistoricalFigure | null>(null);
  const [isDuplicateInLootbox, setIsDuplicateInLootbox] = useState<boolean>(false);
  const [showCollection, setShowCollection] = useState<boolean>(false);
  const [pendingDate, setPendingDate] = useState<string | null>(null);
  const [showAgentSelection, setShowAgentSelection] = useState<boolean>(false);
  const [showBattleScreen, setShowBattleScreen] = useState<boolean>(false);
  const [selectedAgentForBattle, setSelectedAgentForBattle] = useState<HistoricalFigure | null>(null);
  const [currentOpponent, setCurrentOpponent] = useState<DailyOpponent | null>(null);
  const [showBossMinigame, setShowBossMinigame] = useState<boolean>(false);
  const [showTeamSelectionForBoss, setShowTeamSelectionForBoss] = useState<boolean>(false);
  const [finalTeam, setFinalTeam] = useState<HistoricalFigure[]>([]);

  // --- EFEITO PARA CARREGAR O JOGO SALVO ---
  useEffect(() => {
    try {
      // Carrega estado principal
      const savedStateJSON = localStorage.getItem(GAME_STATE_KEY);
      if (savedStateJSON) {
        const savedState = JSON.parse(savedStateJSON);
        if (savedState.userCollection?.length > 0) setUserCollection(savedState.userCollection);
        else setUserCollection(allFigures.filter(f => (initialCollection || []).includes(f.id)));
        if (savedState.highestUnlockedLevel) setHighestUnlockedLevel(savedState.highestUnlockedLevel);
        if (savedState.selectedDate) setSelectedDate(savedState.selectedDate);
      } else {
        setUserCollection(allFigures.filter(f => (initialCollection || []).includes(f.id)));
      }

      // Carrega IDs dos quizzes respondidos
      const savedQuizIdsJSON = localStorage.getItem(CORRECTLY_ANSWERED_QUIZ_KEY);
      if (savedQuizIdsJSON) {
        setCorrectlyAnsweredIds(JSON.parse(savedQuizIdsJSON));
      }

    } catch (error) {
      console.error("Falha ao carregar o estado do jogo:", error);
      setUserCollection(allFigures.filter(f => (initialCollection || []).includes(f.id)));
    } finally {
      setIsStateLoaded(true);
    }
  }, [initialCollection]);

  // --- EFEITO PARA SALVAR O JOGO ---
  useEffect(() => {
    if (isStateLoaded) {
      // Salva estado principal apenas se a coleção não estiver vazia
      if (userCollection.length > 0) {
        const gameState = { userCollection, highestUnlockedLevel, selectedDate };
        localStorage.setItem(GAME_STATE_KEY, JSON.stringify(gameState));
      }
      // Salva IDs dos quizzes respondidos
      localStorage.setItem(CORRECTLY_ANSWERED_QUIZ_KEY, JSON.stringify(correctlyAnsweredIds));
    }
  }, [userCollection, highestUnlockedLevel, selectedDate, correctlyAnsweredIds, isStateLoaded]);

  useEffect(() => {
      setSelectedNode(null);
  }, [selectedDate]);
  
  // --- FUNÇÃO PARA RESETAR O JOGO ---
  const handleResetGame = () => {
    if (window.confirm("Você tem certeza que deseja resetar todo o seu progresso? Esta ação não pode ser desfeita.")) {
      localStorage.removeItem(GAME_STATE_KEY);
      localStorage.removeItem('cubanCrisisAppState');
      localStorage.removeItem(CORRECTLY_ANSWERED_QUIZ_KEY);
      window.location.reload();
    }
  };

  const handleDateChange = useCallback((newDate: string) => {
    const newEventIndex = sortedCrisisDates.indexOf(newDate);
    if (newEventIndex !== -1 && newEventIndex <= highestUnlockedLevel) {
      setSelectedDate(newDate);
    }
  }, [highestUnlockedLevel]);
  
  const handleAdvanceDay = useCallback(() => {
    const currentIndex = sortedCrisisDates.indexOf(selectedDate);
    if (currentIndex < highestUnlockedLevel) return;

    if (isLastTimelineDay && currentIndex === highestUnlockedLevel) {
        setShowTeamSelectionForBoss(true);
        return; 
    }

    const opponentForCurrentDay = opponents[selectedDate];
    if (opponentForCurrentDay) {
        const nextDate = sortedCrisisDates[currentIndex + 1];
        if (nextDate) { 
            setPendingDate(nextDate); 
            setCurrentOpponent(opponentForCurrentDay);
            if (opponentForCurrentDay.battleType === 'tetris') {
                setShowBattleScreen(true);
            } else {
                setShowAgentSelection(true);
            }
        }
    } else {
        const nextIndex = currentIndex + 1;
        if (nextIndex < sortedCrisisDates.length) { 
            setSelectedDate(sortedCrisisDates[nextIndex]);
            setHighestUnlockedLevel(prev => Math.max(prev, nextIndex));
            setSelectedNode(null);
        }
    }
  }, [selectedDate, highestUnlockedLevel, isLastTimelineDay, opponents]);

  const handleAgentSelectForBattle = useCallback((agent: HistoricalFigure) => {
    setSelectedAgentForBattle(agent);
    setShowAgentSelection(false);
    setShowBattleScreen(true);
  }, []);
  
  const handleBattleWin = useCallback(() => {
    setShowBattleScreen(false);
    onAddToken();
    if (pendingDate) {
      const currentDayIndex = sortedCrisisDates.indexOf(selectedDate);
      setHighestUnlockedLevel(prev => Math.max(prev, currentDayIndex + 1));
      setSelectedDate(pendingDate); 
      setPendingDate(null);
      setSelectedNode(null);
    }
  }, [pendingDate, onAddToken, selectedDate]);

  const handleBattleLose = useCallback(() => {
    setShowBattleScreen(false);
    setPendingDate(null);
    toast.error("Você foi derrotado!", { description: "Reorganize-se e tente novamente." });
  }, []);

  const handleConfirmFinalTeam = useCallback((team: HistoricalFigure[]) => {
    setFinalTeam(team);
    setShowTeamSelectionForBoss(false);
    setShowBossMinigame(true);
  }, []);

  const handleCancelFinalTeamSelection = useCallback(() => {
    setShowTeamSelectionForBoss(false);
  }, []);

  const handleBossMinigameWin = useCallback(() => { 
    setShowBossMinigame(false);
    toast.success("VITÓRIA FINAL!", { description: "Você salvou o mundo da aniquilação nuclear." });
  }, []);

  const handleBossMinigameLose = useCallback(() => { 
    setShowBossMinigame(false);
    toast.error("Derrota na Batalha Final", { description: "O mundo mergulhou na escuridão. Tente novamente." });
  }, []);

  const handleFinalQuizComplete = useCallback((keysEarned: number) => {
    for (let i = 0; i < keysEarned; i++) onAddToken();
    setShowFinalQuiz(false);
  }, [onAddToken]);

  const handleStartDailyQuiz = useCallback(() => {
    const filterAnswered = (questions: QuizData[]) => questions.filter(q => !correctlyAnsweredIds.includes(q.id));
    const dailyQuestions = filterAnswered(allQuizQuestions[selectedDate] || []);
    let selectedQuiz: QuizData | null = null;

    if (dailyQuestions.length > 0) {
      selectedQuiz = dailyQuestions[Math.floor(Math.random() * dailyQuestions.length)];
    } else {
      const generalQuestions = filterAnswered(allQuizQuestions['geral'] || []);
      if (generalQuestions.length > 0) {
        selectedQuiz = generalQuestions[Math.floor(Math.random() * generalQuestions.length)];
      }
    }

    if (selectedQuiz) {
      setCurrentEventQuiz(selectedQuiz);
      setShowEventQuiz(true);
    } else {
      toast.info("Você já respondeu todas as perguntas disponíveis hoje!");
    }
  }, [selectedDate, correctlyAnsweredIds]);

  const handleDailyQuizComplete = useCallback((isCorrect: boolean) => {
    if (isCorrect) {
      onAddToken(); 
      if (currentEventQuiz) {
        setCorrectlyAnsweredIds(prev => [...prev, currentEventQuiz.id]);
      }
      toast.success("Resposta Correta!", { description: "Você ganhou 1 Chave de Análise." });
    } else {
      toast.error("Resposta Incorreta.", { description: "Revise os detalhes!" });
    }
    setShowEventQuiz(false); 
    setCurrentEventQuiz(null); 
  }, [onAddToken, currentEventQuiz]);

  const handleOpenLootbox = useCallback(() => {
    if (lootboxTokens <= 0) return;
    onSpendToken();
    const availableFigures = allFigures.filter(f => !f.isStarter && f.chance > 0);
    const totalChance = availableFigures.reduce((sum, figure) => sum + (figure.chance || 0), 0);
    let random = Math.random() * totalChance;
    let drawnFigure: HistoricalFigure | null = null;
    for (const figure of availableFigures) {
        random -= figure.chance || 0;
        if (random <= 0) {
            drawnFigure = figure;
            break;
        }
    }
    if (drawnFigure) {
        const isDuplicate = userCollection.some(f => f.id === drawnFigure!.id);
        setUnlockedFigure(drawnFigure);
        setIsDuplicateInLootbox(isDuplicate);
        setShowLootboxOpening(true);
    }
  }, [lootboxTokens, userCollection, onSpendToken]);

  const handleCollectFigure = useCallback((figureToAdd: HistoricalFigure) => {
    const isDuplicate = userCollection.some(f => f.id === figureToAdd.id);
    if (isDuplicate) {
      setUserCollection(current => current.map(figure => 
        figure.id === figureToAdd.id ? { ...figure, stats: { 
          hp: Math.round(figure.stats.hp * 1.2), 
          attack: Math.round(figure.stats.attack * 1.2), 
          speed: Math.round(figure.stats.speed * 1.2) 
        }} : figure
      ));
      toast.info(`Agente Duplicado: ${figureToAdd.name}`, { description: "Seus status foram fortalecidos em 20%." });
    } else {
      setUserCollection(current => [...current, figureToAdd]);
      toast.success(`Novo Agente Recrutado: ${figureToAdd.name}!`);
    }
    setShowLootboxOpening(false);
    setUnlockedFigure(null);
    setIsDuplicateInLootbox(false);
  }, [userCollection]);

  const handleNodeSelect = useCallback((node: NetworkNode) => setSelectedNode(prev => (prev?.id === node.id ? null : node)), []);
  
  const canAdvance = useMemo(() => sortedCrisisDates.indexOf(selectedDate) === highestUnlockedLevel, [selectedDate, highestUnlockedLevel]);
  const formattedDate = new Date(selectedDate).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });

  const handleJumpToLastDay = useCallback(() => {
    const lastDayIndex = sortedCrisisDates.length - 1; 
    setSelectedDate(sortedCrisisDates[lastDayIndex]);
    setHighestUnlockedLevel(lastDayIndex); 
    setSelectedNode(null);
    setShowBossMinigame(false);
    setShowFinalQuiz(false);
    setShowBattleScreen(false);
    setShowTeamSelectionForBoss(false);
    setPendingDate(null);
  }, []);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-screen w-screen overflow-hidden text-white flex flex-col">
      <div className="animated-grid-background" />
      <div className="noise-overlay" />

      <header className="bg-black/30 backdrop-blur-sm border-b border-cyan-500/30 p-3 shrink-0 z-20">
        <div className="max-w-screen-2xl mx-auto flex justify-between items-center">
          <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-cyan-400 to-red-400 bg-clip-text text-transparent tracking-wider">
            OPERAÇÃO CHRONOS // ANÁLISE: CRISE DOS MÍSSEIS
          </h1>
          <div className="flex items-center gap-2">
            <Button onClick={handleStartDailyQuiz} className="bg-gray-700 hover:bg-gray-600 text-white font-semibold px-4 py-2 rounded-md">
              <BookOpen className="w-4 h-4 mr-2" /> Quiz
            </Button>
            <Button onClick={handleOpenLootbox} disabled={lootboxTokens <= 0} className="bg-yellow-600 hover:bg-yellow-700 text-white font-semibold px-4 py-2 rounded-md">
              <Key className="w-4 h-4 mr-2" /> Cofre ({lootboxTokens})
            </Button>
            <Button onClick={() => setShowCollection(true)} className="bg-gray-700 hover:bg-gray-600 text-white font-semibold px-4 py-2 rounded-md">
              <FolderOpen className="w-4 h-4 mr-2" /> Coleção
            </Button>
            <Button onClick={handleJumpToLastDay} className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-4 py-2 rounded-md">
              <FastForward className="w-4 h-4 mr-2" /> Pular Dia Final
            </Button>
            <Button onClick={handleResetGame} variant="destructive" className="bg-red-800 hover:bg-red-700">
              <RotateCcw className="w-4 h-4 mr-2" /> Resetar
            </Button>
          </div>
        </div>
      </header>
      
      <main className="flex-grow min-h-0">
        <ResizablePanelGroup direction="horizontal" className="h-full max-w-screen-2xl mx-auto p-4">
          <ResizablePanel defaultSize={70}>
            <div className="relative h-full w-full bg-black/20 p-2">
              <NetworkVisualization 
                nodes={crisisData.nodes as NetworkNode[]} 
                currentEvent={currentEventData ? { actions: currentEventData.actions } : null} 
                onNodeSelect={handleNodeSelect} 
                selectedNode={selectedNode} 
              />
            </div>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={30}>
            <div className="h-full w-full flex flex-col gap-4 pl-4">
              <div className="bg-black/20 p-4">
                <RiskIndicator riskLevel={currentEventData ? currentEventData.riskLevel : 1} />
              </div>
              <div className="flex-grow min-h-0 bg-black/20 p-4">
                <InfoPanel 
                  currentEvent={currentEventData} 
                  selectedNode={selectedNode} 
                  nodes={crisisData.nodes as NetworkNode[]} 
                  canAdvance={canAdvance} 
                  onAdvanceDay={handleAdvanceDay} 
                  isFinalDay={isLastTimelineDay} 
                />
              </div>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </main>
      <Button onClick={() => setIsTimelineVisible(!isTimelineVisible)} className="fixed bottom-6 right-6 z-50 rounded-full h-12 w-12 p-0">
        {isTimelineVisible ? <EyeOff className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
      </Button>
      <div className="fixed bottom-6 left-6 z-30 font-mono text-sm text-cyan-300">
        <Clock className="inline w-4 h-4 mr-2" />{formattedDate}
      </div>
      <AnimatePresence>
        {isTimelineVisible && (
          <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} className="fixed bottom-0 left-0 right-0 z-40 bg-black/50 backdrop-blur-md border-t border-cyan-500/30 p-4">
            <Timeline 
              events={limitedCrisisEvents.map(e => ({ date: e.date, title: e.title }))} 
              selectedDate={selectedDate} 
              onDateChange={handleDateChange} 
              highestUnlockedLevel={highestUnlockedLevel} 
            />
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showAgentSelection && ( 
          <AgentSelection 
            userCollection={userCollection.map(f => f.id)} 
            allFigures={allFigures} 
            onSelect={handleAgentSelectForBattle} 
            onCancel={() => setShowAgentSelection(false)} 
          /> 
        )}
        
        {showBattleScreen && currentOpponent && selectedAgentForBattle && (
          (() => {
            if (currentOpponent.battleType === 'tetris') {
              return <MissileCrisisTetris opponent={currentOpponent} onWin={handleBattleWin} onLose={handleBattleLose} />;
            } else if (currentOpponent.battleType === 'rhythm') {
              return <RhythmBattle playerAgent={selectedAgentForBattle} opponent={currentOpponent} onWin={handleBattleWin} onLose={handleBattleLose} />;
            } else {
              return <BattleScreen playerAgent={selectedAgentForBattle} opponent={currentOpponent} onWin={handleBattleWin} onLose={handleBattleLose} currentDate={selectedDate} allCrisisDates={sortedCrisisDates} />;
            }
          })()
        )}

        {showFinalQuiz && ( 
          <FinalQuiz 
            onClose={() => setShowFinalQuiz(false)} 
            onComplete={handleFinalQuizComplete} 
          /> 
        )}
        {showLootboxOpening && unlockedFigure && ( 
          <Lootbox 
            figure={unlockedFigure} 
            onCollect={() => handleCollectFigure(unlockedFigure)}
            isDuplicate={isDuplicateInLootbox} 
          /> 
        )}
        {showCollection && ( 
          <Collection 
            collection={userCollection} 
            allFigures={allFigures} 
            onClose={() => setShowCollection(false)} 
          /> 
        )}
        
        {showTeamSelectionForBoss && (
          <TeamSelectionForBoss 
            userCollection={userCollection}
            onConfirm={handleConfirmFinalTeam}
            onCancel={handleCancelFinalTeamSelection}
          />
        )}

        {showBossMinigame && finalTeam.length === 3 && (
          <BossBattle 
            playerTeam={finalTeam}
            bossFigure={theFinalBoss} 
            onWin={handleBossMinigameWin} 
            onLose={handleBossMinigameLose} 
          />
        )}

        {showEventQuiz && currentEventQuiz && ( 
          <EventQuiz
            quiz={currentEventQuiz}
            onComplete={handleDailyQuizComplete}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Index;