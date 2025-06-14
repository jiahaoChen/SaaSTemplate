import React, { useEffect, useState } from 'react';
import { Button, Flex, Text } from '@chakra-ui/react';
import { LuGlobe } from 'react-icons/lu';
import { useColorModeValue } from './color-mode';
import { 
  MenuRoot, 
  MenuTrigger, 
  MenuContent,
  MenuItem
} from './menu';
import useLanguage from '@/hooks/useLanguage';
import useAnalytics from '@/hooks/useAnalytics';

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

  // Color settings for dark mode
  const menuBg = useColorModeValue('white', 'gray.800');
  const menuBorderColor = useColorModeValue('gray.200', 'gray.700');
  const menuItemHoverBg = useColorModeValue('gray.100', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'white');

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

  return (
    <MenuRoot>
      <MenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="md"
          aria-label={t('common.language')}
        >
          <Flex alignItems="center" gap={2}>
            <LuGlobe />
            <Text>{getLanguageName(languageState as 'en' | 'zh' | 'zh-CN')}</Text>
          </Flex>
        </Button>
      </MenuTrigger>
      <MenuContent 
        bg={menuBg} 
        borderColor={menuBorderColor}
        boxShadow="md"
      >
        {Object.entries(languages).map(([code, name]) => (
          <MenuItem
            key={code}
            value={code}
            onClick={() => handleLanguageClick(code)}
            css={{
              bg: languageState === code ? menuItemHoverBg : 'transparent',
              color: textColor,
              fontWeight: languageState === code ? 'medium' : 'normal',
              '&:hover': { bg: menuItemHoverBg }
            }}
          >
            {name}
          </MenuItem>
        ))}
      </MenuContent>
    </MenuRoot>
  );
}; 