// src/components/BossBattle.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui/button';
import { HistoricalFigure } from '../types/crisisDataTypes';
import { getFigureImageUrl } from '@/lib/imageLoader';

interface BossBattleProps {
  playerAgent: HistoricalFigure;
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
const DAMAGE_PER_WPM = 2; // Dano baseado em WPM
const ACCURACY_MULTIPLIER = 1.5; // Multiplicador de dano por precisão
const BOSS_ATTACK_INTERVAL = 3000; // Boss ataca a cada 3 segundos

const BossBattle: React.FC<BossBattleProps> = ({ playerAgent, bossFigure, onWin, onLose }) => {
  // Estados do jogo
  const [gameStarted, setGameStarted] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);
  const [timeLeft, setTimeLeft] = useState(BATTLE_DURATION);
  
  // Estados de HP
  const [playerCurrentHp, setPlayerCurrentHp] = useState(playerAgent.stats.hp);
  const [bossCurrentHp, setBossCurrentHp] = useState(bossFigure.stats.hp);
  
  // Estados de digitação
  const [currentText, setCurrentText] = useState('');
  const [userInput, setUserInput] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Estados de estatísticas
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [correctChars, setCorrectChars] = useState(0);
  const [totalChars, setTotalChars] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  
  // Estados visuais
  const [message, setMessage] = useState('');
  const [playerDamageDealt, setPlayerDamageDealt] = useState(0);
  const [bossDamageDealt, setBossDamageDealt] = useState(0);
  
  // Refs
  const inputRef = useRef<HTMLInputElement>(null);
  const gameTimerRef = useRef<NodeJS.Timeout | null>(null);
  const bossAttackRef = useRef<NodeJS.Timeout | null>(null);
  const wpmTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Inicializar texto aleatório
  useEffect(() => {
    const randomText = CRISIS_TEXTS[Math.floor(Math.random() * CRISIS_TEXTS.length)];
    setCurrentText(randomText);
  }, []);

  // Iniciar jogo
  const startGame = useCallback(() => {
    if (gameStarted || gameEnded) return;
    
    setGameStarted(true);
    setStartTime(Date.now());
    setMessage('Batalha iniciada! Digite o texto para atacar!');
    
    // Timer principal do jogo
    gameTimerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          endGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    // Ataques do boss
    bossAttackRef.current = setInterval(() => {
      if (!gameEnded) {
        performBossAttack();
      }
    }, BOSS_ATTACK_INTERVAL);
    
    // Cálculo de WPM em tempo real
    wpmTimerRef.current = setInterval(calculateWPM, 1000);
    
    inputRef.current?.focus();
  }, [gameStarted, gameEnded]);

  // Finalizar jogo
  const endGame = useCallback(() => {
    if (gameEnded) return;
    
    setGameEnded(true);
    setGameStarted(false);
    
    // Limpar timers
    if (gameTimerRef.current) clearInterval(gameTimerRef.current);
    if (bossAttackRef.current) clearInterval(bossAttackRef.current);
    if (wpmTimerRef.current) clearInterval(wpmTimerRef.current);
    
    // Determinar vencedor baseado em HP
    if (bossCurrentHp <= 0) {
      setMessage('VITÓRIA! Você derrotou o inimigo com sua velocidade de digitação!');
      setTimeout(onWin, 2000);
    } else if (playerCurrentHp <= 0) {
      setMessage('DERROTA! O inimigo foi mais rápido que você!');
      setTimeout(onLose, 2000);
    } else {
      // Empate - quem tem mais HP ganha
      if (playerCurrentHp > bossCurrentHp) {
        setMessage('VITÓRIA! Você sobreviveu com mais HP!');
        setTimeout(onWin, 2000);
      } else {
        setMessage('DERROTA! O inimigo terminou com mais HP!');
        setTimeout(onLose, 2000);
      }
    }
  }, [gameEnded, bossCurrentHp, playerCurrentHp, onWin, onLose]);

  // Ataque do boss
  const performBossAttack = useCallback(() => {
    const baseDamage = bossFigure.stats.attack;
    const damage = Math.floor(baseDamage * (0.8 + Math.random() * 0.4)); // Dano variável
    
    setPlayerCurrentHp(prev => Math.max(0, prev - damage));
    setBossDamageDealt(prev => prev + damage);
    setMessage(`${bossFigure.name} atacou! -${damage} HP`);
    
    setTimeout(() => setMessage(''), 1500);
  }, [bossFigure]);

  // Calcular WPM
  const calculateWPM = useCallback(() => {
    if (!startTime || !gameStarted) return;
    
    const timeElapsed = (Date.now() - startTime) / 60000; // em minutos
    const wordsTyped = correctChars / 5; // 5 caracteres = 1 palavra (padrão WPM)
    const currentWpm = Math.round(wordsTyped / timeElapsed) || 0;
    
    setWpm(currentWpm);
  }, [startTime, gameStarted, correctChars]);

  // Lidar com input do usuário
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!gameStarted || gameEnded) return;
    
    const value = e.target.value;
    const char = value[value.length - 1];
    
    if (value.length > currentText.length) return; // Impedir digitação além do texto
    
    setUserInput(value);
    setCurrentIndex(value.length);
    
    // Calcular estatísticas
    let correct = 0;
    for (let i = 0; i < value.length; i++) {
      if (value[i] === currentText[i]) {
        correct++;
      }
    }
    
    setCorrectChars(correct);
    setTotalChars(value.length);
    setAccuracy(value.length > 0 ? Math.round((correct / value.length) * 100) : 100);
    
    // Verificar se completou o texto
    if (value === currentText) {
      // Texto completado - causar dano baseado em performance
      const performanceDamage = Math.floor(wpm * DAMAGE_PER_WPM * (accuracy / 100) * ACCURACY_MULTIPLIER);
      const totalDamage = Math.max(10, performanceDamage); // Dano mínimo de 10
      
      setBossCurrentHp(prev => Math.max(0, prev - totalDamage));
      setPlayerDamageDealt(prev => prev + totalDamage);
      setMessage(`Texto completado! Dano causado: ${totalDamage} (${wpm} WPM, ${accuracy}% precisão)`);
      
      // Resetar para próximo texto
      const nextText = CRISIS_TEXTS[Math.floor(Math.random() * CRISIS_TEXTS.length)];
      setCurrentText(nextText);
      setUserInput('');
      setCurrentIndex(0);
      
      setTimeout(() => setMessage(''), 2000);
    }
  };

  // Efeito para verificar fim de jogo por HP
  useEffect(() => {
    if (gameStarted && !gameEnded) {
      if (playerCurrentHp <= 0 || bossCurrentHp <= 0) {
        endGame();
      }
    }
  }, [playerCurrentHp, bossCurrentHp, gameStarted, gameEnded, endGame]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (gameTimerRef.current) clearInterval(gameTimerRef.current);
      if (bossAttackRef.current) clearInterval(bossAttackRef.current);
      if (wpmTimerRef.current) clearInterval(wpmTimerRef.current);
    };
  }, []);

  // Componente de barra de HP
  const HPBar: React.FC<{ current: number; max: number; label: string; color: string }> = ({ current, max, label, color }) => {
    const percentage = Math.max(0, (current / max) * 100);
    return (
      <div className="w-full bg-gray-800 rounded-lg h-6 border border-gray-600 relative overflow-hidden">
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

  // Renderizar caracteres do texto
  const renderText = () => {
    return currentText.split('').map((char, index) => {
      let className = 'text-gray-400';
      
      if (index < userInput.length) {
        className = userInput[index] === char ? 'text-green-400 bg-green-400/20' : 'text-red-400 bg-red-400/20';
      } else if (index === currentIndex) {
        className = 'text-white bg-white/20 animate-pulse';
      }
      
      return (
        <span key={index} className={`${className} text-xl leading-relaxed`}>
          {char === ' ' ? '·' : char}
        </span>
      );
    });
  };

  return (
    <div className="fixed inset-0 bg-gray-900 z-[200] flex flex-col items-center justify-center p-4 font-mono text-white">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-6xl bg-gray-800 border border-gray-600 rounded-lg p-6 space-y-6"
      >
        {/* Header com personagens e HPs */}
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <img 
              src={getFigureImageUrl(playerAgent.image)} 
              className="h-16 w-16 object-cover rounded-full border-2 border-cyan-400" 
              alt={playerAgent.name} 
            />
            <div className="w-64">
              <p className="text-sm text-cyan-300 mb-1">{playerAgent.name}</p>
              <HPBar current={playerCurrentHp} max={playerAgent.stats.hp} label="HP" color="#22d3ee" />
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-400">
              {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
            </div>
            <div className="text-sm text-gray-400">Tempo Restante</div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="w-64">
              <p className="text-sm text-red-300 mb-1">{bossFigure.name}</p>
              <HPBar current={bossCurrentHp} max={bossFigure.stats.hp} label="HP" color="#ef4444" />
            </div>
            <img 
              src={getFigureImageUrl(bossFigure.image)} 
              className="h-16 w-16 object-cover rounded-full border-2 border-red-400" 
              alt={bossFigure.name} 
            />
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-4 gap-4 text-center">
          <div className="bg-gray-700 rounded-lg p-3">
            <div className="text-2xl font-bold text-cyan-400">{wpm}</div>
            <div className="text-sm text-gray-400">WPM</div>
          </div>
          <div className="bg-gray-700 rounded-lg p-3">
            <div className="text-2xl font-bold text-green-400">{accuracy}%</div>
            <div className="text-sm text-gray-400">Precisão</div>
          </div>
          <div className="bg-gray-700 rounded-lg p-3">
            <div className="text-2xl font-bold text-yellow-400">{playerDamageDealt}</div>
            <div className="text-sm text-gray-400">Dano Causado</div>
          </div>
          <div className="bg-gray-700 rounded-lg p-3">
            <div className="text-2xl font-bold text-red-400">{bossDamageDealt}</div>
            <div className="text-sm text-gray-400">Dano Recebido</div>
          </div>
        </div>

        {/* Mensagem de feedback */}
        <AnimatePresence mode="wait">
          {message && (
            <motion.div
              key={message}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="text-center text-lg font-bold text-yellow-300 bg-yellow-300/10 rounded-lg p-2"
            >
              {message}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Área de texto */}
        <div className="bg-gray-900 rounded-lg p-6 min-h-[200px] relative">
          {!gameStarted && !gameEnded ? (
            <div className="text-center">
              <p className="text-xl text-gray-300 mb-4">
                Pressione o botão para iniciar a batalha de digitação!
              </p>
              <Button onClick={startGame} className="bg-cyan-600 hover:bg-cyan-700">
                INICIAR BATALHA
              </Button>
            </div>
          ) : (
            <div className="leading-loose text-justify">
              {renderText()}
            </div>
          )}
        </div>

        {/* Input invisível para capturar digitação */}
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

        {/* Instruções */}
        {!gameStarted && (
          <div className="text-center text-sm text-gray-400">
            Digite o texto exibido para causar dano no inimigo. Sua velocidade (WPM) e precisão determinam o dano causado.
            <br />
            O inimigo atacará periodicamente. Derrote-o antes que seu HP chegue a zero!
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default BossBattle;