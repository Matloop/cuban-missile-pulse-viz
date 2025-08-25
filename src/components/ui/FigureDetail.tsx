// src/components/ui/FigureDetail.tsx

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, User, Shield, Zap } from 'lucide-react';
import { HistoricalFigure } from '@/types/crisisDataTypes';
import { cn } from '@/lib/utils';
import { getFigureImageUrl } from '@/lib/imageLoader';
import { Button } from './button';
import { Badge } from './badge';
import { ScrollArea } from './scroll-area';

interface FigureDetailProps {
  figure: HistoricalFigure;
  onClose: () => void;
}

const rarityStyles: { [key: string]: string } = {
  "Comum": "border-gray-500 text-gray-300",
  "Raro": "border-blue-500 text-blue-300",
  "Épico": "border-purple-500 text-purple-300",
  "Lendário": "border-yellow-500 text-yellow-300",
};

type Tab = 'biografia' | 'papel' | 'habilidade';

const FigureDetail: React.FC<FigureDetailProps> = ({ figure, onClose }) => {
  // --- PASSO DE DIAGNÓSTICO ---
  // Esta linha vai imprimir os dados da figura no console do seu navegador.
  console.log("DADOS RECEBIDOS PELO FIGURADETAIL:", figure);

  const [activeTab, setActiveTab] = useState<Tab>('biografia');
  const rarityClass = rarityStyles[figure.rarity] || 'border-gray-700';

  const renderTabContent = () => {
    switch (activeTab) {
      case 'biografia':
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-cyan-300">Biografia</h3>
            <p className="text-gray-300 leading-relaxed">{figure.biography || figure.description || "Informações biográficas não disponíveis."}</p>
          </div>
        );
      case 'papel':
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-cyan-300">Papel na Crise</h3>
            <p className="text-gray-300 leading-relaxed">{figure.roleInCrisis || "O papel específico desta figura na crise não está detalhado."}</p>
          </div>
        );
      case 'habilidade':
         return (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-cyan-300">Habilidade de Jogo</h3>
            <p className="text-gray-300 leading-relaxed">{figure.ability || "Esta figura não possui uma habilidade especial de jogo registrada."}</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[110] p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-slate-900 border-2 border-cyan-500/40 w-full max-w-4xl h-[80vh] rounded-lg shadow-2xl flex overflow-hidden"
      >
        {/* Painel Esquerdo (Info Fixa) */}
        <div className="w-1/3 bg-black/30 p-6 flex flex-col items-center justify-center border-r border-cyan-500/20">
          <img
            src={getFigureImageUrl(figure.image)}
            alt={figure.name}
            className={cn("w-40 h-40 object-cover rounded-full border-4 shadow-lg", rarityClass)}
          />
          <h2 className="text-3xl font-bold text-white mt-4 text-center">{figure.name}</h2>
          <Badge variant="outline" className={cn("mt-2 text-md", rarityClass)}>{figure.rarity}</Badge>
          
          <div className="w-full mt-8 pt-6 border-t border-slate-700 space-y-3 text-lg font-mono">
            <div className="flex justify-between items-center text-red-400"><span><User className="inline-block mr-2 w-5 h-5" /> Vida</span><span className="font-bold">{figure.stats.hp}</span></div>
            <div className="flex justify-between items-center text-yellow-400"><span><Zap className="inline-block mr-2 w-5 h-5" /> Ataque</span><span className="font-bold">{figure.stats.attack}</span></div>
            <div className="flex justify-between items-center text-blue-400"><span><Shield className="inline-block mr-2 w-5 h-5" /> Velocidade</span><span className="font-bold">{figure.stats.speed}</span></div>
          </div>
        </div>

        {/* Painel Direito (Tabs) */}
        <div className="w-2/3 p-6 flex flex-col">
          <div className="flex border-b border-slate-700 mb-4">
            <button onClick={() => setActiveTab('biografia')} className={cn("px-4 py-2 text-lg", activeTab === 'biografia' ? 'text-cyan-300 border-b-2 border-cyan-300' : 'text-gray-400')}>Biografia</button>
            <button onClick={() => setActiveTab('papel')} className={cn("px-4 py-2 text-lg", activeTab === 'papel' ? 'text-cyan-300 border-b-2 border-cyan-300' : 'text-gray-400')}>Papel na Crise</button>
            <button onClick={() => setActiveTab('habilidade')} className={cn("px-4 py-2 text-lg", activeTab === 'habilidade' ? 'text-cyan-300 border-b-2 border-cyan-300' : 'text-gray-400')}>Habilidade</button>
          </div>
          <ScrollArea className="flex-grow pr-4">
            {renderTabContent()}
          </ScrollArea>
        </div>

        {/* Botão de Fechar */}
        <Button onClick={onClose} variant="ghost" size="icon" className="absolute top-4 right-4 text-gray-400 hover:text-white">
          <X className="w-6 h-6" />
        </Button>
      </motion.div>
    </motion.div>
  );
};

export default FigureDetail;