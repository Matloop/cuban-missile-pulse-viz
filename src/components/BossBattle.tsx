// src/components/BossBattle.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from './ui/button'; // Assumindo que você tem este componente Button

interface BossBattleProps {
  onWin: () => void;
  onLose: () => void;
  // Você pode adicionar props para passar dados do chefão aqui, se necessário (ex: bossFigure: HistoricalFigure)
}

const BossBattle: React.FC<BossBattleProps> = ({ onWin, onLose }) => {
  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[200] flex items-center justify-center p-4 font-mono">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        className="bg-slate-900 border-2 border-red-500 rounded-lg p-8 text-center max-w-lg shadow-xl"
      >
        <h2 className="text-4xl font-bold text-red-400 mb-4">BATALHA FINAL: O CONFRONTO DECISIVO!</h2>
        <p className="text-lg text-gray-300 mb-6">
          Prepare-se para o minigame final! O destino do mundo está em suas mãos.
        </p>
        <div className="space-x-4">
          {/* Estes botões são apenas para depuração. Você os removerá quando seu minigame estiver pronto. */}
          <Button size="lg" className="bg-green-600 hover:bg-green-700" onClick={onWin}>
            Simular Vitória (DEBUG)
          </Button>
          <Button size="lg" className="bg-red-600 hover:bg-red-700" onClick={onLose}>
            Simular Derrota (DEBUG)
          </Button>
        </div>
        <p className="text-sm text-gray-500 mt-4"> (Este é um placeholder para o minigame real) </p>
      </motion.div>
    </div>
  );
};

export default BossBattle;