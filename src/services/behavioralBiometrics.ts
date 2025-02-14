interface KeyTiming {
  key: string;
  pressTime: number;
  releaseTime: number;
  holdTime: number;
  flightTime?: number;
}

interface TypingPattern {
  keyTimings: KeyTiming[];
  averageHoldTime: number;
  averageFlightTime: number;
  variance: number;
  consistency: number;
}

interface MousePattern {
  movements: Array<{
    x: number;
    y: number;
    timestamp: number;
    velocity: number;
  }>;
  clicks: Array<{
    x: number;
    y: number;
    timestamp: number;
    type: 'single' | 'double' | 'right';
  }>;
  averageVelocity: number;
  movementPattern: 'direct' | 'curved' | 'erratic';
}

interface BehavioralProfile {
  typingPatterns: Record<string, TypingPattern>;
  mousePatterns: MousePattern[];
  deviceCharacteristics: {
    screenResolution: string;
    touchPoints: number;
    colorDepth: number;
    devicePixelRatio: number;
    hardwareConcurrency: number;
  };
  confidenceScore: number;
}

class BehavioralBiometrics {
  private profiles: Map<string, BehavioralProfile> = new Map();
  private currentTypingPattern: KeyTiming[] = [];
  private mouseMovements: MousePattern['movements'] = [];
  private mouseClicks: MousePattern['clicks'] = [];
  private readonly MINIMUM_SAMPLES = 10;

  constructor() {
    this.initializeListeners();
  }

  private initializeListeners() {
    if (typeof window === 'undefined') return;

    // Typing pattern listeners
    window.addEventListener('keydown', this.handleKeyDown.bind(this));
    window.addEventListener('keyup', this.handleKeyUp.bind(this));

    // Mouse pattern listeners
    window.addEventListener('mousemove', this.handleMouseMove.bind(this));
    window.addEventListener('click', this.handleMouseClick.bind(this));
    window.addEventListener('contextmenu', this.handleRightClick.bind(this));
  }

  private handleKeyDown(event: KeyboardEvent) {
    const timing: KeyTiming = {
      key: event.key,
      pressTime: performance.now(),
      releaseTime: 0,
      holdTime: 0,
    };
    
    if (this.currentTypingPattern.length > 0) {
      const lastTiming = this.currentTypingPattern[this.currentTypingPattern.length - 1];
      if (lastTiming.releaseTime > 0) {
        timing.flightTime = timing.pressTime - lastTiming.releaseTime;
      }
    }

    this.currentTypingPattern.push(timing);
  }

  private handleKeyUp(event: KeyboardEvent) {
    const timing = this.currentTypingPattern.find(
      t => t.key === event.key && t.releaseTime === 0
    );
    if (timing) {
      timing.releaseTime = performance.now();
      timing.holdTime = timing.releaseTime - timing.pressTime;
    }
  }

  private handleMouseMove(event: MouseEvent) {
    this.mouseMovements.push({
      x: event.clientX,
      y: event.clientY,
      timestamp: performance.now(),
      velocity: this.calculateVelocity(event),
    });

    // Keep only last 100 movements
    if (this.mouseMovements.length > 100) {
      this.mouseMovements.shift();
    }
  }

  private handleMouseClick(event: MouseEvent) {
    this.mouseClicks.push({
      x: event.clientX,
      y: event.clientY,
      timestamp: performance.now(),
      type: event.detail === 2 ? 'double' : 'single',
    });

    // Keep only last 50 clicks
    if (this.mouseClicks.length > 50) {
      this.mouseClicks.shift();
    }
  }

  private handleRightClick(event: MouseEvent) {
    this.mouseClicks.push({
      x: event.clientX,
      y: event.clientY,
      timestamp: performance.now(),
      type: 'right',
    });
  }

  private calculateVelocity(event: MouseEvent): number {
    if (this.mouseMovements.length === 0) return 0;
    
    const lastMovement = this.mouseMovements[this.mouseMovements.length - 1];
    const timeDiff = performance.now() - lastMovement.timestamp;
    const distance = Math.sqrt(
      Math.pow(event.clientX - lastMovement.x, 2) +
      Math.pow(event.clientY - lastMovement.y, 2)
    );
    
    return timeDiff > 0 ? distance / timeDiff : 0;
  }

  private analyzeTypingPattern(): TypingPattern {
    const validTimings = this.currentTypingPattern.filter(t => t.releaseTime > 0);
    
    const holdTimes = validTimings.map(t => t.holdTime);
    const flightTimes = validTimings
      .filter(t => t.flightTime !== undefined)
      .map(t => t.flightTime!);

    const averageHoldTime = holdTimes.reduce((a, b) => a + b, 0) / holdTimes.length;
    const averageFlightTime = flightTimes.length > 0
      ? flightTimes.reduce((a, b) => a + b, 0) / flightTimes.length
      : 0;

    // Calculate variance and consistency
    const variance = this.calculateVariance(holdTimes);
    const consistency = this.calculateConsistency(holdTimes, flightTimes);

    return {
      keyTimings: validTimings,
      averageHoldTime,
      averageFlightTime,
      variance,
      consistency,
    };
  }

  private analyzeMousePattern(): MousePattern {
    const velocities = this.mouseMovements.map(m => m.velocity);
    const averageVelocity = velocities.reduce((a, b) => a + b, 0) / velocities.length;

    // Analyze movement pattern
    const movementPattern = this.determineMovementPattern();

    return {
      movements: this.mouseMovements,
      clicks: this.mouseClicks,
      averageVelocity,
      movementPattern,
    };
  }

  private calculateVariance(numbers: number[]): number {
    const mean = numbers.reduce((a, b) => a + b, 0) / numbers.length;
    const squareDiffs = numbers.map(n => Math.pow(n - mean, 2));
    return squareDiffs.reduce((a, b) => a + b, 0) / numbers.length;
  }

  private calculateConsistency(holdTimes: number[], flightTimes: number[]): number {
    const holdTimeVariance = this.calculateVariance(holdTimes);
    const flightTimeVariance = flightTimes.length > 0
      ? this.calculateVariance(flightTimes)
      : 0;

    // Lower variance means higher consistency
    const maxVariance = 10000; // Arbitrary threshold
    const holdConsistency = Math.max(0, 1 - (holdTimeVariance / maxVariance));
    const flightConsistency = flightTimes.length > 0
      ? Math.max(0, 1 - (flightTimeVariance / maxVariance))
      : 0;

    return (holdConsistency + flightConsistency) / (flightTimes.length > 0 ? 2 : 1);
  }

  private determineMovementPattern(): MousePattern['movementPattern'] {
    if (this.mouseMovements.length < 3) return 'direct';

    let angleChanges = 0;
    let totalSegments = 0;

    for (let i = 2; i < this.mouseMovements.length; i++) {
      const p1 = this.mouseMovements[i - 2];
      const p2 = this.mouseMovements[i - 1];
      const p3 = this.mouseMovements[i];

      const angle1 = Math.atan2(p2.y - p1.y, p2.x - p1.x);
      const angle2 = Math.atan2(p3.y - p2.y, p3.x - p2.x);
      const angleDiff = Math.abs(angle2 - angle1);

      if (angleDiff > Math.PI / 4) angleChanges++;
      totalSegments++;
    }

    const changeRatio = angleChanges / totalSegments;
    if (changeRatio > 0.5) return 'erratic';
    if (changeRatio > 0.2) return 'curved';
    return 'direct';
  }

  public createProfile(userId: string): BehavioralProfile {
    const typingPattern = this.analyzeTypingPattern();
    const mousePattern = this.analyzeMousePattern();

    const profile: BehavioralProfile = {
      typingPatterns: {
        [new Date().toISOString()]: typingPattern,
      },
      mousePatterns: [mousePattern],
      deviceCharacteristics: {
        screenResolution: `${window.screen.width}x${window.screen.height}`,
        touchPoints: navigator.maxTouchPoints,
        colorDepth: window.screen.colorDepth,
        devicePixelRatio: window.devicePixelRatio,
        hardwareConcurrency: navigator.hardwareConcurrency,
      },
      confidenceScore: this.calculateConfidenceScore(typingPattern, mousePattern),
    };

    this.profiles.set(userId, profile);
    return profile;
  }

  public updateProfile(userId: string): void {
    const existingProfile = this.profiles.get(userId);
    if (!existingProfile) return;

    const newTypingPattern = this.analyzeTypingPattern();
    const newMousePattern = this.analyzeMousePattern();

    existingProfile.typingPatterns[new Date().toISOString()] = newTypingPattern;
    existingProfile.mousePatterns.push(newMousePattern);

    // Keep only last 10 patterns
    const typingDates = Object.keys(existingProfile.typingPatterns).sort();
    if (typingDates.length > 10) {
      delete existingProfile.typingPatterns[typingDates[0]];
    }
    if (existingProfile.mousePatterns.length > 10) {
      existingProfile.mousePatterns.shift();
    }

    existingProfile.confidenceScore = this.calculateConfidenceScore(
      newTypingPattern,
      newMousePattern
    );

    this.profiles.set(userId, existingProfile);
  }

  private calculateConfidenceScore(
    typingPattern: TypingPattern,
    mousePattern: MousePattern
  ): number {
    let score = 0;
    const weights = {
      typingConsistency: 0.4,
      mouseConsistency: 0.3,
      patternComplexity: 0.3,
    };

    // Typing pattern score
    if (typingPattern.keyTimings.length >= this.MINIMUM_SAMPLES) {
      score += typingPattern.consistency * weights.typingConsistency;
    }

    // Mouse pattern score
    const mouseConsistencyScore = mousePattern.movementPattern === 'erratic' ? 0.3 :
      mousePattern.movementPattern === 'curved' ? 0.7 : 1.0;
    score += mouseConsistencyScore * weights.mouseConsistency;

    // Pattern complexity
    const complexityScore = (
      (typingPattern.keyTimings.length / 50) + // Normalize to 50 keystrokes
      (mousePattern.movements.length / 100) // Normalize to 100 movements
    ) / 2;
    score += Math.min(1, complexityScore) * weights.patternComplexity;

    return Math.min(1, score);
  }

  public verifyUser(userId: string): number {
    const profile = this.profiles.get(userId);
    if (!profile) return 0;

    const currentTypingPattern = this.analyzeTypingPattern();
    const currentMousePattern = this.analyzeMousePattern();

    // Compare current patterns with stored profiles
    const typingMatch = this.compareTypingPatterns(
      currentTypingPattern,
      Object.values(profile.typingPatterns)
    );

    const mouseMatch = this.compareMousePatterns(
      currentMousePattern,
      profile.mousePatterns
    );

    // Weight the scores (typing pattern is generally more reliable)
    return typingMatch * 0.7 + mouseMatch * 0.3;
  }

  private compareTypingPatterns(
    current: TypingPattern,
    stored: TypingPattern[]
  ): number {
    if (stored.length === 0 || current.keyTimings.length < this.MINIMUM_SAMPLES) {
      return 0;
    }

    const matchScores = stored.map(pattern => {
      const holdTimeDiff = Math.abs(
        current.averageHoldTime - pattern.averageHoldTime
      ) / pattern.averageHoldTime;
      
      const flightTimeDiff = Math.abs(
        current.averageFlightTime - pattern.averageFlightTime
      ) / pattern.averageFlightTime;

      const consistencyDiff = Math.abs(
        current.consistency - pattern.consistency
      );

      // Weight the differences
      return 1 - (
        holdTimeDiff * 0.4 +
        flightTimeDiff * 0.4 +
        consistencyDiff * 0.2
      );
    });

    // Return the best match score
    return Math.max(...matchScores);
  }

  private compareMousePatterns(
    current: MousePattern,
    stored: MousePattern[]
  ): number {
    if (stored.length === 0) return 0;

    const matchScores = stored.map(pattern => {
      const velocityDiff = Math.abs(
        current.averageVelocity - pattern.averageVelocity
      ) / pattern.averageVelocity;

      const patternMatch = current.movementPattern === pattern.movementPattern ? 1 : 0;

      // Weight the differences
      return 1 - (velocityDiff * 0.7 + (1 - patternMatch) * 0.3);
    });

    // Return the best match score
    return Math.max(...matchScores);
  }

  public reset(): void {
    this.currentTypingPattern = [];
    this.mouseMovements = [];
    this.mouseClicks = [];
  }
}

export const behavioralBiometrics = new BehavioralBiometrics(); 