
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Key, Sparkles, Trophy } from 'lucide-react';
import { Badge } from './ui/badge';
import { HistoricalFigure } from '../types/crisisDataTypes';

// Importe as imagens das figuras
import figure_hitler from '../assets/figure_hitler.jpg';
// ... importe todas as outras imagens de figuras aqui

const figureImageMap: { [key: string]: string } = {
  'figure_hitler.jpg': figure_hitler,
  // ... mapeie todas as outras imagens aqui
};


const rarityStyles: { [key: string]: string } = {
  "Comum": "bg-gray-500/20 text-gray-300 border-gray-500",
  "Raro": "bg-blue-500/20 text-blue-300 border-blue-500",
  "Épico": "bg-purple-500/20 text-purple-300 border-purple-500",
  "Lendário": "bg-yellow-500/20 text-yellow-300 border-yellow-500",
};

interface LootboxProps {
  figure: HistoricalFigure;
  onCollect: () => void;
}

const Lootbox: React.FC<LootboxProps> = ({ figure, onCollect }) => {
  const [isRevealed, setIsRevealed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsRevealed(true), 2500);
    return () => clearTimeout(timer);
  }, []);

  const rarityColor = rarityStyles[figure.rarity].split(' ')[2].replace('border-', '');

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-lg flex items-center justify-center z-[100] p-4">
      {!isRevealed ? (
        <motion.div
          animate={{ rotate: [0, -15, 15, -15, 0], scale: [1, 1.1, 1, 1.1, 1] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          className="w-48 h-48 bg-gradient-to-br from-slate-700 to-slate-900 rounded-lg shadow-2xl shadow-cyan-500/30 flex items-center justify-center border-2 border-cyan-400"
        >
          <Key className="w-24 h-24 text-yellow-400" />
          <Sparkles className="absolute w-24 h-24 text-white/80 animate-ping opacity-50" />
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>
          <Card className={`bg-slate-900 border-${rarityColor}/50 text-center max-w-sm w-full shadow-2xl shadow-${rarityColor}/20`}>
            <div className="p-6">
              <Trophy className="w-12 h-12 mx-auto text-yellow-400 mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">Figura Desbloqueada!</h2>
              <img src={figureImageMap[figure.image]} alt={figure.name} className={`w-32 h-32 rounded-full mx-auto my-4 border-4 border-${rarityColor}`} />
              <h3 className="text-3xl font-bold text-white">{figure.name}</h3>
              <Badge className={`mt-2 ${rarityStyles[figure.rarity]}`}>{figure.rarity}</Badge>
              <p className="text-gray-400 mt-4 text-sm">{figure.description}</p>
              <Button onClick={onCollect} className={`mt-6 w-full bg-${rarityColor} hover:bg-${rarityColor}/80`}>Coletar</Button>
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

export default Lootbox;