import React, { useState, useEffect, useCallback } from 'react';
import { Eye, EyeOff, BookOpen, Clock, Key, FolderOpen } from 'lucide-react';
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
import { Button } from '../components/ui/button';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '../components/ui/resizable';

// Dados e Tipos
import crisisData from '../data/crisisData.json';
import allFiguresData from '../data/historicalFigures.json';
import opponentsData from '../data/opponents.json';
import { NetworkNode, NetworkEvent, HistoricalFigure } from '../types/crisisDataTypes';
import Lootbox from '@/components/LootBox';

const allFigures = allFiguresData as HistoricalFigure[];
const opponents = opponentsData as Record<string, any>;

interface IndexProps {
  initialCollection: string[];
}

const Index: React.FC<IndexProps> = ({ initialCollection }) => {
  const [selectedDate, setSelectedDate] = useState<string>(crisisData.events[0].date);
  const [currentEvent, setCurrentEvent] = useState<NetworkEvent | null>(null);
  const [selectedNode, setSelectedNode] = useState<NetworkNode | null>(null);
  const [isTimelineVisible, setIsTimelineVisible] = useState(true);
  
  const [userCollection, setUserCollection] = useState<string[]>([]);
  const [highestUnlockedLevel, setHighestUnlockedLevel] = useState<number>(0);
  const [isFinalDay, setIsFinalDay] = useState(false);
  
  const [showFinalQuiz, setShowFinalQuiz] = useState<boolean>(false);
  const [lootboxTokens, setLootboxTokens] = useState<number>(1);
  const [showLootboxOpening, setShowLootboxOpening] = useState<boolean>(false);
  const [unlockedFigure, setUnlockedFigure] = useState<HistoricalFigure | null>(null);
  const [showCollection, setShowCollection] = useState<boolean>(false);

  const [pendingDate, setPendingDate] = useState<string | null>(null);
  const [showAgentSelection, setShowAgentSelection] = useState<boolean>(false);
  const [showBattleScreen, setShowBattleScreen] = useState<boolean>(false);
  const [selectedAgentForBattle, setSelectedAgentForBattle] = useState<HistoricalFigure | null>(null);
  const [currentOpponent, setCurrentOpponent] = useState<any | null>(null);

  useEffect(() => {
    setUserCollection(initialCollection || []);
  }, [initialCollection]);

  useEffect(() => {
    const eventIndex = crisisData.events.findIndex(e => e.date === selectedDate);
    setCurrentEvent(crisisData.events[eventIndex] as NetworkEvent);
    setSelectedNode(null);
    setIsFinalDay(eventIndex === crisisData.events.length - 1);
  }, [selectedDate]);

  const handleDateChange = (newDate: string) => {
    const newEventIndex = crisisData.events.findIndex(e => e.date === newDate);
    if (newEventIndex <= highestUnlockedLevel) {
      setSelectedDate(newDate);
    }
  };
  
  const handleAdvanceDay = () => {
    const currentIndex = crisisData.events.findIndex(e => e.date === selectedDate);
    const nextIndex = currentIndex + 1;
    if (nextIndex >= crisisData.events.length) return;
    const nextDate = crisisData.events[nextIndex].date;
    const opponent = opponents[nextDate as keyof typeof opponents];
    if (opponent) {
        setPendingDate(nextDate);
        setCurrentOpponent(opponent);
        if (opponent.battleType === 'tetris') {
            setShowBattleScreen(true);
        } else {
            setShowAgentSelection(true);
        }
    } else {
      setHighestUnlockedLevel(prev => Math.max(prev, nextIndex));
      setSelectedDate(nextDate);
    }
  };

  const handleAgentSelectForBattle = (agent: HistoricalFigure) => {
    setSelectedAgentForBattle(agent);
    setShowAgentSelection(false);
    setShowBattleScreen(true);
  };
  
  const handleBattleWin = () => {
    if (pendingDate) {
      setShowBattleScreen(false);
      setLootboxTokens(prev => prev + 1);
      const newLevelIndex = crisisData.events.findIndex(e => e.date === pendingDate);
      setHighestUnlockedLevel(prev => Math.max(prev, newLevelIndex));
      setSelectedDate(pendingDate);
      setPendingDate(null);
    }
  };

  const handleBattleLose = () => {
    setShowBattleScreen(false);
    setPendingDate(null);
  };

  const handleFinalQuizComplete = (keysEarned: number) => {
    setLootboxTokens(prev => prev + keysEarned);
    setShowFinalQuiz(false);
  };

  const handleOpenLootbox = useCallback(() => {
    if (lootboxTokens <= 0) return;
    setLootboxTokens(prev => prev - 1);
    const sortedFigures = [...allFigures].sort((a, b) => a.chance - b.chance);
    let figureRolled: HistoricalFigure | null = null;
    for (const figure of sortedFigures) {
      if (Math.floor(Math.random() * figure.chance) === 0) {
        figureRolled = figure;
        break;
      }
    }
    if (!figureRolled) {
      const commonFigures = allFigures.filter(f => f.rarity === 'Comum');
      figureRolled = commonFigures[Math.floor(Math.random() * commonFigures.length)];
    }
    setUnlockedFigure(figureRolled);
    setShowLootboxOpening(true);
  }, [lootboxTokens]);
  
  const handleCollectFigure = useCallback(() => {
    if (unlockedFigure) {
      setUserCollection(prevCollection => {
        if (!prevCollection.includes(unlockedFigure.id)) {
          return [...prevCollection, unlockedFigure.id];
        }
        return prevCollection;
      });
      setUnlockedFigure(null);
      setShowLootboxOpening(false);
    }
  }, [unlockedFigure]);

  const handleNodeSelect = (node: NetworkNode) => setSelectedNode(prev => (prev?.id === node.id ? null : node));
  const formattedDate = new Date(selectedDate).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
  const currentIndex = crisisData.events.findIndex(e => e.date === selectedDate);
  const canAdvance = currentIndex === highestUnlockedLevel && !isFinalDay;
  const BattleComponent = currentOpponent?.battleType === 'tetris' ? MissileCrisisTetris : BattleScreen;

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
            <Button onClick={handleOpenLootbox} disabled={lootboxTokens <= 0} className="bg-yellow-600 hover:bg-yellow-700">
              <Key className="w-4 h-4 mr-2" /> Abrir Cofre ({lootboxTokens})
            </Button>
            <Button onClick={() => setShowCollection(true)} variant="outline">
              <FolderOpen className="w-4 h-4 mr-2" /> Coleção
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-grow min-h-0">
        <ResizablePanelGroup direction="horizontal" className="h-full max-w-screen-2xl mx-auto p-4">
          <ResizablePanel defaultSize={70}>
            <div className="relative h-full w-full bg-black/20 p-2">
              <NetworkVisualization nodes={crisisData.nodes as NetworkNode[]} currentEvent={currentEvent} onNodeSelect={handleNodeSelect} selectedNode={selectedNode} />
              <AnimatePresence>
                {isFinalDay && ( <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50 }} className="absolute inset-0 flex items-center justify-end p-8 bg-gradient-to-l from-black/80 to-transparent pointer-events-none">
                    <div className="text-left p-8 bg-black/80 rounded-lg border border-yellow-500/50 max-w-sm pointer-events-auto">
                      <h2 className="text-2xl font-bold text-yellow-300">Análise Concluída</h2>
                      <p className="text-gray-300 my-4">Teste seu conhecimento para ganhar mais Chaves de Análise.</p>
                      <Button onClick={() => setShowFinalQuiz(true)} size="lg" className="w-full bg-yellow-600 hover:bg-yellow-700">
                        <BookOpen className="w-5 h-5 mr-3" /> Iniciar Questionário Final
                      </Button>
                    </div>
                </motion.div>)}
              </AnimatePresence>
            </div>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={30}>
            <div className="h-full w-full flex flex-col gap-4 pl-4">
              <div className="bg-black/20 p-4"><RiskIndicator riskLevel={currentEvent?.riskLevel || 1} /></div>
              <div className="flex-grow min-h-0 bg-black/20 p-4">
                <InfoPanel currentEvent={currentEvent} selectedNode={selectedNode} nodes={crisisData.nodes as NetworkNode[]} canAdvance={canAdvance} onAdvanceDay={handleAdvanceDay} isFinalDay={isFinalDay} />
              </div>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </main>
      <Button onClick={() => setIsTimelineVisible(!isTimelineVisible)} className="fixed bottom-6 right-6 z-50 rounded-full h-12 w-12 p-0"><EyeOff className="w-6 h-6" /></Button>
      <div className="fixed bottom-6 left-6 z-30 font-mono text-sm text-cyan-300"><Clock className="inline w-4 h-4 mr-2" />{formattedDate}</div>
      <AnimatePresence>
        {isTimelineVisible && (
          <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} className="fixed bottom-0 left-0 right-0 z-40 bg-black/50 backdrop-blur-md border-t border-cyan-500/30 p-4">
            <Timeline events={crisisData.events} selectedDate={selectedDate} onDateChange={handleDateChange} highestUnlockedLevel={highestUnlockedLevel} />
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showAgentSelection && ( <AgentSelection userCollection={userCollection} allFigures={allFigures} onSelect={handleAgentSelectForBattle} onCancel={() => setShowAgentSelection(false)} /> )}
        {showBattleScreen && currentOpponent && (
            currentOpponent.battleType === 'tetris' ? (
                <MissileCrisisTetris onWin={handleBattleWin} onLose={handleBattleLose} opponent={undefined} />
            ) : (
                selectedAgentForBattle && (
                    <BattleScreen playerAgent={selectedAgentForBattle} opponent={currentOpponent} onWin={handleBattleWin} onLose={handleBattleLose} />
                )
            )
        )}
        {showFinalQuiz && ( <FinalQuiz onClose={() => setShowFinalQuiz(false)} onComplete={handleFinalQuizComplete} /> )}
        {showLootboxOpening && unlockedFigure && ( <Lootbox figure={unlockedFigure} onCollect={handleCollectFigure} /> )}
        {showCollection && ( <Collection collection={userCollection} allFigures={allFigures} onClose={() => setShowCollection(false)} /> )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Index;