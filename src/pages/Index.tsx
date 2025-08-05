// src/pages/Index.tsx

import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, BookOpen, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Importando componentes da sua UI e do projeto
import NetworkVisualization from '../components/NetworkVisualization';
import Timeline from '../components/Timeline';
import InfoPanel from '../components/InfoPanel';
import RiskIndicator from '../components/RiskIndicator';
import Quiz from '../components/Quiz';
import { Button } from '../components/ui/button';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '../components/ui/resizable';

// Importando dados e os novos tipos
import crisisData from '../data/crisisData.json';
import { NetworkNode, NetworkEvent } from '../types/crisisDataTypes';

const Index: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<string>('1962-10-14');
  const [selectedNode, setSelectedNode] = useState<NetworkNode | null>(null);
  const [currentEvent, setCurrentEvent] = useState<NetworkEvent | null>(null);
  const [isTimelineVisible, setIsTimelineVisible] = useState(true);
  const [showQuiz, setShowQuiz] = useState(false);
  const [isFinalDay, setIsFinalDay] = useState(false); // Novo estado para controlar o último dia

  useEffect(() => {
    // Encontra o evento correspondente à data selecionada
    const event = crisisData.events.find(e => e.date === selectedDate) as NetworkEvent;
    setCurrentEvent(event);
    setSelectedNode(null); // Reseta a seleção de nó ao mudar de data

    // Verifica se é o último dia para exibir o botão do quiz
    setIsFinalDay(selectedDate === '1962-10-28');
  }, [selectedDate]);

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
  };

  const handleNodeSelect = (node: NetworkNode) => {
    // Permite selecionar e deselecionar um nó
    setSelectedNode(prevNode => (prevNode && prevNode.id === node.id ? null : node));
  };

  // Formata a data para exibição no HUD
  const formattedDate = new Date(selectedDate).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.5, ease: "easeInOut" }}
      className="h-screen w-screen overflow-hidden text-white flex flex-col"
    >
      {/* Camadas de fundo animadas */}
      <div className="animated-grid-background" />
      <div className="noise-overlay" />

      {/* Header Fixo (botão do quiz removido daqui) */}
      <header className="bg-black/30 backdrop-blur-sm border-b border-cyan-500/30 p-3 shrink-0 z-10">
        <div className="max-w-screen-2xl mx-auto flex justify-between items-center">
          <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-cyan-400 to-red-400 bg-clip-text text-transparent tracking-wider">
            OPERAÇÃO CHRONOS // ANÁLISE: CRISE DOS MÍSSEIS
          </h1>
        </div>
      </header>

      {/* Conteúdo Principal com Painéis Redimensionáveis */}
      <main className="flex-grow min-h-0">
        <ResizablePanelGroup direction="horizontal" className="h-full max-w-screen-2xl mx-auto p-4">
          <ResizablePanel defaultSize={70}>
            <div className="relative h-full w-full bg-black/20 backdrop-blur-sm rounded-lg border border-cyan-500/40 p-2 shadow-lg shadow-cyan-900/20">
              <NetworkVisualization
                nodes={crisisData.nodes as NetworkNode[]}
                currentEvent={currentEvent}
                onNodeSelect={handleNodeSelect}
                selectedNode={selectedNode}
              />
              {/* Botão do Quiz que aparece no último dia */}
              <AnimatePresence>
                {isFinalDay && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.5 }}
                    className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm"
                  >
                    <div className="text-center p-8 bg-black/70 rounded-lg border border-yellow-500/50 shadow-2xl shadow-yellow-500/20">
                      <h2 className="text-2xl font-bold text-yellow-300 mb-2">Análise Concluída</h2>
                      <p className="text-gray-300 mb-6 max-w-md">
                        Você navegou pelos 13 dias que levaram o mundo à beira do abismo. Agora, teste seu conhecimento sobre os eventos críticos que definiram a Crise dos Mísseis.
                      </p>
                      <Button onClick={() => setShowQuiz(true)} size="lg" variant="outline" className="text-yellow-300 border-yellow-500/30 hover:bg-yellow-500/10 hover:text-yellow-200 text-lg">
                        <BookOpen className="w-5 h-5 mr-3" />
                        Iniciar Teste de Conhecimento
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
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

      {/* Botão Flutuante para a Linha do Tempo */}
      <Button
        onClick={() => setIsTimelineVisible(!isTimelineVisible)}
        className="fixed bottom-6 right-6 z-50 bg-cyan-600 hover:bg-cyan-700 text-white rounded-full h-12 w-12 p-0 shadow-lg shadow-cyan-500/30 hover:animate-none animate-pulse"
        aria-label={isTimelineVisible ? 'Ocultar Linha do Tempo' : 'Mostrar Linha do Tempo'}
      >
        {isTimelineVisible ? <EyeOff className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
      </Button>
      
      {/* HUD (Heads-Up Display) nos cantos */}
      <div className="fixed bottom-6 left-6 z-30 font-mono text-sm text-cyan-300 pointer-events-none bg-black/30 p-2 rounded border border-cyan-500/20">
        <div className="flex items-center gap-2">
           <Clock className="w-4 h-4 animate-spin" style={{ animationDuration: '30s' }} /> <span>{formattedDate}</span>
        </div>
      </div>
      <div className="fixed top-20 right-6 z-30 font-mono text-sm text-red-400 pointer-events-none bg-black/30 p-2 rounded border border-red-500/20 animate-pulse">
        <span className="font-bold">LIVE ANALYSIS</span>
      </div>

      {/* Linha do Tempo Animada com Framer Motion */}
      <AnimatePresence>
        {isTimelineVisible && (
          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
            className="fixed bottom-0 left-0 right-0 z-40 bg-black/50 backdrop-blur-md border-t border-cyan-500/30"
          >
            <div className="p-4">
              <Timeline
                events={crisisData.events}
                selectedDate={selectedDate}
                onDateChange={handleDateChange}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal do Quiz */}
      <AnimatePresence>
        {showQuiz && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <Quiz onClose={() => setShowQuiz(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Index;