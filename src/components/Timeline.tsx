
import React from 'react';

const Timeline = ({ events, selectedDate, onDateChange }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: 'short' 
    });
  };

  const getDaysDifference = (date1, date2) => {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const diffTime = Math.abs(d2 - d1);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const firstDate = events[0]?.date;
  const totalDays = getDaysDifference(firstDate, events[events.length - 1]?.date);

  return (
    <div className="max-w-6xl mx-auto">
      <h3 className="text-lg font-semibold text-blue-300 mb-4 text-center">
        Linha do Tempo - Os 13 Dias da Crise
      </h3>
      
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute top-6 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 via-yellow-500 to-red-500"></div>
        
        {/* Events */}
        <div className="flex justify-between items-start relative">
          {events.map((event, index) => {
            const isSelected = event.date === selectedDate;
            const dayNumber = getDaysDifference(firstDate, event.date) + 1;
            
            return (
              <div
                key={event.date}
                className={`flex flex-col items-center cursor-pointer transition-all duration-300 ${
                  isSelected ? 'transform scale-110' : 'hover:scale-105'
                }`}
                onClick={() => onDateChange(event.date)}
              >
                {/* Event marker */}
                <div
                  className={`w-4 h-4 rounded-full border-2 transition-all duration-300 ${
                    isSelected 
                      ? 'bg-yellow-400 border-yellow-300 shadow-lg shadow-yellow-400/50' 
                      : 'bg-blue-600 border-blue-400 hover:bg-blue-500'
                  }`}
                  style={{
                    filter: isSelected ? 'drop-shadow(0 0 10px rgba(255, 255, 0, 0.8))' : 'none'
                  }}
                />
                
                {/* Day number */}
                <div className={`mt-2 text-xs font-bold ${
                  isSelected ? 'text-yellow-300' : 'text-blue-300'
                }`}>
                  DIA {dayNumber}
                </div>
                
                {/* Date */}
                <div className={`text-xs ${
                  isSelected ? 'text-white' : 'text-gray-300'
                }`}>
                  {formatDate(event.date)}
                </div>
                
                {/* Event title */}
                <div className={`text-xs text-center mt-1 max-w-20 ${
                  isSelected ? 'text-yellow-300 font-semibold' : 'text-gray-400'
                }`}>
                  {event.title}
                </div>
                
                {/* Risk level indicator */}
                <div className="mt-1 flex space-x-0.5">
                  {[1, 2, 3, 4, 5].map(level => (
                    <div
                      key={level}
                      className={`w-1 h-3 ${
                        level <= event.riskLevel
                          ? level <= 2 ? 'bg-green-500' 
                            : level <= 3 ? 'bg-yellow-500'
                            : level <= 4 ? 'bg-orange-500'
                            : 'bg-red-500'
                          : 'bg-gray-600'
                      }`}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Current event highlight */}
        <div className="mt-4 text-center">
          <div className="inline-block bg-black/40 backdrop-blur-sm rounded-lg px-4 py-2 border border-blue-500/30">
            <div className="text-yellow-300 font-semibold">
              {events.find(e => e.date === selectedDate)?.title}
            </div>
            <div className="text-blue-200 text-sm mt-1">
              {formatDate(selectedDate)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Timeline;
