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
    <div className="flex items-center gap-4">
      {/* DEFCON Display */}
      <div className="flex items-center gap-2">
        <Icon 
          className={`w-5 h-5 ${riskData.textColor}`}
          style={{
            filter: riskLevel >= 4 ? 'drop-shadow(0 0 5px currentColor)' : 'none',
            animation: riskLevel === 5 ? 'pulse 1s infinite' : 'none'
          }}
        />
        <div>
          <span className={`text-sm font-bold ${riskData.textColor}`}>
            {riskData.label}
          </span>
          <div className={`text-xs -mt-1 ${riskData.textColor} opacity-80`}>
            {riskData.description}
          </div>
        </div>
      </div>

      {/* Risk Meter */}
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map(level => (
          <div
            key={level}
            className={`w-2 h-6 rounded-sm transition-all duration-500 ${
              level <= riskLevel ? (level <= 2 ? 'bg-green-500' : level <= 3 ? 'bg-yellow-500' : level <= 4 ? 'bg-orange-500' : 'bg-red-500 animate-pulse') : 'bg-gray-700'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default RiskIndicator;