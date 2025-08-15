import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Key, Sparkles, Trophy } from 'lucide-react';
import { Badge } from './ui/badge';
import { HistoricalFigure } from '../types/crisisDataTypes';
import { cn } from '@/lib/utils';
import { getFigureImageUrl } from '@/lib/imageLoader';

const rarityStyles: { [key: string]: { base: string; bg: string; text: string; shadow: string; } } = {
  "Comum":    { base: "border-gray-500", bg: "bg-gray-600", text: "text-gray-300", shadow: "shadow-gray-500/20" },
  "Raro":     { base: "border-blue-500", bg: "bg-blue-600", text: "text-blue-300", shadow: "shadow-blue-500/20" },
  "Épico":    { base: "border-purple-500", bg: "bg-purple-600", text: "text-purple-300", shadow: "shadow-purple-500/20" },
  "Lendário": { base: "border-yellow-500", bg: "bg-yellow-600", text: "text-yellow-300", shadow: "shadow-yellow-500/20" },
};

const Particle = ({ i, rarityColor }: { i: number; rarityColor: string }) => {
  const angle = (i / 24) * 2 * Math.PI;
  const radius = 150 + Math.random() * 100;
  return (
    <motion.div
      className="absolute w-2 h-2 rounded-full"
      style={{ backgroundColor: rarityColor }}
      initial={{ scale: 0, x: 0, y: 0 }}
      animate={{ x: Math.cos(angle) * radius, y: Math.sin(angle) * radius, scale: [1, 0.5, 0], opacity: [1, 0] }}
      transition={{ duration: 0.8, delay: 0.1, ease: 'easeOut' }}
    />
  );
};

const GodRay = ({ i, rarityColor }: { i: number; rarityColor: string }) => (
  <motion.div
    className="absolute top-1/2 left-1/2 w-1 h-96 origin-top"
    style={{ rotate: i * 45, background: `linear-gradient(to top, transparent, ${rarityColor}99, transparent)` }}
    initial={{ opacity: 0, scaleY: 0 }}
    animate={{ opacity: [0, 0.4, 0.1], scaleY: 1.5 }}
    transition={{ duration: 1, delay: 0.2 }}
  />
);

interface LootboxProps {
  figure: HistoricalFigure;
  onCollect: () => void;
}

const Lootbox: React.FC<LootboxProps> = ({ figure, onCollect }) => {
  const [animationState, setAnimationState] = useState<'shaking' | 'cracking' | 'revealing'>('shaking');
  const styles = rarityStyles[figure.rarity];

  useEffect(() => {
    const shakeTimer = setTimeout(() => setAnimationState('cracking'), 2500);
    const revealTimer = setTimeout(() => setAnimationState('revealing'), 2700);
    return () => {
      clearTimeout(shakeTimer);
      clearTimeout(revealTimer);
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-lg flex items-center justify-center z-[100] p-4 overflow-hidden">
      <AnimatePresence>
        {animationState === 'shaking' && (
          <motion.div
            key="shaking-box"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1, x: [0, -2, 2, -3, 3, 0], y: [0, 2, -2, 3, -3, 0] }}
            exit={{ scale: 1.5, opacity: 0 }}
            transition={{ x: { repeat: Infinity, duration: 0.2 }, y: { repeat: Infinity, duration: 0.2 } }}
            className="w-48 h-48 bg-gradient-to-br from-slate-700 to-slate-900 rounded-lg shadow-2xl flex items-center justify-center border-2 border-cyan-400"
            style={{boxShadow: `0 0 20px ${styles.base.replace('border-', '')}`}}
          >
            <Key className="w-24 h-24 text-yellow-400" />
            <Sparkles className="absolute w-24 h-24 text-white/80 animate-ping opacity-50" />
          </motion.div>
        )}

        {animationState === 'cracking' && (
          <motion.div key="flash" className="absolute inset-0">
            <motion.div className="absolute inset-0 bg-white" initial={{ opacity: 0 }} animate={{ opacity: [0, 1, 0] }} transition={{ duration: 0.2 }} />
            <div className="w-full h-full flex items-center justify-center">
              {[...Array(24)].map((_, i) => <Particle key={i} i={i} rarityColor={styles.base.replace('border-', '')} />)}
            </div>
          </motion.div>
        )}

        {animationState === 'revealing' && (
          <motion.div key="reveal-card" initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', damping: 15, stiffness: 100 }}>
            <div className="relative flex items-center justify-center">
              <motion.div className="absolute w-full h-full" animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}>
                {[...Array(8)].map((_, i) => <GodRay key={i} i={i} rarityColor={styles.base.replace('border-', '')} />)}
              </motion.div>
              <Card className={cn("bg-slate-900/95 text-center max-w-sm w-full shadow-2xl border relative", styles.base, styles.shadow)}>
                <div className="p-6">
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <Trophy className="w-12 h-12 mx-auto text-yellow-400 mb-4" />
                    <h2 className="text-2xl font-bold text-white mb-2">Figura Desbloqueada!</h2>
                  </motion.div>
                  <motion.img initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.4, type: 'spring', stiffness: 150 }} src={getFigureImageUrl(figure.image)} alt={figure.name} className={cn("w-32 h-32 object-cover rounded-full mx-auto my-4 border-4", styles.base)} />
                  <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
                    <h3 className="text-3xl font-bold text-white">{figure.name}</h3>
                    <Badge variant="outline" className={cn("mt-2", styles.base, styles.text, styles.bg.replace('/20', '/10'), figure.rarity === 'Lendário' && 'animate-pulse')}>{figure.rarity}</Badge>
                    <p className="text-gray-300 mt-4 text-sm">{figure.description}</p>
                  </motion.div>
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
                    <Button onClick={onCollect} className={cn("mt-6 w-full text-white", styles.bg.replace('/10', '/60'), `hover:${styles.bg.replace('/10', '/70')}`)}>Coletar</Button>
                  </motion.div>
                </div>
              </Card>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Lootbox;