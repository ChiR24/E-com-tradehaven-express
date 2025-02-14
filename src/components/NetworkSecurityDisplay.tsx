import React from 'react';
import { useNetworkSecurity } from '@/hooks/useNetworkSecurity';

interface StatusBadgeProps {
  status: 'unknown' | 'critical' | 'warning' | 'degraded' | 'moderate' | 'healthy' | 'secure';
  label: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, label }) => {
  const colors = {
    unknown: 'bg-gray-200 text-gray-800',
    critical: 'bg-red-100 text-red-800',
    warning: 'bg-yellow-100 text-yellow-800',
    degraded: 'bg-orange-100 text-orange-800',
    moderate: 'bg-blue-100 text-blue-800',
    healthy: 'bg-green-100 text-green-800',
    secure: 'bg-emerald-100 text-emerald-800',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[status]}`}>
      {label}
    </span>
  );
};

interface MetricDisplayProps {
  label: string;
  value: string | number;
  unit?: string;
  status?: 'good' | 'warning' | 'critical';
}

const MetricDisplay: React.FC<MetricDisplayProps> = ({ label, value, unit, status }) => {
  const colors = {
    good: 'text-green-600',
    warning: 'text-yellow-600',
    critical: 'text-red-600',
  };

  return (
    <div className="flex flex-col">
      <span className="text-sm text-gray-500">{label}</span>
      <span className={`text-lg font-semibold ${status ? colors[status] : ''}`}>
        {value}
        {unit && <span className="text-sm ml-1">{unit}</span>}
      </span>
    </div>
  );
};

export const NetworkSecurityDisplay: React.FC = () => {
  const {
    networkAssessment,
    networkMetrics,
    isAssessing,
    performAssessment,
    getConnectionStatus,
    getSecurityStatus,
  } = useNetworkSecurity();

  if (!networkAssessment) {
    return (
      <div className="p-4 bg-gray-100 rounded-lg">
        <p className="text-gray-500">No network security assessment available</p>
      </div>
    );
  }

  const connectionStatus = getConnectionStatus();
  const securityStatus = getSecurityStatus();

  return (
    <div className="space-y-6">
      {/* Overall Status */}
      <div className="p-6 bg-white rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Network Security Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Connection Status</p>
            <div className="mt-1">
              <StatusBadge
                status={connectionStatus}
                label={connectionStatus.charAt(0).toUpperCase() + connectionStatus.slice(1)}
              />
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-500">Security Status</p>
            <div className="mt-1">
              <StatusBadge
                status={securityStatus}
                label={securityStatus.charAt(0).toUpperCase() + securityStatus.slice(1)}
              />
            </div>
          </div>
        </div>

        {/* Network Metrics */}
        <div className="mt-6">
          <h3 className="text-lg font-medium mb-3">Network Metrics</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricDisplay
              label="Latency"
              value={Math.round(networkMetrics.latency)}
              unit="ms"
              status={
                networkMetrics.latency > 500 ? 'critical' :
                networkMetrics.latency > 200 ? 'warning' :
                'good'
              }
            />
            <MetricDisplay
              label="Packet Loss"
              value={Math.round(networkMetrics.packetLoss)}
              unit="%"
              status={
                networkMetrics.packetLoss > 15 ? 'critical' :
                networkMetrics.packetLoss > 5 ? 'warning' :
                'good'
              }
            />
            <MetricDisplay
              label="Risk Score"
              value={Math.round(networkAssessment.riskScore)}
              unit="/100"
              status={
                networkAssessment.riskScore > 80 ? 'critical' :
                networkAssessment.riskScore > 50 ? 'warning' :
                'good'
              }
            />
            <MetricDisplay
              label="Connection Type"
              value={(navigator as any).connection?.type || 'Unknown'}
            />
          </div>
        </div>

        {/* Security Concerns */}
        {networkAssessment.networkInfo && (
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-3">Security Analysis</h3>
            <div className="space-y-3">
              {networkAssessment.networkInfo.vpnDetected && (
                <div className="p-3 bg-yellow-50 text-yellow-700 rounded">
                  VPN Connection Detected
                </div>
              )}
              {networkAssessment.networkInfo.proxyDetected && (
                <div className="p-3 bg-yellow-50 text-yellow-700 rounded">
                  Proxy Server Detected
                </div>
              )}
              {networkAssessment.networkInfo.torDetected && (
                <div className="p-3 bg-red-50 text-red-700 rounded">
                  Tor Network Detected
                </div>
              )}
              {networkAssessment.networkInfo.threatIntel.maliciousActivity && (
                <div className="p-3 bg-red-50 text-red-700 rounded">
                  Security Threats Detected
                  {networkAssessment.networkInfo.threatIntel.threatTypes.length > 0 && (
                    <ul className="mt-1 list-disc list-inside text-sm">
                      {networkAssessment.networkInfo.threatIntel.threatTypes.map((threat, index) => (
                        <li key={index}>{threat}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Recommendations */}
        {networkAssessment.recommendations.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-3">Recommendations</h3>
            <ul className="space-y-2">
              {networkAssessment.recommendations.map((rec, index) => (
                <li
                  key={index}
                  className="flex items-start"
                >
                  <span className="flex-shrink-0 h-5 w-5 text-blue-500">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="h-5 w-5"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </span>
                  <span className="ml-2 text-gray-700">{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

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