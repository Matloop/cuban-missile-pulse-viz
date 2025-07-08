
import React from 'react';
import { User, Globe, Calendar, AlertTriangle } from 'lucide-react';

// Import images
import kennedyAdvisors from '../assets/kennedy-advisors.jpg';
import u2SpyPlane from '../assets/u2-spy-plane.jpg';
import sovietMissilesCuba from '../assets/soviet-missiles-cuba.jpg';
import navalBlockade from '../assets/naval-blockade.jpg';
import khrushchevCastro from '../assets/khrushchev-castro.jpg';

const InfoPanel = ({ currentEvent, selectedNode, nodes }) => {
  const displayNode = selectedNode || null;
  
  const imageMap = {
    'kennedy-advisors': kennedyAdvisors,
    'u2-spy-plane': u2SpyPlane,
    'soviet-missiles-cuba': sovietMissilesCuba,
    'naval-blockade': navalBlockade,
    'khrushchev-castro': khrushchevCastro
  };
  
  return (
    <div className="h-full overflow-y-auto">
      <div className="space-y-4">
        
        {/* Header */}
        <div className="border-b border-blue-500/30 pb-3">
          <h3 className="text-lg font-semibold text-blue-300 flex items-center gap-2">
            {displayNode ? (
              <>
                <Globe className="w-5 h-5" />
                Informações do Ator
              </>
            ) : (
              <>
                <Calendar className="w-5 h-5" />
                Evento Atual
              </>
            )}
          </h3>
        </div>

        {/* Node Information */}
        {displayNode && (
          <div className="space-y-4">
            <div className="bg-black/30 rounded-lg p-4 border border-blue-500/20">
              <div className="flex items-center gap-3 mb-3">
                <div 
                  className="w-6 h-6 rounded-full border-2 border-white"
                  style={{ backgroundColor: displayNode.color }}
                />
                <div>
                  <h4 className="font-bold text-white text-lg">
                    {displayNode.name}
                  </h4>
                  <p className="text-blue-200 text-sm flex items-center gap-1">
                    <User className="w-4 h-4" />
                    {displayNode.leader}
                  </p>
                </div>
              </div>
              
              <div className="mb-3">
                <span className="inline-block bg-blue-600/50 text-blue-200 px-2 py-1 rounded text-xs">
                  {displayNode.type}
                </span>
              </div>
              
              <p className="text-gray-300 text-sm leading-relaxed">
                {displayNode.description}
              </p>
            </div>
            
            {/* Node Image */}
            {displayNode.image && imageMap[displayNode.image] && (
              <div className="rounded-lg overflow-hidden border border-blue-500/20">
                <img 
                  src={imageMap[displayNode.image]} 
                  alt={displayNode.name} 
                  className="w-full h-40 object-cover"
                />
              </div>
            )}
            
            {/* Node Details */}
            {displayNode.details && (
              <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/20">
                <h5 className="text-blue-300 font-semibold mb-2">Contexto Histórico</h5>
                <p className="text-sm text-gray-300 leading-relaxed">{displayNode.details}</p>
              </div>
            )}
          </div>
        )}

        {/* Event Information */}
        {currentEvent && !displayNode && (
          <div className="space-y-4">
            <div>
              <h4 className="font-bold text-white text-xl mb-2">
                {currentEvent.title}
              </h4>
              <div className="text-blue-200 text-sm mb-3">
                {new Date(currentEvent.date).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric'
                })}
              </div>
            </div>
            
            {/* Event Image */}
            {currentEvent.image && imageMap[currentEvent.image] && (
              <div className="rounded-lg overflow-hidden border border-blue-500/20">
                <img 
                  src={imageMap[currentEvent.image]} 
                  alt={currentEvent.title} 
                  className="w-full h-48 object-cover"
                />
              </div>
            )}
            
            <div className="bg-black/30 rounded-lg p-4 border border-blue-500/20">
              <p className="text-gray-300 leading-relaxed text-sm">
                {currentEvent.description}
              </p>
            </div>
            
            {/* Event Details */}
            {currentEvent.details && (
              <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/20">
                <h5 className="text-blue-300 font-semibold mb-2">Contexto Histórico</h5>
                <p className="text-sm text-gray-300 leading-relaxed">{currentEvent.details}</p>
              </div>
            )}
            
            {/* Risk Level Indicator */}
            <div className="bg-red-500/10 rounded-lg p-4 border border-red-500/20">
              <h5 className="text-red-300 font-semibold mb-2">Nível de Risco Nuclear</h5>
              <div className="flex items-center space-x-2 mb-2">
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map(level => (
                    <div
                      key={level}
                      className={`w-3 h-3 rounded-full ${
                        level <= currentEvent.riskLevel
                          ? level <= 2 ? 'bg-green-500' 
                            : level <= 3 ? 'bg-yellow-500'
                            : level <= 4 ? 'bg-orange-500'
                            : 'bg-red-500'
                          : 'bg-gray-600'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-300">
                  {currentEvent.riskLevel}/5
                </span>
              </div>
              <p className="text-xs text-gray-400">
                {currentEvent.riskLevel === 1 && "Situação sob controle"}
                {currentEvent.riskLevel === 2 && "Alerta baixo - Monitoramento ativo"}
                {currentEvent.riskLevel === 3 && "Tensão crescente - Negociações críticas"}
                {currentEvent.riskLevel === 4 && "Alto risco - Confronto iminente"}
                {currentEvent.riskLevel === 5 && "DEFCON MÁXIMO - Guerra nuclear iminente"}
              </p>
            </div>

            {/* Actions Summary */}
            {currentEvent.actions && currentEvent.actions.length > 0 && (
              <div className="bg-black/30 rounded-lg p-4 border border-blue-500/20">
                <h5 className="font-semibold text-blue-300 mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Ações Geopolíticas
                </h5>
                <div className="space-y-2">
                  {currentEvent.actions.map((action, index) => {
                    const sourceNode = nodes.find(n => n.id === action.source);
                    const targetNode = nodes.find(n => n.id === action.target);
                    
                    const actionColors = {
                      threat: 'text-red-400',
                      blockade: 'text-orange-400', 
                      alliance: 'text-blue-400',
                      agreement: 'text-green-400',
                      attack: 'text-red-500',
                      ultimatum: 'text-red-300',
                      surveillance: 'text-yellow-400',
                      analysis: 'text-cyan-400',
                      consultation: 'text-purple-400',
                      support: 'text-green-300',
                      standoff: 'text-orange-300',
                      negotiation: 'text-blue-300',
                      guarantee: 'text-emerald-400'
                    };

                    const actionLabels = {
                      threat: 'Ameaça',
                      blockade: 'Bloqueio',
                      alliance: 'Aliança',
                      agreement: 'Acordo',
                      attack: 'Ataque',
                      ultimatum: 'Ultimato',
                      surveillance: 'Vigilância',
                      analysis: 'Análise',
                      consultation: 'Consulta',
                      support: 'Apoio',
                      standoff: 'Confronto',
                      negotiation: 'Negociação',
                      guarantee: 'Garantia'
                    };
                    
                    return (
                      <div key={index} className="text-sm flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <span style={{ color: sourceNode?.color }}>
                            {sourceNode?.name}
                          </span>
                          <span className="text-gray-400">→</span>
                          <span style={{ color: targetNode?.color }}>
                            {targetNode?.name}
                          </span>
                        </div>
                        <span className={`font-semibold ${actionColors[action.type] || 'text-gray-400'}`}>
                          ({actionLabels[action.type] || action.type})
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Instructions */}
        <div className="bg-black/20 rounded-lg p-3 border border-blue-500/10">
          <p className="text-xs text-gray-400">
            💡 <strong>Dica:</strong> {displayNode 
              ? 'Clique na visualização para voltar aos eventos'
              : 'Clique nos países na visualização para mais informações'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default InfoPanel;
