// src/components/Cutscene.tsx

import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Button } from './ui/button';

// Importe o vídeo diretamente para que o Vite gerencie o caminho
import finalVideo from '../assets/videos/final_cutscene.mp4'; 

interface CutsceneProps {
  onComplete: () => void;
}

const Cutscene: React.FC<CutsceneProps> = ({ onComplete }) => {
  // 1. Criamos uma referência para o elemento <video>
  const videoRef = useRef<HTMLVideoElement>(null);

  // 2. Usamos useEffect para controlar a reprodução quando o componente é montado
  useEffect(() => {
    const videoElement = videoRef.current;
    if (videoElement) {
      // 3. Tentamos dar play e lidamos com a Promise
      const playPromise = videoElement.play();

      if (playPromise !== undefined) {
        playPromise
          .then(_ => {
            // Autoplay iniciado com sucesso!
            console.log("Cutscene iniciada com sucesso.");
          })
          .catch(error => {
            // Autoplay foi bloqueado pelo navegador.
            console.error("Erro no autoplay da cutscene:", error);
            // Mesmo que falhe, silenciar o vídeo e tentar de novo é uma boa prática.
            videoElement.muted = true;
            videoElement.play();
          });
      }
    }
  }, []); // O array vazio garante que isso rode apenas uma vez

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black z-[300] flex flex-col items-center justify-center"
    >
      <video
        ref={videoRef} // 4. Associamos a ref ao elemento
        className="w-full h-full object-contain"
        src={finalVideo} // Usamos o vídeo importado
        playsInline  // Importante para iOS
        muted        // Silenciar o vídeo é a maneira mais segura de garantir o autoplay
        onEnded={onComplete}
      />
      <div className="absolute bottom-8 right-8">
        <Button 
          onClick={onComplete}
          className="bg-slate-800/50 text-white hover:bg-slate-700"
        >
          Pular Cutscene
        </Button>
      </div>
    </motion.div>
  );
};

export default Cutscene;