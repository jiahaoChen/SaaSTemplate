import type {
  AnalyticsEvent,
  GAEventParams,
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

// Initialize Google Analytics
export const initializeAnalytics = (): void => {
  if (!config.enabled || !config.measurementId) {
    if (config.debug) {
      console.log('Analytics disabled or measurement ID missing');
    }
    return;
  }

  // Load Google Analytics script dynamically
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${config.measurementId}`;
  document.head.appendChild(script);

  // Initialize gtag
  window.dataLayer = window.dataLayer || [];
  // eslint-disable-next-line prefer-rest-params
  window.gtag = function gtag() { window.dataLayer.push(arguments); };

  window.gtag('js', new Date());
  window.gtag('config', config.measurementId, {
    anonymize_ip: config.anonymizeIp,
    cookie_expires: config.cookieExpires,
    debug_mode: config.debug,
  });

  if (config.debug) {
    console.log('Analytics initialized with measurement ID:', config.measurementId);
  }
};

// Generic event tracking
export const trackEvent = (
  eventName: AnalyticsEvent,
  parameters?: GAEventParams
): void => {
  if (!isGtagAvailable()) {
    if (config.debug) {
      console.log('Analytics not available, would track:', eventName, parameters);
    }
    return;
  }

  try {
    window.gtag('event', eventName, {
      send_to: config.measurementId,
      ...parameters,
    });

    if (config.debug) {
      console.log('Tracked event:', eventName, parameters);
    }
  } catch (error) {
    console.error('Error tracking event:', eventName, error);
  }
};

// Page view tracking
export const trackPageView = (page_title?: string, page_location?: string): void => {
  if (!isGtagAvailable()) {
    if (config.debug) {
      console.log('Analytics not available, would track page view:', page_title, page_location);
    }
    return;
  }

  try {
    window.gtag('config', config.measurementId, {
      page_title,
      page_location: page_location || window.location.href,
    });

    if (config.debug) {
      console.log('Tracked page view:', page_title, page_location);
    }
  } catch (error) {
    console.error('Error tracking page view:', error);
  }
};

// Authentication Events
export const trackSignUp = (method?: string): void => {
  trackEvent('sign_up', {
    method: method || 'email',
    event_category: 'engagement',
  });
};

export const trackLogin = (method?: string): void => {
  trackEvent('login', {
    method: method || 'email',
    event_category: 'engagement',
  });
};

export const trackLogout = (): void => {
  trackEvent('logout', {
    event_category: 'engagement',
  });
};

// Settings Events
export const trackLanguageChange = (oldLang: string, newLang: string): void => {
  trackEvent('language_change', {
    old_language: oldLang,
    new_language: newLang,
    event_category: 'settings',
  });
};

export const trackThemeChange = (oldTheme: string, newTheme: string): void => {
  trackEvent('theme_change', {
    old_theme: oldTheme,
    new_theme: newTheme,
    event_category: 'settings',
  });
};

export const trackSettingsUpdate = (settingType: string): void => {
  trackEvent('settings_update', {
    setting_type: settingType,
    event_category: 'settings',
  });
};

// Search Events
export const trackSearch = (searchTerm: string, resultCount?: number): void => {
  trackEvent('search', {
    search_term: searchTerm,
    result_count: resultCount,
    event_category: 'engagement',
  });
};

// Utility functions
export const setUserId = (userId: string): void => {
  if (!isGtagAvailable()) {
    if (config.debug) {
      console.log('Analytics not available, would set user ID:', userId);
    }
    return;
  }

  try {
    window.gtag('config', config.measurementId, {
      user_id: userId,
    });

    if (config.debug) {
      console.log('Set user ID:', userId);
    }
  } catch (error) {
    console.error('Error setting user ID:', error);
  }
};

export const setUserProperties = (properties: Record<string, any>): void => {
  if (!isGtagAvailable()) {
    if (config.debug) {
      console.log('Analytics not available, would set user properties:', properties);
    }
    return;
  }

  try {
    window.gtag('config', config.measurementId, {
      custom_map: properties,
    });

    if (config.debug) {
      console.log('Set user properties:', properties);
    }
  } catch (error) {
    console.error('Error setting user properties:', error);
  }
};

export const setAnalyticsEnabled = (enabled: boolean): void => {
  // This would typically involve updating consent or configuration
  if (config.debug) {
    console.log('Analytics enabled status changed:', enabled);
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
  // Settings
  trackLanguageChange,
  trackThemeChange,
  trackSettingsUpdate,
  // Search
  trackSearch,
  // Utilities
  setUserProperties,
  setUserId,
  setAnalyticsEnabled,
}; 