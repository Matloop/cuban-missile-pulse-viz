import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Key, Trophy, Swords, ArrowLeft, ArrowRight, ArrowUp, ArrowDown, Space } from 'lucide-react';

// --- CONFIGURAÇÕES DO JOGO ---
const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
const LINES_TO_WIN = 5;

// --- FORMAS DOS MÍSSEIS (BLOCOS DE TETRIS) ---
const PIECES = {
  0: { shape: [[0]], color: 'transparent' },
  I: { shape: [[1, 1, 1, 1]], color: '#3b82f6' },
  O: { shape: [[1, 1], [1, 1]], color: '#ef4444' },
  T: { shape: [[0, 1, 0], [1, 1, 1]], color: '#8b5cf6' },
  L: { shape: [[0, 0, 1], [1, 1, 1]], color: '#f97316' },
  J: { shape: [[1, 0, 0], [1, 1, 1]], color: '#eab308' },
  S: { shape: [[0, 1, 1], [1, 1, 0]], color: '#22c55e' },
  Z: { shape: [[1, 1, 0], [0, 1, 1]], color: '#ec4899' },
};
type PieceKey = keyof typeof PIECES;

const createBoard = (): (readonly [number, string])[][] => 
  Array.from({ length: BOARD_HEIGHT }, () => Array(BOARD_WIDTH).fill([0, 'transparent']));

interface Piece {
  pos: { x: number; y: number };
  shape: number[][];
  color: string;
}

// --- COMPONENTES DA UI ---
const GameInfoPanel = ({ title, value }: { title: React.ReactNode; value: React.ReactNode }) => (
  <div className="bg-slate-800 p-4 rounded-lg border-2 border-slate-600 mt-4 text-center">
    <h2 className="text-lg font-bold text-cyan-400">{title}</h2>
    <p className="text-4xl font-bold mt-2">{value}</p>
  </div>
);

const ControlsPanel = () => (
  <div className="bg-slate-800 p-4 rounded-lg border-2 border-slate-600 mt-4 text-sm text-gray-300">
    <h2 className="text-lg font-bold text-cyan-400 mb-2 text-center">CONTROLES</h2>
    <div className="space-y-2">
      <div className="flex items-center gap-2"><ArrowLeft size={16}/> / <ArrowRight size={16}/> : Mover</div>
      <div className="flex items-center gap-2"><ArrowUp size={16}/> : Girar</div>
      <div className="flex items-center gap-2"><ArrowDown size={16}/> : Acelerar</div>
      <div className="flex items-center gap-2"><Space size={16}/> : Queda Imediata</div>
    </div>
  </div>
);

interface TetrisProps {
  opponent: any;
  onWin: () => void;
  onLose: () => void;
}

const MissileCrisisTetris: React.FC<TetrisProps> = ({ onWin, onLose }) => {
  const [board, setBoard] = useState(createBoard());
  const [player, setPlayer] = useState<Piece>({ pos: { x: 0, y: 0 }, shape: PIECES[0].shape, color: PIECES[0].color });
  const [nextPiece, setNextPiece] = useState(createRandomPiece());
  const [linesCleared, setLinesCleared] = useState(0);
  const [level, setLevel] = useState(0);
  const [dropTime, setDropTime] = useState(1000);
  const [gameState, setGameState] = useState<'intro' | 'playing' | 'won' | 'lost'>('intro');

  function createRandomPiece(): Piece {
    const shapes = 'IOTLJSZ';
    const randShape = shapes[Math.floor(Math.random() * shapes.length)] as PieceKey;
    const newPiece = PIECES[randShape];
    return {
      pos: { x: Math.floor(BOARD_WIDTH / 2) - Math.floor(newPiece.shape[0].length / 2), y: 0 },
      shape: JSON.parse(JSON.stringify(newPiece.shape)), // Deep copy da forma
      color: newPiece.color,
    };
  }

  const checkCollision = useCallback((p: Piece, b: (readonly [number, string])[][]): boolean => {
    for (let y = 0; y < p.shape.length; y++) {
      for (let x = 0; x < p.shape[y].length; x++) {
        if (p.shape[y][x] !== 0) {
          const newY = p.pos.y + y;
          const newX = p.pos.x + x;
          if (newY >= BOARD_HEIGHT || newX < 0 || newX >= BOARD_WIDTH || (b[newY] && b[newY][newX][0] !== 0)) {
            return true;
          }
        }
      }
    }
    return false;
  }, []);
  
  const lockPieceAndReset = useCallback((pieceToLock: Piece) => {
    const newBoard = JSON.parse(JSON.stringify(board));
    pieceToLock.shape.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value !== 0) {
          const boardY = pieceToLock.pos.y + y;
          const boardX = pieceToLock.pos.x + x;
          if (boardY >= 0 && boardY < BOARD_HEIGHT && boardX >= 0 && boardX < BOARD_WIDTH) {
            newBoard[boardY][boardX] = [1, pieceToLock.color];
          }
        }
      });
    });
    
    let clearedCount = 0;
    const boardWithoutFullRows = newBoard.filter((row: any[]) => !row.every(cell => cell[0] !== 0));
    clearedCount = BOARD_HEIGHT - boardWithoutFullRows.length;
    
    const newEmptyRows = Array.from({ length: clearedCount }, () => Array(BOARD_WIDTH).fill([0, 'transparent']));
    const finalBoard = [...newEmptyRows, ...boardWithoutFullRows];
    setBoard(finalBoard);

    if (clearedCount > 0) {
      setLinesCleared(prev => prev + clearedCount);
    }
    
    const newPiece = nextPiece;
    if (checkCollision(newPiece, finalBoard)) {
      setGameState('lost');
    } else {
      setPlayer(newPiece);
      setNextPiece(createRandomPiece());
    }
  }, [board, nextPiece, checkCollision]);

  const drop = useCallback(() => {
    setPlayer(prev => {
      const newPiece = { ...prev, pos: { x: prev.pos.x, y: prev.pos.y + 1 } };
      if (!checkCollision(newPiece, board)) {
        return newPiece;
      } else {
        if (prev.pos.y < 1) {
          setGameState('lost');
        }
        lockPieceAndReset(prev);
        return prev;
      }
    });
  }, [board, checkCollision, lockPieceAndReset]);

  const movePlayer = (dir: -1 | 1) => {
    setPlayer(prev => {
      const newPiece = { ...prev, pos: { ...prev.pos, x: prev.pos.x + dir } };
      if (!checkCollision(newPiece, board)) {
        return newPiece;
      }
      return prev;
    });
  };
  
  const rotatePlayer = () => {
    setPlayer(prev => {
      // Não rotacionar a peça O (quadrado)
      if (prev.color === '#ef4444') return prev; // Cor da peça O
      
      // Criar uma rotação 90 graus no sentido horário
      const matrix = prev.shape;
      const rotated = matrix[0].map((_, colIndex) => 
        matrix.map(row => row[colIndex]).reverse()
      );
      
      const newPiece = {
        ...prev,
        shape: rotated
      };

      // Tentar diferentes posições para encaixar a peça rotacionada
      const offsets = [0, 1, -1, 2, -2];
      for (const offset of offsets) {
        const testPiece = {
          ...newPiece,
          pos: { ...newPiece.pos, x: prev.pos.x + offset }
        };
        
        if (!checkCollision(testPiece, board)) {
          return testPiece;
        }
      }
      
      // Se não conseguir rotacionar, manter a peça original
      return prev;
    });
  };

  const hardDrop = () => {
    setPlayer(prev => {
      let tempPiece = { ...prev };
      while (!checkCollision({ ...tempPiece, pos: { ...tempPiece.pos, y: tempPiece.pos.y + 1 } }, board)) {
        tempPiece.pos.y += 1;
      }
      lockPieceAndReset(tempPiece);
      return tempPiece;
    });
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (gameState !== 'playing') return;
      
      event.preventDefault(); // Prevenir scroll da página
      
      if (event.keyCode === 37) movePlayer(-1);      // Seta esquerda
      else if (event.keyCode === 39) movePlayer(1);  // Seta direita
      else if (event.keyCode === 40) drop();         // Seta para baixo
      else if (event.keyCode === 38) rotatePlayer(); // Seta para cima
      else if (event.keyCode === 32) hardDrop();     // Espaço
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, player, board, drop]);

  useEffect(() => {
    if (linesCleared >= LINES_TO_WIN) setGameState('won');
    const newLevel = Math.floor(linesCleared / 3);
    if (newLevel > level) {
      setLevel(newLevel);
      setDropTime(Math.max(150, 1000 / (newLevel + 1) + 100));
    }
  }, [linesCleared, level]);
  
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (gameState === 'intro') {
      timer = setTimeout(() => {
        setPlayer(createRandomPiece());
        setNextPiece(createRandomPiece());
        setGameState('playing');
      }, 2000);
    } else if (gameState === 'won') {
      timer = setTimeout(onWin, 2000);
    } else if (gameState === 'lost') {
      timer = setTimeout(onLose, 2000);
    }
    return () => clearTimeout(timer);
  }, [gameState, onWin, onLose]);
  
  useEffect(() => {
    let gameInterval: NodeJS.Timeout | undefined;
    if(gameState === 'playing') {
      gameInterval = setInterval(drop, dropTime);
    }
    return () => clearInterval(gameInterval);
  }, [gameState, dropTime, drop]);

  // Renderizar o tabuleiro com a peça atual
  const displayBoard = board.map(row => row.map(cell => [...cell])) as [number, string][][];
  
  // Adicionar a peça atual ao tabuleiro de display
  if (player.shape && player.shape.length > 0) {
    player.shape.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value !== 0) {
          const boardY = player.pos.y + y;
          const boardX = player.pos.x + x;
          if (boardY >= 0 && boardY < BOARD_HEIGHT && boardX >= 0 && boardX < BOARD_WIDTH) {
            displayBoard[boardY][boardX] = [1, player.color];
          }
        }
      });
    });
  }

  if (gameState !== 'playing') {
    return (
      <div className="fixed inset-0 bg-black z-[100] flex items-center justify-center font-mono">
        {gameState === 'intro' && (
          <p className="text-white text-2xl">INICIANDO SIMULAÇÃO DE CONTENÇÃO...</p>
        )}
        {gameState === 'won' && (
          <div className="text-center text-white p-8 bg-slate-900 border-2 border-yellow-500 rounded-lg">
            <Trophy className="w-20 h-20 text-yellow-400 mx-auto" />
            <h1 className="text-4xl font-bold mt-4">VITÓRIA!</h1>
            <p className="text-lg text-gray-300 mt-2">Ameaça neutralizada.</p>
            <div className="my-6 text-2xl font-bold text-yellow-300 flex items-center justify-center gap-2">
              <Key/> +1 Chave de Análise
            </div>
            <Button size="lg" className="bg-green-600 hover:bg-green-700" onClick={onWin}>
              Prosseguir
            </Button>
          </div>
        )}
        {gameState === 'lost' && (
          <div className="text-center text-white p-8 bg-slate-900 border-2 border-red-500 rounded-lg">
            <Swords className="w-20 h-20 text-red-400 mx-auto" />
            <h1 className="text-4xl font-bold mt-4">FALHA NA MISSÃO</h1>
            <p className="text-lg text-gray-300 mt-2">A ameaça sobrepujou as defesas.</p>
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 mt-6" onClick={onLose}>
              Voltar para a Timeline
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black z-[100] flex items-center justify-center p-4 font-mono">
      <div className="flex gap-8 items-center">
        <div className="grid grid-cols-10 gap-px bg-slate-900 border-4 border-slate-600 p-1">
          {displayBoard.map((row, y) =>
            row.map((cell, x) => (
              <div 
                key={`${y}-${x}`} 
                className="w-8 h-8 border border-slate-700" 
                style={{ backgroundColor: cell[1] === 'transparent' ? '#1e293b' : cell[1] }} 
              />
            ))
          )}
        </div>
        <div className="w-52 text-white">
          <div className="bg-slate-800 p-4 rounded-lg border-2 border-slate-600">
            <h2 className="text-lg font-bold text-cyan-400 mb-2 text-center">PRÓXIMA AMEAÇA</h2>
            <div className="flex justify-center items-center min-h-[80px]">
              <div 
                className="grid gap-px p-2 bg-slate-700 rounded"
                style={{
                  gridTemplateColumns: `repeat(${nextPiece.shape[0]?.length || 1}, minmax(0, 1fr))`
                }}
              >
                {nextPiece.shape.map((row, y) =>
                  row.map((cell, x) => (
                    <div 
                      key={`next-${y}-${x}`} 
                      className="w-6 h-6 border border-slate-600" 
                      style={{ 
                        backgroundColor: cell !== 0 ? nextPiece.color : '#374151'
                      }} 
                    />
                  ))
                )}
              </div>
            </div>
          </div>
          <GameInfoPanel title={<>AMEAÇAS<br/>NEUTRALIZADAS</>} value={`${linesCleared} / ${LINES_TO_WIN}`} />
          <GameInfoPanel title={<>NÍVEL DE<br/>VELOCIDADE</>} value={level + 1} />
          <ControlsPanel />
        </div>
      </div>
    </div>
  );
};

export default MissileCrisisTetris;