import React from 'react';
import { Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TimelineEventDisplay {
  date: string;
  title: string;
}

interface TimelineProps {
  events: TimelineEventDisplay[];
  selectedDate: string;
  onDateChange: (date: string) => void;
  highestUnlockedLevel: number;
}

const Timeline: React.FC<TimelineProps> = ({ events, selectedDate, onDateChange, highestUnlockedLevel }) => {
  const formatDate = (dateString: string) => {
    // Adiciona 1 dia à data para corrigir problemas de fuso horário que podem fazer a data "voltar" um dia.
    const date = new Date(dateString);
    date.setUTCDate(date.getUTCDate() + 1); 
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  };

  return (
    <div className="max-w-6xl mx-auto">
      <h3 className="text-lg font-semibold text-cyan-300 mb-4 text-center">
        Linha do Tempo - Os {events.length} Dias da Crise
      </h3>
      
      <div className="relative">
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-gradient-to-r from-green-500 via-yellow-500 to-red-500"></div>
        
        <div className="flex justify-between items-start relative">
          {events.map((event, index) => {
            const isSelected = event.date === selectedDate;
            const isLocked = index > highestUnlockedLevel;
            
            // --- CORREÇÃO PRINCIPAL AQUI ---
            // O número do dia agora é simplesmente o índice + 1.
            const dayNumber = index + 1;
            
            return (
              <div
                key={event.date}
                className={cn(
                  'flex flex-col items-center transition-all duration-300 relative group',
                  isSelected && 'transform scale-110',
                  !isLocked && 'cursor-pointer hover:scale-105',
                  isLocked && 'opacity-50 grayscale cursor-not-allowed'
                )}
                onClick={() => !isLocked && onDateChange(event.date)}
              >
                <div
                  className={cn(
                    'w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 relative',
                    isSelected 
                      ? 'bg-yellow-400 border-yellow-300 shadow-lg shadow-yellow-400/50' 
                      : isLocked
                        ? 'bg-slate-700 border-slate-500'
                        : 'bg-cyan-600 border-cyan-400 group-hover:bg-cyan-500'
                  )}
                  style={{ filter: isSelected ? 'drop-shadow(0 0 10px rgba(250, 204, 21, 0.8))' : 'none' }}
                >
                  {isLocked && <Lock className="w-3 h-3 text-white/70" />}
                </div>
                
                <div className={cn('mt-2 text-xs font-bold', isSelected ? 'text-yellow-300' : 'text-cyan-300')}>
                  DIA {dayNumber}
                </div>
                
                <div className={cn('text-xs', isSelected ? 'text-white' : 'text-gray-400')}>
                  {formatDate(event.date)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Timeline;