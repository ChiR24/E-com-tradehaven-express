interface PasswordRequirement {
  regex: RegExp;
  message: string;
  level: 'normal' | 'enhanced' | 'maximum';
}

interface PasswordStrengthResult {
  score: number;
  requirements: {
    regex: RegExp;
    message: string;
    met: boolean;
  }[];
  feedback: string[];
  isValid: boolean;
}

const PASSWORD_REQUIREMENTS: PasswordRequirement[] = [
  // Normal requirements
  {
    regex: /.{8,}/,
    message: 'At least 8 characters',
    level: 'normal',
  },
  {
    regex: /[0-9]/,
    message: 'At least one number',
    level: 'normal',
  },
  {
    regex: /[a-z]/,
    message: 'At least one lowercase letter',
    level: 'normal',
  },
  {
    regex: /[A-Z]/,
    message: 'At least one uppercase letter',
    level: 'normal',
  },
  
  // Enhanced requirements
  {
    regex: /.{12,}/,
    message: 'At least 12 characters',
    level: 'enhanced',
  },
  {
    regex: /[^A-Za-z0-9]/,
    message: 'At least one special character',
    level: 'enhanced',
  },
  {
    regex: /^(?!.*(.)\1{2,})/,
    message: 'No character repeated more than twice in a row',
    level: 'enhanced',
  },
  
  // Maximum requirements
  {
    regex: /.{16,}/,
    message: 'At least 16 characters',
    level: 'maximum',
  },
  {
    regex: /(?=.*[0-9].*[0-9])/,
    message: 'At least two numbers',
    level: 'maximum',
  },
  {
    regex: /(?=.*[^A-Za-z0-9].*[^A-Za-z0-9])/,
    message: 'At least two special characters',
    level: 'maximum',
  },
  {
    regex: /^(?!.*(?:password|123|abc|qwerty))/i,
    message: 'Must not contain common patterns',
    level: 'maximum',
  },
];

const COMPROMISED_PASSWORDS = new Set([
  // Add known compromised passwords here
  'password123',
  'admin123',
  'letmein123',
  // ... add more
]);

export const passwordPolicy = {
  validatePassword(password: string, complexity: 'normal' | 'enhanced' | 'maximum' = 'normal'): PasswordStrengthResult {
    // Get requirements for current complexity level
    const activeRequirements = PASSWORD_REQUIREMENTS.filter(req => {
      if (complexity === 'normal') return req.level === 'normal';
      if (complexity === 'enhanced') return ['normal', 'enhanced'].includes(req.level);
      return true; // maximum includes all requirements
    });

    // Check each requirement
    const results = activeRequirements.map(req => ({
      regex: req.regex,
      message: req.message,
      met: req.regex.test(password),
    }));

    // Calculate score (0-100)
    const baseScore = (results.filter(r => r.met).length / results.length) * 100;
    
    // Additional checks for better scoring
    const bonusPoints = [
      password.length > 20 ? 10 : 0, // Extra length bonus
      /[^A-Za-z0-9].*[^A-Za-z0-9].*[^A-Za-z0-9]/.test(password) ? 5 : 0, // Extra special chars
      /(?=.*[0-9].*[0-9].*[0-9])/.test(password) ? 5 : 0, // Extra numbers
    ].reduce((sum, points) => sum + points, 0);

    const score = Math.min(100, baseScore + bonusPoints);

    // Generate feedback
    const feedback: string[] = [];
    
    // Add failed requirements to feedback
    results.filter(r => !r.met).forEach(r => feedback.push(r.message));

    // Check for compromised password
    if (COMPROMISED_PASSWORDS.has(password.toLowerCase())) {
      feedback.push('This password has been compromised in data breaches');
    }

    // Additional feedback based on patterns
    if (/(.)\1{2,}/.test(password)) {
      feedback.push('Avoid repeating characters');
    }
    if (/^[A-Za-z]+$/.test(password)) {
      feedback.push('Add numbers and special characters');
    }
    if (/^[0-9]+$/.test(password)) {
      feedback.push('Add letters and special characters');
    }
    if (password.toLowerCase().includes(password.toLowerCase().split('').reverse().join(''))) {
      feedback.push('Avoid palindromes');
    }

    return {
      score,
      requirements: results,
      feedback,
      isValid: results.every(r => r.met) && !COMPROMISED_PASSWORDS.has(password.toLowerCase()),
    };
  },

  generateStrongPassword(): string {
    const lowercase = 'abcdefghijkmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    const numbers = '23456789';
    const special = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    const allChars = lowercase + uppercase + numbers + special;
    const length = 16 + Math.floor(Math.random() * 8); // 16-24 characters
    
    let password = '';
    
    // Ensure at least one of each type
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += special[Math.floor(Math.random() * special.length)];
    
    // Fill the rest randomly
    for (let i = password.length; i < length; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }
    
    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('');
  },
}; 