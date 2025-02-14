interface RiskFactor {
  name: string;
  weight: number;
  score: number;
  explanation: string;
}

interface RiskAssessment {
  score: number;
  level: 'low' | 'medium' | 'high' | 'critical';
  factors: RiskFactor[];
  recommendations: string[];
  timestamp: number;
}

interface UserContext {
  ipAddress?: string;
  userAgent: string;
  timestamp: number;
  location?: {
    latitude: number;
    longitude: number;
    accuracy: number;
  };
  deviceInfo: {
    platform: string;
    browser: string;
    os: string;
    screenResolution: string;
    deviceMemory?: number;
    hardwareConcurrency: number;
    touchSupport: boolean;
  };
  behavioralMetrics: {
    typingSpeed?: number;
    typingConsistency?: number;
    mouseMovementPattern?: string;
    interactionFrequency?: number;
  };
  historicalData: {
    lastLoginTime?: number;
    failedAttempts: number;
    successfulLogins: number;
    averageSessionDuration?: number;
    commonLoginTimes: number[];
    knownLocations: Array<{ lat: number; lng: number }>;
  };
}

class RiskAssessmentService {
  private static instance: RiskAssessmentService;
  private riskHistory: Map<string, RiskAssessment[]> = new Map();
  private readonly MAX_HISTORY_LENGTH = 50;
  private readonly RISK_THRESHOLDS = {
    low: 30,
    medium: 60,
    high: 80,
  };

  private constructor() {}

  public static getInstance(): RiskAssessmentService {
    if (!RiskAssessmentService.instance) {
      RiskAssessmentService.instance = new RiskAssessmentService();
    }
    return RiskAssessmentService.instance;
  }

  public async assessRisk(userId: string, context: UserContext): Promise<RiskAssessment> {
    const factors: RiskFactor[] = [];
    let totalScore = 0;
    let totalWeight = 0;

    // Location-based risk assessment
    if (context.location) {
      const locationRisk = await this.assessLocationRisk(context);
      factors.push(locationRisk);
      totalScore += locationRisk.score * locationRisk.weight;
      totalWeight += locationRisk.weight;
    }

    // Time-based risk assessment
    const timeRisk = this.assessTimeRisk(context);
    factors.push(timeRisk);
    totalScore += timeRisk.score * timeRisk.weight;
    totalWeight += timeRisk.weight;

    // Device-based risk assessment
    const deviceRisk = this.assessDeviceRisk(context);
    factors.push(deviceRisk);
    totalScore += deviceRisk.score * deviceRisk.weight;
    totalWeight += deviceRisk.weight;

    // Behavioral risk assessment
    if (context.behavioralMetrics) {
      const behavioralRisk = this.assessBehavioralRisk(context);
      factors.push(behavioralRisk);
      totalScore += behavioralRisk.score * behavioralRisk.weight;
      totalWeight += behavioralRisk.weight;
    }

    // Historical risk assessment
    const historicalRisk = this.assessHistoricalRisk(context);
    factors.push(historicalRisk);
    totalScore += historicalRisk.score * historicalRisk.weight;
    totalWeight += historicalRisk.weight;

    // Calculate final risk score (0-100)
    const finalScore = Math.round((totalScore / totalWeight) * 100);

    // Determine risk level
    const riskLevel = this.determineRiskLevel(finalScore);

    // Generate recommendations
    const recommendations = this.generateRecommendations(factors, riskLevel);

    const assessment: RiskAssessment = {
      score: finalScore,
      level: riskLevel,
      factors,
      recommendations,
      timestamp: Date.now(),
    };

    // Store assessment in history
    this.storeAssessment(userId, assessment);

    return assessment;
  }

  private async assessLocationRisk(context: UserContext): Promise<RiskFactor> {
    const { location, historicalData } = context;
    
    if (!location || historicalData.knownLocations.length === 0) {
      return {
        name: 'Location',
        weight: 0.25,
        score: 0.5, // Neutral score when location data is unavailable
        explanation: 'Location data unavailable or no historical locations',
      };
    }

    // Calculate minimum distance to known locations
    const minDistance = Math.min(
      ...historicalData.knownLocations.map(known =>
        this.calculateDistance(
          location.latitude,
          location.longitude,
          known.lat,
          known.lng
        )
      )
    );

    // Score based on distance (0-1)
    let score: number;
    if (minDistance < 1) { // Within 1km
      score = 0.1; // Very low risk
    } else if (minDistance < 10) { // Within 10km
      score = 0.3;
    } else if (minDistance < 100) { // Within 100km
      score = 0.6;
    } else if (minDistance < 1000) { // Within 1000km
      score = 0.8;
    } else {
      score = 1.0; // High risk
    }

    return {
      name: 'Location',
      weight: 0.25,
      score,
      explanation: `Login location is ${Math.round(minDistance)}km from nearest known location`,
    };
  }

  private assessTimeRisk(context: UserContext): RiskFactor {
    const { timestamp, historicalData } = context;
    const currentHour = new Date(timestamp).getHours();
    
    if (!historicalData.commonLoginTimes.length) {
      return {
        name: 'Time Pattern',
        weight: 0.15,
        score: 0.5,
        explanation: 'No historical login time data available',
      };
    }

    // Check if current hour is among common login times
    const isCommonTime = historicalData.commonLoginTimes.includes(currentHour);
    const nearCommonTime = historicalData.commonLoginTimes.some(
      time => Math.abs(time - currentHour) <= 1
    );

    let score: number;
    let explanation: string;

    if (isCommonTime) {
      score = 0.1;
      explanation = 'Login during common hours';
    } else if (nearCommonTime) {
      score = 0.3;
      explanation = 'Login near common hours';
    } else {
      score = 0.8;
      explanation = 'Login during unusual hours';
    }

    return {
      name: 'Time Pattern',
      weight: 0.15,
      score,
      explanation,
    };
  }

  private assessDeviceRisk(context: UserContext): RiskFactor {
    const { deviceInfo } = context;
    let riskScore = 0;
    const riskFactors: string[] = [];

    // Check browser security features
    if (!window.isSecureContext) {
      riskScore += 0.3;
      riskFactors.push('Non-secure context');
    }

    // Check for suspicious device characteristics
    if (deviceInfo.hardwareConcurrency < 2) {
      riskScore += 0.2;
      riskFactors.push('Low hardware concurrency (possible VM)');
    }

    if (deviceInfo.deviceMemory && deviceInfo.deviceMemory < 4) {
      riskScore += 0.1;
      riskFactors.push('Low device memory');
    }

    // Check for platform consistency
    const platformConsistency = this.checkPlatformConsistency(deviceInfo);
    if (!platformConsistency.consistent) {
      riskScore += 0.3;
      riskFactors.push(platformConsistency.reason);
    }

    return {
      name: 'Device Security',
      weight: 0.2,
      score: Math.min(1, riskScore),
      explanation: riskFactors.join('; ') || 'No device security concerns',
    };
  }

  private assessBehavioralRisk(context: UserContext): RiskFactor {
    const { behavioralMetrics } = context;
    let riskScore = 0;
    const riskFactors: string[] = [];

    if (behavioralMetrics.typingConsistency && behavioralMetrics.typingConsistency < 0.6) {
      riskScore += 0.3;
      riskFactors.push('Inconsistent typing pattern');
    }

    if (behavioralMetrics.mouseMovementPattern === 'erratic') {
      riskScore += 0.2;
      riskFactors.push('Erratic mouse movement');
    }

    if (behavioralMetrics.interactionFrequency && behavioralMetrics.interactionFrequency < 0.3) {
      riskScore += 0.2;
      riskFactors.push('Low interaction frequency');
    }

    return {
      name: 'Behavioral Pattern',
      weight: 0.25,
      score: Math.min(1, riskScore),
      explanation: riskFactors.join('; ') || 'Normal behavioral patterns',
    };
  }

  private assessHistoricalRisk(context: UserContext): RiskFactor {
    const { historicalData } = context;
    let riskScore = 0;
    const riskFactors: string[] = [];

    // Check failed attempts
    if (historicalData.failedAttempts > 3) {
      riskScore += 0.3;
      riskFactors.push(`${historicalData.failedAttempts} recent failed attempts`);
    }

    // Check login frequency
    if (historicalData.lastLoginTime) {
      const hoursSinceLastLogin = (Date.now() - historicalData.lastLoginTime) / (1000 * 60 * 60);
      if (hoursSinceLastLogin > 168) { // 1 week
        riskScore += 0.2;
        riskFactors.push('First login in over a week');
      }
    }

    // Check success rate
    const totalAttempts = historicalData.failedAttempts + historicalData.successfulLogins;
    const successRate = historicalData.successfulLogins / totalAttempts;
    if (successRate < 0.7) {
      riskScore += 0.2;
      riskFactors.push('Low login success rate');
    }

    return {
      name: 'Historical Pattern',
      weight: 0.15,
      score: Math.min(1, riskScore),
      explanation: riskFactors.join('; ') || 'Normal historical patterns',
    };
  }

  private checkPlatformConsistency(deviceInfo: UserContext['deviceInfo']): {
    consistent: boolean;
    reason?: string;
  } {
    // Check if OS and platform match
    const platform = deviceInfo.platform.toLowerCase();
    const os = deviceInfo.os.toLowerCase();

    if (platform.includes('win') && !os.includes('windows')) {
      return { consistent: false, reason: 'Platform/OS mismatch' };
    }

    if (platform.includes('mac') && !os.includes('mac')) {
      return { consistent: false, reason: 'Platform/OS mismatch' };
    }

    if (platform.includes('linux') && !os.includes('linux')) {
      return { consistent: false, reason: 'Platform/OS mismatch' };
    }

    // Check for touch support consistency
    const hasTouchScreen = deviceInfo.touchSupport;
    const isMobileDevice = deviceInfo.platform.toLowerCase().includes('mobile');
    if (isMobileDevice !== hasTouchScreen) {
      return { consistent: false, reason: 'Touch support inconsistency' };
    }

    return { consistent: true };
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  private determineRiskLevel(score: number): RiskAssessment['level'] {
    if (score >= this.RISK_THRESHOLDS.high) return 'critical';
    if (score >= this.RISK_THRESHOLDS.medium) return 'high';
    if (score >= this.RISK_THRESHOLDS.low) return 'medium';
    return 'low';
  }

  private generateRecommendations(
    factors: RiskFactor[],
    riskLevel: RiskAssessment['level']
  ): string[] {
    const recommendations: string[] = [];

    // Add general recommendations based on risk level
    if (riskLevel === 'critical' || riskLevel === 'high') {
      recommendations.push('Enable two-factor authentication');
      recommendations.push('Review recent account activity');
      recommendations.push('Update password');
    }

    // Add specific recommendations based on risk factors
    factors.forEach(factor => {
      if (factor.score > 0.6) {
        switch (factor.name) {
          case 'Location':
            recommendations.push('Verify your location through additional authentication');
            break;
          case 'Time Pattern':
            recommendations.push('Login attempt outside normal hours - additional verification recommended');
            break;
          case 'Device Security':
            recommendations.push('Ensure your device and browser are up to date');
            recommendations.push('Use a secure connection');
            break;
          case 'Behavioral Pattern':
            recommendations.push('Unusual behavior detected - additional verification may be required');
            break;
          case 'Historical Pattern':
            recommendations.push('Review and verify recent account activity');
            break;
        }
      }
    });

    return [...new Set(recommendations)]; // Remove duplicates
  }

  private storeAssessment(userId: string, assessment: RiskAssessment): void {
    const userHistory = this.riskHistory.get(userId) || [];
    userHistory.push(assessment);
    
    // Keep only the last MAX_HISTORY_LENGTH assessments
    if (userHistory.length > this.MAX_HISTORY_LENGTH) {
      userHistory.shift();
    }
    
    this.riskHistory.set(userId, userHistory);
  }

  public getAssessmentHistory(userId: string): RiskAssessment[] {
    return this.riskHistory.get(userId) || [];
  }

  public getAggregateRisk(userId: string): {
    averageScore: number;
    trend: 'improving' | 'stable' | 'worsening';
    riskLevel: RiskAssessment['level'];
  } {
    const history = this.getAssessmentHistory(userId);
    if (history.length === 0) {
      return {
        averageScore: 0,
        trend: 'stable',
        riskLevel: 'medium',
      };
    }

    const scores = history.map(h => h.score);
    const averageScore = scores.reduce((a, b) => a + b, 0) / scores.length;

    // Calculate trend using linear regression
    const trend = this.calculateTrend(scores);

    return {
      averageScore,
      trend,
      riskLevel: this.determineRiskLevel(averageScore),
    };
  }

  private calculateTrend(scores: number[]): 'improving' | 'stable' | 'worsening' {
    if (scores.length < 2) return 'stable';

    // Simple linear regression
    const n = scores.length;
    const x = Array.from({ length: n }, (_, i) => i);
    const y = scores;

    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((a, b, i) => a + b * y[i], 0);
    const sumXX = x.reduce((a, b) => a + b * b, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);

    if (Math.abs(slope) < 0.1) return 'stable';
    return slope < 0 ? 'improving' : 'worsening';
  }
}

export const riskAssessment = RiskAssessmentService.getInstance(); 