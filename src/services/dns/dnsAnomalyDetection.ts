import type {
  DNSRecord,
  DNSMonitoringMetrics,
  DNSAnomaly,
  DNSPattern
} from '@/types/dns';

class DNSAnomalyDetectionService {
  private static instance: DNSAnomalyDetectionService;
  private patterns: Map<string, DNSPattern> = new Map();
  private anomalies: Map<string, DNSAnomaly[]> = new Map();
  private readonly LEARNING_PERIOD = 7 * 24 * 60 * 60 * 1000; // 7 days
  private readonly MAX_ANOMALIES = 1000;
  private readonly ANOMALY_THRESHOLDS = {
    queryRate: 2, // Standard deviations from mean
    timing: 3,    // Standard deviations from mean
    failure: 0.2, // 20% increase in failure rate
    pattern: 0.3, // 30% deviation from normal pattern
  };

  private constructor() {
    this.initializeMonitoring();
  }

  public static getInstance(): DNSAnomalyDetectionService {
    if (!DNSAnomalyDetectionService.instance) {
      DNSAnomalyDetectionService.instance = new DNSAnomalyDetectionService();
    }
    return DNSAnomalyDetectionService.instance;
  }

  private initializeMonitoring() {
    setInterval(() => {
      this.cleanupOldAnomalies();
    }, 3600000); // Every hour
  }

  private cleanupOldAnomalies() {
    const cutoffTime = Date.now() - this.LEARNING_PERIOD;
    this.anomalies.forEach((anomalies, domain) => {
      const filteredAnomalies = anomalies.filter(a => a.timestamp > cutoffTime);
      if (filteredAnomalies.length === 0) {
        this.anomalies.delete(domain);
      } else {
        this.anomalies.set(domain, filteredAnomalies);
      }
    });
  }

  public getAnomalies(domain: string): DNSAnomaly[] {
    return this.anomalies.get(domain) || [];
  }

  public getPattern(domain: string): DNSPattern | null {
    return this.patterns.get(domain) || null;
  }

  public clearData(domain?: string) {
    if (domain) {
      this.patterns.delete(domain);
      this.anomalies.delete(domain);
    } else {
      this.patterns.clear();
      this.anomalies.clear();
    }
  }

  // ... rest of the class implementation ...
}

export const dnsAnomalyDetection = DNSAnomalyDetectionService.getInstance(); 