import type {
  AnalyticsEvent,
  GAEventParams,
  AuthEventParams,
  MindmapEventParams,
  NavigationEventParams,
  SettingsEventParams,
  AnalyticsConfig,
} from '../types/analytics';

// Analytics Configuration
const config: AnalyticsConfig = {
  measurementId: import.meta.env.VITE_GA4_MEASUREMENT_ID || 'G-DFZYPLG7N4',
  enabled: import.meta.env.VITE_ENABLE_ANALYTICS === 'true' && import.meta.env.PROD,
  debug: import.meta.env.DEV,
  anonymizeIp: true,
  cookieExpires: 63072000, // 2 years
};

// Check if gtag is available
const isGtagAvailable = (): boolean => {
  return typeof window !== 'undefined' && 
         typeof window.gtag === 'function' && 
         config.enabled;
};

// Load GA4 script dynamically
const loadGAScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !config.enabled || !config.measurementId) {
      resolve();
      return;
    }

    // Check if script is already loaded
    if (typeof window.gtag === 'function') {
      resolve();
      return;
    }

    // Initialize dataLayer
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag() {
      window.dataLayer.push(arguments);
    };
    window.gtag('js', new Date());

    // Load GA4 script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${config.measurementId}`;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load GA4 script'));
    
    document.head.appendChild(script);
  });
};

// Initialize Google Analytics
export const initializeAnalytics = async (): Promise<void> => {
  if (!config.enabled || !config.measurementId) {
    if (config.debug) {
      console.log('Analytics: GA4 disabled or no measurement ID provided');
    }
    return;
  }

  try {
    // Load GA4 script first
    await loadGAScript();

    // Configure GA4
    window.gtag('config', config.measurementId, {
      anonymize_ip: config.anonymizeIp,
      cookie_expires: config.cookieExpires,
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
      debug_mode: config.debug,
    });

    if (config.debug) {
      console.log('Analytics: GA4 initialized with config:', config);
    }
  } catch (error) {
    console.error('Analytics: Failed to initialize GA4:', error);
  }
};

// Generic event tracking
export const trackEvent = (
  eventName: AnalyticsEvent,
  parameters?: GAEventParams
): void => {
  if (!isGtagAvailable()) {
    if (config.debug) {
      console.log('Analytics Event (disabled):', eventName, parameters);
    }
    return;
  }

  try {
    window.gtag('event', eventName, parameters);
    
    if (config.debug) {
      console.log('Analytics Event:', eventName, parameters);
    }
  } catch (error) {
    console.error('Analytics: Error tracking event:', error);
  }
};

// Page view tracking
export const trackPageView = (params?: NavigationEventParams): void => {
  if (!isGtagAvailable()) return;

  const pageParams = {
    page_title: document.title,
    page_location: window.location.href,
    page_referrer: document.referrer,
    ...params,
  };

  window.gtag('event', 'page_view', pageParams);
  
  if (config.debug) {
    console.log('Analytics Page View:', pageParams);
  }
};

// Authentication Events
export const trackSignUp = (method: string = 'email'): void => {
  trackEvent('sign_up', {
    method,
    event_category: 'authentication',
  } as AuthEventParams);
};

export const trackLogin = (method: string = 'email'): void => {
  trackEvent('login', {
    method,
    event_category: 'authentication',
  } as AuthEventParams);
};

export const trackLogout = (): void => {
  trackEvent('logout', {
    event_category: 'authentication',
  });
};

// Mindmap Events
export const trackMindmapCreateStart = (videoId: string, videoTitle?: string): void => {
  trackEvent('mindmap_create_start', {
    video_id: videoId,
    video_title: videoTitle,
    event_category: 'mindmap',
  } as MindmapEventParams);
};

export const trackMindmapCreateSuccess = (
  videoId: string,
  mindmapId: string,
  processingTime?: number
): void => {
  trackEvent('mindmap_create_success', {
    video_id: videoId,
    mindmap_id: mindmapId,
    processing_time: processingTime,
    event_category: 'mindmap',
  } as MindmapEventParams);
};

export const trackMindmapCreateError = (
  videoId: string,
  errorType: string
): void => {
  trackEvent('mindmap_create_error', {
    video_id: videoId,
    error_type: errorType,
    event_category: 'mindmap',
  } as MindmapEventParams);
};

export const trackMindmapView = (mindmapId: string, videoId?: string): void => {
  trackEvent('mindmap_view', {
    mindmap_id: mindmapId,
    video_id: videoId,
    event_category: 'mindmap',
  } as MindmapEventParams);
};

export const trackMindmapShare = (mindmapId: string): void => {
  trackEvent('mindmap_share', {
    mindmap_id: mindmapId,
    event_category: 'mindmap',
  } as MindmapEventParams);
};

export const trackMindmapDelete = (mindmapId: string): void => {
  trackEvent('mindmap_delete', {
    mindmap_id: mindmapId,
    event_category: 'mindmap',
  } as MindmapEventParams);
};

// Video Events
export const trackVideoAnalysisRequest = (videoId: string, videoTitle?: string): void => {
  trackEvent('video_analysis_request', {
    video_id: videoId,
    video_title: videoTitle,
    event_category: 'video',
  });
};

export const trackVideoTranscriptError = (videoId: string, errorType: string): void => {
  trackEvent('video_transcript_error', {
    video_id: videoId,
    error_type: errorType,
    event_category: 'video',
  });
};

// Settings Events
export const trackLanguageChange = (oldLang: string, newLang: string): void => {
  trackEvent('language_change', {
    setting_type: 'language',
    old_value: oldLang,
    new_value: newLang,
    event_category: 'settings',
  } as SettingsEventParams);
};

export const trackThemeChange = (oldTheme: string, newTheme: string): void => {
  trackEvent('theme_change', {
    setting_type: 'theme',
    old_value: oldTheme,
    new_value: newTheme,
    event_category: 'settings',
  } as SettingsEventParams);
};

export const trackSettingsUpdate = (settingType: string): void => {
  trackEvent('settings_update', {
    setting_type: settingType,
    event_category: 'settings',
  } as SettingsEventParams);
};

// Search Events
export const trackSearch = (searchTerm: string, resultCount?: number): void => {
  trackEvent('search', {
    search_term: searchTerm,
    event_category: 'search',
    value: resultCount,
  });
};

// Extension Events
export const trackExtensionInstall = (): void => {
  trackEvent('extension_install', {
    event_category: 'extension',
  });
};

export const trackExtensionActivate = (): void => {
  trackEvent('extension_activate', {
    event_category: 'extension',
  });
};

export const trackExtensionMindmapGenerate = (videoId: string): void => {
  trackEvent('extension_mindmap_generate', {
    video_id: videoId,
    event_category: 'extension',
  });
};

// Utility function to set user properties
export const setUserProperties = (properties: Record<string, any>): void => {
  if (!isGtagAvailable()) return;

  window.gtag('config', config.measurementId, {
    custom_map: properties,
  });
};

// Set user ID for cross-session tracking
export const setUserId = (userId: string): void => {
  if (!isGtagAvailable()) return;

  window.gtag('config', config.measurementId, {
    user_id: userId,
  });
};

// Enable/disable analytics
export const setAnalyticsEnabled = (enabled: boolean): void => {
  config.enabled = enabled;
  
  if (!enabled && isGtagAvailable()) {
    // Disable analytics
    window.gtag('config', config.measurementId, {
      send_page_view: false,
    });
  }
};

export default {
  initialize: initializeAnalytics,
  trackEvent,
  trackPageView,
  // Auth
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
  setUserProperties,
  setUserId,
  setAnalyticsEnabled,
}; 