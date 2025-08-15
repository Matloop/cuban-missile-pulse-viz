// src/components/BattleScreen.tsx

import React, { useState, useReducer, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HistoricalFigure, QuizData } from '../types/crisisDataTypes';
import { getFigureImageUrl } from '@/lib/imageLoader';
import { cn } from '@/lib/utils';
import allQuestionsData from '../data/quizQuestions.json';
import { Button } from './ui/button';
import { Trophy, Swords, X } from 'lucide-react';
import vs_image from '../assets/vs.png';

const allQuestions = Object.values(allQuestionsData).flat();

// --- UTILITIES ---
const shuffleArray = <T,>(array: T[]): T[] => {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
};
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

// --- BATTLE DATA & STATE ---

// Represents the raw data of the battle
type BattleDataState = {
  playerHp: number;
  opponentHp: number;
  currentQuestion: QuizData | null;
  message: string;
  damageToShow: { target: 'player' | 'opponent' | null; amount: number };
};

// Represents the flow/phase of the battle
type TurnState =
  | { phase: 'intro' }
  | { phase: 'playerInput' }
  | { phase: 'playerAction'; correct: boolean }
  | { phase: 'opponentAction' }
  | { phase: 'gameOver'; winner: 'player' | 'opponent' };

// Actions to update the battle data
type BattleAction =
  | { type: 'SET_QUESTION'; payload: QuizData }
  | { type: 'SET_MESSAGE'; payload: string }
  | { type: 'DEAL_DAMAGE'; payload: { target: 'player' | 'opponent'; damage: number } }
  | { type: 'CLEAR_DAMAGE' };

const battleReducer = (state: BattleDataState, action: BattleAction): BattleDataState => {
  switch (action.type) {
    case 'SET_QUESTION':
      return { ...state, currentQuestion: action.payload, message: action.payload.question };
    case 'SET_MESSAGE':
      return { ...state, message: action.payload };
    case 'DEAL_DAMAGE':
      const { target, damage } = action.payload;
      return {
        ...state,
        playerHp: target === 'player' ? Math.max(0, state.playerHp - damage) : state.playerHp,
        opponentHp: target === 'opponent' ? Math.max(0, state.opponentHp - damage) : state.opponentHp,
        damageToShow: { target, amount: damage },
      };
    case 'CLEAR_DAMAGE':
      return { ...state, damageToShow: { target: null, amount: 0 } };
    default:
      return state;
  }
};

// --- UI SUB-COMPONENTS ---
const HPDisplay: React.FC<{ agent: any; hp: number; maxHp: number }> = ({ agent, hp, maxHp }) => {
    const percentage = Math.max(0, (hp / maxHp) * 100);
    const color = percentage > 50 ? 'bg-green-500' : percentage > 20 ? 'bg-yellow-500' : 'bg-red-500';
    return (
        <div className='w-[45%] p-2'>
            <div className="bg-slate-800/90 p-3 border-2 border-slate-600 rounded-lg">
                <div className="flex justify-between font-bold text-white text-lg mb-2">
                    <span>{agent.name}</span>
                    <span>HP: {Math.max(0, Math.ceil(hp))}</span>
                </div>
                <div className='w-full bg-slate-700 rounded-full h-4 border border-slate-800'>
                    <motion.div className={cn('h-full rounded-full', color)} initial={{width: '100%'}} animate={{ width: `${percentage}%` }} transition={{ duration: 0.5 }} />
                </div>
            </div>
        </div>
    );
};

const DamageNumber: React.FC<{ damage: number }> = ({ damage }) => (
    <motion.div
        key={Date.now()}
        initial={{ y: 0, opacity: 1, scale: 1.5 }}
        animate={{ y: -60, opacity: 0, scale: 2.5 }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
        className="absolute text-red-500 text-4xl font-bold"
        style={{ textShadow: '2px 2px 0 #000' }}
    >
        -{damage}
    </motion.div>
);

// --- MAIN BATTLE COMPONENT ---
interface BattleScreenProps {
  playerAgent: HistoricalFigure;
  opponent: any;
  onWin: () => void;
  onLose: () => void;
}

const BattleScreen: React.FC<BattleScreenProps> = ({ playerAgent, opponent, onWin, onLose }) => {
  const initialState: BattleDataState = {
    playerHp: playerAgent.stats.hp,
    opponentHp: opponent.stats.hp,
    currentQuestion: null,
    message: `${opponent.name} te desafia!`,
    damageToShow: { target: null, amount: 0 },
  };

  const [battleData, dispatch] = useReducer(battleReducer, initialState);
  const [turnState, setTurnState] = useState<TurnState>({ phase: 'intro' });

  // The Game Engine: Controls the flow of the battle based on the current phase.
  useEffect(() => {
    if (turnState.phase === 'gameOver') return; // Stop the engine if the game is over.

    const processTurn = async () => {
      dispatch({ type: 'CLEAR_DAMAGE' });
      await delay(500);

      switch (turnState.phase) {
        case 'intro':
          await delay(1500);
          setTurnState({ phase: 'playerInput' });
          break;

        case 'playerInput':
          dispatch({ type: 'SET_QUESTION', payload: shuffleArray(allQuestions)[0] });
          break;

        case 'playerAction':
          if (turnState.correct) {
            dispatch({ type: 'SET_MESSAGE', payload: 'Correto! Você ataca!' });
            await delay(1000);
            dispatch({ type: 'DEAL_DAMAGE', payload: { target: 'opponent', damage: playerAgent.stats.attack } });
            await delay(1500);
            if (battleData.opponentHp - playerAgent.stats.attack <= 0) {
              setTurnState({ phase: 'gameOver', winner: 'player' });
            } else {
              setTurnState({ phase: 'opponentAction' });
            }
          } else {
            dispatch({ type: 'SET_MESSAGE', payload: 'Incorreto! O oponente avança!' });
            await delay(1500);
            setTurnState({ phase: 'opponentAction' });
          }
          break;

        case 'opponentAction':
          dispatch({ type: 'SET_MESSAGE', payload: `${opponent.name} contra-ataca!` });
          await delay(1000);
          dispatch({ type: 'DEAL_DAMAGE', payload: { target: 'player', damage: opponent.stats.attack } });
          await delay(1500);
          if (battleData.playerHp - opponent.stats.attack <= 0) {
            setTurnState({ phase: 'gameOver', winner: 'opponent' });
          } else {
            setTurnState({ phase: 'playerInput' });
          }
          break;
      }
    };
    processTurn();
  }, [turnState]); // This effect runs only when the battle phase changes.

  const handleAnswer = (answerIndex: number) => {
    if (turnState.phase !== 'playerInput' || !battleData.currentQuestion) return;
    const correct = answerIndex === battleData.currentQuestion.correctAnswer;
    setTurnState({ phase: 'playerAction', correct });
  };

  // --- RENDER ---

  if (turnState.phase === 'gameOver') {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
        <motion.div initial={{opacity: 0, scale: 0.8}} animate={{opacity: 1, scale: 1}} transition={{delay: 0.2}}
          className={`text-center text-white p-8 bg-slate-900 border-2 ${turnState.winner === 'player' ? 'border-yellow-500' : 'border-red-500'} rounded-lg max-w-md shadow-2xl`}
        >
          {turnState.winner === 'player' ? <Trophy className="w-20 h-20 text-yellow-400 mx-auto" /> : <X className="w-20 h-20 text-red-400 mx-auto" />}
          <h1 className="text-4xl font-bold mt-4">{turnState.winner === 'player' ? 'VITÓRIA!' : 'DERROTA'}</h1>
          <p className="text-lg text-gray-300 mt-2">{turnState.winner === 'player' ? 'Ameaça neutralizada.' : 'Agente comprometido.'}</p>
          <Button size="lg" className="mt-8 w-full" onClick={turnState.winner === 'player' ? onWin : onLose}>
            Continuar
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black z-[100] flex items-center justify-center p-4 font-mono">
      <div className="w-full max-w-4xl aspect-video bg-gray-900 border-8 border-gray-700 rounded-lg flex flex-col relative overflow-hidden bg-[url('/src/assets/battle_bg.png')] bg-cover">
        <div className="absolute inset-0 flex justify-center items-center pointer-events-none">
          <img src={vs_image} alt="Versus" className="w-32 h-32 opacity-50" />
        </div>
        
        <div className="flex-grow relative flex justify-between items-center px-8 pt-20">
          <div className="relative flex flex-col items-center">
            <AnimatePresence>
              {battleData.damageToShow.target === 'player' && <DamageNumber damage={battleData.damageToShow.amount} />}
            </AnimatePresence>
            <img src={getFigureImageUrl(playerAgent.image)} className="h-48 w-48 object-cover drop-shadow-lg" alt={playerAgent.name} />
          </div>
          <div className="relative flex flex-col items-center">
             <AnimatePresence>
              {battleData.damageToShow.target === 'opponent' && <DamageNumber damage={battleData.damageToShow.amount} />}
            </AnimatePresence>
            <img src={getFigureImageUrl(opponent.image)} className="h-48 w-48 object-cover drop-shadow-lg" alt={opponent.name} />
          </div>
        </div>
        
        <div className="absolute top-0 left-0 right-0 flex justify-between">
          <HPDisplay agent={playerAgent} hp={battleData.playerHp} maxHp={playerAgent.stats.hp} />
          <HPDisplay agent={opponent} hp={battleData.opponentHp} maxHp={opponent.stats.hp} />
        </div>
        
        <div className="h-1/3 bg-slate-800 border-t-8 border-slate-700 p-4 flex flex-col justify-center">
           <AnimatePresence mode="wait">
            <motion.div key={battleData.message} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{duration: 0.2}}>
              {turnState.phase === 'playerInput' && battleData.currentQuestion ? (
                 <div className="text-white">
                  <p className="text-lg mb-4">{battleData.currentQuestion.question}</p>
                  <div className="grid grid-cols-2 gap-3 text-base">
                    {battleData.currentQuestion.options.map((option, index) => (
                      <Button
                        key={`${battleData.currentQuestion?.id}-${index}`}
                        variant="outline"
                        onClick={() => handleAnswer(index)}
                        className="text-left p-3 bg-slate-700 hover:bg-slate-600 border-slate-600 text-white h-auto whitespace-normal justify-start"
                      >
                        {'>'} {option}
                      </Button>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-xl text-white text-center">{battleData.message}</p>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default BattleScreen;