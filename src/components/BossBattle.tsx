import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui/button';
import { HistoricalFigure } from '../types/crisisDataTypes';
import { getFigureImageUrl } from '@/lib/imageLoader';

interface BossBattleProps {
  playerTeam: HistoricalFigure[]; // Recebe um time de 3 personagens
  bossFigure: HistoricalFigure;
  onWin: () => void;
  onLose: () => void;
}

// Textos relacionados à Crise dos Mísseis de Cuba
const CRISIS_TEXTS = [
  "Em outubro de 1962, o mundo chegou mais perto de uma guerra nuclear do que nunca. A descoberta de mísseis soviéticos em Cuba criou uma crise sem precedentes entre Estados Unidos e União Soviética.",
  "Kennedy e Khrushchev enfrentaram treze dias de tensão extrema. Cada decisão poderia significar o início da Terceira Guerra Mundial. A diplomacia secreta e a contenção foram fundamentais.",
  "O bloqueio naval americano de Cuba foi chamado de quarentena para evitar implicações de guerra. Navios soviéticos se aproximavam enquanto o mundo continha a respiração esperando uma resolução.",
  "Robert Kennedy negociou secretamente com diplomatas soviéticos. O acordo final incluía a retirada dos mísseis de Cuba em troca da promessa de não invasão da ilha.",
  "Vasily Arkhipov, um oficial naval soviético, evitou o lançamento de um torpedo nuclear. Sua decisão de não autorizar o ataque pode ter salvado o mundo de uma catástrofe nuclear.",
  "A crise revelou a necessidade de comunicação direta entre superpotências. O telefone vermelho foi estabelecido para evitar mal-entendidos que poderiam levar à guerra.",
  "Fidel Castro pressionava por uma resposta militar mais agressiva. Sua posição radical contrastava com a abordagem mais cautelosa de Khrushchev durante as negociações críticas.",
  "Os mísseis Jupiter na Turquia foram secretamente retirados como parte do acordo. Esta concessão americana não foi revelada publicamente por décadas após a crise.",
  "A DEFCON 2 foi declarada pela primeira vez na história americana. As forças militares estavam em alerta máximo, prontas para responder a qualquer escalada do conflito.",
  "A espionagem por aviões U-2 forneceu evidências cruciais dos mísseis. As fotografias aéreas revelaram a extensão real da ameaça soviética em território cubano."
];

// Configurações do jogo
const BATTLE_DURATION = 60; // 60 segundos de batalha
const DAMAGE_PER_WORD_BASE = 5; // Dano base por palavra, ANTES do bônus de ataque
const ACCURACY_MULTIPLIER = 1.2;
const BOSS_ATTACK_INTERVAL = 3000;

const BossBattle: React.FC<BossBattleProps> = ({ playerTeam, bossFigure, onWin, onLose }) => {
  // Combina os stats do time (HP e Ataque) em um único objeto
  const combinedStats = useMemo(() => {
    return playerTeam.reduce(
      (acc, figure) => {
        acc.hp += figure.stats.hp;
        acc.attack += figure.stats.attack;
        return acc;
      },
      { hp: 0, attack: 0 }
    );
  }, [playerTeam]);

  const [gameStarted, setGameStarted] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);
  const [timeLeft, setTimeLeft] = useState(BATTLE_DURATION);

  // Usa os stats combinados para o HP inicial do jogador
  const [playerCurrentHp, setPlayerCurrentHp] = useState(combinedStats.hp);
  const [bossCurrentHp, setBossCurrentHp] = useState(bossFigure.stats.hp);

  const [currentText, setCurrentText] = useState('');
  const [userInput, setUserInput] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [wordsCompleted, setWordsCompleted] = useState(0);

  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [correctChars, setCorrectChars] = useState(0);
  const [totalChars, setTotalChars] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);

  const [message, setMessage] = useState('');
  const [playerDamageDealt, setPlayerDamageDealt] = useState(0);
  const [bossDamageDealt, setBossDamageDealt] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const gameTimerRef = useRef<NodeJS.Timeout | null>(null);
  const bossAttackRef = useRef<NodeJS.Timeout | null>(null);
  const wpmTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const randomText = CRISIS_TEXTS[Math.floor(Math.random() * CRISIS_TEXTS.length)];
    setCurrentText(randomText);
  }, []);

  const startGame = useCallback(() => {
    if (gameStarted || gameEnded) return;

    setGameStarted(true);
    setStartTime(Date.now());
    setMessage('Batalha iniciada! Digite o texto para atacar!');

    gameTimerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          endGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    bossAttackRef.current = setInterval(() => {
      if (!gameEnded) {
        performBossAttack();
      }
    }, BOSS_ATTACK_INTERVAL);

    wpmTimerRef.current = setInterval(calculateWPM, 1000);

    inputRef.current?.focus();
  }, [gameStarted, gameEnded]);

  const endGame = useCallback(() => {
    if (gameEnded) return;

    setGameEnded(true);
    setGameStarted(false);

    if (gameTimerRef.current) clearInterval(gameTimerRef.current);
    if (bossAttackRef.current) clearInterval(bossAttackRef.current);
    if (wpmTimerRef.current) clearInterval(wpmTimerRef.current);

    // Usa as variáveis de estado mais recentes para a decisão final
    setBossCurrentHp(currentBossHp => {
      setPlayerCurrentHp(currentPlayerHp => {
        if (currentBossHp <= 0) {
          setMessage('VITÓRIA! Você derrotou o inimigo!');
          setTimeout(onWin, 2000);
        } else if (currentPlayerHp <= 0) {
          setMessage('DERROTA! Seu esquadrão foi superado!');
          setTimeout(onLose, 2000);
        } else {
          if (currentPlayerHp > currentBossHp) {
            setMessage('VITÓRIA! Você sobreviveu com mais HP!');
            setTimeout(onWin, 2000);
          } else {
            setMessage('DERROTA! O inimigo terminou com mais HP!');
            setTimeout(onLose, 2000);
          }
        }
        return currentPlayerHp;
      });
      return currentBossHp;
    });
  }, [gameEnded, onWin, onLose]);

  const performBossAttack = useCallback(() => {
    const baseDamage = bossFigure.stats.attack;
    const damage = Math.floor(baseDamage * (0.8 + Math.random() * 0.4)); // Dano com variação

    setPlayerCurrentHp(prev => Math.max(0, prev - damage));
    setBossDamageDealt(prev => prev + damage);
    setMessage(`${bossFigure.name} atacou! -${damage} HP`);

    setTimeout(() => setMessage(''), 1500);
  }, [bossFigure]);

  const calculateWPM = useCallback(() => {
    if (!startTime || !gameStarted) return;

    const timeElapsed = (Date.now() - startTime) / 60000; // em minutos
    const wordsTyped = correctChars / 5; // Média de 5 caracteres por palavra
    const currentWpm = Math.round(wordsTyped / timeElapsed) || 0;

    setWpm(currentWpm);
  }, [startTime, gameStarted, correctChars]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!gameStarted || gameEnded) return;

    const value = e.target.value;
    if (value.length > currentText.length) return;

    setUserInput(value);
    setCurrentIndex(value.length);

    let correct = 0;
    for (let i = 0; i < value.length; i++) {
      if (value[i] === currentText[i]) correct++;
    }

    setCorrectChars(correct);
    setTotalChars(value.length);
    setAccuracy(value.length > 0 ? Math.round((correct / value.length) * 100) : 100);

    // Verifica se completou uma palavra
    const words = currentText.split(' ');
    let charCount = 0;
    
    for (let i = 0; i < words.length; i++) {
      const wordLength = words[i].length + (i < words.length - 1 ? 1 : 0); // +1 para o espaço
      if (charCount + wordLength <= value.length) {
        const wordText = words[i] + (i < words.length - 1 ? ' ' : '');
        const typedWord = value.substring(charCount, charCount + wordLength);
        
        if (wordText === typedWord && i + 1 > wordsCompleted) {
          // Usa o ataque combinado do time para calcular o dano
          const attackBonus = combinedStats.attack / 10;
          const rawWordDamage = DAMAGE_PER_WORD_BASE + attackBonus;
          const finalDamage = Math.floor(rawWordDamage * (accuracy / 100) * ACCURACY_MULTIPLIER);
          const totalDamage = Math.max(5, finalDamage); // Dano mínimo
          
          setBossCurrentHp(prev => Math.max(0, prev - totalDamage));
          setPlayerDamageDealt(prev => prev + totalDamage);
          setWordsCompleted(i + 1);
          setMessage(`Palavra completada! Dano: ${totalDamage}`);
          
          setTimeout(() => setMessage(''), 1000);
        }
        charCount += wordLength;
      } else {
        break;
      }
    }

    // Se completou o texto inteiro, gera um novo
    if (value === currentText) {
      const nextText = CRISIS_TEXTS[Math.floor(Math.random() * CRISIS_TEXTS.length)];
      setCurrentText(nextText);
      setUserInput('');
      setCurrentIndex(0);
      setWordsCompleted(0);
      setMessage('Texto completado! Novo texto carregado!');
      
      setTimeout(() => setMessage(''), 1500);
    }
  };

  useEffect(() => {
    if (gameStarted && !gameEnded) {
      if (playerCurrentHp <= 0 || bossCurrentHp <= 0) {
        endGame();
      }
    }
  }, [playerCurrentHp, bossCurrentHp, gameStarted, gameEnded, endGame]);

  useEffect(() => {
    return () => {
      if (gameTimerRef.current) clearInterval(gameTimerRef.current);
      if (bossAttackRef.current) clearInterval(bossAttackRef.current);
      if (wpmTimerRef.current) clearInterval(wpmTimerRef.current);
    };
  }, []);

  const HPBar: React.FC<{ current: number; max: number; label: string; color: string }> = ({ current, max, label, color }) => {
    const percentage = Math.max(0, (current / max) * 100);
    return (
      <div className="w-full bg-gray-800 rounded-lg h-8 border border-gray-600 relative overflow-hidden">
        <motion.div
          className="h-full rounded-lg"
          style={{ backgroundColor: color }}
          initial={{ width: '100%' }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5 }}
        />
        <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-white z-10">
          {label}: {Math.max(0, Math.ceil(current))} / {max}
        </span>
      </div>
    );
  };

  const renderText = () => {
    return currentText.split('').map((char, index) => {
      let className = 'text-gray-400';

      if (index < userInput.length) {
        className = userInput[index] === char ? 'text-green-400 bg-green-400/20' : 'text-red-400 bg-red-400/20';
      } else if (index === currentIndex) {
        className = 'text-white bg-white/20 animate-pulse';
      }

      return (
        <span key={index} className={`${className}`}>
          {char === ' ' ? '\u00A0' : char}
        </span>
      );
    });
  };

  return (
    <div className="fixed inset-0 bg-gray-950 z-[200] flex flex-col items-center justify-center p-4 font-mono text-white overflow-hidden">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.5 }}
        className="w-full h-full max-w-6xl flex flex-col justify-between"
      >
        <div className="flex flex-col items-center space-y-3">
          <img
            src={getFigureImageUrl(bossFigure.image)}
            className="h-32 w-32 object-cover rounded-full border-4 border-red-500 shadow-2xl"
            alt={bossFigure.name}
          />
          <p className="text-xl font-bold text-red-400">{bossFigure.name}</p>
          <div className="w-80">
            <HPBar current={bossCurrentHp} max={bossFigure.stats.hp} label="Boss HP" color="#ef4444" />
          </div>
        </div>

        <div className="text-center">
          <div className="text-3xl font-extrabold text-yellow-400 drop-shadow-lg">
            {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
          </div>
          <div className="text-xs text-gray-400">Tempo Restante</div>
        </div>

        <div className="flex-1 flex items-center justify-center px-4">
          <div className="w-full max-w-4xl bg-gray-900 rounded-lg border-2 border-gray-700 shadow-2xl">
            <div className="p-6 min-h-[200px] max-h-[300px] overflow-hidden">
              {!gameStarted && !gameEnded ? (
                <div className="text-center h-full flex flex-col items-center justify-center">
                  <p className="text-lg text-gray-300 mb-6">
                    Pressione o botão para iniciar a batalha contra o boss!
                  </p>
                  <Button onClick={startGame} className="bg-cyan-600 hover:bg-cyan-700 text-lg px-8 py-3">
                    INICIAR BATALHA
                  </Button>
                </div>
              ) : (
                <div 
                  className="text-lg leading-relaxed text-justify break-words"
                  style={{ 
                    fontFamily: 'monospace',
                    letterSpacing: '0.02em',
                    lineHeight: '1.6'
                  }}
                >
                  {renderText()}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3 text-center mb-4">
          <div className="bg-gray-800 rounded-lg p-3 border border-gray-600">
            <div className="text-xl font-bold text-cyan-400">{wpm}</div>
            <div className="text-xs text-gray-400">WPM</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-3 border border-gray-600">
            <div className="text-xl font-bold text-green-400">{accuracy}%</div>
            <div className="text-xs text-gray-400">Precisão</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-3 border border-gray-600">
            <div className="text-xl font-bold text-yellow-400">{playerDamageDealt}</div>
            <div className="text-xs text-gray-400">Dano Causado</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-3 border border-gray-600">
            <div className="text-xl font-bold text-red-400">{bossDamageDealt}</div>
            <div className="text-xs text-gray-400">Dano Sofrido</div>
          </div>
        </div>

        <div className="flex flex-col items-center space-y-2">
          <div className="flex -space-x-8">
            {playerTeam.map((agent, index) => (
              <img
                key={agent.id}
                src={getFigureImageUrl(agent.image)}
                className={`h-20 w-20 object-cover rounded-full border-4 border-cyan-400 shadow-lg z-${10 + index * 10}`}
                alt={agent.name}
              />
            ))}
          </div>
          <p className="text-sm text-cyan-300">Seu Esquadrão</p>
          <div className="w-64">
            <HPBar current={playerCurrentHp} max={combinedStats.hp} label="HP do Esquadrão" color="#22d3ee" />
          </div>
        </div>

        <AnimatePresence mode="wait">
          {message && (
            <motion.div
              key={message}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center text-base font-bold text-yellow-300 bg-yellow-300/20 backdrop-blur-sm rounded-lg p-3 border border-yellow-300/30 z-50"
            >
              {message}
            </motion.div>
          )}
        </AnimatePresence>

        {gameStarted && !gameEnded && (
          <input
            ref={inputRef}
            type="text"
            value={userInput}
            onChange={handleInputChange}
            className="sr-only"
            autoFocus
          />
        )}
      </motion.div>
    </div>
  );
};

export default BossBattle;