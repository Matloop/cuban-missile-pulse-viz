import React from 'react';
import { User, Globe, Calendar, Quote, ListChecks, Target, Users, Shield } from 'lucide-react';

// --- IMAGENS ---
// Importe todas as imagens necessárias, incluindo as novas.
import kennedyAdvisors from '../assets/kennedy-advisors.jpg';
import u2SpyPlane from '../assets/u2-spy-plane.jpg';
import sovietMissilesCuba from '../assets/soviet-missiles-cuba.jpg';
import navalBlockade from '../assets/naval-blockade.jpg';
import khrushchevCastro from '../assets/khrushchev-castro.jpg';
// Novas imagens importadas
import castroSpeech from '../assets/castro-speech.jpg';
import unSecurityCouncil from '../assets/un-security-council.jpg';
import vasilyArkhipov from '../assets/vasily-arkhipov.jpg';
import excommMeeting from '../assets/excomm-meeting.jpg';

// Mapeamento completo de imagens
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

// Componente reutilizável para seções de informação
const InfoSection = ({ icon: Icon, title, children }: { icon: React.ElementType, title: string, children: React.ReactNode }) => (
  <div className="flex items-start gap-3">
    <Icon className="w-5 h-5 text-cyan-400 mt-1 shrink-0" />
    <div>
      <h5 className="font-semibold text-cyan-300 text-sm">{title}</h5>
      <div className="text-xs text-gray-300 leading-relaxed">{children}</div>
    </div>
  </div>
);

// --- O COMPONENTE PRINCIPAL ---
const InfoPanel: React.FC<any> = ({ currentEvent, selectedNode, nodes }) => {
  const displayNode = selectedNode || null;

  return (
    <div className="h-full overflow-y-auto pr-2">
      <div className="space-y-4">
        <div className="border-b border-cyan-500/30 pb-3">
          <h3 className="text-lg font-semibold text-cyan-200 flex items-center gap-2">
            {displayNode ? <Globe className="w-5 h-5" /> : <Calendar className="w-5 h-5" />}
            {displayNode ? 'Detalhes do Ator' : 'Resumo do Dia'}
          </h3>
        </div>

        {/* --- Painel de Informações do Ator (Nó Selecionado) --- */}
        {displayNode && (
          <div className="space-y-4">
            {displayNode.image && imageMap[displayNode.image] && (
              // CHANGED: Classes de imagem ajustadas para melhor exibição
              <div className="w-full bg-black/20 rounded-lg border border-cyan-500/20 flex justify-center items-center">
                <img 
                  src={imageMap[displayNode.image]} 
                  alt={displayNode.name} 
                  className="max-h-40 w-auto object-contain" 
                />
              </div>
            )}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full border-2 border-white flex-shrink-0" style={{ backgroundColor: displayNode.color }} />
              <div>
                <h4 className="font-bold text-white text-lg">{displayNode.name}</h4>
                <p className="text-cyan-200 text-sm flex items-center gap-1"><User className="w-4 h-4" /> {displayNode.leader}</p>
              </div>
            </div>
            <p className="text-sm text-gray-300 leading-relaxed bg-black/30 p-3 rounded-lg">{displayNode.description}</p>
            <div className="space-y-3 bg-black/20 p-3 rounded-lg border border-cyan-800/20">
              <InfoSection icon={Target} title="Objetivo Principal">{displayNode.objective}</InfoSection>
              <InfoSection icon={Users} title="Figuras-Chave">{displayNode.key_figures}</InfoSection>
              <InfoSection icon={Shield} title="Recursos Estratégicos">{displayNode.key_assets}</InfoSection>
            </div>
          </div>
        )}

        {/* --- Painel de Informações do Evento (Padrão) --- */}
        {currentEvent && !displayNode && (
          <div className="space-y-4">
            {currentEvent.image && imageMap[currentEvent.image] && (
              // CHANGED: Classes de imagem ajustadas para melhor exibição
              <div className="w-full bg-black/20 rounded-lg border border-cyan-500/20 flex justify-center items-center">
                 <img 
                    src={imageMap[currentEvent.image]} 
                    alt={currentEvent.title} 
                    className="max-h-40 w-auto object-contain" 
                  />
              </div>
            )}
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
                <blockquote className="italic">
                  "{currentEvent.quote}"
                  <footer className="not-italic text-cyan-400/80 mt-1">- {currentEvent.quote_author}</footer>
                </blockquote>
              </InfoSection>
            </div>
          </div>
        )}
        
        <div className="bg-black/20 rounded-lg p-3 border border-cyan-500/10 mt-4">
          <p className="text-xs text-gray-400">
            💡 <strong>Dica:</strong> {displayNode ? 'Clique no mapa para voltar aos eventos.' : 'Clique nos atores no mapa para mais detalhes.'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default InfoPanel;