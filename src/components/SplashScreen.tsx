import React, { useState, useEffect, useRef } from 'react';
import { Power, AlertTriangle } from 'lucide-react';
import { TypeAnimation } from 'react-type-animation';
import * as THREE from 'three';
import NET from 'vanta/dist/vanta.net.min.js';

interface SplashScreenProps {
  onStart: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onStart }) => {
  const vantaRef = useRef(null);
  // Usamos 'any' para o tipo do vantaEffect, pois a biblioteca Vanta não fornece tipos oficiais
  const [vantaEffect, setVantaEffect] = useState<any>(null);

  useEffect(() => {
    // A verificação `vantaRef.current` garante que o div exista antes de inicializar o Vanta
    if (!vantaEffect && vantaRef.current) {
      setVantaEffect(
        NET({
          el: vantaRef.current,
          THREE: THREE, // Passa a biblioteca THREE.js (versão correta) para o Vanta
          mouseControls: true,
          touchControls: true,
          gyroControls: false,
          minHeight: 200.00,
          minWidth: 200.00,
          scale: 1.00,
          scaleMobile: 1.00,
          color: 0x0891b2, // Cor ciano (em hexadecimal)
          backgroundColor: 0x020617, // Fundo azul escuro
          points: 12.00,
          maxDistance: 25.00,
          spacing: 18.00
        })
      );
    }

    // Função de limpeza para destruir o efeito quando o componente for desmontado
    return () => {
      if (vantaEffect) {
        vantaEffect.destroy();
      }
    };
  }, [vantaEffect]); // A dependência garante que o useEffect rode apenas uma vez

  return (
    // O div principal agora serve como container para o efeito Vanta
    <div ref={vantaRef} className="relative w-screen h-screen overflow-hidden">
      
      <div className="absolute top-0 left-0 w-full h-full z-10 pointer-events-none">
        <div className="scanline"></div>
      </div>

      <div className="relative z-20 flex flex-col items-center justify-center w-full h-full text-cyan-200 font-mono">
        <div className="bg-black/40 backdrop-blur-sm border border-cyan-500/30 rounded-xl p-8 max-w-3xl text-center shadow-2xl shadow-cyan-500/10">
          <div className="flex justify-center items-center gap-4 mb-4">
            <AlertTriangle className="w-10 h-10 text-red-400" />
            <h1
              className="text-4xl md:text-5xl font-bold text-cyan-100 tracking-widest uppercase"
              style={{ textShadow: '0 0 10px #0891b2, 0 0 20px #0891b2' }}
            >
              Operação Chronos
            </h1>
            <AlertTriangle className="w-10 h-10 text-red-400" />
          </div>

          <div className="h-16 mt-4 text-lg text-cyan-300">
            <TypeAnimation
              sequence={[
                'INICIALIZANDO PROTOCOLO DE ANÁLISE...', 2000,
                'CARREGANDO DADOS HISTÓRICOS CRÍTICOS...', 2000,
                'ALVO: CRISE DOS MÍSSEIS DE CUBA, 1962.', 2000,
                'NÍVEL DE AMEAÇA: MÁXIMO.', 3000,
                'AGUARDANDO COMANDO PARA INICIAR SIMULAÇÃO...', 5000,
              ]}
              wrapper="span"
              speed={50}
              cursor={true}
              repeat={Infinity}
              style={{ display: 'inline-block' }}
            />
          </div>

          <div className="mt-10">
            <button
              onClick={onStart}
              className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white bg-cyan-700/50 border-2 border-cyan-500 rounded-lg overflow-hidden transition-all duration-300 ease-in-out hover:border-cyan-300 hover:shadow-[0_0_20px_theme(colors.cyan.400)]"
            >
              <span className="absolute w-0 h-0 transition-all duration-300 ease-out bg-cyan-600 rounded-full group-hover:w-56 group-hover:h-56"></span>
              <span className="relative flex items-center gap-2">
                <Power className="w-6 h-6" />
                INICIAR ANÁLISE
              </span>
            </button>
          </div>
        </div>
      </div>
      
       <div className="absolute top-4 left-4 z-20 font-mono text-xs text-green-400/70 pointer-events-none">
        <p>STATUS: ONLINE</p>
        <p>CONEXÃO: SEGURA</p>
      </div>
      <div className="absolute bottom-4 right-4 z-20 font-mono text-xs text-red-400/70 text-right pointer-events-none">
        <p>RISCO NUCLEAR: CRÍTICO</p>
        <p>PROTOCOLO: DEFCON 2</p>
      </div>
    </div>
  );
};

export default SplashScreen;