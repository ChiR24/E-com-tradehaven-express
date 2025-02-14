import { Buffer } from 'buffer';
import { toast } from 'sonner';
import { dnsCache } from './dnsCache';
import {
  DNSRecord,
  DNSRecordType,
  DNSSecurityInfo,
  DNSMonitoringMetrics,
  DNSQueryOptions,
  DNSQueryResult,
} from '@/types/dns';
import { dnsAnomalyDetection } from './dnsAnomalyDetection';

// Constants for DNS record types
const DNS_RECORD_TYPES: Record<DNSRecordType, number> = {
  A: 1,
  AAAA: 28,
  MX: 15,
  TXT: 16,
  NS: 2,
  CNAME: 5,
  SOA: 6,
  CAA: 257,
  DNSKEY: 48,
  DS: 43,
  PTR: 12,
  AXFR: 252,
} as const;

// DNS-over-HTTPS endpoints
const DOH_ENDPOINTS = {
  cloudflare: 'https://cloudflare-dns.com/dns-query',
  google: 'https://dns.google/resolve',
  quad9: 'https://dns.quad9.net:5053/dns-query',
};

class DNSSecurityService {
  private static instance: DNSSecurityService;
  private dnsCache: Map<string, DNSRecord[]> = new Map();
  private monitoringMetrics: Map<string, DNSMonitoringMetrics[]> = new Map();
  private readonly MAX_METRICS_HISTORY = 100;
  private readonly DNS_CHECK_ENDPOINTS = [
    '8.8.8.8',   // Google DNS
    '1.1.1.1',   // Cloudflare DNS
    '9.9.9.9',   // Quad9
    '208.67.222.222', // OpenDNS
  ];

  private constructor() {
    this.initializeDNSMonitoring();
  }

  public static getInstance(): DNSSecurityService {
    if (!DNSSecurityService.instance) {
      DNSSecurityService.instance = new DNSSecurityService();
    }
    return DNSSecurityService.instance;
  }

  private initializeDNSMonitoring() {
    // Start periodic DNS health checks
    setInterval(() => {
      this.performDNSHealthCheck();
    }, 60000); // Every minute
  }

  private async performDNSHealthCheck() {
    const domain = window.location.hostname;
    const metrics = await this.measureDNSMetrics(domain);
    this.storeDNSMetrics(domain, metrics);
  }

  private async measureDNSMetrics(domain: string): Promise<DNSMonitoringMetrics> {
    const startTime = performance.now();
    let successfulQueries = 0;
    let totalQueries = 0;

    // Test each DNS resolver with parallel queries
    const queries = this.DNS_CHECK_ENDPOINTS.map(async dnsServer => {
      try {
        await this.queryDNS(domain, dnsServer, {
          useCache: false,
          timeout: 2000,
          retries: 0,
        });
        successfulQueries++;
      } catch (error) {
        console.warn(`DNS query failed for ${dnsServer}:`, error);
      }
      totalQueries++;
    });

    await Promise.allSettled(queries);

    const responseTime = performance.now() - startTime;
    const querySuccessRate = (successfulQueries / totalQueries) * 100;

    let resolverHealth: 'good' | 'degraded' | 'poor' = 'good';
    if (querySuccessRate < 50) {
      resolverHealth = 'poor';
    } else if (querySuccessRate < 80) {
      resolverHealth = 'degraded';
    }

    return {
      responseTime,
      querySuccessRate,
      lastChecked: Date.now(),
      resolverHealth,
    };
  }

  private async queryDNS(domain: string, dnsServer: string, options: DNSQueryOptions = {}): Promise<DNSQueryResult> {
    const startTime = performance.now();
    const {
      type,
      useCache = true,
      bypassCache = false,
      timeout = 5000,
      retries = 2,
      preferredResolver,
    } = options;

    // Check cache first
    if (useCache && !bypassCache && dnsCache.isValid(domain, type)) {
      const records = dnsCache.get(domain, type);
      return {
        records,
        fromCache: true,
        queryTime: 0,
        resolver: 'cache',
        truncated: false,
      };
    }

    // Prepare query URL
    const resolver = preferredResolver || DOH_ENDPOINTS.cloudflare;
    const url = new URL(resolver);
    url.searchParams.set('name', domain);
    url.searchParams.set('type', type || 'ANY');
    if (type === 'DNSKEY' || type === 'DS') {
      url.searchParams.set('do', 'true');
    }

    // Perform query with retries
    let lastError: Error | null = null;
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const response = await fetch(url.toString(), {
          headers: {
            'Accept': 'application/dns-json',
          },
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`DNS query failed: ${response.statusText}`);
        }

        const data = await response.json();
        const records = this.parseDNSResponse(data);
        const queryTime = performance.now() - startTime;

        // Cache the results
        if (useCache && records.length > 0) {
          dnsCache.set(domain, records);
        }

        // Analyze for anomalies
        const metrics: DNSMonitoringMetrics = {
          responseTime: queryTime,
          querySuccessRate: 100,
          lastChecked: Date.now(),
          resolverHealth: 'good',
        };

        const anomalies = await dnsAnomalyDetection.analyzeQuery(
          domain,
          type || 'ANY',
          records,
          metrics
        );

        // Handle critical anomalies
        if (anomalies.some(a => a.severity === 'critical')) {
          toast.error(`Critical DNS anomalies detected for ${domain}`);
          console.error('Critical DNS anomalies:', anomalies);
        }

        return {
          records,
          fromCache: false,
          queryTime,
          resolver: dnsServer,
          truncated: data.TC || false,
        };
      } catch (error) {
        lastError = error as Error;
        if (error.name === 'AbortError') {
          console.warn(`DNS query timeout for ${domain} (attempt ${attempt + 1}/${retries + 1})`);
        } else {
          console.error(`DNS query failed for ${domain} (attempt ${attempt + 1}/${retries + 1}):`, error);
        }
      }
    }

    throw lastError || new Error('DNS query failed after retries');
  }

  private parseDNSResponse(response: any): DNSRecord[] {
    if (!response.Answer) return [];

    return response.Answer.map((answer: any) => ({
      type: this.getRecordType(answer.type),
      value: answer.data,
      ttl: answer.TTL,
    }));
  }

  private getRecordType(type: number): DNSRecord['type'] {
    const types = Object.entries(DNS_RECORD_TYPES);
    const found = types.find(([_, value]) => value === type);
    return (found?.[0] as DNSRecord['type']) || 'A';
  }

  private async checkDNSSEC(domain: string): Promise<boolean> {
    try {
      const response = await fetch(`${DOH_ENDPOINTS.cloudflare}?name=${domain}&type=DNSKEY&do=true`, {
        headers: {
          'Accept': 'application/dns-json',
        },
      });

      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      return data.AD === true; // AD flag indicates DNSSEC validation
    } catch {
      return false;
    }
  }

  private async checkCAA(domain: string): Promise<boolean> {
    try {
      const result = await this.queryDNS(domain, DOH_ENDPOINTS.cloudflare, { type: 'CAA' });
      return result.records.length > 0;
    } catch {
      return false;
    }
  }

  private async checkSPF(domain: string): Promise<boolean> {
    try {
      const result = await this.queryDNS(domain, DOH_ENDPOINTS.cloudflare, { type: 'TXT' });
      return result.records.some(record => 
        record.value.toLowerCase().startsWith('v=spf1')
      );
    } catch {
      return false;
    }
  }

  private async checkDMARC(domain: string): Promise<boolean> {
    try {
      const dmarcDomain = `_dmarc.${domain}`;
      const result = await this.queryDNS(dmarcDomain, DOH_ENDPOINTS.cloudflare, { type: 'TXT' });
      return result.records.some(record => 
        record.value.toLowerCase().startsWith('v=dmarc1')
      );
    } catch {
      return false;
    }
  }

  private async checkMXRecords(domain: string): Promise<boolean> {
    try {
      const result = await this.queryDNS(domain, DOH_ENDPOINTS.cloudflare, { type: 'MX' });
      return result.records.length > 0;
    } catch {
      return false;
    }
  }

  private async checkNameserverRedundancy(domain: string): Promise<boolean> {
    try {
      const result = await this.queryDNS(domain, DOH_ENDPOINTS.cloudflare, { type: 'NS' });
      return result.records.length >= 2;
    } catch {
      return false;
    }
  }

  private async checkVulnerabilities(domain: string): Promise<DNSSecurityInfo['vulnerabilities']> {
    const vulnerabilities: DNSSecurityInfo['vulnerabilities'] = [];

    try {
      // Check for zone transfer vulnerability
      const axfrResult = await this.queryDNS(domain, DOH_ENDPOINTS.cloudflare, { type: 'AXFR' });
      if (axfrResult.records.length > 0) {
        vulnerabilities.push({
          type: 'Zone Transfer',
          severity: 'high',
          description: 'DNS zone transfer is enabled, potentially exposing sensitive information',
        });
      }

      // Check for missing reverse DNS
      const aResult = await this.queryDNS(domain, DOH_ENDPOINTS.cloudflare, { type: 'A' });
      for (const record of aResult.records) {
        try {
          const ptrResult = await this.queryDNS(record.value, DOH_ENDPOINTS.cloudflare, { type: 'PTR' });
          if (ptrResult.records.length === 0) {
            vulnerabilities.push({
              type: 'Missing Reverse DNS',
              severity: 'medium',
              description: `No reverse DNS record found for IP ${record.value}`,
            });
          }
        } catch {
          // Ignore errors for individual PTR lookups
        }
      }

      // Check for DNSSEC misconfiguration
      if (await this.checkDNSSEC(domain)) {
        try {
          const dsResult = await this.queryDNS(domain, DOH_ENDPOINTS.cloudflare, { type: 'DS' });
          if (dsResult.records.length === 0) {
            vulnerabilities.push({
              type: 'DNSSEC Misconfiguration',
              severity: 'critical',
              description: 'DNSSEC is enabled but no DS records found',
            });
          }
        } catch {
          vulnerabilities.push({
            type: 'DNSSEC Validation Error',
            severity: 'high',
            description: 'Unable to validate DNSSEC configuration',
          });
        }
      }

    } catch (error) {
      console.error('Vulnerability check failed:', error);
    }

    return vulnerabilities;
  }

  private storeDNSMetrics(domain: string, metrics: DNSMonitoringMetrics) {
    const domainMetrics = this.monitoringMetrics.get(domain) || [];
    domainMetrics.push(metrics);

    if (domainMetrics.length > this.MAX_METRICS_HISTORY) {
      domainMetrics.shift();
    }

    this.monitoringMetrics.set(domain, domainMetrics);
  }

  public async performDNSSecurityAssessment(domain: string = window.location.hostname): Promise<{
    securityInfo: DNSSecurityInfo;
    metrics: DNSMonitoringMetrics;
    recommendations: string[];
  }> {
    try {
      const securityInfo = await this.checkDNSSecurity(domain);
      const metrics = await this.measureDNSMetrics(domain);
      const recommendations = this.generateRecommendations(securityInfo, metrics);

      return {
        securityInfo,
        metrics,
        recommendations,
      };
    } catch (error) {
      console.error('DNS security assessment failed:', error);
      throw error;
    }
  }

  private async checkDNSSecurity(domain: string): Promise<DNSSecurityInfo> {
    // In a real implementation, you would perform actual DNS lookups
    // This is a simplified example
    return {
      hasDNSSEC: await this.checkDNSSEC(domain),
      hasCAA: await this.checkCAA(domain),
      hasSPF: await this.checkSPF(domain),
      hasDMARC: await this.checkDMARC(domain),
      hasValidMXRecords: await this.checkMXRecords(domain),
      hasNameserverRedundancy: await this.checkNameserverRedundancy(domain),
      vulnerabilities: await this.checkVulnerabilities(domain),
    };
  }

  private generateRecommendations(
    securityInfo: DNSSecurityInfo,
    metrics: DNSMonitoringMetrics
  ): string[] {
    const recommendations: string[] = [];

    if (!securityInfo.hasDNSSEC) {
      recommendations.push('Enable DNSSEC to prevent DNS spoofing attacks');
    }

    if (!securityInfo.hasCAA) {
      recommendations.push('Add CAA records to control which CAs can issue certificates');
    }

    if (!securityInfo.hasSPF) {
      recommendations.push('Implement SPF records to prevent email spoofing');
    }

    if (!securityInfo.hasDMARC) {
      recommendations.push('Configure DMARC policy to enhance email security');
    }

    if (!securityInfo.hasValidMXRecords) {
      recommendations.push('Review and update MX records for proper email routing');
    }

    if (!securityInfo.hasNameserverRedundancy) {
      recommendations.push('Add redundant nameservers for improved reliability');
    }

    if (metrics.resolverHealth !== 'good') {
      recommendations.push('DNS resolution performance issues detected - consider using redundant DNS providers');
    }

    if (metrics.querySuccessRate < 80) {
      recommendations.push('DNS query success rate is low - investigate potential DNS infrastructure issues');
    }

    // Add recommendations for each vulnerability
    securityInfo.vulnerabilities.forEach(vuln => {
      recommendations.push(`${vuln.severity.toUpperCase()}: ${vuln.description}`);
    });

    return recommendations;
  }

  public getDNSMetrics(domain: string = window.location.hostname): {
    responseTime: number;
    querySuccessRate: number;
    resolverHealth: 'good' | 'degraded' | 'poor';
    lastChecked: number | null;
  } {
    const metrics = this.monitoringMetrics.get(domain) || [];
    if (metrics.length === 0) {
      return {
        responseTime: 0,
        querySuccessRate: 100,
        resolverHealth: 'good',
        lastChecked: null,
      };
    }

    const latestMetrics = metrics[metrics.length - 1];
    return {
      responseTime: latestMetrics.responseTime,
      querySuccessRate: latestMetrics.querySuccessRate,
      resolverHealth: latestMetrics.resolverHealth,
      lastChecked: latestMetrics.lastChecked,
    };
  }

  public getCacheStats() {
    return dnsCache.getStats();
  }

  public clearCache(domain?: string, type?: DNSRecord['type']) {
    if (domain) {
      dnsCache.invalidate(domain, type);
    } else {
      // Clear all cache
      for (const cachedDomain of Array.from(this.dnsCache.keys())) {
        dnsCache.invalidate(cachedDomain);
      }
    }
  }
}

export const dnsSecurityService = DNSSecurityService.getInstance(); 