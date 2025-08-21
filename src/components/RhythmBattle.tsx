import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HistoricalFigure } from '../types/crisisDataTypes';
import { getFigureImageUrl } from '@/lib/imageLoader';
import { cn } from '@/lib/utils';
import { Button } from './ui/button'; // Embora não usado, mantido se precisar no futuro
import { Heart, Key, Trophy, Swords } from 'lucide-react';
import vs_image from '../assets/vs.png';

// --- COMPONENTES DA UI DA BATALHA (HP, etc.) ---
const HPBar = ({ currentHp, maxHp }: { currentHp: number; maxHp: number }) => {
  const percentage = Math.max(0, (currentHp / maxHp) * 100);
  const color = percentage > 50 ? 'bg-green-500' : percentage > 20 ? 'bg-yellow-500' : 'bg-red-500';
  return (
    <div className='w-full bg-slate-700 rounded-full h-4 border-2 border-slate-800 mt-1'>
      <motion.div className={cn('h-full rounded-full', color)} animate={{ width: `${percentage}%` }} transition={{ duration: 0.5, ease: 'easeOut' }} />
    </div>
  );
};
const BattleUI = ({ agent, hp, maxHp, alignLeft = false }: { agent: any; hp: number; maxHp: number; alignLeft?: boolean }) => (
    <div className={`w-[45%] p-2 flex flex-col ${alignLeft ? 'items-start' : 'items-end'}`}>
      <div className="bg-slate-800/80 p-2 border-2 border-slate-600 rounded-lg w-full max-w-xs">
        <div className="flex justify-between font-bold text-white text-lg">
          <span>{agent.name}</span>
          <span>HP: {Math.max(0, Math.ceil(hp))}</span>
        </div>
        <HPBar currentHp={hp} maxHp={maxHp} />
      </div>
    </div>
);
const DamageNumber = ({ damage }: { damage: number }) => (
  <motion.div key={Date.now()} initial={{ y: 0, opacity: 1, scale: 1.5 }} animate={{ y: -50, opacity: 0, scale: 2.5 }} transition={{ duration: 1, ease: 'easeOut' }} className="absolute text-red-500 text-4xl font-bold" style={{ textShadow: '2px 2px #000' }}>
    -{damage}
  </motion.div>
);
const KeyPrompt = ({ char, isCompleted }: { char: string; isCompleted: boolean }) => (
    <div className="relative w-16 h-16 bg-slate-900 border-4 border-slate-600 rounded-lg flex items-center justify-center text-4xl font-bold text-white">
      {char.toUpperCase()}
      {isCompleted && (
        <motion.div 
          initial={{ scale: 0 }} 
          animate={{ scale: 1 }} 
          className="absolute inset-0 bg-green-500/50 rounded-md" 
        />
      )}
    </div>
);
const TimingBar = ({ duration, onComplete, isPaused }: { duration: number; onComplete: () => void; isPaused: boolean }) => (
  <motion.div
    key={Date.now()} // Força a re-renderização
    className="h-2 bg-gradient-to-r from-yellow-400 to-red-500 rounded-full"
    initial={{ width: '100%' }}
    animate={{ width: isPaused ? '100%' : '0%' }} // Pausa a animação se necessário
    transition={{ duration, ease: 'linear' }}
    onAnimationComplete={() => { if (!isPaused) onComplete(); }}
  />
);
const FeedbackMessage = ({ text }: { text: string }) => {
    let color = 'text-yellow-300';
    if (text === 'PERFEITO!') color = 'text-cyan-300';
    if (text === 'MISS!') color = 'text-red-400';

    return (
        <motion.div
            key={Date.now()}
            initial={{ y: 20, opacity: 0, scale: 0.8 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -20, opacity: 0, scale: 0.8 }}
            className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-5xl font-extrabold ${color}`}
            style={{ textShadow: '2px 2px 4px #000' }}
        >
            {text}
        </motion.div>
    );
};
// --- FIM DOS COMPONENTES DA UI ---

interface RhythmBattleProps {
  playerAgent: HistoricalFigure;
  opponent: any;
  onWin: () => void;
  onLose: () => void;
}

const RhythmBattle: React.FC<RhythmBattleProps> = ({ playerAgent, opponent, onWin, onLose }) => {
  const [playerHp, setPlayerHp] = useState(playerAgent.stats.hp);
  const [opponentHp, setOpponentHp] = useState(opponent.stats.hp);
  const [message, setMessage] = useState(`${opponent.name} te desafia!`);
  const [gameState, setGameState] = useState<'intro' | 'player_turn' | 'processing' | 'won' | 'lost'>('intro');
  const [sequence, setSequence] = useState<string[]>([]);
  const [playerInputIndex, setPlayerInputIndex] = useState(0);
  const [turn, setTurn] = useState(1);
  const [showDamage, setShowDamage] = useState<{ target: 'player' | 'opponent', amount: number } | null>(null);
  const [feedback, setFeedback] = useState<string>('');
  
  const timerDuration = 3;

  const generateSequence = useCallback(() => {
    const keys = ['w', 'a', 's', 'd'];
    const length = Math.min(8, 2 + Math.floor(turn / 2)); // Aumenta a dificuldade mais devagar
    setSequence(Array.from({ length }, () => keys[Math.floor(Math.random() * keys.length)]));
    setPlayerInputIndex(0);
    setFeedback(''); // Limpa o feedback
  }, [turn]);

  const handleTurnResult = useCallback(async (damageMultiplier: number) => {
    setGameState('processing');
    let feedbackMsg = '';
    
    // Reseta o dano para limpar a UI
    setShowDamage(null);

    if (damageMultiplier > 0) {
        const damage = Math.round(playerAgent.stats.attack * damageMultiplier);
        if (damageMultiplier === 1.5) feedbackMsg = 'PERFEITO!';
        else if (damageMultiplier === 1.0) feedbackMsg = 'ÓTIMO!';
        else feedbackMsg = 'OK';
        
        setFeedback(feedbackMsg);
        setMessage('Ação bem-sucedida!');
        await delay(800);
        
        setShowDamage({ target: 'opponent', amount: damage });
        const newOpponentHp = opponentHp - damage;
        setOpponentHp(Math.max(0, newOpponentHp));

        if (newOpponentHp <= 0) {
            await delay(1000);
            setMessage(`${opponent.name} foi superado!`);
            setGameState('won');
            return;
        }

    } else {
        feedbackMsg = 'MISS!';
        setFeedback(feedbackMsg);
        setMessage('Falha na execução!');
        await delay(1500);
    }
    
    await delay(1000);
    setFeedback(''); // Limpa o feedback antes do ataque do oponente
    
    // Ataque do oponente
    setMessage(`${opponent.name} responde!`);
    await delay(1000);
    const opponentDamage = Math.round(opponent.stats.attack * (0.8 + Math.random() * 0.4)); // Dano variável
    setShowDamage({ target: 'player', amount: opponentDamage });
    const newPlayerHp = playerHp - opponentDamage;
    setPlayerHp(Math.max(0, newPlayerHp));

    if (newPlayerHp <= 0) {
        await delay(1000);
        setMessage(`${playerAgent.name} foi derrotado!`);
        setGameState('lost');
        return;
    }
    
    await delay(1000);
    setTurn(t => t + 1);
    setMessage('Prepare-se...');
    await delay(1000); // Pequeno delay antes de mostrar a nova sequência
    generateSequence();
    setGameState('player_turn');

  }, [opponent, opponentHp, playerAgent, playerHp, generateSequence]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== 'player_turn' || !sequence.length || playerInputIndex >= sequence.length) return;
      
      const key = e.key.toLowerCase();
      
      if (key === sequence[playerInputIndex]) {
        // Acertou a tecla
        const newIndex = playerInputIndex + 1;
        setPlayerInputIndex(newIndex);
        
        if (newIndex === sequence.length) {
          // Completou a sequência, calcula o bônus de tempo
          const timeBar = document.getElementById('timing-bar')?.firstChild as HTMLElement;
          if (timeBar) {
            const timeLeftPercentage = (timeBar.offsetWidth / (timeBar.parentElement?.offsetWidth || 1)) * 100;
            if (timeLeftPercentage > 75) handleTurnResult(1.5); // Perfeito
            else if (timeLeftPercentage > 25) handleTurnResult(1.0); // Ótimo
            else handleTurnResult(0.5); // Ok
          } else {
            handleTurnResult(1.0); // Fallback se a barra não for encontrada
          }
        }
      } else if (['w', 'a', 's', 'd'].includes(key)) {
        // Errou a tecla
        handleTurnResult(0);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, playerInputIndex, sequence, handleTurnResult]);
  
  useEffect(() => {
    if (gameState === 'intro') {
      setTimeout(() => {
        generateSequence();
        setGameState('player_turn');
        setMessage('Siga a sequência!');
      }, 2000);
    } else if (gameState === 'won') {
      setTimeout(onWin, 2000);
    } else if (gameState === 'lost') {
      setTimeout(onLose, 2000);
    }
  }, [gameState, onWin, onLose, generateSequence]);

  return (
    <div className="fixed inset-0 bg-black z-[100] flex items-center justify-center p-4 font-mono">
      <div className="w-full max-w-4xl aspect-video bg-gray-900 border-8 border-gray-700 rounded-lg flex flex-col relative overflow-hidden bg-[url('/src/assets/battle_bg.png')] bg-cover">
        <div className="absolute inset-0 flex justify-center items-center pointer-events-none">
            <img src={vs_image} alt="Versus" className="w-32 h-32 opacity-50" />
            <AnimatePresence>
                {feedback && <FeedbackMessage text={feedback} />}
            </AnimatePresence>
        </div>
        <div className="flex-grow relative flex justify-between items-center px-8 pt-20">
          <div className="relative">
            <AnimatePresence>{showDamage?.target === 'player' && <DamageNumber damage={showDamage.amount} />}</AnimatePresence>
            <img src={getFigureImageUrl(playerAgent.image)} className="h-48 w-48 object-cover drop-shadow-lg" alt={playerAgent.name} />
          </div>
          <div className="relative">
            <AnimatePresence>{showDamage?.target === 'opponent' && <DamageNumber damage={showDamage.amount} />}</AnimatePresence>
            <img src={getFigureImageUrl(opponent.image)} className="h-48 w-48 object-cover drop-shadow-lg" alt={opponent.name} />
          </div>
        </div>
        <div className="absolute top-0 left-0 right-0 flex justify-between">
          {/* --- CORREÇÃO DA POSIÇÃO DA UI --- */}
          <BattleUI agent={playerAgent} hp={playerHp} maxHp={playerAgent.stats.hp} alignLeft />
          <BattleUI agent={opponent} hp={opponentHp} maxHp={opponent.stats.hp} />
        </div>
        <div className="h-1/3 bg-slate-800 border-t-8 border-slate-700 p-4 text-white text-xl flex flex-col items-center justify-center">
          {gameState === 'player_turn' ? (
              <div className="w-full max-w-md text-center">
                  <p className="mb-2 text-lg">{message}</p>
                  <div className="flex justify-center gap-2 mb-4">
                      {sequence.map((char, i) => (
                          <KeyPrompt key={i} char={char} isCompleted={i < playerInputIndex} />
                      ))}
                  </div>
                  <div id="timing-bar" className="w-full bg-slate-600 rounded-full">
                      <TimingBar duration={timerDuration} onComplete={() => handleTurnResult(0)} isPaused={gameState !== 'player_turn'} />
                  </div>
              </div>
          ) : (<p className="text-2xl text-center">{message}</p>)}
        </div>
      </div>
    </div>
  );
};

export default RhythmBattle;

function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}