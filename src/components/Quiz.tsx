// src/components/Quiz.tsx

import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card';
import { CheckCircle, XCircle, Trophy, ChevronsRight, Info } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

const questions: Question[] = [
  // ... (a lista de perguntas permanece a mesma)
];

interface QuizProps {
  onClose: () => void;
}

const Quiz: React.FC<QuizProps> = ({ onClose }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<(number | null)[]>(Array(questions.length).fill(null));
  const [quizState, setQuizState] = useState<'answering' | 'answered' | 'results'>('answering');

  const handleAnswerSelect = (answerIndex: number) => {
    if (quizState !== 'answering') return;
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestion] = answerIndex;
    setSelectedAnswers(newAnswers);
    setQuizState('answered');
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setQuizState('answering');
    } else {
      setQuizState('results');
    }
  };

  const calculateScore = () => {
    return selectedAnswers.filter((answer, index) => answer === questions[index].correctAnswer).length;
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setSelectedAnswers(Array(questions.length).fill(null));
    setQuizState('answering');
  };

  if (quizState === 'results') {
    const score = calculateScore();
    const percentage = Math.round((score / questions.length) * 100);

    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <Card className="bg-slate-900 border-blue-500/30 max-w-2xl w-full">
          <CardHeader className="text-center">
            <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
            <CardTitle className="text-3xl font-bold text-white">Quiz Concluído!</CardTitle>
            <div className="text-6xl font-bold text-blue-400 pt-2">{score}/{questions.length}</div>
            <div className="text-xl text-blue-300">{percentage}% de acertos</div>
            <p className="text-lg text-gray-300 pt-4">
              {percentage >= 80 ? "Excelente! Você domina a história da Crise dos Mísseis!" :
               percentage >= 60 ? "Bom trabalho! Você tem um bom conhecimento sobre o tema." :
               "Continue estudando para aprender mais sobre este momento histórico crucial!"}
            </p>
          </CardHeader>
          <CardContent>
            <Separator className="my-4 bg-blue-500/30" />
            <h3 className="text-lg font-semibold text-center text-white mb-4">Revisão das Respostas</h3>
            <ScrollArea className="h-[200px] p-4 rounded-md border border-slate-700">
              <div className="space-y-4">
                {questions.map((q, index) => (
                  <div key={q.id}>
                    <p className="font-semibold text-white">{index + 1}. {q.question}</p>
                    <p className="text-sm text-gray-400 mt-1 flex items-center">
                      <Info className="w-4 h-4 mr-2 text-blue-400" /> {q.explanation}
                    </p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
          <CardFooter className="flex gap-4 justify-center">
            <Button onClick={resetQuiz} variant="outline" className="text-blue-300 border-blue-500/30">
              Refazer Quiz
            </Button>
            <Button onClick={onClose} className="bg-blue-600 hover:bg-blue-700">
              Fechar
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const question = questions[currentQuestion];
  const isAnswered = quizState === 'answered';

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="bg-slate-900 border-blue-500/30 p-6 max-w-2xl w-full">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-white">Quiz: Crise dos Mísseis</h2>
            <div className="text-blue-300 font-mono">
              {currentQuestion + 1} / {questions.length}
            </div>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2 mb-4">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>
        <div className="mb-6">
          <h3 className="text-xl text-white mb-4">{question.question}</h3>
          <div className="space-y-3">
            {question.options.map((option, index) => {
              const isSelected = selectedAnswers[currentQuestion] === index;
              const isCorrect = index === question.correctAnswer;
              
              return (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  disabled={isAnswered}
                  className={`w-full p-4 text-left rounded-lg border transition-all duration-300 ${
                    !isAnswered 
                      ? 'border-blue-500/30 bg-slate-800 hover:bg-slate-700 text-white cursor-pointer'
                      : isSelected
                        ? isCorrect 
                          ? 'border-green-500 bg-green-500/20 text-green-300'
                          : 'border-red-500 bg-red-500/20 text-red-300'
                        : isCorrect
                          ? 'border-green-500 bg-green-500/10 text-green-300'
                          : 'border-gray-600 bg-gray-800 text-gray-400 opacity-70'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{option}</span>
                    {isAnswered && isSelected && (isCorrect ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />)}
                    {isAnswered && !isSelected && isCorrect && <CheckCircle className="w-5 h-5 text-green-400" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
        {isAnswered && (
          <div className="bg-blue-900/30 border border-blue-500/30 rounded-lg p-4 mb-4 animate-in fade-in-50 duration-500">
            <h4 className="text-blue-300 font-semibold mb-2">Explicação:</h4>
            <p className="text-gray-300">{question.explanation}</p>
          </div>
        )}
        <div className="flex justify-between items-center mt-6">
          <Button onClick={onClose} variant="outline" className="text-gray-300 border-gray-600">
            Sair do Quiz
          </Button>
          {isAnswered && (
             <Button onClick={handleNext} className="bg-blue-600 hover:bg-blue-700">
                {currentQuestion < questions.length - 1 ? 'Próxima Pergunta' : 'Ver Resultados'}
                <ChevronsRight className="w-4 h-4 ml-2" />
             </Button>
          )}
        </div>
      </Card>
    </div>
  );
};

export default Quiz;