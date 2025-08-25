// src/components/InfoPanel.tsx

import { Calendar, Quote, ListChecks, ChevronsRight, History, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import { motion } from 'framer-motion';

// --- IMAGENS (sem alterações) ---
import kennedyAdvisors from '../assets/kennedy-advisors.jpg';
import u2SpyPlane from '../assets/u2-spy-plane.jpg';
import sovietMissilesCuba from '../assets/soviet-missiles-cuba.jpg';
import navalBlockade from '../assets/naval-blockade.jpg';
import khrushchevCastro from '../assets/khrushchev-castro.jpg';
import castroSpeech from '../assets/castro-speech.jpg';
import unSecurityCouncil from '../assets/un-security-council.jpg';
import vasilyArkhipov from '../assets/vasily-arkhipov.jpg';
import excommMeeting from '../assets/excomm-meeting.jpg';
const imageMap: { [key: string]: string } = {
  'kennedy-advisors': kennedyAdvisors,
  'u2-spy-plane': u2SpyPlane,
  'soviet-missiles-cuba': sovietMissilesCuba,
  'naval-blockade': navalBlockade,
  'khrushchev-castro': khrushchevCastro,
  'castro-speech': castroSpeech,
  'un-security-council': unSecurityCouncil,
  'vasily-arkhipov': vasilyArkhipov,
  'excomm-meeting': excommMeeting,
};
const historicalContexts: { [key: number]: string } = {
  1: "Crise resolvida, mundo respira aliviado",
  2: "Situação sob monitoramento constante",
  3: "Tensões diplomáticas se intensificam",
  4: "Forças militares em estado de alerta máximo",
  5: "O mundo nunca esteve tão próximo da guerra nuclear total",
};

const InfoSection = ({ icon: Icon, title, children }: { icon: React.ElementType, title: string, children: React.ReactNode }) => (
  <div className="flex items-start gap-3">
    <Icon className="w-5 h-5 text-cyan-400 mt-1 shrink-0" />
    <div>
      <h5 className="font-semibold text-cyan-300 text-sm">{title}</h5>
      <div className="text-xs text-gray-300 leading-relaxed">{children}</div>
    </div>
  </div>
);

const InfoPanel: React.FC<any> = ({ currentEvent, canAdvance, onAdvanceDay, isFinalDay }) => {
  return (
    <div className="h-full flex flex-col">
      <div className="overflow-y-auto pr-2 flex-grow">
        <div className="space-y-4">
          <div className="border-b border-cyan-500/30 pb-3">
            <h3 className="text-lg font-semibold text-cyan-200 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Resumo do Dia
            </h3>
          </div>

          {currentEvent && (
            <div className="space-y-4">
              {currentEvent.image && imageMap[currentEvent.image] && <img src={imageMap[currentEvent.image]} alt={currentEvent.title} className="w-full h-32 object-cover rounded-lg border border-cyan-500/20" />}
              <div>
                <h4 className="font-bold text-white text-xl">{currentEvent.title}</h4>
                <p className="text-sm text-gray-300 leading-relaxed mt-1 bg-black/30 p-3 rounded-lg">{currentEvent.description}</p>
              </div>
              <div className="space-y-3 bg-black/20 p-3 rounded-lg border border-cyan-800/20">
                <InfoSection icon={ListChecks} title="Momentos-Chave">
                  <ul className="list-disc list-inside space-y-1">
                    {currentEvent.key_moments.map((moment: string, index: number) => <li key={index}>{moment}</li>)}
                  </ul>
                </InfoSection>
                <InfoSection icon={Quote} title="Citação do Dia">
                  <blockquote className="italic">"{currentEvent.quote}"<footer className="not-italic text-cyan-400/80 mt-1">- {currentEvent.quote_author}</footer></blockquote>
                </InfoSection>
                <InfoSection icon={History} title="Contexto Histórico">
                  {historicalContexts[currentEvent.riskLevel] || 'N/A'}
                </InfoSection>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-cyan-500/20 shrink-0">
        {canAdvance ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
            {/* --- MUDANÇA: BOTÃO MAIOR E COM EFEITO RGB --- */}
            <Button 
              onClick={onAdvanceDay} 
              className="w-full text-white font-bold h-16 text-xl rainbow-glow"
            >
              PROSSEGUIR PARA O PRÓXIMO DIA
              <ChevronsRight className="w-6 h-6 ml-3" />
            </Button>
          </motion.div>
        ) : (
          /* --- MUDANÇA: MENSAGEM EXPLICATIVA PARA O JOGADOR --- */
          <div className="bg-black/20 rounded-lg p-3 border border-yellow-500/20 text-center">
            <div className="flex items-center justify-center text-yellow-300">
                <AlertCircle className="w-4 h-4 mr-2" />
                <p className="text-sm font-semibold">Ação Necessária</p>
            </div>
            <p className="text-xs text-gray-300 mt-1">
              {isFinalDay ? 'Você chegou ao fim da crise. Prepare-se para o confronto final!' : 'Você está revisitando um dia anterior. Volte para o dia mais recente na Linha do Tempo para poder avançar.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InfoPanel;