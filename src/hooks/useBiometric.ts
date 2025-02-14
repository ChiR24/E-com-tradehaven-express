import { useState, useCallback } from 'react';

interface BiometricState {
  isAvailable: boolean;
  isEnabled: boolean;
  isSupported: boolean;
}

export function useBiometric() {
  const [state, setState] = useState<BiometricState>({
    isAvailable: false,
    isEnabled: false,
    isSupported: false,
  });

  const checkSupport = useCallback(async () => {
    if (!window.PublicKeyCredential) {
      setState(prev => ({ ...prev, isSupported: false }));
      return;
    }

    try {
      const available = await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      setState(prev => ({ ...prev, isSupported: true, isAvailable: available }));
    } catch {
      setState(prev => ({ ...prev, isSupported: false }));
    }
  }, []);

  const registerBiometric = useCallback(async (userId: string, username: string) => {
    if (!state.isAvailable) throw new Error('Biometric authentication not available');

    const challenge = new Uint8Array(32);
    window.crypto.getRandomValues(challenge);

    const publicKeyCredentialCreationOptions: PublicKeyCredentialCreationOptions = {
      challenge,
      rp: {
        name: 'TradeHaven',
        id: window.location.hostname,
      },
      user: {
        id: Uint8Array.from(userId, c => c.charCodeAt(0)),
        name: username,
        displayName: username,
      },
      pubKeyCredParams: [
        { alg: -7, type: 'public-key' },
        { alg: -257, type: 'public-key' },
      ],
      authenticatorSelection: {
        authenticatorAttachment: 'platform',
        requireResidentKey: true,
        userVerification: 'required',
      },
      timeout: 60000,
      attestation: 'direct',
    };

    try {
      const credential = await navigator.credentials.create({
        publicKey: publicKeyCredentialCreationOptions,
      });

      if (credential) {
        setState(prev => ({ ...prev, isEnabled: true }));
        // Store credential info in your backend
        return credential;
      }
    } catch (error) {
      throw new Error('Failed to register biometric authentication');
    }
  }, [state.isAvailable]);

  const authenticateWithBiometric = useCallback(async () => {
    if (!state.isEnabled) throw new Error('Biometric authentication not enabled');

    const challenge = new Uint8Array(32);
    window.crypto.getRandomValues(challenge);

    const publicKeyCredentialRequestOptions: PublicKeyCredentialRequestOptions = {
      challenge,
      timeout: 60000,
      userVerification: 'required',
      rpId: window.location.hostname,
    };

    try {
      const assertion = await navigator.credentials.get({
        publicKey: publicKeyCredentialRequestOptions,
      });

      return assertion;
    } catch (error) {
      throw new Error('Biometric authentication failed');
    }
  }, [state.isEnabled]);

  return {
    ...state,
    checkSupport,
    registerBiometric,
    authenticateWithBiometric,
  };
} 