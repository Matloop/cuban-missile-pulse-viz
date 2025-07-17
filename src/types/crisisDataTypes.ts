// src/types/crisisDataTypes.ts

import * as d3 from 'd3';

// Estende a interface base de nó do D3 com nossas propriedades customizadas
export interface NetworkNode extends d3.SimulationNodeDatum {
  id: string;
  name: string;
  leader?: string;
  type: string;
  color: string;
  description?: string;
  details?: string;
  image?: string;
}

// Define a estrutura de um único evento na linha do tempo
export interface NetworkEvent {
  date: string;
  title: string;
  description: string;
  riskLevel: number;
  image?: string;
  details?: string;
  actions: {
    source: string;
    target: string;
    type: string;
    strength?: number;
  }[];
}