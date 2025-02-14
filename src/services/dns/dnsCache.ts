import type { DNSRecord, DNSCacheStats } from '@/types/dns';

interface CachedDNSRecord {
  record: DNSRecord;
  timestamp: number;
  expiresAt: number;
}

class DNSCacheService {
  private static instance: DNSCacheService;
  private cache: Map<string, Map<string, CachedDNSRecord>> = new Map();
  private readonly DEFAULT_TTL = 300; // 5 minutes in seconds
  private readonly MAX_CACHE_SIZE = 1000;
  private readonly CLEANUP_INTERVAL = 60000; // 1 minute in milliseconds

  private constructor() {
    this.initializeCleanup();
  }

  public static getInstance(): DNSCacheService {
    if (!DNSCacheService.instance) {
      DNSCacheService.instance = new DNSCacheService();
    }
    return DNSCacheService.instance;
  }

  private initializeCleanup() {
    setInterval(() => {
      this.cleanupExpiredRecords();
    }, this.CLEANUP_INTERVAL);
  }

  public set(domain: string, records: DNSRecord[]): void {
    const now = Date.now();
    const domainCache = this.cache.get(domain) || new Map();

    records.forEach(record => {
      const ttl = Math.max(record.ttl, this.DEFAULT_TTL);
      domainCache.set(this.getCacheKey(record), {
        record,
        timestamp: now,
        expiresAt: now + ttl * 1000,
      });
    });

    this.cache.set(domain, domainCache);
    this.enforceMaxCacheSize();
  }

  public get(domain: string, type?: DNSRecord['type']): DNSRecord[] {
    const domainCache = this.cache.get(domain);
    if (!domainCache) return [];

    const now = Date.now();
    const records: DNSRecord[] = [];

    domainCache.forEach((cached, key) => {
      if (cached.expiresAt > now && (!type || cached.record.type === type)) {
        records.push(cached.record);
      }
    });

    return records;
  }

  public isValid(domain: string, type?: DNSRecord['type']): boolean {
    const domainCache = this.cache.get(domain);
    if (!domainCache) return false;

    const now = Date.now();
    return Array.from(domainCache.values()).some(
      cached => cached.expiresAt > now && (!type || cached.record.type === type)
    );
  }

  public invalidate(domain: string, type?: DNSRecord['type']): void {
    const domainCache = this.cache.get(domain);
    if (!domainCache) return;

    if (type) {
      // Remove only records of specified type
      Array.from(domainCache.entries())
        .filter(([_, cached]) => cached.record.type === type)
        .forEach(([key]) => domainCache.delete(key));
    } else {
      // Remove all records for domain
      this.cache.delete(domain);
    }
  }

  private cleanupExpiredRecords(): void {
    const now = Date.now();

    this.cache.forEach((domainCache, domain) => {
      let hasValidRecords = false;
      domainCache.forEach((cached, key) => {
        if (cached.expiresAt <= now) {
          domainCache.delete(key);
        } else {
          hasValidRecords = true;
        }
      });

      if (!hasValidRecords) {
        this.cache.delete(domain);
      }
    });
  }

  private enforceMaxCacheSize(): void {
    let totalRecords = 0;
    const domains = Array.from(this.cache.keys());

    // Count total records
    for (const domain of domains) {
      totalRecords += this.cache.get(domain)?.size || 0;
    }

    // If over limit, remove oldest records
    if (totalRecords > this.MAX_CACHE_SIZE) {
      const recordsToRemove = totalRecords - this.MAX_CACHE_SIZE;
      let removedCount = 0;

      // Sort domains by oldest record
      domains.sort((a, b) => {
        const aOldest = Math.min(...Array.from(this.cache.get(a)?.values() || []).map(r => r.timestamp));
        const bOldest = Math.min(...Array.from(this.cache.get(b)?.values() || []).map(r => r.timestamp));
        return aOldest - bOldest;
      });

      // Remove records until under limit
      for (const domain of domains) {
        if (removedCount >= recordsToRemove) break;

        const domainCache = this.cache.get(domain);
        if (!domainCache) continue;

        const records = Array.from(domainCache.entries())
          .sort(([, a], [, b]) => a.timestamp - b.timestamp);

        for (const [key] of records) {
          domainCache.delete(key);
          removedCount++;
          if (removedCount >= recordsToRemove) break;
        }

        if (domainCache.size === 0) {
          this.cache.delete(domain);
        }
      }
    }
  }

  private getCacheKey(record: DNSRecord): string {
    return `${record.type}:${record.value}`;
  }

  public getStats(): DNSCacheStats {
    let totalRecords = 0;
    let oldestTimestamp = Date.now();
    let newestTimestamp = 0;

    this.cache.forEach(domainCache => {
      totalRecords += domainCache.size;
      domainCache.forEach(cached => {
        oldestTimestamp = Math.min(oldestTimestamp, cached.timestamp);
        newestTimestamp = Math.max(newestTimestamp, cached.timestamp);
      });
    });

    return {
      totalDomains: this.cache.size,
      totalRecords,
      cacheSize: totalRecords,
      oldestRecord: oldestTimestamp,
      newestRecord: newestTimestamp,
    };
  }
}

export const dnsCache = DNSCacheService.getInstance(); 