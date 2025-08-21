import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from './ui/button';
import { HistoricalFigure } from '../types/crisisDataTypes';
import { cn } from '@/lib/utils';
import { Heart, Zap, Wind } from 'lucide-react';

// Função Helper para Imagens.
// É crucial que o caminho para as imagens esteja correto.
const getFigureImageUrl = (imageName: string) => {
  if (!imageName) return '';
  if (imageName.startsWith('/') || imageName.startsWith('http')) {
    return imageName;
  }
  return `/assets/figures/${imageName}`; // Ajuste este caminho se necessário
};

// Interface de props atualizada para receber a coleção completa
interface AgentSelectionProps {
  userCollection: HistoricalFigure[]; // AGORA RECEBE A COLEÇÃO COMPLETA COM STATS ATUALIZADOS
  onSelect: (figure: HistoricalFigure) => void;
  onCancel: () => void;
}

const AgentSelection: React.FC<AgentSelectionProps> = ({ userCollection, onSelect, onCancel }) => {
  const [selected, setSelected] = useState<HistoricalFigure | null>(null);

  // A prop 'userCollection' já é a lista correta de agentes disponíveis.
  const availableAgents = userCollection;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center z-[100] p-4 font-mono">
      <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
        <h1 className="text-4xl font-bold text-cyan-200 mb-2">MISSÃO DE INFILTRAÇÃO</h1>
        <p className="text-lg text-cyan-400 mb-8">Selecione um agente da sua coleção para prosseguir.</p>
      </motion.div>
      
      {/* Container da Grade */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 max-h-[60vh] overflow-y-auto p-4 bg-slate-900/50 rounded-lg border border-slate-700">
        {availableAgents.map((agent, index) => (
          <motion.div
            key={agent.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className={cn(
              'p-4 border-2 bg-slate-900/80 rounded-lg cursor-pointer transition-all w-52 flex flex-col items-center', // Estrutura Flex para alinhamento
              selected?.id === agent.id ? 'border-yellow-400 scale-105 shadow-lg shadow-yellow-500/20' : 'border-slate-800 hover:border-slate-600'
            )}
            onClick={() => setSelected(agent)}
          >
            {/* Imagem */}
            <img 
              src={getFigureImageUrl(agent.image)} 
              alt={agent.name} 
              className="w-24 h-24 rounded-full border-4 border-slate-700 object-cover bg-slate-800"
            />
            {/* Nome (com altura fixa para alinhamento) */}
            <h2 className="text-center text-xl font-bold text-white mt-4 h-14 flex items-center justify-center">
              {agent.name}
            </h2>
            
            {/* Linha Divisória */}
            <hr className="w-full border-slate-700 my-2" />

            {/* Stats */}
            <div className="flex justify-around w-full mt-1 text-sm">
              <span className="flex items-center gap-1.5 text-red-400" title={`HP: ${agent.stats.hp}`}>
                <Heart size={16} /> {agent.stats.hp}
              </span>
              <span className="flex items-center gap-1.5 text-yellow-400" title={`Ataque: ${agent.stats.attack}`}>
                <Zap size={16} /> {agent.stats.attack}
              </span>
              <span className="flex items-center gap-1.5 text-blue-400" title={`Velocidade: ${agent.stats.speed}`}>
                <Wind size={16} /> {agent.stats.speed}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Botões */}
      <div className="mt-8 flex gap-4">
        <Button 
          onClick={onCancel}
          className="bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white"
        >
          Cancelar
        </Button>
        <Button 
          onClick={() => selected && onSelect(selected)} 
          disabled={!selected} 
          size="lg" 
          className="bg-green-600 hover:bg-green-700 disabled:bg-green-900/50 disabled:text-gray-400"
        >
          Iniciar Missão
        </Button>
      </div>
    </div>
  );
};

export default AgentSelection;