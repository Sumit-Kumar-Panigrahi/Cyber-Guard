import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ConsentSettings, ConsentContextType, ConsentUpdatePayload } from '../types/consent';
import { apiRequest } from '../services/api';

import { useAuth } from './AuthContext';

const ConsentContext = createContext<ConsentContextType | undefined>(undefined);

export const ConsentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [consent, setConsent] = useState<ConsentSettings | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchConsent = useCallback(async () => {
    if (!isAuthenticated) {
      setConsent(null);
      return;
    }
    setIsLoading(true);
    try {
      const data = await apiRequest<ConsentSettings>('/consent');
      setConsent(data);
    } catch (err) {
      console.error('Failed to load consent configuration:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchConsent();
  }, [fetchConsent]);

  const updateToggle = async (key: keyof ConsentUpdatePayload, value: boolean) => {
    // Optimistic UI update
    if (consent) {
      setConsent({ ...consent, [key]: value });
    }
    try {
      const updated = await apiRequest<ConsentSettings>('/consent', {
        method: 'PUT',
        body: JSON.stringify({ [key]: value }),
      });
      setConsent(updated);
    } catch (err) {
      console.error(`Failed to update consent for ${key}:`, err);
      // Revert on error
      fetchConsent();
      throw err;
    }
  };

  const purgeFaceData = async () => {
    try {
      await apiRequest('/consent/face-data', { method: 'DELETE' });
      if (consent) {
        setConsent({ ...consent, opt_in_face_embedding: false });
      }
    } catch (err) {
      console.error('Failed to purge face data:', err);
      throw err;
    }
  };

  return (
    <ConsentContext.Provider
      value={{
        consent,
        isLoading,
        updateToggle,
        purgeFaceData,
        reloadConsent: fetchConsent,
      }}
    >
      {children}
    </ConsentContext.Provider>
  );
};

export const useConsent = (): ConsentContextType => {
  const context = useContext(ConsentContext);
  if (!context) {
    throw new Error('useConsent must be used within a ConsentProvider');
  }
  return context;
};
