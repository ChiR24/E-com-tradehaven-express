import { Buffer } from 'buffer';
import { toast } from 'sonner';
import { dnsCache } from './dnsCache';
import { dnsAnomalyDetection } from './dnsAnomalyDetection';
import {
  DNSRecord,
  DNSRecordType,
  DNSSecurityInfo,
  DNSMonitoringMetrics,
  DNSQueryOptions,
  DNSQueryResult,
} from '@/types/dns';

// ... rest of the file unchanged ... 