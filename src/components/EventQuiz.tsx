import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card';
import { HelpCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface EventQuizProps {
  question: string;
  options: string[];
  correctAnswer: number;
  onAnswer: (isCorrect: boolean) => void;
}

const EventQuiz: React.FC<EventQuizProps> = ({ question, options, correctAnswer, onAnswer }) => {
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);

  const handleSelect = (index: number) => {
    if (answered) return;
    setAnswered(true);
    setSelected(index);
    const isCorrect = index === correctAnswer;
    setTimeout(() => onAnswer(isCorrect), 2500);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
        <Card className="bg-slate-900 border-yellow-500/30 max-w-lg w-full">
          <CardHeader>
            <CardTitle className="text-yellow-300 flex items-center gap-2"><HelpCircle /> Pop-up de Inteligência</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg text-white mb-6">{question}</p>
            <div className="space-y-3">
              {options.map((option, index) => {
                const isSelected = selected === index;
                const isCorrect = index === correctAnswer;
                return (
                  <button
                    key={index}
                    onClick={() => handleSelect(index)}
                    disabled={answered}
                    className={`w-full p-3 text-left rounded-md border-2 transition-all duration-300
                      ${!answered
                        ? 'border-yellow-500/30 hover:bg-yellow-900/50 text-white cursor-pointer'
                        : isSelected
                          ? (isCorrect ? 'bg-green-500/30 border-green-500 text-green-300 scale-105' : 'bg-red-500/30 border-red-500 text-red-300 scale-105')
                          : isCorrect
                            ? 'bg-green-500/20 border-green-500/50 text-green-300'
                            : 'opacity-60 border-slate-700'
                      }`
                    }
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          </CardContent>
          <CardFooter className="h-12 flex items-center justify-center">
              {answered && (selected === correctAnswer
                ? <p className="text-green-400 w-full text-center animate-pulse font-semibold">Correto! +1 Chave de Análise!</p>
                : <p className="text-red-400 w-full text-center font-semibold">Incorreto. A resposta era: "{options[correctAnswer]}"</p>
              )}
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
};

export default EventQuiz;