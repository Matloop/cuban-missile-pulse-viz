// src/components/EventQuiz.tsx

import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card';
import { HelpCircle, CheckCircle, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import { QuizData } from '../types/crisisDataTypes';

interface EventQuizProps {
  quiz: QuizData;
  onComplete: (isCorrect: boolean) => void;
}

const EventQuiz: React.FC<EventQuizProps> = ({ quiz, onComplete }) => {
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);

  const handleSelect = (index: number) => {
    if (answered) return;
    
    setAnswered(true);
    setSelected(index);
    
    // After a delay to show feedback, call the onComplete callback.
    setTimeout(() => {
      onComplete(index === quiz.correctAnswer);
    }, 2000); // 2-second delay
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
        <Card className="bg-slate-900 border-yellow-500/30 max-w-lg w-full">
          <CardHeader>
            <CardTitle className="text-yellow-300 flex items-center gap-2"><HelpCircle /> Pop-up de Inteligência</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg text-white mb-6">{quiz.question}</p>
            <div className="space-y-3">
              {quiz.options.map((option, index) => {
                const isSelected = selected === index;
                const isCorrect = quiz.correctAnswer === index;
                
                return (
                  <Button
                    key={index}
                    variant="outline"
                    onClick={() => handleSelect(index)}
                    disabled={answered}
                    className={cn(
                      "w-full justify-between h-auto py-3 text-left text-white whitespace-normal",
                      "border-blue-500/30 bg-slate-800 hover:bg-slate-700 disabled:opacity-80",
                      answered && isCorrect && "bg-green-500/20 border-green-500 text-white",
                      answered && isSelected && !isCorrect && "bg-red-500/20 border-red-500 text-white"
                    )}
                  >
                    <span>{option}</span>
                    {answered && isSelected && !isCorrect && <XCircle className="ml-auto text-red-400" />}
                    {answered && isCorrect && <CheckCircle className="ml-auto text-green-400" />}
                  </Button>
                );
              })}
            </div>
          </CardContent>
          <CardFooter className="min-h-[4rem] flex items-center justify-center p-4">
             {answered ? (
                <motion.p 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  className="text-sm text-gray-300 text-center"
                >
                  <span className='font-bold'>{selected === quiz.correctAnswer ? "Correto! " : "Incorreto. "}</span> 
                  {quiz.explanation}
                </motion.p>
            ) : <p className="text-sm text-gray-400">Responda para prosseguir.</p>}
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
};

export default EventQuiz;