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

export interface NetworkEvent {
  date: string;
  title: string;
  description: string;
  riskLevel: number;
  image?: string;
  key_moments: string[];
  quote: string;
  quote_author: string;
  quiz?: QuizData;
  actions: {
    source: string;
    target: string;
    type: string;
    strength?: number;
  }[];
}

export interface HistoricalFigure {
  id: string;
  name: string;
  rarity: 'Comum' | 'Raro' | 'Épico' | 'Lendário';
  chance: number;
  description: string;
  image: string;
  isStarter?: boolean;
  stats: {
    hp: number;
    attack: number;
    speed: number;
  };
}