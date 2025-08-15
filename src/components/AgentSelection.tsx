import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from './ui/button';
import { HistoricalFigure } from '../types/crisisDataTypes';
import { getFigureImageUrl } from '@/lib/imageLoader';
import { cn } from '@/lib/utils';
import { Heart, Zap, Wind } from 'lucide-react';

interface AgentSelectionProps {
  userCollection: string[];
  allFigures: HistoricalFigure[];
  onSelect: (figure: HistoricalFigure) => void;
  onCancel: () => void;
}

const AgentSelection: React.FC<AgentSelectionProps> = ({ userCollection, allFigures, onSelect, onCancel }) => {
  const [selected, setSelected] = useState<HistoricalFigure | null>(null);
  const availableAgents = allFigures.filter(fig => userCollection.includes(fig.id));

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center z-[100] p-4">
      <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
        <h1 className="text-4xl font-bold text-cyan-200 mb-2">MISSÃO DE INFILTRAÇÃO</h1>
        <p className="text-lg text-cyan-400 mb-8">Selecione um agente da sua coleção para prosseguir.</p>
      </motion.div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {availableAgents.map((agent, index) => (
          <motion.div
            key={agent.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className={cn(
              'p-4 border-2 bg-slate-900/80 rounded-lg cursor-pointer transition-all',
              selected?.id === agent.id ? 'border-yellow-400 scale-105' : 'border-slate-700 hover:border-slate-500'
            )}
            onClick={() => setSelected(agent)}
          >
            <img src={getFigureImageUrl(agent.image)} alt={agent.name} className="w-24 h-24 rounded-full mx-auto border-4 border-slate-600 object-cover" />
            <h2 className="text-center text-xl font-bold text-white mt-4">{agent.name}</h2>
            <div className="flex justify-around mt-4 text-sm font-mono">
              <span className="flex items-center gap-1 text-red-400"><Heart size={16} /> {agent.stats.hp}</span>
              <span className="flex items-center gap-1 text-yellow-400"><Zap size={16} /> {agent.stats.attack}</span>
              <span className="flex items-center gap-1 text-blue-400"><Wind size={16} /> {agent.stats.speed}</span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-8 flex gap-4">
        <Button variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button onClick={() => selected && onSelect(selected)} disabled={!selected} size="lg" className="bg-green-600 hover:bg-green-700">
          Iniciar Missão
        </Button>
      </div>
    </div>
  );
};

export default AgentSelection;