// src/components/Collection.tsx

import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';
import { HistoricalFigure } from '../types/crisisDataTypes';
import { cn } from '@/lib/utils';
import { getFigureImageUrl, getLockedImageUrl } from '@/lib/imageLoader';
import { Heart, Zap, Wind } from 'lucide-react';
import FigureDetail from './ui/FigureDetail';

const rarityStyles: { [key: string]: string } = {
  "Comum": "border-gray-500 text-gray-300",
  "Raro": "border-blue-500 text-blue-300",
  "Épico": "border-purple-500 text-purple-300",
  "Lendário": "border-yellow-500 text-yellow-300",
};

interface CollectionProps {
  collection: HistoricalFigure[];
  allFigures: HistoricalFigure[];
  onClose: () => void;
}

const Collection: React.FC<CollectionProps> = ({ collection, allFigures, onClose }) => {
  // --- DEBUG 5: VERIFICAR PROPS RECEBIDAS ---
  console.log('[DEBUG] Props recebidas por <Collection />:', { collection, allFigures });

  const [selectedFigureId, setSelectedFigureId] = useState<string | null>(null);

  const getHydratedFigure = (id: string | null): HistoricalFigure | null => {
    if (!id) return null;
    const baseFigureData = allFigures.find(f => f.id === id);
    if (!baseFigureData) return null;
    const userFigureData = collection.find(f => f.id === id);
    const mergedFigure = { ...baseFigureData, ...userFigureData };
    // --- DEBUG 7: VERIFICAR O OBJETO FINAL ENVIADO PARA O MODAL DE DETALHES ---
    console.log('[DEBUG] Objeto final e completo sendo preparado para o FigureDetail:', mergedFigure);
    return mergedFigure;
  };
  
  const selectedFigure = getHydratedFigure(selectedFigureId);

  const collectibleFigures = allFigures.filter(f => !f.isStarter);
  const unlockedCollectibles = collection.filter(f => !f.isStarter);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <Card className="bg-slate-900 border-blue-500/30 max-w-5xl w-full h-[90vh] flex flex-col">
        <CardHeader>
          <CardTitle className="text-white">Figuras Desbloqueadas ({unlockedCollectibles.length}/{collectibleFigures.length})</CardTitle>
        </CardHeader>
        <CardContent className="flex-grow overflow-hidden">
          <ScrollArea className="h-full pr-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {allFigures.map((baseFigure) => {
                const userFigureData = collection.find(f => f.id === baseFigure.id);
                const isUnlocked = !!userFigureData;
                const displayFigure: HistoricalFigure = isUnlocked ? { ...baseFigure, ...userFigureData } : baseFigure;

                // --- DEBUG 6: VERIFICAR DADOS DE CADA CARD INDIVIDUALMENTE ---
                if(isUnlocked) {
                  console.log(`[DEBUG] Dados para o card de ${displayFigure.name}:`, displayFigure);
                }
                
                const rarityClass = rarityStyles[displayFigure.rarity] || 'border-gray-700';
                
                return (
                  <div
                    key={displayFigure.id}
                    className={cn( 'p-4 border rounded-lg transition-all flex flex-col', isUnlocked ? `bg-slate-800 ${rarityClass} cursor-pointer hover:scale-105 hover:shadow-lg` : 'bg-black/50 border-slate-800' )}
                    onClick={() => isUnlocked && setSelectedFigureId(baseFigure.id)}
                  >
                    <img src={isUnlocked ? getFigureImageUrl(displayFigure.image) : getLockedImageUrl()} alt={isUnlocked ? displayFigure.name : 'Bloqueado'} className={cn('w-24 h-24 object-cover rounded-full mx-auto mb-2 border-4', isUnlocked ? rarityClass : 'border-gray-700 filter grayscale opacity-50')} />
                    <h3 className={cn('font-bold text-center mt-2', isUnlocked ? 'text-white' : 'text-gray-500')}>{isUnlocked ? displayFigure.name : '???'}</h3>
                    {isUnlocked && <Badge variant="outline" className={cn('mt-2 w-full justify-center', rarityClass)}>{displayFigure.rarity}</Badge>}
                    {isUnlocked && displayFigure.stats && (
                      <div className="mt-4 pt-3 border-t border-slate-700 space-y-2 text-sm font-mono">
                        <div className="flex justify-between items-center text-red-400"><span className='flex items-center gap-1'><Heart size={16} /> HP</span><span className="font-bold">{displayFigure.stats.hp}</span></div>
                        <div className="flex justify-between items-center text-yellow-400"><span className='flex items-center gap-1'><Zap size={16} /> ATK</span><span className="font-bold">{displayFigure.stats.attack}</span></div>
                        <div className="flex justify-between items-center text-blue-400"><span className='flex items-center gap-1'><Wind size={16} /> SPD</span><span className="font-bold">{displayFigure.stats.speed}</span></div>
                      </div>
                    )}
                    {!isUnlocked && <div className="flex-grow"></div>}
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </CardContent>
        <div className="p-4 border-t border-blue-500/30 flex justify-end">
          <Button onClick={onClose}>Fechar</Button>
        </div>
      </Card>
      
      <AnimatePresence>
        {selectedFigure && (
          <FigureDetail
            figure={selectedFigure}
            onClose={() => setSelectedFigureId(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Collection;