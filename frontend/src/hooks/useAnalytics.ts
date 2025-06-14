import React, { useCallback } from 'react';
import analytics from '../utils/analytics';

export const useAnalytics = () => {
  // Page tracking
  const trackPageView = useCallback((page_title?: string, page_location?: string) => {
    analytics.trackPageView(page_title, page_location);
  }, []);

  // Authentication tracking
  const trackSignUp = useCallback((method?: string) => {
    analytics.trackSignUp(method);
  }, []);

  const trackLogin = useCallback((method?: string) => {
    analytics.trackLogin(method);
  }, []);

  const trackLogout = useCallback(() => {
    analytics.trackLogout();
  }, []);

  // Settings tracking
  const trackLanguageChange = useCallback((oldLang: string, newLang: string) => {
    analytics.trackLanguageChange(oldLang, newLang);
  }, []);

  const trackThemeChange = useCallback((oldTheme: string, newTheme: string) => {
    analytics.trackThemeChange(oldTheme, newTheme);
  }, []);

  const trackSettingsUpdate = useCallback((settingType: string) => {
    analytics.trackSettingsUpdate(settingType);
  }, []);

  // Search tracking
  const trackSearch = useCallback((searchTerm: string, resultCount?: number) => {
    analytics.trackSearch(searchTerm, resultCount);
  }, []);

  // Utilities
  const setUserId = useCallback((userId: string) => {
    analytics.setUserId(userId);
  }, []);

  const setUserProperties = useCallback((properties: Record<string, any>) => {
    analytics.setUserProperties(properties);
  }, []);

  const setAnalyticsEnabled = useCallback((enabled: boolean) => {
    analytics.setAnalyticsEnabled(enabled);
  }, []);

  return {
    // Page tracking
    trackPageView,
    
    // Authentication
    trackSignUp,
    trackLogin,
    trackLogout,
    
    // Settings
    trackLanguageChange,
    trackThemeChange,
    trackSettingsUpdate,
    
    // Search
    trackSearch,
    
    // Utilities
    setUserId,
    setUserProperties,
    setAnalyticsEnabled,
  };
};

export default useAnalytics; 