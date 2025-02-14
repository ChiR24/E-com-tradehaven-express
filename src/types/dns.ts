export type DNSRecordType = 
  | 'A' 
  | 'AAAA' 
  | 'MX' 
  | 'TXT' 
  | 'NS' 
  | 'CNAME' 
  | 'SOA' 
  | 'CAA' 
  | 'DNSKEY' 
  | 'DS' 
  | 'PTR'
  | 'AXFR';

export interface DNSRecord {
  type: DNSRecordType;
  value: string;
  ttl: number;
}

export interface DNSSecurityInfo {
  hasDNSSEC: boolean;
  hasCAA: boolean;
  hasSPF: boolean;
  hasDMARC: boolean;
  hasValidMXRecords: boolean;
  hasNameserverRedundancy: boolean;
  vulnerabilities: {
    type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
  }[];
}

export interface DNSMonitoringMetrics {
  responseTime: number;
  querySuccessRate: number;
  lastChecked: number;
  resolverHealth: 'good' | 'degraded' | 'poor';
}

export interface DNSCacheStats {
  totalDomains: number;
  totalRecords: number;
  cacheSize: number;
  oldestRecord: number;
  newestRecord: number;
}

export interface DNSQueryOptions {
  type?: DNSRecord['type'];
  useCache?: boolean;
  bypassCache?: boolean;
  timeout?: number;
  retries?: number;
  preferredResolver?: string;
}

export interface DNSQueryResult {
  records: DNSRecord[];
  fromCache: boolean;
  queryTime: number;
  resolver: string;
  truncated: boolean;
}

export interface DNSAnomaly {
  type: 'pattern' | 'timing' | 'volume' | 'resolution' | 'security';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  timestamp: number;
  affectedDomain: string;
  evidence: string[];
}

export interface DNSPattern {
  hourlyDistribution: number[];
  averageQueryRate: number;
  commonRecordTypes: Map<string, number>;
  commonResponses: Map<string, number>;
  failureRates: Map<string, number>;
  averageResponseTime: number;
  successRate: number;
  securityScore: number;
  queryDistribution: {
    hour: number;
    count: number;
  }[];
  responseTimeDistribution: {
    range: string;
    count: number;
  }[];
}

export interface AnomalyDetectionConfig {
  enableContinuousMonitoring?: boolean;
  monitoringInterval?: number; // in milliseconds
  severityThresholds?: {
    notifyOnCritical?: boolean;
    notifyOnHigh?: boolean;
    notifyOnMedium?: boolean;
  };
} 