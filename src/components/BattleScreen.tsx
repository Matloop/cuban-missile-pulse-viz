import React, { useState, useReducer } from 'react';
import { HistoricalFigure, QuizData } from '../types/crisisDataTypes';
import { getFigureImageUrl } from '@/lib/imageLoader';
import { cn } from '@/lib/utils';
import allQuestionsData from '../data/quizQuestions.json';
import { Button } from './ui/button';
import { Key, Trophy, Swords } from 'lucide-react';
import vs_image from '../assets/vs.png';

const allQuestions = Object.values(allQuestionsData).flat();

const shuffleArray = <T,>(array: T[]): T[] => {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
};

// --- MÁQUINA DE ESTADO ---
type BattleState = {
  playerHp: number;
  opponentHp: number;
  currentQuestion: QuizData | null;
  message: string;
  canAnswer: boolean;
  showPlayerDamage: boolean;
  showOpponentDamage: boolean;
  gameOver: boolean;
  winner: 'player' | 'opponent' | null;
};

type BattleAction = 
  | { type: 'START_BATTLE' }
  | { type: 'ANSWER_QUESTION'; payload: { answerIndex: number; correctAnswer: number } }
  | { type: 'PLAYER_ATTACK_COMPLETE' }
  | { type: 'OPPONENT_ATTACK_COMPLETE' }
  | { type: 'NEXT_QUESTION' }
  | { type: 'SHOW_DAMAGE'; payload: { target: 'player' | 'opponent'; damage: number } }
  | { type: 'HIDE_DAMAGE' }
  | { type: 'GAME_OVER'; payload: { winner: 'player' | 'opponent' } };

const battleReducer = (state: BattleState, action: BattleAction): BattleState => {
  switch (action.type) {
    case 'START_BATTLE':
      const firstQuestion = shuffleArray([...allQuestions])[0];
      return {
        ...state,
        currentQuestion: firstQuestion,
        message: firstQuestion.question,
        canAnswer: true
      };

    case 'ANSWER_QUESTION':
      const isCorrect = action.payload.answerIndex === action.payload.correctAnswer;
      return {
        ...state,
        canAnswer: false,
        message: isCorrect ? 'Correto! Preparando ataque...' : 'Incorreto! Você perdeu a chance de atacar.'
      };

    case 'SHOW_DAMAGE':
      const { target, damage } = action.payload;
      const newState = { ...state };
      
      if (target === 'player') {
        newState.playerHp = Math.max(0, state.playerHp - damage);
        newState.showPlayerDamage = true;
        newState.message = 'Você recebeu dano!';
      } else {
        newState.opponentHp = Math.max(0, state.opponentHp - damage);
        newState.showOpponentDamage = true;
        newState.message = 'Você causou dano!';
      }
      
      return newState;

    case 'HIDE_DAMAGE':
      return {
        ...state,
        showPlayerDamage: false,
        showOpponentDamage: false
      };

    case 'NEXT_QUESTION':
      const nextQuestion = shuffleArray([...allQuestions])[0];
      return {
        ...state,
        currentQuestion: nextQuestion,
        message: nextQuestion.question,
        canAnswer: true,
        showPlayerDamage: false,
        showOpponentDamage: false
      };

    case 'GAME_OVER':
      return {
        ...state,
        gameOver: true,
        winner: action.payload.winner,
        canAnswer: false,
        message: action.payload.winner === 'player' ? 'Você venceu!' : 'Você perdeu!'
      };

    default:
      return state;
  }
};

// --- COMPONENTES UI SEPARADOS ---
const BattleInterface: React.FC<{
  question: QuizData | null;
  message: string;
  canAnswer: boolean;
  onAnswer: (index: number) => void;
}> = ({ question, message, canAnswer, onAnswer }) => {
  if (!canAnswer || !question) {
    return <p className="text-xl text-white">{message}</p>;
  }

  return (
    <div className="text-white">
      <p className="text-lg mb-4">{question.question}</p>
      <div className="grid grid-cols-2 gap-3 text-base">
        {question.options.map((option, index) => (
          <Button
            key={`${question.id}-${index}`}
            variant="outline"
            onClick={() => onAnswer(index)}
            className="text-left p-3 bg-slate-700 hover:bg-slate-600 border-slate-600 text-white h-auto whitespace-normal justify-start"
          >
            {'>'} {option}
          </Button>
        ))}
      </div>
    </div>
  );
};

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
          <div className={cn('h-full rounded-full transition-all duration-300', color)} style={{ width: `${percentage}%` }} />
        </div>
      </div>
    </div>
  );
};

interface BattleScreenProps {
  playerAgent: HistoricalFigure;
  opponent: any;
  onWin: () => void;
  onLose: () => void;
}

const BattleScreen: React.FC<BattleScreenProps> = ({ playerAgent, opponent, onWin, onLose }) => {
  const initialState: BattleState = {
    playerHp: playerAgent.stats.hp,
    opponentHp: opponent.stats.hp,
    currentQuestion: null,
    message: `${opponent.name} te desafia! Preparando primeira pergunta...`,
    canAnswer: false,
    showPlayerDamage: false,
    showOpponentDamage: false,
    gameOver: false,
    winner: null
  };

  const [state, dispatch] = useReducer(battleReducer, initialState);
  const [battleStarted, setBattleStarted] = useState(false);

  // Iniciar batalha
  React.useEffect(() => {
    if (!battleStarted) {
      const timer = setTimeout(() => {
        dispatch({ type: 'START_BATTLE' });
        setBattleStarted(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [battleStarted]);

  // Processar batalha baseado no HP
  React.useEffect(() => {
    if (state.playerHp <= 0 && !state.gameOver) {
      dispatch({ type: 'GAME_OVER', payload: { winner: 'opponent' } });
    } else if (state.opponentHp <= 0 && !state.gameOver) {
      dispatch({ type: 'GAME_OVER', payload: { winner: 'player' } });
    }
  }, [state.playerHp, state.opponentHp, state.gameOver]);

  // Finalizar jogo
  React.useEffect(() => {
    if (state.gameOver) {
      const timer = setTimeout(() => {
        if (state.winner === 'player') {
          onWin();
        } else {
          onLose();
        }
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [state.gameOver, state.winner, onWin, onLose]);

  const handleAnswer = (answerIndex: number) => {
    if (!state.canAnswer || !state.currentQuestion) return;

    const isCorrect = answerIndex === state.currentQuestion.correctAnswer;
    
    dispatch({ 
      type: 'ANSWER_QUESTION', 
      payload: { 
        answerIndex, 
        correctAnswer: state.currentQuestion.correctAnswer 
      } 
    });

    // Sequência de batalha
    setTimeout(() => {
      if (isCorrect) {
        // Jogador ataca
        dispatch({ 
          type: 'SHOW_DAMAGE', 
          payload: { target: 'opponent', damage: playerAgent.stats.attack } 
        });
        
        setTimeout(() => {
          dispatch({ type: 'HIDE_DAMAGE' });
          
          // Verificar se oponente morreu
          if (state.opponentHp - playerAgent.stats.attack > 0) {
            // Oponente contra-ataca
            setTimeout(() => {
              dispatch({ 
                type: 'SHOW_DAMAGE', 
                payload: { target: 'player', damage: opponent.stats.attack } 
              });
              
              setTimeout(() => {
                dispatch({ type: 'HIDE_DAMAGE' });
                
                // Próxima pergunta se jogador não morreu
                if (state.playerHp - opponent.stats.attack > 0) {
                  setTimeout(() => {
                    dispatch({ type: 'NEXT_QUESTION' });
                  }, 500);
                }
              }, 1000);
            }, 1000);
          }
        }, 1500);
      } else {
        // Oponente ataca
        setTimeout(() => {
          dispatch({ 
            type: 'SHOW_DAMAGE', 
            payload: { target: 'player', damage: opponent.stats.attack } 
          });
          
          setTimeout(() => {
            dispatch({ type: 'HIDE_DAMAGE' });
            
            // Próxima pergunta se jogador não morreu
            if (state.playerHp - opponent.stats.attack > 0) {
              setTimeout(() => {
                dispatch({ type: 'NEXT_QUESTION' });
              }, 500);
            }
          }, 1000);
        }, 1000);
      }
    }, 1000);
  };

  // Tela de fim de jogo
  if (state.gameOver) {
    const isWin = state.winner === 'player';
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center">
        <div className={`text-center text-white p-8 bg-slate-900 border-2 ${isWin ? 'border-yellow-500' : 'border-red-500'} rounded-lg max-w-md`}>
          {isWin ? <Trophy className="w-20 h-20 text-yellow-400 mx-auto" /> : <Swords className="w-20 h-20 text-red-400 mx-auto" />}
          <h1 className="text-4xl font-bold mt-4">{isWin ? 'VITÓRIA!' : 'DERROTA'}</h1>
          <p className="text-lg text-gray-300 mt-2">{state.message}</p>
          {isWin && (
            <div className="my-6 text-2xl font-bold text-yellow-300 flex items-center justify-center gap-2">
              <Key /> +1 Chave de Análise
            </div>
          )}
          <Button 
            size="lg" 
            className={isWin ? "bg-green-600 hover:bg-green-700" : "bg-blue-600 hover:bg-blue-700 mt-6"}
            onClick={isWin ? onWin : onLose}
          >
            {isWin ? 'Prosseguir para o Próximo Dia' : 'Voltar para a Timeline'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black z-[100] flex items-center justify-center p-4 font-mono">
      <div className="w-full max-w-4xl aspect-video bg-gray-900 border-8 border-gray-700 rounded-lg flex flex-col relative overflow-hidden bg-[url('/src/assets/battle_bg.png')] bg-cover">
        {/* VS Image */}
        <div className="absolute inset-0 flex justify-center items-center pointer-events-none">
          <img src={vs_image} alt="Versus" className="w-32 h-32 opacity-50" />
        </div>
        
        {/* Character Images */}
        <div className="flex-grow relative flex justify-between items-center px-8 pt-20">
          <div className="relative flex flex-col items-center">
            {state.showPlayerDamage && (
              <div className="absolute -top-8 text-red-500 text-3xl font-bold animate-pulse">
                -{opponent.stats.attack}
              </div>
            )}
            <img 
              src={getFigureImageUrl(playerAgent.image)} 
              className="h-48 w-48 object-cover drop-shadow-lg" 
              alt={playerAgent.name} 
            />
          </div>
          <div className="relative flex flex-col items-center">
            {state.showOpponentDamage && (
              <div className="absolute -top-8 text-red-500 text-3xl font-bold animate-pulse">
                -{playerAgent.stats.attack}
              </div>
            )}
            <img 
              src={getFigureImageUrl(opponent.image)} 
              className="h-48 w-48 object-cover drop-shadow-lg" 
              alt={opponent.name} 
            />
          </div>
        </div>
        
        {/* HP Bars */}
        <div className="absolute top-0 left-0 right-0 flex justify-between">
          <HPDisplay agent={opponent} hp={state.opponentHp} maxHp={opponent.stats.hp} />
          <HPDisplay agent={playerAgent} hp={state.playerHp} maxHp={playerAgent.stats.hp} />
        </div>
        
        {/* Battle Interface */}
        <div className="h-1/3 bg-slate-800 border-t-8 border-slate-700 p-4 flex flex-col justify-center">
          <BattleInterface
            question={state.currentQuestion}
            message={state.message}
            canAnswer={state.canAnswer}
            onAnswer={handleAnswer}
          />
        </div>
      </div>
    </div>
  );
};

export default BattleScreen;