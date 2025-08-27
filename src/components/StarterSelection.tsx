import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { HistoricalFigure } from '../types/crisisDataTypes';
import { getFigureImageUrl } from '@/lib/imageLoader';
import { cn } from '@/lib/utils';
import { TypeAnimation } from 'react-type-animation';

const rarityStyles: { [key: string]: string } = {
  "Comum": "border-gray-500 text-gray-300",
  "Raro": "border-blue-500 text-blue-300",
  "Épico": "border-purple-500 text-purple-300",
  "Lendário": "border-yellow-500 text-yellow-300",
};

interface StarterSelectionProps {
  starters: HistoricalFigure[];
  onSelect: (figureId: string) => void;
}

const StarterSelection: React.FC<StarterSelectionProps> = ({ starters, onSelect }) => {
  const [selected, setSelected] = useState<HistoricalFigure | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  const handleConfirm = () => {
    if (selected) {
      setConfirmed(true);
      setTimeout(() => onSelect(selected.id), 1500);
    }
  };

  return (
    <div className="w-screen h-screen bg-slate-950 overflow-hidden flex flex-col p-8">
      <div className="animated-grid-background" />
      <div className="noise-overlay" />

      {/* Top text */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center z-10 mb-8"
      >
        <h1 className="text-4xl md:text-5xl font-bold text-cyan-200 tracking-wider">
          ESCOLHA SEU PRIMEIRO AGENTE
        </h1>
        <div className="text-lg text-cyan-400 mt-2 h-6">
          <TypeAnimation
            sequence={[
              'Sua primeira escolha definirá o início da sua análise.',
              2000,
              'Selecione um dossiê para revisar.',
              5000,
            ]}
            wrapper="span"
            speed={50}
            cursor={true}
            repeat={Infinity}
          />
        </div>
      </motion.div>

      {/* Grid of agents */}
      <div className="flex-1 overflow-y-auto z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8 justify-items-center">
          {starters.slice(0, 10).map((figure, index) => (
            <motion.div
              key={figure.id}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 * index }}
              whileHover={{ scale: 1.05, y: -10 }}
              className={cn(
                'p-6 border-2 rounded-xl bg-black/40 backdrop-blur-md w-64 text-center cursor-pointer transition-all duration-300',
                selected?.id === figure.id
                  ? `shadow-2xl ${rarityStyles[figure.rarity]}`
                  : 'border-slate-700 hover:border-cyan-400'
              )}
              onClick={() => setSelected(figure)}
            >
              <img
                src={getFigureImageUrl(figure.image)}
                alt={figure.name}
                className={cn(
                  'w-28 h-28 object-cover rounded-full mx-auto mb-4 border-4 transition-all',
                  selected?.id === figure.id
                    ? rarityStyles[figure.rarity]
                    : 'border-slate-600'
                )}
              />
              <h2 className="text-xl font-bold text-white">{figure.name}</h2>
              <Badge
                variant="outline"
                className={cn('mt-2', rarityStyles[figure.rarity])}
              >
                {figure.rarity}
              </Badge>
              <p className="text-sm text-gray-400 mt-4 h-24 overflow-hidden">
                {figure.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Bottom button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: selected ? 1 : 0 }}
        transition={{ duration: 0.5 }}
        className="z-10 mt-6 flex justify-center"
      >
        <Button
          onClick={handleConfirm}
          disabled={!selected || confirmed}
          size="lg"
          className={cn(
            'text-xl px-12 py-6 text-white transition-all',
            selected &&
              `bg-opacity-50 ${rarityStyles[selected.rarity]
                .replace('text-', 'bg-')
                .replace('border-', 'bg-')}`,
            confirmed && 'bg-green-600'
          )}
        >
          {confirmed
            ? 'AGENTE CONFIRMADO'
            : `CONFIRMAR ${selected?.name.toUpperCase()}`}
        </Button>
      </motion.div>
    </div>
  );
};

export default StarterSelection;
