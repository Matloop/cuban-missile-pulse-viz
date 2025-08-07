import React, { useState, useEffect } from 'react';
import { EyeOff, Clock, Key, FolderOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Componentes
import NetworkVisualization from '../components/NetworkVisualization';
import Timeline from '../components/Timeline';
import InfoPanel from '../components/InfoPanel';
import RiskIndicator from '../components/RiskIndicator';
import EventQuiz from '../components/EventQuiz';
import { Button } from '../components/ui/button';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '../components/ui/resizable';

// Dados
import crisisData from '../data/crisisData.json';
import allFiguresData from '../data/historicalFigures.json';

// Tipos
import { NetworkNode, NetworkEvent, HistoricalFigure, QuizData } from '../types/crisisDataTypes';
import Lootbox from '@/components/LootBox';
import Collection from '@/components/Collection';

// Adicionando perguntas ao crisisData dinamicamente para não precisar editar o JSON
const quizQuestions: QuizData[] = [
  { question: "Qual tipo de avião americano descobriu os mísseis?", options: ["SR-71 Blackbird", "U-2 Dragon Lady", "B-52 Stratofortress"], correctAnswer: 1 },
  { question: "Qual o nome do comitê secreto de Kennedy?", options: ["Conselho de Guerra", "ExComm", "Grupo de Crise"], correctAnswer: 1 },
  { question: "Por que Kennedy usou o termo 'quarentena'?", options: ["Soava melhor", "Bloqueio é um ato de guerra", "Foi sugestão da ONU"], correctAnswer: 1 },
  { question: "Qual evento marcou o 'Sábado Negro'?", options: ["O abate de um avião U-2", "A chegada dos navios soviéticos", "O discurso de Kennedy"], correctAnswer: 0 },
  { question: "Qual acordo secreto resolveu a crise?", options: ["Remoção dos mísseis da Turquia", "Pagamento de indenização", "Cuba se tornar neutra"], correctAnswer: 0 }
];
crisisData.events.forEach((event, index) => {
  if (quizQuestions[index]) {
    (event as any).quiz = quizQuestions[index];
  }
});
const allFigures = allFiguresData as HistoricalFigure[];

const Index: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<string>(crisisData.events[0].date);
  const [selectedNode, setSelectedNode] = useState<NetworkNode | null>(null);
  const [currentEvent, setCurrentEvent] = useState<NetworkEvent | null>(null);
  const [isTimelineVisible, setIsTimelineVisible] = useState(true);
  
  const [showEventQuiz, setShowEventQuiz] = useState<boolean>(false);
  const [lootboxTokens, setLootboxTokens] = useState<number>(1);
  const [showLootboxOpening, setShowLootboxOpening] = useState<boolean>(false);
  const [unlockedFigure, setUnlockedFigure] = useState<HistoricalFigure | null>(null);
  const [userCollection, setUserCollection] = useState<string[]>([]);
  const [showCollection, setShowCollection] = useState<boolean>(false);

  useEffect(() => {
    const event = crisisData.events.find(e => e.date === selectedDate) as NetworkEvent;
    setCurrentEvent(event);
    setSelectedNode(null);
    if (event?.quiz && selectedDate !== crisisData.events[0].date) {
      setShowEventQuiz(true);
    }
  }, [selectedDate]);

  const handleQuizAnswer = (isCorrect: boolean) => {
    setShowEventQuiz(false);
    if (isCorrect) {
      setLootboxTokens(prev => prev + 1);
    }
  };

  const handleOpenLootbox = () => {
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
  };
  
  const handleCollectFigure = () => {
      if (unlockedFigure && !userCollection.includes(unlockedFigure.id)) {
          setUserCollection(prev => [...prev, unlockedFigure.id]);
      }
      setShowLootboxOpening(false);
      setUnlockedFigure(null);
  };

  const formattedDate = new Date(selectedDate).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.5 }}
      className="h-screen w-screen overflow-hidden text-white flex flex-col"
    >
      <div className="animated-grid-background" />
      <div className="noise-overlay" />

      <header className="bg-black/30 backdrop-blur-sm border-b border-cyan-500/30 p-3 shrink-0 z-20">
        <div className="max-w-screen-2xl mx-auto flex justify-between items-center">
          <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-cyan-400 to-red-400 bg-clip-text text-transparent tracking-wider">
            OPERAÇÃO CHRONOS // ANÁLISE: CRISE DOS MÍSSEIS
          </h1>
          <div className="flex items-center gap-2">
            <Button onClick={handleOpenLootbox} disabled={lootboxTokens <= 0} className="bg-yellow-600 hover:bg-yellow-700 text-white shadow-lg disabled:bg-gray-500">
              <Key className="w-4 h-4 mr-2" /> Abrir Cofre ({lootboxTokens})
            </Button>
            <Button onClick={() => setShowCollection(true)} variant="outline" className="text-cyan-300 border-cyan-500/30 hover:bg-cyan-500/10 hover:text-cyan-200">
              <FolderOpen className="w-4 h-4 mr-2" /> Coleção
            </Button>
          </div>
        </div>
      </header>
      
      <main className="flex-grow min-h-0">
        <ResizablePanelGroup direction="horizontal" className="h-full max-w-screen-2xl mx-auto p-4">
          <ResizablePanel defaultSize={70}>
            <div className="h-full w-full bg-black/20 backdrop-blur-sm rounded-lg border border-cyan-500/40 p-2 shadow-lg shadow-cyan-900/20">
              <NetworkVisualization
                nodes={crisisData.nodes as NetworkNode[]}
                currentEvent={currentEvent}
                onNodeSelect={(node) => setSelectedNode(prev => (prev?.id === node.id ? null : node))}
                selectedNode={selectedNode}
              />
            </div>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={30}>
            <div className="h-full w-full flex flex-col gap-4 pl-4">
              <div className="bg-black/20 backdrop-blur-sm rounded-lg border border-cyan-500/30 p-4 shadow-lg shadow-cyan-900/20">
                <RiskIndicator riskLevel={currentEvent?.riskLevel || 1} />
              </div>
              <div className="flex-grow min-h-0 bg-black/20 backdrop-blur-sm rounded-lg border border-cyan-500/30 p-4 shadow-lg shadow-cyan-900/20">
                <InfoPanel
                  currentEvent={currentEvent}
                  selectedNode={selectedNode}
                  nodes={crisisData.nodes as NetworkNode[]}
                />
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
            <Timeline events={crisisData.events} selectedDate={selectedDate} onDateChange={setSelectedDate} />
          </motion.div>
        )}
        {showEventQuiz && currentEvent?.quiz && (
          <EventQuiz {...currentEvent.quiz} onAnswer={handleQuizAnswer} />
        )}
        {showLootboxOpening && unlockedFigure && (
          <Lootbox figure={unlockedFigure} onCollect={handleCollectFigure} />
        )}
        {showCollection && (
          <Collection collection={userCollection} allFigures={allFigures} onClose={() => setShowCollection(false)} />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Index;