
import React, { useState, useEffect } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import NetworkVisualization from '../components/NetworkVisualization';
import Timeline from '../components/Timeline';
import InfoPanel from '../components/InfoPanel';
import RiskIndicator from '../components/RiskIndicator';
import Quiz from '../components/Quiz';
import { Button } from '../components/ui/button';
import crisisData from '../data/crisisData.json';

const Index = () => {
  const [selectedDate, setSelectedDate] = useState('1962-10-14');
  const [selectedNode, setSelectedNode] = useState(null);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [isTimelineVisible, setIsTimelineVisible] = useState(true);
  const [showQuiz, setShowQuiz] = useState(false);

  useEffect(() => {
    const event = crisisData.events.find(e => e.date === selectedDate);
    setCurrentEvent(event);
    setSelectedNode(null); // Reset selected node when date changes
    
    // Show quiz when reaching the last day (1962-10-28)
    if (selectedDate === '1962-10-28') {
      setShowQuiz(true);
    }
  }, [selectedDate]);

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const handleNodeSelect = (node) => {
    setSelectedNode(node);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 text-white">
      {/* Header */}
      <header className="bg-black/30 backdrop-blur-sm border-b border-blue-500/30 p-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-center bg-gradient-to-r from-blue-400 to-red-400 bg-clip-text text-transparent">
            CRISE DOS MÍSSEIS DE CUBA
          </h1>
          <p className="text-center text-blue-200 mt-2">
            Outubro de 1962 • 13 Dias que Quase Mudaram o Mundo
          </p>
        </div>
      </header>

      {/* Main Content */}
      <div className={`max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-4 gap-6 ${isTimelineVisible ? 'h-[calc(100vh-120px)]' : 'min-h-[calc(100vh-120px)]'}`}>
        
        {/* Network Visualization - Main Center */}
        <div className="lg:col-span-3 bg-black/20 backdrop-blur-sm rounded-lg border border-blue-500/30 p-4">
          <NetworkVisualization
            nodes={crisisData.nodes}
            currentEvent={currentEvent}
            onNodeSelect={handleNodeSelect}
            selectedNode={selectedNode}
          />
        </div>

        {/* Side Panel */}
        <div className="space-y-6">
          
          {/* Risk Indicator */}
          <div className="bg-black/20 backdrop-blur-sm rounded-lg border border-blue-500/30 p-4">
            <RiskIndicator riskLevel={currentEvent?.riskLevel || 1} />
          </div>

          {/* Info Panel */}
          <div className="bg-black/20 backdrop-blur-sm rounded-lg border border-blue-500/30 p-4 flex-1">
            <InfoPanel 
              currentEvent={currentEvent}
              selectedNode={selectedNode}
              nodes={crisisData.nodes}
            />
          </div>
        </div>
      </div>

      {/* Timeline Toggle Button */}
      <Button
        onClick={() => setIsTimelineVisible(!isTimelineVisible)}
        className="fixed bottom-4 right-4 z-50 bg-blue-600 hover:bg-blue-700 text-white"
        size="sm"
      >
        {isTimelineVisible ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
        {isTimelineVisible ? 'Ocultar Linha do Tempo' : 'Mostrar Linha do Tempo'}
      </Button>

      {/* Timeline - Bottom */}
      {isTimelineVisible && (
        <div className="fixed bottom-0 left-0 right-0 bg-black/40 backdrop-blur-sm border-t border-blue-500/30 p-4">
          <Timeline
            events={crisisData.events}
            selectedDate={selectedDate}
            onDateChange={handleDateChange}
          />
        </div>
      )}

      {/* Quiz Modal */}
      {showQuiz && (
        <Quiz onClose={() => setShowQuiz(false)} />
      )}
    </div>
  );
};

export default Index;
