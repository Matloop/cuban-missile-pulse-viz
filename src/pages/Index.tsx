import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Eye, EyeOff, BookOpen, Clock, Key, FolderOpen, FastForward } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Componentes
import NetworkVisualization from '../components/NetworkVisualization';
import Timeline from '../components/Timeline';
import InfoPanel from '../components/InfoPanel';
import RiskIndicator from '../components/RiskIndicator';
import AgentSelection from '../components/AgentSelection';
import BattleScreen from '../components/BattleScreen';
import MissileCrisisTetris from '../components/MissileCrisisTetris';
import FinalQuiz from '../components/Quiz'; 
import Collection from '../components/Collection';

import RhythmBattle from '@/components/RhythmBattle';

import { Button } from '../components/ui/button';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '../components/ui/resizable';

// Dados e Tipos
import crisisData from '../data/crisisData.json';
import allFiguresData from '../data/historicalFigures.json';
import opponentsData from '../data/opponents.json';
import { NetworkNode, DailyEvent, HistoricalFigure, DailyOpponent } from '../types/crisisDataTypes';
import Lootbox from '@/components/LootBox';
import BossBattle from '../components/BossBattle';

// --- NOVA IMPORTAÇÃO DO CHEFÃO FINAL ---
import { theFinalBoss } from '../data/finalBoss'; // Importa o chefão completo


const allFigures = allFiguresData as HistoricalFigure[];
const opponents = opponentsData as Record<string, DailyOpponent>;

const CRISIS_DAYS_LIMIT = 10; // Mantido em 10 dias
const limitedCrisisEvents = crisisData.events.slice(0, CRISIS_DAYS_LIMIT);
const sortedCrisisDates = limitedCrisisEvents.map(event => event.date).sort();


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
  onStartQuiz 
}) => {
  const [selectedDate, setSelectedDate] = useState<string>(limitedCrisisEvents[0].date);
  
  const currentEventData = useMemo(() => {
    return limitedCrisisEvents.find(e => e.date === selectedDate);
  }, [selectedDate]);
  
  const [selectedNode, setSelectedNode] = useState<NetworkNode | null>(null);
  const [isTimelineVisible, setIsTimelineVisible] = useState(true);
  
  const [userCollection, setUserCollection] = useState<HistoricalFigure[]>([]);
  const [highestUnlockedLevel, setHighestUnlockedLevel] = useState<number>(0);
  
  const isLastTimelineDay = useMemo(() => {
    const currentIndex = sortedCrisisDates.indexOf(selectedDate);
    return currentIndex === sortedCrisisDates.length - 1;
  }, [selectedDate]);

  const [showFinalQuiz, setShowFinalQuiz] = useState<boolean>(false);
  const [showLootboxOpening, setShowLootboxOpening] = useState<boolean>(false);
  const [unlockedFigure, setUnlockedFigure] = useState<HistoricalFigure | null>(null);
  const [isDuplicateInLootbox, setIsDuplicateInLootbox] = useState<boolean>(false);
  const [showCollection, setShowCollection] = useState<boolean>(false);

  const [pendingDate, setPendingDate] = useState<string | null>(null);
  const [showAgentSelection, setShowAgentSelection] = useState<boolean>(false);
  const [showBattleScreen, setShowBattleScreen] = useState<boolean>(false);
  // selectedAgentForBattle deve ser HistoricalFigure, pois é seu personagem
  const [selectedAgentForBattle, setSelectedAgentForBattle] = useState<HistoricalFigure | null>(null);
  const [currentOpponent, setCurrentOpponent] = useState<DailyOpponent | null>(null);

  const [showBossMinigame, setShowBossMinigame] = useState<boolean>(false);

  // --- REMOVIDO: O useMemo que derivava o chefão de opponentsData ---
  // const finalBossFigure: DailyOpponent = useMemo(() => { ... }, []);

  // Define um playerAgent padrão para testes, se o jogo não tiver seleção prévia
  const defaultPlayerAgent: HistoricalFigure = useMemo(() => {
    return userCollection.length > 0 ? userCollection[0] : allFigures[0];
  }, [userCollection]);


  useEffect(() => {
    const initialFigures = allFigures.filter(figure => 
        (initialCollection || []).includes(figure.id) || figure.isStarter
    );
    setUserCollection(initialFigures);
  }, [initialCollection]);

  useEffect(() => {
      setSelectedNode(null);
  }, [selectedDate]);

  const handleDateChange = useCallback((newDate: string) => {
    const newEventIndex = sortedCrisisDates.indexOf(newDate);
    if (newEventIndex !== -1 && newEventIndex <= highestUnlockedLevel) {
      setSelectedDate(newDate);
    }
  }, [highestUnlockedLevel]);
  
  const handleAdvanceDay = useCallback(() => {
    const currentIndex = sortedCrisisDates.indexOf(selectedDate);
    
    if (currentIndex < highestUnlockedLevel) {
      return; 
    }

    // Se é o ÚLTIMO DIA da linha do tempo (10 DIAS) E o jogador está nele
    if (isLastTimelineDay && currentIndex === highestUnlockedLevel) {
        // --- USAMOS O CHEFÃO IMPORTADO AQUI ---
        setShowBossMinigame(true); 
        return; 
    }

    const opponentForCurrentDay = opponents[selectedDate];
    
    if (opponentForCurrentDay) {
        const nextDateIndex = currentIndex + 1;
        const nextDate = sortedCrisisDates[nextDateIndex];
        
        if (nextDateIndex < sortedCrisisDates.length) { 
            setPendingDate(nextDate); 
            setCurrentOpponent(opponentForCurrentDay);
            if (opponentForCurrentDay.battleType === 'tetris') {
                setShowBattleScreen(true);
            } else {
                if (!selectedAgentForBattle) {
                    setShowAgentSelection(true); 
                } else {
                    setShowBattleScreen(true);
                }
            }
        } else {
            console.log("Chegou ao final dos dias limitados, sem batalha diária pendente para o último dia");
        }
    } else {
        const nextIndex = currentIndex + 1;
        if (nextIndex < sortedCrisisDates.length) { 
            setSelectedDate(sortedCrisisDates[nextIndex]);
            setHighestUnlockedLevel(prev => Math.max(prev, nextIndex));
            setSelectedNode(null);
        } else {
            console.log("Não há mais dias para avançar na linha do tempo limitada.");
        }
    }
  }, [selectedDate, highestUnlockedLevel, isLastTimelineDay, opponents, selectedAgentForBattle]);

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
    window.location.reload(); 
  }, []);

  const handleBossMinigameWin = useCallback(() => { 
    setShowBossMinigame(false);
    alert("Parabéns! Você venceu a batalha final e salvou o mundo!");
  }, []);

  const handleBossMinigameLose = useCallback(() => { 
    setShowBossMinigame(false);
    alert("Fim de Jogo! A crise saiu do controle na batalha final.");
    window.location.reload(); 
  }, []);

  const handleFinalQuizComplete = useCallback((keysEarned: number) => {
    for (let i = 0; i < keysEarned; i++) {
      onAddToken();
    }
    setShowFinalQuiz(false);
  }, [onAddToken]);

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

  const handleCollectFigure = useCallback(() => {
    if (!unlockedFigure) return;
    if (isDuplicateInLootbox) {
        setUserCollection(currentCollection =>
            currentCollection.map(figure => {
                if (figure.id === unlockedFigure.id && figure.stats) {
                    return {
                        ...figure,
                        stats: {
                            hp: Math.round(figure.stats.hp * 1.2),
                            attack: Math.round(figure.stats.attack * 1.2),
                            speed: Math.round(figure.stats.speed * 1.2),
                        }
                    };
                }
                return figure;
            })
        );
    } else {
        setUserCollection(currentCollection => [...currentCollection, unlockedFigure]);
    }
    setShowLootboxOpening(false);
    setUnlockedFigure(null);
    setIsDuplicateInLootbox(false);
  }, [unlockedFigure, isDuplicateInLootbox]);

  const handleNodeSelect = useCallback((node: NetworkNode) => setSelectedNode(prev => (prev?.id === node.id ? null : node)), []);
  
  const canAdvance = useMemo(() => {
    const currentIndex = sortedCrisisDates.indexOf(selectedDate);
    return currentIndex === highestUnlockedLevel;
  }, [selectedDate, highestUnlockedLevel]);

  const formattedDate = new Date(selectedDate).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });

  const handleJumpToLastDay = useCallback(() => {
    const lastDayIndex = sortedCrisisDates.length - 1; 
    setSelectedDate(sortedCrisisDates[lastDayIndex]);
    setHighestUnlockedLevel(lastDayIndex); 
    setSelectedNode(null);
    setShowBossMinigame(false);
    setShowFinalQuiz(false);
    setShowBattleScreen(false);
    setPendingDate(null);
    alert(`Pulando para o Dia ${lastDayIndex + 1} (último dia para testes)!`);
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
            <Button onClick={onStartQuiz} className="bg-gray-700 hover:bg-gray-600 text-white font-semibold px-4 py-2 rounded-md">
              <BookOpen className="w-4 h-4 mr-2" /> Responder Quiz (Diário)
            </Button>
            <Button onClick={handleOpenLootbox} disabled={lootboxTokens <= 0} className="bg-yellow-600 hover:bg-yellow-700 text-white font-semibold px-4 py-2 rounded-md">
              <Key className="w-4 h-4 mr-2" /> Abrir Cofre ({lootboxTokens})
            </Button>
            <Button onClick={() => setShowCollection(true)} className="bg-gray-700 hover:bg-gray-600 text-white font-semibold px-4 py-2 rounded-md">
              <FolderOpen className="w-4 h-4 mr-2" /> Coleção
            </Button>
            <Button onClick={handleJumpToLastDay} className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-4 py-2 rounded-md">
              <FastForward className="w-4 h-4 mr-2" /> Pular Último Dia (DEBUG)
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
        
        {showBattleScreen && currentOpponent && (() => {
            if (currentOpponent.battleType === 'tetris') {
                return <MissileCrisisTetris opponent={currentOpponent} onWin={handleBattleWin} onLose={handleBattleLose} />;
            }
            // Garante que selectedAgentForBattle não é nulo para outras batalhas
            if (selectedAgentForBattle) {
                if (currentOpponent.battleType === 'rhythm') {
                    return <RhythmBattle playerAgent={selectedAgentForBattle} opponent={currentOpponent} onWin={handleBattleWin} onLose={handleBattleLose} />;
                }
                return <BattleScreen playerAgent={selectedAgentForBattle} opponent={currentOpponent} onWin={handleBattleWin} onLose={handleBattleLose} />;
            }
            return null; // Caso de fallback se selectedAgentForBattle for nulo (não deveria acontecer)
        })()}

        {showFinalQuiz && ( 
          <FinalQuiz 
            onClose={() => setShowFinalQuiz(false)} 
            onComplete={handleFinalQuizComplete} 
          /> 
        )}
        {showLootboxOpening && unlockedFigure && ( 
          <Lootbox 
            figure={unlockedFigure} 
            onCollect={handleCollectFigure} 
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

        {/* Renderiza a BossBattle APENAS quando showBossMinigame for true */}
        {showBossMinigame && defaultPlayerAgent && ( // Assegura que defaultPlayerAgent exista
          <BossBattle 
            playerAgent={selectedAgentForBattle || defaultPlayerAgent} // Prioriza o selecionado, senão usa o padrão
            bossFigure={theFinalBoss} // <--- AQUI USAMOS O NOVO CHEFÃO IMPORTADO
            onWin={handleBossMinigameWin} 
            onLose={handleBossMinigameLose} 
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Index;