import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from './ui/button';
import { HistoricalFigure } from '../types/crisisDataTypes';
import { cn } from '@/lib/utils';
import { Heart, Zap, Wind } from 'lucide-react';
import { getFigureImageUrl } from '@/lib/imageLoader'; 

// --- Função Helper para Imagens ---
// Mantendo a função aqui para garantir que o componente funcione de forma independente.



interface TeamSelectionProps {
  userCollection: HistoricalFigure[];
  onConfirm: (team: HistoricalFigure[]) => void;
  onCancel: () => void;
}

const TeamSelectionForBoss: React.FC<TeamSelectionProps> = ({ userCollection, onConfirm, onCancel }) => {
  const [selectedTeam, setSelectedTeam] = useState<HistoricalFigure[]>([]);

  const handleSelect = (figure: HistoricalFigure) => {
    const isSelected = selectedTeam.some(f => f.id === figure.id);

    if (isSelected) {
      setSelectedTeam(prev => prev.filter(f => f.id !== figure.id));
    } else {
      if (selectedTeam.length < 3) {
        setSelectedTeam(prev => [...prev, figure]);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center z-[150] p-4 font-mono">
      <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-center">
        <h1 className="text-4xl font-bold text-red-400 mb-2">FORMAÇÃO DE ESQUADRÃO FINAL</h1>
        <p className="text-lg text-red-300 mb-8">Escolha 3 agentes para o confronto decisivo.</p>
      </motion.div>
      
      {/* Container da Grade */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 max-h-[60vh] overflow-y-auto p-4 bg-slate-900/50 rounded-lg border border-slate-700">
        {userCollection.map((agent, index) => {
          const isSelected = selectedTeam.some(f => f.id === agent.id);
          const isDisabled = !isSelected && selectedTeam.length >= 3;
          return (
            <motion.div
              key={agent.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className={cn(
                'p-4 border-2 bg-slate-900/80 rounded-lg cursor-pointer transition-all', // <--- ESTRUTURA BASE
                isSelected ? 'border-yellow-400 scale-105' : 'border-slate-700 hover:border-slate-500',
                isDisabled ? 'opacity-50 grayscale cursor-not-allowed' : ''
              )}
              onClick={() => !isDisabled && handleSelect(agent)}
            >
              {/* Imagem */}
              <img 
                src={getFigureImageUrl(agent.image)} 
                alt={agent.name} 
                className="w-24 h-24 rounded-full mx-auto border-4 border-slate-600 object-cover bg-slate-800"
              />
              {/* Nome */}
              <h2 className="text-center text-xl font-bold text-white mt-4">
                {agent.name}
              </h2>
              
              {/* Stats */}
              <div className="flex justify-around mt-4 text-sm font-mono">
                <span className="flex items-center gap-1 text-red-400" title={`HP: ${agent.stats.hp}`}>
                  <Heart size={16} /> {agent.stats.hp}
                </span>
                <span className="flex items-center gap-1 text-yellow-400" title={`Ataque: ${agent.stats.attack}`}>
                  <Zap size={16} /> {agent.stats.attack}
                </span>
                <span className="flex items-center gap-1 text-blue-400" title={`Velocidade: ${agent.stats.speed}`}>
                  <Wind size={16} /> {agent.stats.speed}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Botões */}
      <div className="mt-8 flex gap-4">
        {/* Botão Cancelar com estilo explícito para visibilidade */}
        <Button 
          onClick={onCancel}
          className="bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white"
        >
          Cancelar
        </Button>
        <Button 
          onClick={() => onConfirm(selectedTeam)} 
          disabled={selectedTeam.length !== 3} 
          size="lg" 
          className="bg-red-700 hover:bg-red-600 disabled:bg-red-900/50 disabled:text-gray-400"
        >
          Confirmar Esquadrão ({selectedTeam.length}/3)
        </Button>
      </div>
    </div>
  );
};

export default TeamSelectionForBoss;