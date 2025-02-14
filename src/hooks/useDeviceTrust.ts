import { useState, useEffect, useCallback } from 'react';
import { UAParser } from 'ua-parser-js';

interface TrustScore {
  score: number;
  factors: {
    knownDevice: boolean;
    recentActivity: boolean;
    locationMatch: boolean;
    platformSecurity: boolean;
    browserSecurity: boolean;
    networkSecurity: boolean;
    timePatternMatch: boolean;
    deviceIntegrity: boolean;
    riskLevel: 'low' | 'medium' | 'high';
  };
  metadata: {
    lastLoginTime: number;
    loginCount: number;
    failedAttempts: number;
    unusualActivityFlags: string[];
  };
}

interface DeviceInfo {
  deviceId: string;
  browser: string;
  os: string;
  device: string;
  lastSeen: number;
  loginTimes: number[]; // Store last 10 login timestamps
  usualLoginHours: number[]; // Store usual login hours (0-23)
  networkInfo: {
    ip?: string;
    vpnDetected?: boolean;
    isp?: string;
  };
  location?: {
    latitude: number;
    longitude: number;
    accuracy: number;
    timestamp: number;
  };
  riskFactors: {
    unusualLoginTime: boolean;
    unusualLocation: boolean;
    rapidLocationChange: boolean;
    multipleFailedAttempts: boolean;
    suspiciousIpActivity: boolean;
  };
}

export function useDeviceTrust() {
  const [trustScore, setTrustScore] = useState<TrustScore>({
    score: 0,
    factors: {
      knownDevice: false,
      recentActivity: false,
      locationMatch: false,
      platformSecurity: false,
      browserSecurity: false,
      networkSecurity: false,
      timePatternMatch: false,
      deviceIntegrity: false,
      riskLevel: 'medium'
    },
    metadata: {
      lastLoginTime: 0,
      loginCount: 0,
      failedAttempts: 0,
      unusualActivityFlags: []
    }
  });

  const generateDeviceId = useCallback(() => {
    const parser = new UAParser();
    const ua = parser.getResult();
    const deviceInfo = {
      browser: `${ua.browser.name} ${ua.browser.version}`,
      os: `${ua.os.name} ${ua.os.version}`,
      device: ua.device.vendor ? `${ua.device.vendor} ${ua.device.model}` : 'Desktop',
      screen: `${window.screen.width}x${window.screen.height}`,
      colorDepth: window.screen.colorDepth,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };
    return btoa(JSON.stringify(deviceInfo));
  }, []);

  const checkKnownDevice = useCallback(async () => {
    const deviceId = generateDeviceId();
    const knownDevices: DeviceInfo[] = JSON.parse(localStorage.getItem('knownDevices') || '[]');
    return knownDevices.some(device => device.deviceId === deviceId);
  }, [generateDeviceId]);

  const checkPlatformSecurity = useCallback(() => {
    const parser = new UAParser();
    const ua = parser.getResult();
    
    // Check if browser is up to date
    const browserVersion = parseInt(ua.browser.version?.split('.')[0] || '0');
    const isModernBrowser = (
      (ua.browser.name === 'Chrome' && browserVersion >= 90) ||
      (ua.browser.name === 'Firefox' && browserVersion >= 88) ||
      (ua.browser.name === 'Safari' && browserVersion >= 14)
    );

    // Check for security features
    const hasSecurityFeatures = !!(
      window.crypto &&
      window.crypto.subtle &&
      window.isSecureContext &&
      window.crossOriginIsolated
    );

    return isModernBrowser && hasSecurityFeatures;
  }, []);

  const checkLocationMatch = useCallback(async () => {
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });

      const knownDevices: DeviceInfo[] = JSON.parse(localStorage.getItem('knownDevices') || '[]');
      const deviceId = generateDeviceId();
      const knownDevice = knownDevices.find(device => device.deviceId === deviceId);

      if (!knownDevice?.location) return false;

      const distance = calculateDistance(
        position.coords.latitude,
        position.coords.longitude,
        knownDevice.location.latitude,
        knownDevice.location.longitude
      );

      return distance < 100; // Within 100km
    } catch {
      return false;
    }
  }, [generateDeviceId]);

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const detectVPN = useCallback(async () => {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const { ip } = await response.json();
      // Check if IP is from known VPN providers (you'd need a database/API for this)
      return { ip, vpnDetected: false }; // Placeholder implementation
    } catch {
      return { vpnDetected: false };
    }
  }, []);

  const checkTimePattern = useCallback((loginTimes: number[]) => {
    if (loginTimes.length < 5) return true;
    
    const currentHour = new Date().getHours();
    const usualHours = loginTimes
      .map(time => new Date(time).getHours())
      .reduce((acc, hour) => {
        acc[hour] = (acc[hour] || 0) + 1;
        return acc;
      }, {} as Record<number, number>);

    const isUsualTime = usualHours[currentHour] > 0;
    return isUsualTime;
  }, []);

  const checkLocationAnomaly = useCallback((
    currentLocation: DeviceInfo['location'],
    previousLocations: DeviceInfo['location'][]
  ) => {
    if (!currentLocation || previousLocations.length === 0) return false;

    const recentLocation = previousLocations[previousLocations.length - 1];
    if (!recentLocation) return false;

    const timeDiff = currentLocation.timestamp - recentLocation.timestamp;
    const distance = calculateDistance(
      currentLocation.latitude,
      currentLocation.longitude,
      recentLocation.latitude,
      recentLocation.longitude
    );

    // Flag if location changed too quickly (e.g., > 800 km/h)
    const speedMph = (distance / timeDiff) * 3600;
    return speedMph > 500;
  }, []);

  const assessRiskLevel = useCallback((factors: TrustScore['factors'], deviceInfo: DeviceInfo) => {
    let riskScore = 0;
    
    // Add risk points for each suspicious factor
    if (!factors.knownDevice) riskScore += 2;
    if (!factors.locationMatch) riskScore += 2;
    if (!factors.timePatternMatch) riskScore += 1;
    if (deviceInfo.riskFactors.unusualLocation) riskScore += 2;
    if (deviceInfo.riskFactors.rapidLocationChange) riskScore += 3;
    if (deviceInfo.riskFactors.multipleFailedAttempts) riskScore += 3;
    if (deviceInfo.networkInfo.vpnDetected) riskScore += 1;

    // Determine risk level
    if (riskScore >= 6) return 'high';
    if (riskScore >= 3) return 'medium';
    return 'low';
  }, []);

  const calculateTrustScore = useCallback(async () => {
    const deviceId = generateDeviceId();
    const knownDevices: DeviceInfo[] = JSON.parse(localStorage.getItem('knownDevices') || '[]');
    const currentDevice = knownDevices.find(d => d.deviceId === deviceId);

    const networkInfo = await detectVPN();
    const position = await getCurrentPosition().catch(() => null);
    
    const factors: TrustScore['factors'] = {
      knownDevice: !!currentDevice,
      recentActivity: currentDevice ? (Date.now() - currentDevice.lastSeen) < 7 * 24 * 60 * 60 * 1000 : false,
      locationMatch: false,
      platformSecurity: checkPlatformSecurity(),
      browserSecurity: window.isSecureContext,
      networkSecurity: !networkInfo.vpnDetected,
      timePatternMatch: currentDevice ? checkTimePattern(currentDevice.loginTimes) : true,
      deviceIntegrity: checkDeviceIntegrity(),
      riskLevel: 'low'
    };

    if (position && currentDevice?.location) {
      factors.locationMatch = calculateDistance(
        position.coords.latitude,
        position.coords.longitude,
        currentDevice.location.latitude,
        currentDevice.location.longitude
      ) < 100; // Within 100km
    }

    const deviceInfo: DeviceInfo = {
      ...currentDevice!,
      networkInfo,
      riskFactors: {
        unusualLoginTime: !factors.timePatternMatch,
        unusualLocation: !factors.locationMatch,
        rapidLocationChange: position ? checkLocationAnomaly(
          { 
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp
          },
          knownDevices.map(d => d.location).filter(Boolean)
        ) : false,
        multipleFailedAttempts: (trustScore.metadata.failedAttempts || 0) > 3,
        suspiciousIpActivity: networkInfo.vpnDetected || false
      }
    };

    factors.riskLevel = assessRiskLevel(factors, deviceInfo);

    // Calculate final trust score (0-100)
    const weights = {
      knownDevice: 20,
      recentActivity: 15,
      locationMatch: 15,
      platformSecurity: 10,
      browserSecurity: 10,
      networkSecurity: 10,
      timePatternMatch: 10,
      deviceIntegrity: 10
    };

    const score = Object.entries(weights).reduce((total, [factor, weight]) => {
      return total + (factors[factor as keyof typeof weights] ? weight : 0);
    }, 0);

    const newTrustScore: TrustScore = {
      score,
      factors,
      metadata: {
        lastLoginTime: Date.now(),
        loginCount: (trustScore.metadata.loginCount || 0) + 1,
        failedAttempts: trustScore.metadata.failedAttempts || 0,
        unusualActivityFlags: getUnusualActivityFlags(factors, deviceInfo)
      }
    };

    setTrustScore(newTrustScore);
    return newTrustScore;
  }, [trustScore.metadata.failedAttempts, checkTimePattern, detectVPN, assessRiskLevel]);

  const checkDeviceIntegrity = useCallback(() => {
    // Check for signs of device tampering or security risks
    const hasDevTools = (window as any).devtools?.isOpen;
    const hasDebugger = Function.prototype.toString.call(function() {
      debugger;
    }).includes('debugger');
    const isEmulator = checkEmulator();
    
    return !hasDevTools && !hasDebugger && !isEmulator;
  }, []);

  const checkEmulator = useCallback(() => {
    const parser = new UAParser();
    const result = parser.getResult();
    
    // List of common emulator indicators
    const emulatorSigns = [
      'android simulator',
      'ios simulator',
      'genymotion',
      'nox',
      'bluestacks'
    ];

    return emulatorSigns.some(sign => 
      result.ua.toLowerCase().includes(sign) ||
      (result.device.model || '').toLowerCase().includes(sign)
    );
  }, []);

  const getUnusualActivityFlags = useCallback((
    factors: TrustScore['factors'],
    deviceInfo: DeviceInfo
  ) => {
    const flags: string[] = [];

    if (!factors.knownDevice) flags.push('New device detected');
    if (!factors.locationMatch) flags.push('Unusual location');
    if (!factors.timePatternMatch) flags.push('Unusual login time');
    if (deviceInfo.riskFactors.rapidLocationChange) flags.push('Rapid location change');
    if (deviceInfo.riskFactors.multipleFailedAttempts) flags.push('Multiple failed attempts');
    if (deviceInfo.networkInfo.vpnDetected) flags.push('VPN detected');
    if (!factors.deviceIntegrity) flags.push('Device integrity check failed');

    return flags;
  }, []);

  const registerDevice = useCallback(async () => {
    const deviceId = generateDeviceId();
    const knownDevices: DeviceInfo[] = JSON.parse(localStorage.getItem('knownDevices') || '[]');

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });

      const deviceInfo: DeviceInfo = {
        deviceId,
        browser: new UAParser().getBrowser().name || 'Unknown',
        os: new UAParser().getOS().name || 'Unknown',
        device: new UAParser().getDevice().vendor || 'Desktop',
        lastSeen: Date.now(),
        loginTimes: [],
        usualLoginHours: [],
        networkInfo: {
          ip: undefined,
          vpnDetected: false,
          isp: undefined
        },
        location: {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp
        },
        riskFactors: {
          unusualLoginTime: false,
          unusualLocation: false,
          rapidLocationChange: false,
          multipleFailedAttempts: false,
          suspiciousIpActivity: false
        }
      };

      const updatedDevices = [...knownDevices.filter(d => d.deviceId !== deviceId), deviceInfo];
      localStorage.setItem('knownDevices', JSON.stringify(updatedDevices));
      
      return deviceInfo;
    } catch {
      // Register without location if geolocation is not available
      const deviceInfo: DeviceInfo = {
        deviceId,
        browser: new UAParser().getBrowser().name || 'Unknown',
        os: new UAParser().getOS().name || 'Unknown',
        device: new UAParser().getDevice().vendor || 'Desktop',
        lastSeen: Date.now(),
        loginTimes: [],
        usualLoginHours: [],
        networkInfo: {
          ip: undefined,
          vpnDetected: false,
          isp: undefined
        },
        location: undefined,
        riskFactors: {
          unusualLoginTime: false,
          unusualLocation: false,
          rapidLocationChange: false,
          multipleFailedAttempts: false,
          suspiciousIpActivity: false
        }
      };

      const updatedDevices = [...knownDevices.filter(d => d.deviceId !== deviceId), deviceInfo];
      localStorage.setItem('knownDevices', JSON.stringify(updatedDevices));
      
      return deviceInfo;
    }
  }, [generateDeviceId]);

  useEffect(() => {
    calculateTrustScore();
  }, [calculateTrustScore]);

  return {
    trustScore,
    calculateTrustScore,
    registerDevice,
    checkDeviceIntegrity,
    getUnusualActivityFlags,
  };
}

const getCurrentPosition = (): Promise<GeolocationPosition> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported'));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, reject);
  });
}; 