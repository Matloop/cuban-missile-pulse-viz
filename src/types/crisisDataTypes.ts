// src/types/crisisDataTypes.ts

import * as d3 from 'd3';

export interface NetworkNode extends d3.SimulationNodeDatum {
  id: string;
  name: string;
  leader?: string;
  type: string;
  color: string;
  description?: string;
  objective?: string;
  key_figures?: string;
  key_assets?: string;
  image?: string;
}

export interface QuizData {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface NetworkAction {
  source: string;
  target: string;
  type: string;
  strength?: number;
}

export interface DailyEvent {
  date: string;
  title: string;
  description: string;
  riskLevel: number;
  image?: string;
  key_moments: string[];
  quote: string;
  quote_author: string;
  quiz?: QuizData;
  actions: NetworkAction[];
}

// --- NOVOS TIPOS BASE ---

// Interface para as estatísticas básicas que todos os personagens terão
export interface CharacterStats {
  hp: number;
  attack: number;
  speed: number;
}

// Interface base para as propriedades comuns entre HistoricalFigure e DailyOpponent
export interface BaseCharacter {
  id: string;
  name: string;
  description: string;
  image: string;
  stats: CharacterStats; // Usa a interface CharacterStats
}

// HistoricalFigure agora estende BaseCharacter e adiciona suas propriedades específicas
export interface HistoricalFigure extends BaseCharacter {
  rarity: 'Comum' | 'Raro' | 'Épico' | 'Lendário'; // Estas continuam obrigatórias para HistoricalFigure
  chance: number; // Estas continuam obrigatórias para HistoricalFigure
  isStarter?: boolean;
}

// DailyOpponent agora estende BaseCharacter e adiciona suas propriedades específicas
// Não precisa de rarity e chance, pois BaseCharacter não as exige
export interface DailyOpponent extends BaseCharacter {
  battleType?: "rhythm" | "quiz" | "tetris"; // battleType continua opcional
}

// Se você usa isso para tipar o crisisData.json completo:
export interface CrisisDataRoot {
  nodes: NetworkNode[];
  events: DailyEvent[];
}