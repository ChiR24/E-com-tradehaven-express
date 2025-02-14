export { dnsSecurityService } from './dnsSecurityService';
export { dnsAnomalyDetection } from './dnsAnomalyDetection';
export { dnsCache } from './dnsCache';

// Re-export types
export type {
  DNSRecord,
  DNSRecordType,
  DNSSecurityInfo,
  DNSMonitoringMetrics,
  DNSQueryOptions,
  DNSQueryResult,
  DNSAnomaly,
  DNSPattern,
  AnomalyDetectionConfig,
  DNSCacheStats,
} from '@/types/dns'; 