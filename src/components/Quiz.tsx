import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { CheckCircle, XCircle, Trophy } from 'lucide-react';

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

const questions: Question[] = [
  {
    id: 1,
    question: "Quando os mísseis soviéticos em Cuba foram descobertos?",
    options: [
      "14 de outubro de 1962",
      "16 de outubro de 1962", 
      "22 de outubro de 1962",
      "24 de outubro de 1962"
    ],
    correctAnswer: 0,
    explanation: "Os mísseis foram descobertos em 14 de outubro de 1962 por um avião espião U-2 pilotado por Richard Heyser."
  },
  {
    id: 2,
    question: "Qual foi o nome dado ao comitê formado por Kennedy para lidar com a crise?",
    options: [
      "Conselho de Guerra",
      "ExComm (Comitê Executivo)",
      "Grupo de Crise",
      "Comando Supremo"
    ],
    correctAnswer: 1,
    explanation: "Kennedy formou o ExComm (Comitê Executivo do Conselho de Segurança Nacional) para assessorá-lo durante a crise."
  },
  {
    id: 3,
    question: "Por que Kennedy usou o termo 'quarentena' em vez de 'bloqueio'?",
    options: [
      "Soava mais diplomático",
      "Era mais preciso tecnicamente",
      "Bloqueio seria considerado ato de guerra",
      "Foi sugestão da ONU"
    ],
    correctAnswer: 2,
    explanation: "Kennedy evitou o termo 'bloqueio' porque seria considerado um ato de guerra segundo o direito internacional."
  },
  {
    id: 4,
    question: "Qual dia ficou conhecido como 'Sábado Negro'?",
    options: [
      "26 de outubro",
      "27 de outubro",
      "28 de outubro",
      "29 de outubro"
    ],
    correctAnswer: 1,
    explanation: "27 de outubro foi o 'Sábado Negro', quando um U-2 foi abatido e o mundo chegou mais perto da guerra nuclear."
  },
  {
    id: 5,
    question: "Qual foi o acordo secreto que ajudou a resolver a crise?",
    options: [
      "Mísseis americanos na Turquia seriam removidos",
      "Cuba se tornaria neutra",
      "A URSS pagaria indenização",
      "Os EUA reduziriam tropas na Europa"
    ],
    correctAnswer: 0,
    explanation: "Secretamente, os EUA concordaram em remover os mísseis Júpiter da Turquia em 4-5 meses."
  },
  {
    id: 6,
    question: "Quantos dias durou a Crise dos Mísseis de Cuba?",
    options: [
      "10 dias",
      "13 dias",
      "15 dias",
      "20 dias"
    ],
    correctAnswer: 1,
    explanation: "A crise durou exatos 13 dias, de 14 a 28 de outubro de 1962, sendo conhecida como 'Os 13 Dias'."
  }
];

interface QuizProps {
  onClose: () => void;
}

const Quiz: React.FC<QuizProps> = ({ onClose }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>(Array(questions.length).fill(-1));
  const [showResults, setShowResults] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  const handleAnswerSelect = (answerIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestion] = answerIndex;
    setSelectedAnswers(newAnswers);
    setShowExplanation(true);
    
    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setShowExplanation(false);
      } else {
        setShowResults(true);
      }
    }, 3000);
  };

  const calculateScore = () => {
    return selectedAnswers.filter((answer, index) => answer === questions[index].correctAnswer).length;
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setSelectedAnswers(Array(questions.length).fill(-1));
    setShowResults(false);
    setShowExplanation(false);
  };

  if (showResults) {
    const score = calculateScore();
    const percentage = Math.round((score / questions.length) * 100);

    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <Card className="bg-slate-900 border-blue-500/30 p-8 max-w-2xl w-full">
          <div className="text-center">
            <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-white mb-4">Quiz Concluído!</h2>
            <div className="text-6xl font-bold text-blue-400 mb-2">{score}/{questions.length}</div>
            <div className="text-xl text-blue-300 mb-6">{percentage}% de acertos</div>
            
            <div className="text-lg text-gray-300 mb-6">
              {percentage >= 80 ? "Excelente! Você domina a história da Crise dos Mísseis!" :
               percentage >= 60 ? "Bom trabalho! Você tem um bom conhecimento sobre o tema." :
               "Continue estudando para aprender mais sobre este momento histórico crucial!"}
            </div>

            <div className="flex gap-4 justify-center">
              <Button onClick={resetQuiz} variant="outline" className="text-blue-300 border-blue-500/30">
                Refazer Quiz
              </Button>
              <Button onClick={onClose} className="bg-blue-600 hover:bg-blue-700">
                Fechar
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  const question = questions[currentQuestion];
  const isAnswered = selectedAnswers[currentQuestion] !== -1;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="bg-slate-900 border-blue-500/30 p-6 max-w-2xl w-full">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-white">Quiz: Crise dos Mísseis</h2>
            <div className="text-blue-300">
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
              const showFeedback = showExplanation;
              
              return (
                <button
                  key={index}
                  onClick={() => !isAnswered && handleAnswerSelect(index)}
                  disabled={isAnswered}
                  className={`w-full p-4 text-left rounded-lg border transition-all duration-300 ${
                    !showFeedback 
                      ? 'border-blue-500/30 bg-slate-800 hover:bg-slate-700 text-white'
                      : isSelected
                        ? isCorrect 
                          ? 'border-green-500 bg-green-500/20 text-green-300'
                          : 'border-red-500 bg-red-500/20 text-red-300'
                        : isCorrect
                          ? 'border-green-500 bg-green-500/10 text-green-300'
                          : 'border-gray-600 bg-gray-800 text-gray-400'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{option}</span>
                    {showFeedback && (
                      <div>
                        {isSelected && (isCorrect ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />)}
                        {!isSelected && isCorrect && <CheckCircle className="w-5 h-5" />}
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {showExplanation && (
          <div className="bg-blue-900/30 border border-blue-500/30 rounded-lg p-4 mb-4">
            <h4 className="text-blue-300 font-semibold mb-2">Explicação:</h4>
            <p className="text-gray-300">{question.explanation}</p>
          </div>
        )}

        <div className="flex justify-between">
          <Button onClick={onClose} variant="outline" className="text-gray-300 border-gray-600">
            Fechar Quiz
          </Button>
          
          <div className="text-sm text-gray-400">
            {showExplanation ? 'Próxima pergunta em alguns segundos...' : 'Selecione uma resposta'}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Quiz;