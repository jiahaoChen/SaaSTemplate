import { useCallback, useEffect } from 'react';
import analytics from '../utils/analytics';
import type { GAEventParams } from '../types/analytics';

export const useAnalytics = () => {
  // Initialize analytics on hook mount
  useEffect(() => {
    analytics.initialize();
  }, []);

  // Track page view manually
  const trackPageView = useCallback((params?: GAEventParams) => {
    analytics.trackPageView(params);
  }, []);

  // Authentication tracking
  const trackSignUp = useCallback((method: string = 'email') => {
    analytics.trackSignUp(method);
  }, []);

  const trackLogin = useCallback((method: string = 'email') => {
    analytics.trackLogin(method);
  }, []);

  const trackLogout = useCallback(() => {
    analytics.trackLogout();
  }, []);

  // Mindmap tracking
  const trackMindmapCreateStart = useCallback((videoId: string, videoTitle?: string) => {
    analytics.trackMindmapCreateStart(videoId, videoTitle);
  }, []);

  const trackMindmapCreateSuccess = useCallback((
    videoId: string,
    mindmapId: string,
    processingTime?: number
  ) => {
    analytics.trackMindmapCreateSuccess(videoId, mindmapId, processingTime);
  }, []);

  const trackMindmapCreateError = useCallback((videoId: string, errorType: string) => {
    analytics.trackMindmapCreateError(videoId, errorType);
  }, []);

  const trackMindmapView = useCallback((mindmapId: string, videoId?: string) => {
    analytics.trackMindmapView(mindmapId, videoId);
  }, []);

  const trackMindmapShare = useCallback((mindmapId: string) => {
    analytics.trackMindmapShare(mindmapId);
  }, []);

  const trackMindmapDelete = useCallback((mindmapId: string) => {
    analytics.trackMindmapDelete(mindmapId);
  }, []);

  // Video tracking
  const trackVideoAnalysisRequest = useCallback((videoId: string, videoTitle?: string) => {
    analytics.trackVideoAnalysisRequest(videoId, videoTitle);
  }, []);

  const trackVideoTranscriptError = useCallback((videoId: string, errorType: string) => {
    analytics.trackVideoTranscriptError(videoId, errorType);
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

  // Extension tracking
  const trackExtensionInstall = useCallback(() => {
    analytics.trackExtensionInstall();
  }, []);

  const trackExtensionActivate = useCallback(() => {
    analytics.trackExtensionActivate();
  }, []);

  const trackExtensionMindmapGenerate = useCallback((videoId: string) => {
    analytics.trackExtensionMindmapGenerate(videoId);
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
    
    // Mindmap
    trackMindmapCreateStart,
    trackMindmapCreateSuccess,
    trackMindmapCreateError,
    trackMindmapView,
    trackMindmapShare,
    trackMindmapDelete,
    
    // Video
    trackVideoAnalysisRequest,
    trackVideoTranscriptError,
    
    // Settings
    trackLanguageChange,
    trackThemeChange,
    trackSettingsUpdate,
    
    // Search
    trackSearch,
    
    // Extension
    trackExtensionInstall,
    trackExtensionActivate,
    trackExtensionMindmapGenerate,
    
    // Utilities
    setUserId,
    setUserProperties,
    setAnalyticsEnabled,
  };
};

export default useAnalytics; 