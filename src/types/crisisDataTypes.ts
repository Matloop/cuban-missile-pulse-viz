// src/types/crisisDataTypes.ts

import * as d3 from 'd3';

// --- DEFINIÇÕES DE TIPO ---
export interface NetworkNode extends d3.SimulationNodeDatum {
  id: string;
  name: string;
  leader?: string;
  type: string;
  color: string;
  // --- FIX: Make these properties optional to match the incoming data type ---
  description?: string;
  objective?: string;
  key_figures?: string;
  key_assets?: string;
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
export interface HistoricalFigure {
  id: string;
  name: string;
  image: string;
  rarity: "Comum" | "Raro" | "Épico" | "Lendário";
  isStarter?: boolean;
  chance?: number;
  stats: {
    hp: number;
    attack: number;
    speed: number;
  };
  description: string;   // O resumo curto
  biography?: string;      // A biografia longa (opcional)
  roleInCrisis?: string;   // O papel na crise (opcional)
  ability?: string;        // A habilidade no jogo (opcional)
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