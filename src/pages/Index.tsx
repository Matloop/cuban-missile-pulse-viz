// src/pages/Index.tsx

import React from 'react';
import { useReducer, useEffect } from 'react';
import { EyeOff, BookOpen, Clock, Key, FolderOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Components
import NetworkVisualization from '../components/NetworkVisualization';
import Timeline from '../components/Timeline';
import InfoPanel from '../components/InfoPanel';
import RiskIndicator from '../components/RiskIndicator';
import AgentSelection from '../components/AgentSelection';
import BattleScreen from '../components/BattleScreen';
import EventQuiz from '../components/EventQuiz';
import FinalQuiz from '../components/Quiz';
import Lootbox from '../components/LootBox';
import Collection from '../components/Collection';
import { Button } from '../components/ui/button';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '../components/ui/resizable';

// Data and Types
import crisisData from '../data/crisisData.json';
import allFiguresData from '../data/historicalFigures.json';
import opponentsData from '../data/opponents.json';
import quizQuestions from '../data/quizQuestions.json';
import { NetworkNode, HistoricalFigure, QuizData } from '../types/crisisDataTypes';

// --- TYPE DEFINITIONS FOR OUR NEW STATE AND ACTIONS ---

type GameState = {
  currentDayIndex: number;
  highestDayIndex: number;
  userCollection: string[];
  lootboxTokens: number;
  selectedNode: NetworkNode | null;
  isTimelineVisible: boolean;
  activeModal: 
    | 'none' 
    | 'agentSelection' 
    | 'battle' 
    | 'eventQuiz' 
    | 'finalQuiz' 
    | 'lootbox' 
    | 'collection';
  modalData: any; // To hold opponent, quiz question, or unlocked figure
};

type GameAction =
  | { type: 'SET_INITIAL_COLLECTION'; payload: string[] }
  | { type: 'SELECT_DATE'; payload: number }
  | { type: 'TOGGLE_TIMELINE' }
  | { type: 'SELECT_NODE'; payload: NetworkNode | null }
  | { type: 'START_ADVANCE_DAY' }
  | { type: 'AGENT_SELECTED'; payload: HistoricalFigure }
  | { type: 'BATTLE_WON' }
  | { type: 'BATTLE_LOST' }
  | { type: 'QUIZ_ANSWERED'; payload: { isCorrect: boolean } }
  | { type: 'START_FINAL_QUIZ' }
  | { type: 'COMPLETE_FINAL_QUIZ'; payload: number }
  | { type: 'OPEN_LOOTBOX' }
  | { type: 'COLLECT_FIGURE'; payload: string }
  | { type: 'VIEW_COLLECTION' }
  | { type: 'CLOSE_MODAL' };

const allFigures = allFiguresData as HistoricalFigure[];
const opponents = opponentsData as Record<string, any>;
const quizzes = quizQuestions as Record<string, QuizData[]>;

// --- THE MASTER GAME REDUCER ---

const gameReducer = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case 'SET_INITIAL_COLLECTION':
      return { ...state, userCollection: action.payload };

    case 'SELECT_DATE':
      if (action.payload <= state.highestDayIndex) {
        return { ...state, currentDayIndex: action.payload, selectedNode: null };
      }
      return state;

    case 'TOGGLE_TIMELINE':
      return { ...state, isTimelineVisible: !state.isTimelineVisible };

    case 'SELECT_NODE':
      return { ...state, selectedNode: state.selectedNode?.id === action.payload?.id ? null : action.payload };

    case 'START_ADVANCE_DAY': {
      const nextIndex = state.currentDayIndex + 1;
      if (nextIndex >= crisisData.events.length) return state;

      const nextDate = crisisData.events[nextIndex].date;
      const opponent = opponents[nextDate];
      const quiz = quizzes[nextDate]?.[0];

      if (opponent) {
        return { ...state, activeModal: 'agentSelection', modalData: { opponent } };
      }
      if (quiz) {
        return { ...state, activeModal: 'eventQuiz', modalData: { quiz } };
      }
      // No encounter, just advance
      return { ...state, currentDayIndex: nextIndex, highestDayIndex: Math.max(state.highestDayIndex, nextIndex) };
    }

    case 'AGENT_SELECTED':
      return { ...state, activeModal: 'battle', modalData: { ...state.modalData, playerAgent: action.payload } };

    case 'BATTLE_WON': {
      const nextIndex = state.currentDayIndex + 1;
      return {
        ...state,
        activeModal: 'none',
        currentDayIndex: nextIndex,
        highestDayIndex: Math.max(state.highestDayIndex, nextIndex),
        lootboxTokens: state.lootboxTokens + 1, // Reward for winning
      };
    }
    
    case 'BATTLE_LOST':
      return { ...state, activeModal: 'none' };

    case 'QUIZ_ANSWERED': {
      const nextIndex = state.currentDayIndex + 1;
      return {
        ...state,
        activeModal: 'none',
        currentDayIndex: nextIndex,
        highestDayIndex: Math.max(state.highestDayIndex, nextIndex),
        // Reward for correct answer
        lootboxTokens: state.lootboxTokens + (action.payload.isCorrect ? 1 : 0),
      };
    }

    case 'START_FINAL_QUIZ':
      return { ...state, activeModal: 'finalQuiz' };
      
    case 'COMPLETE_FINAL_QUIZ':
      return { ...state, activeModal: 'none', lootboxTokens: state.lootboxTokens + action.payload };
    
    case 'OPEN_LOOTBOX': {
      if (state.lootboxTokens <= 0) return state;
      // Lootbox rolling logic
      const sortedFigures = [...allFigures].sort((a, b) => a.chance - b.chance);
      let figureRolled: HistoricalFigure = allFigures[allFigures.length - 1]; // Fallback
      for (const figure of sortedFigures) {
        if (Math.floor(Math.random() * figure.chance) === 0) {
          figureRolled = figure;
          break;
        }
      }
      return { ...state, activeModal: 'lootbox', lootboxTokens: state.lootboxTokens - 1, modalData: { figure: figureRolled } };
    }

    case 'COLLECT_FIGURE':
      return {
        ...state,
        activeModal: 'none',
        userCollection: state.userCollection.includes(action.payload) ? state.userCollection : [...state.userCollection, action.payload],
      };
      
    case 'VIEW_COLLECTION':
      return { ...state, activeModal: 'collection' };

    case 'CLOSE_MODAL':
      return { ...state, activeModal: 'none', modalData: null };

    default:
      return state;
  }
};


interface IndexProps {
  initialCollection: string[];
}

const Index: React.FC<IndexProps> = ({ initialCollection }) => {
  const initialState: GameState = {
    currentDayIndex: 0,
    highestDayIndex: 0,
    userCollection: [],
    lootboxTokens: 1,
    selectedNode: null,
    isTimelineVisible: true,
    activeModal: 'none',
    modalData: null,
  };

  const [state, dispatch] = useReducer(gameReducer, initialState);

  useEffect(() => {
    dispatch({ type: 'SET_INITIAL_COLLECTION', payload: initialCollection });
  }, [initialCollection]);

  const currentEvent = crisisData.events[state.currentDayIndex];
  const selectedDate = currentEvent.date;
  const isFinalDay = state.currentDayIndex === crisisData.events.length - 1;
  const canAdvance = state.currentDayIndex === state.highestDayIndex && !isFinalDay;
  const formattedDate = new Date(selectedDate).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.5 }}
      className="h-screen w-screen overflow-hidden text-white flex flex-col"
    >
      <div className="animated-grid-background" />
      <div className="noise-overlay" />

      <header className="bg-black/30 backdrop-blur-sm border-b border-cyan-500/30 p-3 shrink-0 z-20">
        <div className="max-w-screen-2xl mx-auto flex justify-between items-center">
          <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-cyan-400 to-red-400 bg-clip-text text-transparent tracking-wider">
            OPERAÇÃO CHRONOS // ANÁLISE: CRISE DOS MÍSSEIS
          </h1>
          <div className="flex items-center gap-2">
            <Button onClick={() => dispatch({type: 'OPEN_LOOTBOX'})} disabled={state.lootboxTokens <= 0} className="bg-yellow-600 hover:bg-yellow-700 text-white shadow-lg disabled:bg-gray-500">
              <Key className="w-4 h-4 mr-2" /> Abrir Cofre ({state.lootboxTokens})
            </Button>
            <Button onClick={() => dispatch({type: 'VIEW_COLLECTION'})} variant="outline" className="text-cyan-300 border-cyan-500/30 hover:bg-cyan-500/10 hover:text-cyan-200">
              <FolderOpen className="w-4 h-4 mr-2" /> Coleção
            </Button>
          </div>
        </div>
      </header>
      
      <main className="flex-grow min-h-0">
        <ResizablePanelGroup direction="horizontal" className="h-full max-w-screen-2xl mx-auto p-4">
          <ResizablePanel defaultSize={70}>
            <div className="relative h-full w-full bg-black/20 backdrop-blur-sm rounded-lg border border-cyan-500/40 p-2 shadow-lg shadow-cyan-900/20">
              <NetworkVisualization
                nodes={crisisData.nodes as NetworkNode[]}
                currentEvent={currentEvent as any}
                onNodeSelect={(node) => dispatch({ type: 'SELECT_NODE', payload: node })}
                selectedNode={state.selectedNode}
              />
              <AnimatePresence>
                {isFinalDay && (
                  <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50 }} className="absolute inset-0 flex items-center justify-end p-8 bg-gradient-to-l from-black/80 via-black/50 to-transparent pointer-events-none">
                    <div className="text-left p-8 bg-black/80 rounded-lg border border-yellow-500/50 max-w-sm pointer-events-auto shadow-2xl shadow-yellow-500/10">
                      <h2 className="text-2xl font-bold text-yellow-300">Análise Concluída</h2>
                      <p className="text-gray-300 my-4">Você navegou pelos 13 dias da crise. Teste seu conhecimento para ganhar mais Chaves de Análise.</p>
                      <Button onClick={() => dispatch({type: 'START_FINAL_QUIZ'})} size="lg" className="w-full bg-yellow-600 hover:bg-yellow-700">
                        <BookOpen className="w-5 h-5 mr-3" /> Iniciar Questionário Final
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={30}>
            <div className="h-full w-full flex flex-col gap-4 pl-4">
              <div className="bg-black/20 backdrop-blur-sm rounded-lg border border-cyan-500/30 p-4">
                <RiskIndicator riskLevel={currentEvent?.riskLevel || 1} />
              </div>
              <div className="flex-grow min-h-0 bg-black/20 backdrop-blur-sm rounded-lg border border-cyan-500/30 p-4">
                <InfoPanel
                  currentEvent={currentEvent}
                  selectedNode={state.selectedNode}
                  nodes={crisisData.nodes as NetworkNode[]}
                  canAdvance={canAdvance}
                  onAdvanceDay={() => dispatch({ type: 'START_ADVANCE_DAY' })}
                  isFinalDay={isFinalDay}
                />
              </div>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </main>

      <Button onClick={() => dispatch({ type: 'TOGGLE_TIMELINE' })} className="fixed bottom-6 right-6 z-50 rounded-full h-12 w-12 p-0"><EyeOff className="w-6 h-6" /></Button>
      <div className="fixed bottom-6 left-6 z-30 font-mono text-sm text-cyan-300 pointer-events-none bg-black/30 p-2 rounded border border-cyan-500/20">
        <div className="flex items-center gap-2">
           <Clock className="w-4 h-4 animate-spin" style={{ animationDuration: '30s' }} /> <span>{formattedDate}</span>
        </div>
      </div>
      
      <AnimatePresence>
        {state.isTimelineVisible && (
          <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} className="fixed bottom-0 left-0 right-0 z-40 bg-black/50 backdrop-blur-md border-t border-cyan-500/30 p-4">
            <Timeline
              events={crisisData.events}
              selectedDate={selectedDate}
              onDateChange={(date) => dispatch({ type: 'SELECT_DATE', payload: crisisData.events.findIndex(e => e.date === date) })}
              highestUnlockedLevel={state.highestDayIndex}
            />
          </motion.div>
        )}
      </AnimatePresence>
      
      <AnimatePresence>
        {state.activeModal === 'agentSelection' && (
          <AgentSelection
            userCollection={state.userCollection}
            allFigures={allFigures}
            onSelect={(agent) => dispatch({ type: 'AGENT_SELECTED', payload: agent })}
            onCancel={() => dispatch({ type: 'CLOSE_MODAL' })}
          />
        )}
        {state.activeModal === 'battle' && (
          <BattleScreen
            playerAgent={state.modalData.playerAgent}
            opponent={state.modalData.opponent}
            onWin={() => dispatch({ type: 'BATTLE_WON' })}
            onLose={() => dispatch({ type: 'BATTLE_LOST' })}
          />
        )}
        {state.activeModal === 'eventQuiz' && (
          <EventQuiz
            quiz={state.modalData.quiz}
            onComplete={(isCorrect) => dispatch({ type: 'QUIZ_ANSWERED', payload: { isCorrect } })}
          />
        )}
        {state.activeModal === 'finalQuiz' && (
          <FinalQuiz
            onClose={() => dispatch({ type: 'CLOSE_MODAL' })}
            onComplete={(keys) => dispatch({ type: 'COMPLETE_FINAL_QUIZ', payload: keys })}
          />
        )}
        {state.activeModal === 'lootbox' && (
          <Lootbox
            figure={state.modalData.figure}
            onCollect={() => dispatch({ type: 'COLLECT_FIGURE', payload: state.modalData.figure.id })}
          />
        )}
        {state.activeModal === 'collection' && (
          <Collection
            collection={state.userCollection}
            allFigures={allFigures}
            onClose={() => dispatch({ type: 'CLOSE_MODAL' })}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Index;