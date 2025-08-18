import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HistoricalFigure } from '../types/crisisDataTypes';
import { getFigureImageUrl } from '@/lib/imageLoader';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
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
const BattleUI = ({ agent, hp, maxHp }: { agent: any; hp: number; maxHp: number }) => (
    <div className='w-[45%] p-2 flex flex-col items-start'>
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
const KeyPrompt = ({ char }: { char: string }) => (
  <div className="w-16 h-16 bg-slate-900 border-4 border-slate-600 rounded-lg flex items-center justify-center text-4xl font-bold text-white">
    {char.toUpperCase()}
  </div>
);
const TimingBar = ({ duration, onComplete }: { duration: number; onComplete: () => void }) => (
  <motion.div
    key={duration}
    className="h-2 bg-gradient-to-r from-yellow-400 to-red-500 rounded-full"
    initial={{ width: '100%' }}
    animate={{ width: '0%' }}
    transition={{ duration, ease: 'linear' }}
    onAnimationComplete={onComplete}
  />
);
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
  const [playerInput, setPlayerInput] = useState<string[]>([]);
  const [turn, setTurn] = useState(1);
  const [showDamage, setShowDamage] = useState<{ target: 'player' | 'opponent', amount: number } | null>(null);
  const [feedback, setFeedback] = useState<'perfect' | 'great' | 'ok' | 'miss' | ''>('');
  
  const timerDuration = Math.max(1.5, 3 - (turn * 0.2));

  const generateSequence = useCallback(() => {
    const keys = ['w', 'a', 's', 'd'];
    const length = Math.min(8, 2 + turn);
    setSequence(Array.from({ length }, () => keys[Math.floor(Math.random() * keys.length)]));
    setPlayerInput([]);
  }, [turn]);

  const handleTurnResult = useCallback(async (damageMultiplier: number) => {
    setGameState('processing');
    let feedbackMsg: 'perfect' | 'great' | 'ok' | 'miss' = 'miss';

    if (damageMultiplier > 0) {
        const damage = Math.round(playerAgent.stats.attack * damageMultiplier);
        if (damageMultiplier === 1.5) feedbackMsg = 'perfect';
        else if (damageMultiplier === 1.0) feedbackMsg = 'great';
        else feedbackMsg = 'ok';
        
        setMessage('Ação bem-sucedida!');
        await delay(500);
        setShowDamage({ target: 'opponent', amount: damage });
        setOpponentHp(prev => Math.max(0, prev - damage));
        await delay(1000);
    } else {
        setMessage('Falha na execução!');
        await delay(1500);
    }
    setFeedback(feedbackMsg);

    if (opponentHp - (playerAgent.stats.attack * damageMultiplier) <= 0) {
        setMessage(`${opponent.name} foi superado!`);
        setGameState('won');
        return;
    }

    await delay(1000);
    setMessage(`${opponent.name} responde!`);
    await delay(1000);
    const opponentDamage = opponent.stats.attack;
    setShowDamage({ target: 'player', amount: opponentDamage });
    setPlayerHp(prev => Math.max(0, prev - opponentDamage));
    await delay(1000);

    if (playerHp - opponentDamage <= 0) {
        setMessage(`${playerAgent.name} foi derrotado!`);
        setGameState('lost');
        return;
    }
    
    await delay(1000);
    setTurn(t => t + 1);
    generateSequence();
    setMessage('Prepare-se...');
    setGameState('player_turn');
  }, [opponent, opponentHp, playerAgent, playerHp, generateSequence]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== 'player_turn' || !sequence.length) return;
      const key = e.key.toLowerCase();
      if (['w', 'a', 's', 'd'].includes(key)) {
        const newInput = [...playerInput, key];
        if (newInput[newInput.length - 1] !== sequence[newInput.length - 1]) {
          handleTurnResult(0);
        } else {
          setPlayerInput(newInput);
          if (newInput.length === sequence.length) {
            const timeBar = document.getElementById('timing-bar')?.firstChild as HTMLElement;
            const timeLeftPercentage = (timeBar.offsetWidth / (timeBar.parentElement?.offsetWidth || 1)) * 100;
            if (timeLeftPercentage > 75) handleTurnResult(1.5);
            else if (timeLeftPercentage > 25) handleTurnResult(1.0);
            else handleTurnResult(0.5);
          }
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, playerInput, sequence, handleTurnResult]);
  
  useEffect(() => {
    if (gameState === 'intro') setTimeout(() => { generateSequence(); setGameState('player_turn'); }, 2000);
    else if (gameState === 'won') setTimeout(onWin, 2000);
    else if (gameState === 'lost') setTimeout(onLose, 2000);
  }, [gameState, onWin, onLose, generateSequence]);

  return (
    <div className="fixed inset-0 bg-black z-[100] flex items-center justify-center p-4 font-mono">
      <div className="w-full max-w-4xl aspect-video bg-gray-900 border-8 border-gray-700 rounded-lg flex flex-col relative overflow-hidden bg-[url('/src/assets/battle_bg.png')] bg-cover">
        <div className="absolute inset-0 flex justify-center items-center"><img src={vs_image} alt="Versus" className="w-32 h-32 opacity-50" /></div>
        <div className="flex-grow relative flex justify-between items-center px-8 pt-20">
          <div className="relative"><AnimatePresence>{showDamage?.target === 'player' && <DamageNumber damage={showDamage.amount} />}</AnimatePresence><img src={getFigureImageUrl(playerAgent.image)} className="h-48 w-48 object-cover" alt={playerAgent.name} /></div>
          <div className="relative"><AnimatePresence>{showDamage?.target === 'opponent' && <DamageNumber damage={showDamage.amount} />}</AnimatePresence><img src={getFigureImageUrl(opponent.image)} className="h-48 w-48 object-cover" alt={opponent.name} /></div>
        </div>
        <div className="absolute top-0 left-0 right-0 flex justify-between"><BattleUI agent={opponent} hp={opponentHp} maxHp={opponent.stats.hp} /><BattleUI agent={playerAgent} hp={playerHp} maxHp={playerAgent.stats.hp} /></div>
        <div className="h-1/3 bg-slate-800 border-t-8 border-slate-700 p-4 text-white text-xl flex flex-col items-center justify-center">
          {gameState === 'player_turn' ? (
              <div className="w-full max-w-md text-center">
                  <div className="flex justify-center gap-2 mb-4">
                      {sequence.map((char, i) => (
                          <div key={i} className="relative">
                              <KeyPrompt char={char} />
                              {playerInput[i] && (<motion.div initial={{scale:0}} animate={{scale:1}} className="absolute inset-0 bg-green-500/50 rounded-lg" />)}
                          </div>
                      ))}
                  </div>
                  <div id="timing-bar" className="w-full bg-slate-600 rounded-full"><TimingBar duration={timerDuration} onComplete={() => handleTurnResult(0)} /></div>
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


