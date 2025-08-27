// src/components/TutorialOverlay.tsx
import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Key } from 'lucide-react';

interface TutorialOverlayProps {
  onFinish?: () => void;
}

const TutorialOverlay: React.FC<TutorialOverlayProps> = ({ onFinish }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onFinish) onFinish();
    }, 5000); // 5 segundos
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 z-30 flex items-center justify-center text-center p-8 font-mono"
    >
      <div className="flex flex-col items-center">
        <Key className="w-16 h-16 text-yellow-400 mb-6 animate-bounce" />
        <h2 className="text-3xl font-bold text-white">Primeira Tarefa</h2>
        <p className="text-slate-300 max-w-md mt-2 text-lg">
          Sua primeira diretriz é abrir o cofre inicial para obter seu segundo
          agente e formar a base do seu esquadrão.
        </p>
      </div>
    </motion.div>
  );
};

export default TutorialOverlay;
