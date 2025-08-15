// src/components/FigureDetail.tsx

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';


import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"


import { getFigureImageUrl } from '@/lib/imageLoader';
import { cn } from '@/lib/utils';
import { X, Heart, Zap, Wind, BookUser, History, Quote, Sparkles, Badge } from 'lucide-react';
import { HistoricalFigure } from '@/types/crisisDataTypes';
import { Card, CardContent } from './card';
import { Button } from 'react-day-picker';

const rarityStyles: { [key: string]: string } = {
  "Comum": "border-gray-500 text-gray-300",
  "Raro": "border-blue-500 text-blue-300",
  "Épico": "border-purple-500 text-purple-300",
  "Lendário": "border-yellow-500 text-yellow-300",
};

interface FigureDetailProps {
  figure: HistoricalFigure;
  onClose: () => void;
}

const FigureDetail: React.FC<FigureDetailProps> = ({ figure, onClose }) => {
  const rarityClass = rarityStyles[figure.rarity] || 'border-gray-700';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[110] p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', damping: 15, stiffness: 120 }}
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking on the card
        className="relative w-full max-w-4xl"
      >
        <Card className={cn("bg-slate-900/95 border-2 w-full flex flex-col md:flex-row shadow-2xl", rarityClass)}>
          {/* Left Column: Image & Stats */}
          <div className="w-full md:w-1/3 p-6 flex flex-col items-center border-b-2 md:border-b-0 md:border-r-2" style={{ borderColor: rarityStyles[figure.rarity].replace('text-', 'border-') }}>
            <img
              src={getFigureImageUrl(figure.image)}
              alt={figure.name}
              className={cn('w-40 h-40 object-cover rounded-full border-4', rarityClass)}
            />
            <h2 className="text-3xl font-bold text-white text-center mt-4">{figure.name}</h2>
            <div className={cn('mt-2 text-lg px-4 border rounded', rarityClass)}>{figure.rarity}</div>
            
            <div className="w-full mt-6 pt-6 border-t border-slate-700 space-y-3 text-md font-mono">
              <div className="flex justify-between items-center text-red-400"><span className='flex items-center gap-2'><Heart size={18} /> VIDA</span><span className="font-bold">{figure.stats.hp}</span></div>
              <div className="flex justify-between items-center text-yellow-400"><span className='flex items-center gap-2'><Zap size={18} /> ATAQUE</span><span className="font-bold">{figure.stats.attack}</span></div>
              <div className="flex justify-between items-center text-blue-400"><span className='flex items-center gap-2'><Wind size={18} /> VELOCIDADE</span><span className="font-bold">{figure.stats.speed}</span></div>
            </div>
          </div>
          
          {/* Right Column: Detailed Info Tabs */}
          <div className="w-full md:w-2/3 p-6">
            <Tabs defaultValue="bio" className="w-full text-white">
              <TabsList className="grid w-full grid-cols-3 bg-slate-800">
                <TabsTrigger value="bio">Biografia</TabsTrigger>
                <TabsTrigger value="crisis">Papel na Crise</TabsTrigger>
                <TabsTrigger value="gameplay">Habilidade</TabsTrigger>
              </TabsList>
              <CardContent className="mt-4 px-1 text-gray-300 leading-relaxed text-sm h-80 overflow-y-auto">
                <TabsContent value="bio">
                  <h4 className="font-bold text-lg text-cyan-300 mb-2 flex items-center gap-2"><BookUser /> Biografia</h4>
                  <p>{(figure as any).bio}</p>
                </TabsContent>
                <TabsContent value="crisis">
                   <h4 className="font-bold text-lg text-cyan-300 mb-2 flex items-center gap-2"><History /> Papel na Crise</h4>
                  <p>{(figure as any).crisisRole}</p>
                </TabsContent>
                <TabsContent value="gameplay">
                  <h4 className="font-bold text-lg text-cyan-300 mb-2 flex items-center gap-2"><Sparkles /> Habilidade Passiva</h4>
                  <p className="font-semibold text-white mb-4">{(figure as any).specialTrait}</p>
                  
                  <h4 className="font-bold text-lg text-cyan-300 mb-2 mt-6 flex items-center gap-2"><Quote /> Citação</h4>
                  <blockquote className="border-l-4 border-cyan-500 pl-4 italic">
                    "{(figure as any).quote}"
                  </blockquote>
                </TabsContent>
              </CardContent>
            </Tabs>
          </div>
        </Card>
        <button onClick={onClose} className="absolute -top-3 -right-3 rounded-full bg-slate-800 hover:bg-red-600 z-10">
          <X className="h-6 w-6 text-white" />
        </button>
      </motion.div>
    </motion.div>
  );
};

export default FigureDetail;