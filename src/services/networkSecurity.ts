interface NetworkInfo {
  ip: string;
  isp?: string;
  asn?: string;
  vpnDetected: boolean;
  proxyDetected: boolean;
  torDetected: boolean;
  datacenterIp: boolean;
  threatIntel: {
    maliciousActivity: boolean;
    lastReportedAt?: string;
    threatTypes: string[];
  };
}

interface ConnectionMetrics {
  latency: number;
  packetLoss: number;
  connectionType?: 'wifi' | 'cellular' | 'ethernet' | 'unknown';
  signalStrength?: number;
  bandwidth?: number;
}

class NetworkSecurityService {
  private static instance: NetworkSecurityService;
  private knownNetworks: Map<string, NetworkInfo> = new Map();
  private connectionMetrics: Map<string, ConnectionMetrics[]> = new Map();
  private readonly MAX_METRICS_HISTORY = 100;

  private constructor() {
    this.initializeNetworkMonitoring();
  }

  public static getInstance(): NetworkSecurityService {
    if (!NetworkSecurityService.instance) {
      NetworkSecurityService.instance = new NetworkSecurityService();
    }
    return NetworkSecurityService.instance;
  }

  private initializeNetworkMonitoring() {
    if (typeof window === 'undefined') return;

    // Monitor connection changes
    if ('connection' in navigator) {
      (navigator as any).connection.addEventListener('change', this.handleConnectionChange.bind(this));
    }

    // Monitor online/offline status
    window.addEventListener('online', this.handleOnlineStatus.bind(this));
    window.addEventListener('offline', this.handleOnlineStatus.bind(this));
  }

  private async handleConnectionChange() {
    const connection = (navigator as any).connection;
    if (!connection) return;

    const metrics: ConnectionMetrics = {
      latency: await this.measureLatency(),
      packetLoss: this.measurePacketLoss(),
      connectionType: connection.type || 'unknown',
      signalStrength: connection.signalStrength,
      bandwidth: connection.downlink,
    };

    this.storeConnectionMetrics(metrics);
  }

  private handleOnlineStatus() {
    if (navigator.onLine) {
      this.performNetworkAssessment();
    }
  }

  private async measureLatency(): Promise<number> {
    const start = performance.now();
    try {
      await fetch('/api/ping', { method: 'HEAD' });
      return performance.now() - start;
    } catch {
      return 999; // High latency indicator
    }
  }

  private measurePacketLoss(): number {
    // Simplified packet loss estimation based on recent connection metrics
    const recentMetrics = this.getRecentConnectionMetrics();
    if (recentMetrics.length < 2) return 0;

    const failedConnections = recentMetrics.filter(m => m.latency > 500).length;
    return (failedConnections / recentMetrics.length) * 100;
  }

  private storeConnectionMetrics(metrics: ConnectionMetrics) {
    const userId = this.getCurrentUserId();
    if (!userId) return;

    const userMetrics = this.connectionMetrics.get(userId) || [];
    userMetrics.push(metrics);

    // Keep only recent metrics
    if (userMetrics.length > this.MAX_METRICS_HISTORY) {
      userMetrics.shift();
    }

    this.connectionMetrics.set(userId, userMetrics);
  }

  private getRecentConnectionMetrics(): ConnectionMetrics[] {
    const userId = this.getCurrentUserId();
    if (!userId) return [];

    return this.connectionMetrics.get(userId) || [];
  }

  private getCurrentUserId(): string | null {
    // Implement based on your auth system
    return null;
  }

  public async performNetworkAssessment(): Promise<{
    networkInfo: NetworkInfo;
    riskScore: number;
    recommendations: string[];
  }> {
    try {
      const networkInfo = await this.gatherNetworkInfo();
      const riskScore = this.calculateNetworkRiskScore(networkInfo);
      const recommendations = this.generateRecommendations(networkInfo, riskScore);

      return {
        networkInfo,
        riskScore,
        recommendations,
      };
    } catch (error) {
      console.error('Network assessment failed:', error);
      throw error;
    }
  }

  private async gatherNetworkInfo(): Promise<NetworkInfo> {
    try {
      // Get IP info
      const ipResponse = await fetch('https://api.ipify.org?format=json');
      const { ip } = await ipResponse.json();

      // Get detailed IP info (you'll need to implement or use a service)
      const ipInfo = await this.getIpInformation(ip);

      // Check for VPN/Proxy
      const vpnDetected = await this.detectVPN(ip);
      const proxyDetected = await this.detectProxy();
      const torDetected = await this.detectTor(ip);
      
      // Check if IP is from a datacenter
      const datacenterIp = await this.isDatacenterIP(ip);

      // Get threat intelligence
      const threatIntel = await this.getThreatIntelligence(ip);

      return {
        ip,
        isp: ipInfo.isp,
        asn: ipInfo.asn,
        vpnDetected,
        proxyDetected,
        torDetected,
        datacenterIp,
        threatIntel,
      };
    } catch (error) {
      console.error('Failed to gather network info:', error);
      throw error;
    }
  }

  private async getIpInformation(ip: string) {
    // Implement IP information lookup
    // You might want to use a service like MaxMind or IP2Location
    return {
      isp: 'Unknown',
      asn: 'Unknown',
    };
  }

  private async detectVPN(ip: string): Promise<boolean> {
    // Implement VPN detection logic
    // Could use IP reputation databases or check against known VPN IP ranges
    return false;
  }

  private async detectProxy(): Promise<boolean> {
    // Check for common proxy headers
    const headers = [
      'HTTP_VIA',
      'HTTP_X_FORWARDED_FOR',
      'HTTP_FORWARDED',
      'HTTP_X_FORWARDED',
      'HTTP_CLIENT_IP',
      'HTTP_FORWARDED_FOR_IP',
      'VIA',
      'X_FORWARDED_FOR',
      'FORWARDED',
      'X_FORWARDED',
      'CLIENT_IP',
      'FORWARDED_FOR_IP',
      'HTTP_PROXY_CONNECTION',
    ];

    return headers.some(header => header.toLowerCase() in window.navigator);
  }

  private async detectTor(ip: string): Promise<boolean> {
    // Implement Tor detection
    // Could use Tor exit node lists or services that maintain such data
    return false;
  }

  private async isDatacenterIP(ip: string): Promise<boolean> {
    // Implement datacenter IP detection
    // Could use databases of known datacenter IP ranges
    return false;
  }

  private async getThreatIntelligence(ip: string) {
    // Implement threat intelligence gathering
    // Could use services like AbuseIPDB, VirusTotal, etc.
    return {
      maliciousActivity: false,
      threatTypes: [],
    };
  }

  private calculateNetworkRiskScore(networkInfo: NetworkInfo): number {
    let score = 0;
    const weights = {
      vpn: 20,
      proxy: 15,
      tor: 25,
      datacenter: 10,
      threatIntel: 30,
    };

    if (networkInfo.vpnDetected) score += weights.vpn;
    if (networkInfo.proxyDetected) score += weights.proxy;
    if (networkInfo.torDetected) score += weights.tor;
    if (networkInfo.datacenterIp) score += weights.datacenter;
    if (networkInfo.threatIntel.maliciousActivity) score += weights.threatIntel;

    // Add connection quality factors
    const connectionMetrics = this.getRecentConnectionMetrics();
    if (connectionMetrics.length > 0) {
      const avgLatency = connectionMetrics.reduce((sum, m) => sum + m.latency, 0) / connectionMetrics.length;
      const avgPacketLoss = connectionMetrics.reduce((sum, m) => sum + m.packetLoss, 0) / connectionMetrics.length;

      if (avgLatency > 200) score += 5;
      if (avgLatency > 500) score += 10;
      if (avgPacketLoss > 5) score += 5;
      if (avgPacketLoss > 15) score += 10;
    }

    return Math.min(100, score);
  }

  private generateRecommendations(networkInfo: NetworkInfo, riskScore: number): string[] {
    const recommendations: string[] = [];

    if (riskScore >= 80) {
      recommendations.push('High-risk network detected. Additional authentication required.');
      recommendations.push('Consider using a trusted network connection.');
    }

    if (networkInfo.vpnDetected) {
      recommendations.push('VPN usage detected. Verify your identity through additional means.');
    }

    if (networkInfo.proxyDetected) {
      recommendations.push('Proxy detected. This may impact security and performance.');
    }

    if (networkInfo.torDetected) {
      recommendations.push('Tor network detected. Access may be restricted.');
    }

    if (networkInfo.threatIntel.maliciousActivity) {
      recommendations.push('Security threats detected from this network. Please use caution.');
    }

    const connectionMetrics = this.getRecentConnectionMetrics();
    if (connectionMetrics.length > 0) {
      const avgLatency = connectionMetrics.reduce((sum, m) => sum + m.latency, 0) / connectionMetrics.length;
      const avgPacketLoss = connectionMetrics.reduce((sum, m) => sum + m.packetLoss, 0) / connectionMetrics.length;

      if (avgLatency > 500) {
        recommendations.push('High network latency detected. This may impact security features.');
      }

      if (avgPacketLoss > 15) {
        recommendations.push('Significant packet loss detected. Consider using a more stable connection.');
      }
    }

    return recommendations;
  }

  public getNetworkMetrics(): {
    latency: number;
    packetLoss: number;
    connectionQuality: 'good' | 'fair' | 'poor';
  } {
    const metrics = this.getRecentConnectionMetrics();
    if (metrics.length === 0) {
      return {
        latency: 0,
        packetLoss: 0,
        connectionQuality: 'good',
      };
    }

    const avgLatency = metrics.reduce((sum, m) => sum + m.latency, 0) / metrics.length;
    const avgPacketLoss = metrics.reduce((sum, m) => sum + m.packetLoss, 0) / metrics.length;

    let connectionQuality: 'good' | 'fair' | 'poor' = 'good';
    if (avgLatency > 500 || avgPacketLoss > 15) {
      connectionQuality = 'poor';
    } else if (avgLatency > 200 || avgPacketLoss > 5) {
      connectionQuality = 'fair';
    }

    return {
      latency: avgLatency,
      packetLoss: avgPacketLoss,
      connectionQuality,
    };
  }
}

export const networkSecurity = NetworkSecurityService.getInstance(); 