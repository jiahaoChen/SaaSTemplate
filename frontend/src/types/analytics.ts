// Google Analytics 4 Types
export interface GAEventParams {
  event_category?: string;
  event_label?: string;
  value?: number;
  custom_parameter?: string;
  [key: string]: string | number | boolean | undefined;
}

// User Authentication Events
export interface AuthEventParams extends GAEventParams {
  method?: 'email' | 'google' | 'extension';
}

// Mindmap Events
export interface MindmapEventParams extends GAEventParams {
  video_id?: string;
  video_title?: string;
  mindmap_id?: string;
  processing_time?: number;
  error_type?: string;
}

// Navigation Events
export interface NavigationEventParams extends GAEventParams {
  page_title?: string;
  page_location?: string;
  page_referrer?: string;
}

// Settings Events
export interface SettingsEventParams extends GAEventParams {
  setting_type?: 'language' | 'theme' | 'profile' | 'password';
  old_value?: string;
  new_value?: string;
}

// Custom Event Types
export type AnalyticsEvent = 
  // Authentication
  | 'sign_up'
  | 'login' 
  | 'logout'
  // Mindmap
  | 'mindmap_create_start'
  | 'mindmap_create_success'
  | 'mindmap_create_error'
  | 'mindmap_view'
  | 'mindmap_share'
  | 'mindmap_delete'
  // Video
  | 'video_analysis_request'
  | 'video_transcript_error'
  // Navigation
  | 'page_view'
  | 'search'
  // Settings
  | 'language_change'
  | 'theme_change'
  | 'settings_update'
  // Extension
  | 'extension_install'
  | 'extension_activate'
  | 'extension_mindmap_generate';

// Analytics Configuration
export interface AnalyticsConfig {
  measurementId: string;
  enabled: boolean;
  debug: boolean;
  anonymizeIp: boolean;
  cookieExpires: number;
}

// Consent Management
export interface ConsentState {
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
  timestamp: number;
}

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
} 