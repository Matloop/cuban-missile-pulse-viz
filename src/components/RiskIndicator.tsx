
import React from 'react';
import { AlertTriangle, Shield, Zap } from 'lucide-react';

const RiskIndicator = ({ riskLevel }) => {
  const getRiskData = (level) => {
    switch(level) {
      case 1:
        return {
          label: 'DEFCON 5',
          description: 'Exercício / Paz',
          color: 'from-green-600 to-green-400',
          bgColor: 'bg-green-600/20',
          borderColor: 'border-green-500/50',
          icon: Shield,
          textColor: 'text-green-300'
        };
      case 2:
        return {
          label: 'DEFCON 4', 
          description: 'Vigilância Elevada',
          color: 'from-blue-600 to-blue-400',
          bgColor: 'bg-blue-600/20',
          borderColor: 'border-blue-500/50',
          icon: Shield,
          textColor: 'text-blue-300'
        };
      case 3:
        return {
          label: 'DEFCON 3',
          description: 'Aumento da Prontidão',
          color: 'from-yellow-600 to-yellow-400',
          bgColor: 'bg-yellow-600/20',
          borderColor: 'border-yellow-500/50',
          icon: AlertTriangle,
          textColor: 'text-yellow-300'
        };
      case 4:
        return {
          label: 'DEFCON 2',
          description: 'Prontidão Máxima',
          color: 'from-orange-600 to-orange-400',
          bgColor: 'bg-orange-600/20',
          borderColor: 'border-orange-500/50',
          icon: AlertTriangle,
          textColor: 'text-orange-300'
        };
      case 5:
        return {
          label: 'DEFCON 1',
          description: 'Guerra Nuclear Iminente',
          color: 'from-red-600 to-red-400',
          bgColor: 'bg-red-600/20',
          borderColor: 'border-red-500/50',
          icon: Zap,
          textColor: 'text-red-300'
        };
      default:
        return getRiskData(1);
    }
  };

  const riskData = getRiskData(riskLevel);
  const Icon = riskData.icon;

  return (
    <div className={`${riskData.bgColor} ${riskData.borderColor} border rounded-lg p-4`}>
      <div className="text-center">
        <h3 className="text-sm font-semibold text-white mb-3">
          NÍVEL DE AMEAÇA NUCLEAR
        </h3>
        
        {/* DEFCON Display */}
        <div className={`${riskData.bgColor} rounded-lg p-3 mb-4 border ${riskData.borderColor}`}>
          <div className="flex items-center justify-center gap-2 mb-2">
            <Icon 
              className={`w-6 h-6 ${riskData.textColor}`}
              style={{
                filter: riskLevel === 5 ? 'drop-shadow(0 0 8px currentColor)' : 'none',
                animation: riskLevel === 5 ? 'pulse 1s infinite' : 'none'
              }}
            />
            <span className={`text-xl font-bold ${riskData.textColor}`}>
              {riskData.label}
            </span>
          </div>
          <div className={`text-xs ${riskData.textColor}`}>
            {riskData.description}
          </div>
        </div>

        {/* Risk Meter */}
        <div className="mb-4">
          <div className="text-xs text-gray-400 mb-2">MEDIDOR DE TENSÃO</div>
          <div className="flex justify-center gap-1">
            {[1, 2, 3, 4, 5].map(level => (
              <div
                key={level}
                className={`w-3 h-8 rounded-sm transition-all duration-500 ${
                  level <= riskLevel
                    ? level <= 2 
                      ? 'bg-green-500' 
                      : level <= 3 
                        ? 'bg-yellow-500'
                        : level <= 4 
                          ? 'bg-orange-500'
                          : 'bg-red-500 animate-pulse'
                    : 'bg-gray-700'
                }`}
                style={{
                  boxShadow: level <= riskLevel && level >= 4 
                    ? `0 0 10px ${level === 5 ? '#ef4444' : '#f97316'}` 
                    : 'none'
                }}
              />
            ))}
          </div>
        </div>

        {/* Historical Context */}
        <div className="bg-black/30 rounded p-2">
          <div className="text-xs text-gray-400 mb-1">CONTEXTO HISTÓRICO</div>
          <div className="text-xs text-gray-300">
            {riskLevel === 5 && "O mundo nunca esteve tão próximo da guerra nuclear total"}
            {riskLevel === 4 && "Forças militares em estado de alerta máximo"}
            {riskLevel === 3 && "Tensões diplomáticas se intensificam"}
            {riskLevel === 2 && "Situação sob monitoramento constante"}
            {riskLevel === 1 && "Crise resolvida, mundo respira aliviado"}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiskIndicator;
