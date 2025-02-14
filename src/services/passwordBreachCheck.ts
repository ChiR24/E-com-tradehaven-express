import { createHash } from 'crypto';

interface BreachCheckResult {
  isCompromised: boolean;
  occurrences: number;
  breachDetails?: {
    firstSeen: string;
    lastSeen: string;
    sources: string[];
  };
}

export const passwordBreachCheck = {
  async checkPassword(password: string): Promise<BreachCheckResult> {
    try {
      // Hash the password with SHA-1
      const hash = createHash('sha1').update(password).digest('hex').toUpperCase();
      const prefix = hash.slice(0, 5);
      const suffix = hash.slice(5);

      // Query the HIBP API with k-anonymity
      const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
        headers: {
          'Add-Padding': 'true', // Helps prevent timing attacks
        },
      });

      if (!response.ok) {
        throw new Error('Failed to check password breach status');
      }

      const text = await response.text();
      const hashes = text.split('\n');
      
      // Find our hash suffix in the response
      const match = hashes.find(h => h.startsWith(suffix));
      
      if (!match) {
        return {
          isCompromised: false,
          occurrences: 0,
        };
      }

      const occurrences = parseInt(match.split(':')[1], 10);
      
      return {
        isCompromised: true,
        occurrences,
        breachDetails: {
          firstSeen: 'Unknown', // HIBP API doesn't provide this info
          lastSeen: new Date().toISOString(),
          sources: ['Have I Been Pwned Database'],
        },
      };
    } catch (error) {
      console.error('Password breach check failed:', error);
      // Fail safe - if the check fails, assume the password might be compromised
      return {
        isCompromised: true,
        occurrences: 0,
        breachDetails: {
          firstSeen: 'Unknown',
          lastSeen: 'Unknown',
          sources: ['Check failed - assuming compromised'],
        },
      };
    }
  },

  async checkPasswordStrength(password: string): Promise<{
    entropy: number;
    crackTime: string;
    suggestions: string[];
  }> {
    const calculateEntropy = (str: string): number => {
      const charSet = new Set(str.split(''));
      const possibilities = charSet.size;
      return Math.log2(Math.pow(possibilities, str.length));
    };

    const estimateCrackTime = (entropy: number): string => {
      // Assume 1 billion guesses per second (modern hardware)
      const guessesPerSecond = 1000000000;
      const seconds = Math.pow(2, entropy) / guessesPerSecond;
      
      if (seconds < 1) return 'instantly';
      if (seconds < 60) return `${Math.round(seconds)} seconds`;
      if (seconds < 3600) return `${Math.round(seconds / 60)} minutes`;
      if (seconds < 86400) return `${Math.round(seconds / 3600)} hours`;
      if (seconds < 31536000) return `${Math.round(seconds / 86400)} days`;
      return `${Math.round(seconds / 31536000)} years`;
    };

    const entropy = calculateEntropy(password);
    const suggestions: string[] = [];

    // Analyze password composition
    if (!/[A-Z]/.test(password)) suggestions.push('Add uppercase letters');
    if (!/[a-z]/.test(password)) suggestions.push('Add lowercase letters');
    if (!/[0-9]/.test(password)) suggestions.push('Add numbers');
    if (!/[^A-Za-z0-9]/.test(password)) suggestions.push('Add special characters');
    if (password.length < 16) suggestions.push('Make the password longer');
    if (/(.)\1{2,}/.test(password)) suggestions.push('Avoid repeating characters');
    if (/^(?:abc|123|qwerty|password)/i.test(password)) suggestions.push('Avoid common patterns');

    return {
      entropy,
      crackTime: estimateCrackTime(entropy),
      suggestions,
    };
  },
}; 