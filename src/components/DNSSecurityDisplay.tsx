import React from 'react';
import { useDNSSecurity } from '@/hooks/useDNSSecurity';

interface SecurityFeatureBadgeProps {
  label: string;
  enabled: boolean;
  importance: 'critical' | 'high' | 'medium' | 'low';
}

const SecurityFeatureBadge: React.FC<SecurityFeatureBadgeProps> = ({ label, enabled, importance }) => {
  const colors = {
    enabled: 'bg-green-100 text-green-800 border-green-200',
    disabled: {
      critical: 'bg-red-100 text-red-800 border-red-200',
      high: 'bg-orange-100 text-orange-800 border-orange-200',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      low: 'bg-blue-100 text-blue-800 border-blue-200',
    },
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
        enabled ? colors.enabled : colors.disabled[importance]
      }`}
    >
      {label}
      <span className="ml-1.5">
        {enabled ? (
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        ) : (
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        )}
      </span>
    </span>
  );
};

interface HealthIndicatorProps {
  status: 'healthy' | 'degraded' | 'critical' | 'unknown';
  label: string;
  value?: string | number;
  unit?: string;
}

const HealthIndicator: React.FC<HealthIndicatorProps> = ({ status, label, value, unit }) => {
  const colors = {
    healthy: 'text-green-500',
    degraded: 'text-yellow-500',
    critical: 'text-red-500',
    unknown: 'text-gray-500',
  };

  const icons = {
    healthy: '●',
    degraded: '◐',
    critical: '○',
    unknown: '?',
  };

  return (
    <div className="flex items-center space-x-2">
      <span className={`text-lg ${colors[status]}`}>{icons[status]}</span>
      <span className="text-sm text-gray-600">{label}</span>
      {value !== undefined && (
        <span className="text-sm font-medium">
          {value}
          {unit && <span className="text-gray-500 ml-1">{unit}</span>}
        </span>
      )}
    </div>
  );
};

export const DNSSecurityDisplay: React.FC = () => {
  const {
    dnsAssessment,
    dnsMetrics,
    isAssessing,
    performAssessment,
    getDNSSecurityStatus,
    getDNSHealthStatus,
    getSecurityScore,
  } = useDNSSecurity();

  if (!dnsAssessment) {
    return (
      <div className="p-4 bg-gray-100 rounded-lg">
        <p className="text-gray-500">No DNS security assessment available</p>
      </div>
    );
  }

  const securityStatus = getDNSSecurityStatus();
  const healthStatus = getDNSHealthStatus();
  const securityScore = getSecurityScore();

  return (
    <div className="space-y-6">
      {/* Overall Status */}
      <div className="p-6 bg-white rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-4">DNS Security Status</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Security Score */}
          <div>
            <p className="text-sm text-gray-500 mb-1">Security Score</p>
            <div className="flex items-baseline">
              <span className="text-3xl font-bold">{securityScore}</span>
              <span className="text-sm text-gray-500 ml-1">/100</span>
            </div>
          </div>

          {/* Health Status */}
          <div>
            <p className="text-sm text-gray-500 mb-1">DNS Health</p>
            <HealthIndicator
              status={healthStatus as any}
              label={healthStatus.charAt(0).toUpperCase() + healthStatus.slice(1)}
              value={Math.round(dnsMetrics.querySuccessRate)}
              unit="%"
            />
          </div>

          {/* Response Time */}
          <div>
            <p className="text-sm text-gray-500 mb-1">Response Time</p>
            <HealthIndicator
              status={
                dnsMetrics.responseTime > 500 ? 'critical' :
                dnsMetrics.responseTime > 200 ? 'degraded' :
                'healthy'
              }
              label="DNS Resolution"
              value={Math.round(dnsMetrics.responseTime)}
              unit="ms"
            />
          </div>
        </div>

        {/* Security Features */}
        <div className="mt-6">
          <h3 className="text-lg font-medium mb-3">Security Features</h3>
          <div className="flex flex-wrap gap-2">
            <SecurityFeatureBadge
              label="DNSSEC"
              enabled={dnsAssessment.securityInfo.hasDNSSEC}
              importance="critical"
            />
            <SecurityFeatureBadge
              label="CAA Records"
              enabled={dnsAssessment.securityInfo.hasCAA}
              importance="high"
            />
            <SecurityFeatureBadge
              label="SPF"
              enabled={dnsAssessment.securityInfo.hasSPF}
              importance="high"
            />
            <SecurityFeatureBadge
              label="DMARC"
              enabled={dnsAssessment.securityInfo.hasDMARC}
              importance="high"
            />
            <SecurityFeatureBadge
              label="Valid MX Records"
              enabled={dnsAssessment.securityInfo.hasValidMXRecords}
              importance="medium"
            />
            <SecurityFeatureBadge
              label="Nameserver Redundancy"
              enabled={dnsAssessment.securityInfo.hasNameserverRedundancy}
              importance="medium"
            />
          </div>
        </div>

        {/* Vulnerabilities */}
        {dnsAssessment.securityInfo.vulnerabilities.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-3">Vulnerabilities</h3>
            <div className="space-y-3">
              {dnsAssessment.securityInfo.vulnerabilities.map((vuln, index) => (
                <div
                  key={index}
                  className={`p-3 rounded ${
                    vuln.severity === 'critical' ? 'bg-red-50 text-red-700' :
                    vuln.severity === 'high' ? 'bg-orange-50 text-orange-700' :
                    vuln.severity === 'medium' ? 'bg-yellow-50 text-yellow-700' :
                    'bg-blue-50 text-blue-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{vuln.type}</span>
                    <span className="text-sm">
                      {vuln.severity.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm mt-1">{vuln.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommendations */}
        {dnsAssessment.recommendations.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-3">Recommendations</h3>
            <ul className="space-y-2">
              {dnsAssessment.recommendations.map((rec, index) => (
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