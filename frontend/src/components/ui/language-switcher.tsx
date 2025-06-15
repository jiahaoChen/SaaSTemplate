import React, { useEffect, useState } from 'react';
import { Button, Dropdown, Space, Typography } from 'antd';
import type { MenuProps } from 'antd';
import { LuGlobe } from 'react-icons/lu';
import useLanguage from '@/hooks/useLanguage';
import useAnalytics from '@/hooks/useAnalytics';

const { Text } = Typography;

export const LanguageSwitcher: React.FC = () => {
  const { t, currentLanguage, changeLanguage, getLanguageName } = useLanguage();
  const { trackLanguageChange } = useAnalytics();
  // Add local state to ensure re-render when language changes
  const [languageState, setLanguageState] = useState(currentLanguage);

  // Force rerender when language changes
  useEffect(() => {
    setLanguageState(currentLanguage);
    
    const handleLanguageChange = () => {
      setLanguageState(currentLanguage);
    };
    
    window.addEventListener('languageChanged', handleLanguageChange);
    
    return () => {
      window.removeEventListener('languageChanged', handleLanguageChange);
    };
  }, [currentLanguage]);

  // Map of language codes to their names in their own language
  const languages = {
    'en': 'English',
    'zh-CN': '简体中文',
    'zh-TW': '繁體中文',
  };
  
  const handleLanguageClick = (code: string) => {
    if (code === 'en' || code === 'zh' || code === 'zh-CN') {
      const oldLanguage = languageState;
      const newLanguage = code as 'en' | 'zh' | 'zh-CN';
      
      // Track language change
      trackLanguageChange(oldLanguage, newLanguage);
      
      changeLanguage(newLanguage);
      // Immediately update local state for faster UI response
      setLanguageState(newLanguage);
    }
  };

  // Create menu items for Ant Design Dropdown
  const items: MenuProps['items'] = Object.entries(languages).map(([code, name]) => ({
    key: code,
    label: name,
    onClick: () => handleLanguageClick(code),
    style: {
      fontWeight: languageState === code ? 500 : 400,
      backgroundColor: languageState === code ? 'rgba(22, 119, 255, 0.1)' : 'transparent',
    }
  }));

  return (
    <Dropdown 
      menu={{ items }} 
      placement="bottomRight"
      trigger={['click']}
      arrow
    >
      <Button 
        type="text" 
        size="middle"
        aria-label={t('common.language')}
      >
        <Space align="center">
          <LuGlobe />
          <Text>{getLanguageName(languageState as 'en' | 'zh' | 'zh-CN')}</Text>
        </Space>
      </Button>
    </Dropdown>
  );
}; 