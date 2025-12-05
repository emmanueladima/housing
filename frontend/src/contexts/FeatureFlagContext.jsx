import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const FeatureFlagContext = createContext();

export const useFeatureFlags = () => {
  const context = useContext(FeatureFlagContext);
  if (!context) {
    throw new Error('useFeatureFlags must be used within FeatureFlagProvider');
  }
  return context;
};

export const FeatureFlagProvider = ({ children }) => {
  const [flags, setFlags] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeatureFlags();
  }, []);

  const fetchFeatureFlags = async () => {
    try {
      const response = await axios.get('/api/feature-flags');
      setFlags(response.data);
    } catch (error) {
      console.error('Error fetching feature flags:', error);
      // Default to all features disabled on error
      setFlags({});
    } finally {
      setLoading(false);
    }
  };

  const isEnabled = (flagName) => {
    return flags[flagName] === true;
  };

  return (
    <FeatureFlagContext.Provider value={{ flags, loading, isEnabled }}>
      {children}
    </FeatureFlagContext.Provider>
  );
};

