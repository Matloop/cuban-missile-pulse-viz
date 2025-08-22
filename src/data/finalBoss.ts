
import { HistoricalFigure } from '../types/crisisDataTypes'; // Ajuste o caminho

export const theFinalBoss: HistoricalFigure = {
  id: "nikita_khrushchev_final_boss",
  name: "Nikita Khrushchev",
  rarity: "Lendário", // Propriedade obrigatória para HistoricalFigure
  chance: 0, // Não é para ser encontrado em lootbox
  description: "O astuto e imprevisível Premier soviético. O confronto final pela paz mundial depende de você decifrar suas intenções e superá-lo.",
  image: "minatto.jpg", // Certifique-se de ter essa imagem!
  stats: { hp: 550, attack: 30, speed: 70 } // Stats elevados para um chefão final
};

