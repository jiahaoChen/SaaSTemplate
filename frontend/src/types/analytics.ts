// Global gtag interface
interface GTagParams {
  [key: string]: any;
}

interface GTag {
  (command: 'config', targetId: string, config?: GTagParams): void;
  (command: 'event', eventName: string, eventParams?: GTagParams): void;
  (command: 'js', date: Date): void;
}

declare global {
  interface Window {
    gtag: GTag;
    dataLayer: any[];
  }
}

// Analytics Configuration
export interface AnalyticsConfig {
  measurementId: string;
  enabled: boolean;
  debug: boolean;
  anonymizeIp: boolean;
  cookieExpires: number;
}

// Base event parameters
export interface GAEventParams {
  event_category?: string;
  event_label?: string;
  value?: number;
  [key: string]: any;
}

// Specific event parameter types
export interface AuthEventParams extends GAEventParams {
  method?: string;
}

export interface NavigationEventParams extends GAEventParams {
  page_title?: string;
  page_location?: string;
  page_referrer?: string;
}

export interface SettingsEventParams extends GAEventParams {
  setting_type?: string;
  old_value?: string;
  new_value?: string;
}

// Custom Event Types
export type AnalyticsEvent = 
  // Authentication
  | 'sign_up'
  | 'login' 
  | 'logout'
  // Navigation
  | 'page_view'
  | 'search'
  // Settings
  | 'language_change'
  | 'theme_change'
  | 'settings_update';

// Consent Management
export interface ConsentState {
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
  timestamp: number;
} 