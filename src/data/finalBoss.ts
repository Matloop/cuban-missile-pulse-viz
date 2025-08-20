// src/data/finalBoss.ts
import { HistoricalFigure } from '../types/crisisDataTypes'; // Ajuste o caminho

export const theFinalBoss: HistoricalFigure = {
  id: "nikita_khrushchev_final_boss",
  name: "Nikita Khrushchev",
  rarity: "Lendário", // Propriedade obrigatória para HistoricalFigure
  chance: 0, // Não é para ser encontrado em lootbox
  description: "O astuto e imprevisível Premier soviético. O confronto final pela paz mundial depende de você decifrar suas intenções e superá-lo.",
  image: "figure_khrushchev_leader.jpg", // Certifique-se de ter essa imagem!
  stats: { hp: 350, attack: 40, speed: 70 } // Stats elevados para um chefão final
};

// Ou se preferir outro chefão, como Fidel Castro, com os dados completos:
/*
export const theFinalBoss: HistoricalFigure = {
  id: "fidel_castro_final_boss",
  name: "Fidel Castro",
  rarity: "Lendário",
  chance: 0,
  description: "O carismático e determinado líder revolucionário de Cuba, defendendo sua ilha a todo custo. Um desafio à sua perspicácia política.",
  image: "figure_castro_boss.jpg", // Exemplo
  stats: { hp: 320, attack: 35, speed: 85 }
};
*/