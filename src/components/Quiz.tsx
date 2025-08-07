import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card';
import { CheckCircle, XCircle, Trophy, ChevronsRight, Info, Key, RefreshCw } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import allQuestions from '../data/quizQuestions.json';

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface QuizProps {
  onClose: () => void;
  onComplete: (keysEarned: number) => void;
}

const QUESTIONS_PER_SESSION = 5;

// Função para embaralhar um array (Fisher-Yates shuffle)
const shuffleArray = (array: any[]) => {
  let currentIndex = array.length, randomIndex;
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }
  return array;
};

const FinalQuiz: React.FC<QuizProps> = ({ onClose, onComplete }) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<(number | null)[]>([]);
  const [quizState, setQuizState] = useState<'answering' | 'answered' | 'results'>('answering');

  useEffect(() => {
    startNewQuiz();
  }, []);

  const startNewQuiz = () => {
    const shuffled = shuffleArray([...allQuestions]).slice(0, QUESTIONS_PER_SESSION);
    setQuestions(shuffled);
    setCurrentQuestionIndex(0);
    setSelectedAnswers(Array(QUESTIONS_PER_SESSION).fill(null));
    setQuizState('answering');
  };

  const handleAnswerSelect = (answerIndex: number) => {
    if (quizState !== 'answering') return;
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestionIndex] = answerIndex;
    setSelectedAnswers(newAnswers);
    setQuizState('answered');
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setQuizState('answering');
    } else {
      setQuizState('results');
    }
  };

  const calculateScore = () => {
    return selectedAnswers.filter((answer, index) => answer === questions[index].correctAnswer).length;
  };
  
  const handleCloseAndReward = () => {
    const score = calculateScore();
    onComplete(score);
    onClose();
  };

  if (quizState === 'results') {
    const score = calculateScore();
    const percentage = Math.round((score / questions.length) * 100);

    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
        <Card className="bg-slate-900 border-yellow-500/30 max-w-2xl w-full">
          <CardHeader className="text-center">
            <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
            <CardTitle className="text-3xl font-bold text-white">Análise Concluída!</CardTitle>
            <div className="text-6xl font-bold text-yellow-300 pt-2 flex items-center justify-center gap-4">
              <Key className="w-12 h-12" /> +{score}
            </div>
            <div className="text-xl text-yellow-200">Você ganhou {score} Chave(s) de Análise!</div>
            <p className="text-lg text-gray-300 pt-4">Sua pontuação foi de {percentage}%.</p>
          </CardHeader>
          <CardFooter className="flex gap-4 justify-center">
            <Button onClick={startNewQuiz} variant="outline" className="text-cyan-300 border-cyan-500/30">
              <RefreshCw className="w-4 h-4 mr-2" /> Tentar Novamente
            </Button>
            <Button onClick={handleCloseAndReward} className="bg-yellow-600 hover:bg-yellow-700">
              Coletar Chaves e Fechar
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (questions.length === 0) return null; // Previne renderização antes do setup

  const question = questions[currentQuestionIndex];
  const isAnswered = quizState === 'answered';

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <Card className="bg-slate-900 border-blue-500/30 max-w-2xl w-full">
        <CardHeader>
          <div className="flex justify-between items-center mb-4">
            <CardTitle className="text-2xl font-bold text-white">Questionário Final</CardTitle>
            <div className="text-blue-300 font-mono">{currentQuestionIndex + 1} / {questions.length}</div>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2"><div className="bg-blue-500 h-2 rounded-full" style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}/></div>
        </CardHeader>
        <CardContent className="space-y-6 min-h-[20rem]">
          <h3 className="text-xl text-white">{question.question}</h3>
          <div className="space-y-3">
            {question.options.map((option, index) => {
              const isSelected = selectedAnswers[currentQuestionIndex] === index;
              const isCorrect = index === question.correctAnswer;
              return (
                <button
                  key={index} onClick={() => handleAnswerSelect(index)} disabled={isAnswered}
                  className={`w-full p-4 text-left rounded-lg border transition-all ${!isAnswered ? 'border-blue-500/30 bg-slate-800 hover:bg-slate-700' : isSelected ? (isCorrect ? 'border-green-500 bg-green-500/20' : 'border-red-500 bg-red-500/20') : isCorrect ? 'border-green-500 bg-green-500/10' : 'border-gray-600 opacity-60'}`}
                >
                  <div className="flex items-center justify-between">
                    <span>{option}</span>
                    {isAnswered && (isSelected ? (isCorrect ? <CheckCircle className="text-green-400"/> : <XCircle className="text-red-400"/>) : isCorrect ? <CheckCircle className="text-green-400"/> : null)}
                  </div>
                </button>
              );
            })}
          </div>
          {isAnswered && <div className="bg-blue-900/30 border border-blue-500/30 rounded-lg p-4"><Info className="inline w-4 h-4 mr-2 text-blue-300"/>{question.explanation}</div>}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button onClick={onClose} variant="outline">Sair</Button>
          {isAnswered && <Button onClick={handleNext} className="bg-blue-600 hover:bg-blue-700">{currentQuestionIndex < questions.length - 1 ? 'Próxima' : 'Ver Resultados'} <ChevronsRight className="w-4 h-4 ml-2" /></Button>}
        </CardFooter>
      </Card>
    </div>
  );
};

export default FinalQuiz;