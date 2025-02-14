import {
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

  public async analyzeQuery(
    domain: string,
    queryType: string,
    response: DNSRecord[],
    metrics: DNSMonitoringMetrics
  ): Promise<DNSAnomaly[]> {
    const anomalies: DNSAnomaly[] = [];
    const pattern = this.getOrCreatePattern(domain);
    const currentHour = new Date().getHours();

    // Update pattern
    this.updatePattern(pattern, queryType, response, metrics);

    // Check for timing anomalies
    if (this.detectTimingAnomaly(metrics, pattern)) {
      anomalies.push({
        type: 'timing',
        severity: 'medium',
        description: 'Unusual DNS response time detected',
        timestamp: Date.now(),
        affectedDomain: domain,
        evidence: [`Response time: ${metrics.responseTime}ms`],
      });
    }

    // Check for volume anomalies
    if (this.detectVolumeAnomaly(pattern, currentHour)) {
      anomalies.push({
        type: 'volume',
        severity: 'high',
        description: 'Unusual query volume detected',
        timestamp: Date.now(),
        affectedDomain: domain,
        evidence: ['Query rate significantly above normal'],
      });
    }

    // Check for resolution anomalies
    if (this.detectResolutionAnomaly(response, pattern)) {
      anomalies.push({
        type: 'resolution',
        severity: 'high',
        description: 'Unusual DNS resolution pattern detected',
        timestamp: Date.now(),
        affectedDomain: domain,
        evidence: ['Resolution pattern deviates from historical data'],
      });
    }

    // Check for security anomalies
    const securityAnomalies = await this.detectSecurityAnomalies(domain, response);
    anomalies.push(...securityAnomalies);

    // Store anomalies
    this.storeAnomalies(domain, anomalies);

    return anomalies;
  }

  private getOrCreatePattern(domain: string): DNSPattern {
    if (!this.patterns.has(domain)) {
      this.patterns.set(domain, {
        hourlyDistribution: new Array(24).fill(0),
        averageQueryRate: 0,
        commonRecordTypes: new Map(),
        commonResponses: new Map(),
        failureRates: new Map(),
      });
    }
    return this.patterns.get(domain)!;
  }

  private updatePattern(
    pattern: DNSPattern,
    queryType: string,
    response: DNSRecord[],
    metrics: DNSMonitoringMetrics
  ) {
    const hour = new Date().getHours();
    pattern.hourlyDistribution[hour]++;

    // Update record type frequency
    const currentCount = pattern.commonRecordTypes.get(queryType) || 0;
    pattern.commonRecordTypes.set(queryType, currentCount + 1);

    // Update response patterns
    response.forEach(record => {
      const key = `${record.type}:${record.value}`;
      const count = pattern.commonResponses.get(key) || 0;
      pattern.commonResponses.set(key, count + 1);
    });

    // Update failure rates
    if (metrics.querySuccessRate < 100) {
      const currentFailures = pattern.failureRates.get(queryType) || 0;
      pattern.failureRates.set(queryType, (currentFailures + (100 - metrics.querySuccessRate)) / 2);
    }
  }

  private detectTimingAnomaly(metrics: DNSMonitoringMetrics, pattern: DNSPattern): boolean {
    // Calculate standard deviation of response times
    const meanResponseTime = pattern.averageQueryRate;
    const threshold = meanResponseTime + (this.ANOMALY_THRESHOLDS.timing * this.calculateStandardDeviation(metrics.responseTime, meanResponseTime));
    
    return metrics.responseTime > threshold;
  }

  private detectVolumeAnomaly(pattern: DNSPattern, currentHour: number): boolean {
    const hourlyMean = pattern.hourlyDistribution[currentHour] / (this.LEARNING_PERIOD / (24 * 60 * 60 * 1000));
    const currentRate = pattern.hourlyDistribution[currentHour];
    
    return currentRate > (hourlyMean * (1 + this.ANOMALY_THRESHOLDS.queryRate));
  }

  private detectResolutionAnomaly(response: DNSRecord[], pattern: DNSPattern): boolean {
    if (response.length === 0) return false;

    // Check if response pattern deviates significantly from historical data
    let anomalyScore = 0;
    response.forEach(record => {
      const key = `${record.type}:${record.value}`;
      const historicalFrequency = pattern.commonResponses.get(key) || 0;
      const totalResponses = Array.from(pattern.commonResponses.values()).reduce((a, b) => a + b, 0);
      
      if (totalResponses > 0) {
        const expectedProbability = historicalFrequency / totalResponses;
        if (expectedProbability < this.ANOMALY_THRESHOLDS.pattern) {
          anomalyScore++;
        }
      }
    });

    return anomalyScore / response.length > this.ANOMALY_THRESHOLDS.pattern;
  }

  private async detectSecurityAnomalies(domain: string, response: DNSRecord[]): Promise<DNSAnomaly[]> {
    const anomalies: DNSAnomaly[] = [];

    // Check for DNS tunneling indicators
    if (this.detectDNSTunneling(response)) {
      anomalies.push({
        type: 'security',
        severity: 'critical',
        description: 'Possible DNS tunneling detected',
        timestamp: Date.now(),
        affectedDomain: domain,
        evidence: ['Unusual record content length', 'High entropy in record values'],
      });
    }

    // Check for DNS amplification
    if (this.detectDNSAmplification(response)) {
      anomalies.push({
        type: 'security',
        severity: 'critical',
        description: 'Possible DNS amplification attack',
        timestamp: Date.now(),
        affectedDomain: domain,
        evidence: ['Large response size', 'ANY query type'],
      });
    }

    // Check for cache poisoning attempts
    if (await this.detectCachePoisoning(domain, response)) {
      anomalies.push({
        type: 'security',
        severity: 'critical',
        description: 'Possible DNS cache poisoning attempt',
        timestamp: Date.now(),
        affectedDomain: domain,
        evidence: ['Unexpected record changes', 'Multiple conflicting responses'],
      });
    }

    return anomalies;
  }

  private detectDNSTunneling(response: DNSRecord[]): boolean {
    // Check for characteristics of DNS tunneling
    const suspiciousRecords = response.filter(record => {
      // Check for unusually long record values
      if (record.value.length > 200) return true;

      // Check for high entropy in record values (indication of encoded data)
      if (this.calculateEntropy(record.value) > 4.5) return true;

      // Check for unusual subdomains
      if (record.type === 'A' && record.value.split('.').some(part => part.length > 30)) return true;

      return false;
    });

    return suspiciousRecords.length > 0;
  }

  private detectDNSAmplification(response: DNSRecord[]): boolean {
    // Check response size
    const totalSize = response.reduce((size, record) => size + record.value.length, 0);
    return totalSize > 512; // Standard DNS message size
  }

  private async detectCachePoisoning(domain: string, response: DNSRecord[]): Promise<boolean> {
    // Compare with known good responses
    const pattern = this.patterns.get(domain);
    if (!pattern) return false;

    // Check for rapid record changes
    const hasUnexpectedChanges = response.some(record => {
      const key = `${record.type}:${record.value}`;
      return !pattern.commonResponses.has(key);
    });

    return hasUnexpectedChanges;
  }

  private calculateEntropy(str: string): number {
    const freq: { [key: string]: number } = {};
    for (const char of str) {
      freq[char] = (freq[char] || 0) + 1;
    }

    return -Object.values(freq).reduce((entropy, count) => {
      const p = count / str.length;
      return entropy + p * Math.log2(p);
    }, 0);
  }

  private calculateStandardDeviation(value: number, mean: number): number {
    return Math.sqrt(Math.pow(value - mean, 2));
  }

  private storeAnomalies(domain: string, newAnomalies: DNSAnomaly[]) {
    const existingAnomalies = this.anomalies.get(domain) || [];
    const updatedAnomalies = [...existingAnomalies, ...newAnomalies]
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, this.MAX_ANOMALIES);

    this.anomalies.set(domain, updatedAnomalies);
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
}

export const dnsAnomalyDetection = DNSAnomalyDetectionService.getInstance(); 