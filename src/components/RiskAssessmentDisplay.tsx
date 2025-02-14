import React from 'react';
import { useRiskAssessment } from '@/hooks/useRiskAssessment';

interface RiskLevelIndicatorProps {
  level: 'low' | 'medium' | 'high' | 'critical';
}

const RiskLevelIndicator: React.FC<RiskLevelIndicatorProps> = ({ level }) => {
  const colors = {
    low: 'bg-green-500',
    medium: 'bg-yellow-500',
    high: 'bg-orange-500',
    critical: 'bg-red-500',
  };

  return (
    <div className="flex items-center gap-2">
      <div className={`w-3 h-3 rounded-full ${colors[level]}`} />
      <span className="capitalize">{level}</span>
    </div>
  );
};

interface TrendIndicatorProps {
  trend: 'improving' | 'stable' | 'worsening';
}

const TrendIndicator: React.FC<TrendIndicatorProps> = ({ trend }) => {
  const icons = {
    improving: '↓',
    stable: '→',
    worsening: '↑',
  };

  const colors = {
    improving: 'text-green-500',
    stable: 'text-gray-500',
    worsening: 'text-red-500',
  };

  return (
    <div className={`flex items-center gap-1 ${colors[trend]}`}>
      <span>{icons[trend]}</span>
      <span className="capitalize">{trend}</span>
    </div>
  );
};

export const RiskAssessmentDisplay: React.FC = () => {
  const {
    currentAssessment,
    isAssessing,
    performAssessment,
    getRiskHistory,
    getAggregateRisk,
  } = useRiskAssessment();

  const aggregateRisk = getAggregateRisk();
  const riskHistory = getRiskHistory();

  if (!currentAssessment) {
    return (
      <div className="p-4 bg-gray-100 rounded-lg">
        <p className="text-gray-500">No risk assessment available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Risk Assessment */}
      <div className="p-6 bg-white rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Current Security Risk Assessment</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Risk Level</p>
            <div className="mt-1">
              <RiskLevelIndicator level={currentAssessment.level} />
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-500">Risk Score</p>
            <p className="text-2xl font-bold">{currentAssessment.score}/100</p>
          </div>
        </div>

        {/* Risk Factors */}
        <div className="mt-6">
          <h3 className="text-lg font-medium mb-3">Risk Factors</h3>
          <div className="space-y-3">
            {currentAssessment.factors.map((factor, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{factor.name}</span>
                  <span className={`px-2 py-1 rounded text-sm ${
                    factor.score > 0.6 ? 'bg-red-100 text-red-700' :
                    factor.score > 0.3 ? 'bg-yellow-100 text-yellow-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {Math.round(factor.score * 100)}%
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{factor.explanation}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Recommendations */}
        {currentAssessment.recommendations.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-3">Recommendations</h3>
            <ul className="list-disc list-inside space-y-2">
              {currentAssessment.recommendations.map((rec, index) => (
                <li key={index} className="text-gray-700">{rec}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Aggregate Risk */}
      {aggregateRisk && (
        <div className="p-6 bg-white rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Risk Trend Analysis</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500">Average Risk Score</p>
              <p className="text-2xl font-bold">{Math.round(aggregateRisk.averageScore)}/100</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Risk Trend</p>
              <div className="mt-1">
                <TrendIndicator trend={aggregateRisk.trend} />
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500">Overall Risk Level</p>
              <div className="mt-1">
                <RiskLevelIndicator level={aggregateRisk.riskLevel} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* History Chart (placeholder) */}
      {riskHistory.length > 0 && (
        <div className="p-6 bg-white rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Risk History</h2>
          <div className="h-64 bg-gray-50 rounded flex items-center justify-center">
            <p className="text-gray-500">Risk history chart would go here</p>
          </div>
        </div>
      )}

      {/* Refresh Button */}
      <div className="flex justify-end">
        <button
          onClick={() => performAssessment()}
          disabled={isAssessing}
          className={`px-4 py-2 rounded-lg text-white ${
            isAssessing
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600'
          }`}
        >
          {isAssessing ? 'Assessing...' : 'Refresh Assessment'}
        </button>
      </div>
    </div>
  );
}; 