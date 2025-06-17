import React from 'react';
import Icon from '@ant-design/icons';

const GoogleSvg = () => (
  <svg width="1em" height="1em" viewBox="0 0 48 48">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.6-6.38C38.1 4.59 33.3 3 24 3 14.7 3 6.66 7.85 3 15.61l7.98 6.19C14.65 13.92 19.01 9.5 24 9.5z"/>
    <path fill="#34A853" d="M46.22 24c0-1.53-.13-3.08-.36-4.59H24v8.34h12.55c-.56 4.08-2.78 7.4-6.35 9.77l6.61 6.4c3.87-3.62 6.13-9.04 6.13-15.01z"/>
    <path fill="#FBBC05" d="M10.95 27.27c-.23-1.63-.36-3.35-.36-5.07s.13-3.44.36-5.07L3 10.15C1.13 13.91 0 18.73 0 24s1.13 10.09 3 13.85l7.95-6.58z"/>
    <path fill="#4285F4" d="M24 44.5c6.48 0 11.95-2.13 15.93-5.85l-6.61-6.4c-2.76 1.95-6.27 3.2-9.32 3.2-7.05 0-13.08-4.83-15.34-11.37L3 37.85C6.66 45.15 14.7 44.5 24 44.5z"/>
  </svg>
);

const GoogleColorIcon = (props: any) => <Icon component={GoogleSvg} {...props} />;

export default GoogleColorIcon;
