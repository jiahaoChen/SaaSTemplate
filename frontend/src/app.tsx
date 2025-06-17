import { AvatarDropdown, AvatarName, Footer, Question, SelectLang } from '@/components';
import { LinkOutlined, GlobalOutlined, SunOutlined, MoonOutlined, SettingOutlined } from '@ant-design/icons';
import type { Settings as LayoutSettings } from '@ant-design/pro-components';
import { SettingDrawer } from '@ant-design/pro-components';
import type { RequestConfig, RunTimeLayoutConfig } from '@umijs/max';
import { history, Link, setLocale, getLocale } from '@umijs/max';
import defaultSettings from '../config/defaultSettings';
import { errorConfig } from './requestErrorConfig';
import { usersReadUserMe as queryCurrentUser } from './services/ant-design-pro/users';
import { ConfigProvider, theme, FloatButton, Dropdown, Space } from 'antd';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import React from 'react';

const isDev = process.env.NODE_ENV === 'development';
const loginPath = '/user/login';
const landingPath = '/landing';

// Language options
const languageOptions = [
  { key: 'en-US', label: 'English', flag: '🇺🇸' },
  { key: 'zh-CN', label: '简体中文', flag: '🇨🇳' },
  { key: 'zh-TW', label: '繁體中文', flag: '🇹🇼' },
  { key: 'ja-JP', label: '日本語', flag: '🇯🇵' },
  { key: 'pt-BR', label: 'Português', flag: '🇧🇷' },
  { key: 'id-ID', label: 'Bahasa Indonesia', flag: '🇮🇩' },
  { key: 'fa-IR', label: 'فارسی', flag: '🇮🇷' },
  { key: 'bn-BD', label: 'বাংলা', flag: '🇧🇩' },
];

// A new component to wrap the main application content and apply the global theme
const AppWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isDarkMode } = useTheme();
  return (
    <ConfigProvider
      theme={{
        algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
      }}
    >
      {children}
    </ConfigProvider>
  );
};

// Global FloatButton component
const GlobalFloatButton: React.FC = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  const handleLanguageChange = ({ key }: { key: string }) => {
    setLocale(key, false); // false to not reload page
    localStorage.setItem('app-language', key);
  };

  const languageMenuItems = languageOptions.map(option => ({
    key: option.key,
    label: (
      <Space>
        <span>{option.flag}</span>
        <span>{option.label}</span>
      </Space>
    ),
  }));

  return (
    <FloatButton.Group
      trigger="hover"
      type="primary"
      style={{ right: 24 }}
      icon={<SettingOutlined />}
    >
      <FloatButton
        icon={isDarkMode ? <SunOutlined /> : <MoonOutlined />}
        tooltip="Toggle Theme"
        onClick={toggleTheme}
      />
      <Dropdown
        menu={{
          items: languageMenuItems,
          onClick: handleLanguageChange,
          selectedKeys: [getLocale()],
        }}
        placement="bottomLeft"
      >
        <FloatButton
          icon={<GlobalOutlined />}
          tooltip="Change Language"
        />
      </Dropdown>
    </FloatButton.Group>
  );
};

/**
 * @see  https://umijs.org/zh-CN/plugins/plugin-initial-state
 * */
export async function getInitialState(): Promise<{
  settings?: Partial<LayoutSettings>;
  currentUser?: API.UserPublic;
  loading?: boolean;
  fetchUserInfo?: () => Promise<API.UserPublic | undefined>;
}> {
  const fetchUserInfo = async () => {
    try {
      const msg = await queryCurrentUser({
        skipErrorHandler: true,
      });
      if (msg) {
        msg.avatar = msg.avatar || 'https://gw.alipayobjects.com/zos/antfincdn/XAosXuNZyF/BiazfanxmamNRoxxVxka.png';
      }
      return msg;
    } catch (error) {
      // Do not redirect here, let onPageChange handle unauthenticated users for landing page
      // history.push(loginPath);
    }
    return undefined;
  };
  // 如果不是登录页面或landing页面，执行
  const { location } = history;
  if (![loginPath, '/user/register', '/user/register-result', landingPath].includes(location.pathname)) {
    const currentUser = await fetchUserInfo();
    return {
      fetchUserInfo,
      currentUser,
      settings: defaultSettings as Partial<LayoutSettings>,
    };
  }
  return {
    fetchUserInfo,
    settings: defaultSettings as Partial<LayoutSettings>,
  };
}

// A component to render actions in the layout header, consuming the global theme
const HeaderActions: React.FC = () => {
  const { isDarkMode } = useTheme();
  return (
    <>
      <Question key="doc" />
      <SelectLang key="SelectLang" isDark={isDarkMode} />
    </>
  );
};

// ProLayout 支持的api https://procomponents.ant.design/components/layout
export const layout: RunTimeLayoutConfig = ({ initialState, setInitialState }) => {
  return {
    actionsRender: () => [<HeaderActions key="headerActions" />],
    avatarProps: {
      src: initialState?.currentUser?.avatar,
      title: <AvatarName />,
      render: (_, avatarChildren) => {
        return <AvatarDropdown>{avatarChildren}</AvatarDropdown>;
      },
    },
    waterMarkProps: {
      content: initialState?.currentUser?.full_name || undefined,
    },
    footerRender: () => <Footer />,
    onPageChange: () => {
      const { location } = history;
      // 如果没有登录，重定向到 landing page
      if (!initialState?.currentUser &&
          ![loginPath, '/user/register', '/user/register-result', landingPath].includes(location.pathname)) {
        history.push(landingPath);
      }
    },
    bgLayoutImgList: [
      {
        src: 'https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/D2LWSqNny4sAAAAAAAAAAAAAFl94AQBr',
        left: 85,
        bottom: 100,
        height: '303px',
      },
      {
        src: 'https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/C2TWRpJpiC0AAAAAAAAAAAAAFl94AQBr',
        bottom: -68,
        right: -45,
        height: '303px',
      },
      {
        src: 'https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/F6vSTbj8KpYAAAAAAAAAAAAAFl94AQBr',
        bottom: 0,
        left: 0,
        width: '331px',
      },
    ],
    links: isDev
      ? [
          <Link key="openapi" to="/umi/plugin/openapi" target="_blank">
            <LinkOutlined />
            <span>OpenAPI 文档</span>
          </Link>,
        ]
      : [],
    menuHeaderRender: undefined,
    // 自定义 403 页面
    // unAccessible: <div>unAccessible</div>,
    // 增加一个 loading 的状态
    childrenRender: (children) => {
      // if (initialState?.loading) return <PageLoading />;
      return (
        <>
          {children}
          <GlobalFloatButton />
          {isDev && (
            <SettingDrawer
              disableUrlParams
              enableDarkTheme
              settings={initialState?.settings}
              onSettingChange={(settings) => {
                setInitialState((preInitialState) => ({
                  ...preInitialState,
                  settings,
                }));
              }}
            />
          )}
        </>
      );
    },
    ...initialState?.settings,
  };
};

export function rootContainer(container: JSX.Element) {
  return (
    <ThemeProvider>
      <AppWrapper>{container}</AppWrapper>
    </ThemeProvider>
  );
}

/**
 * @name request 配置，可以配置错误处理
 * 它基于 axios 和 ahooks 的 useRequest 提供了一套统一的网络请求和错误处理方案。
 * @doc https://umijs.org/docs/max/request#配置
 */
export const request: RequestConfig = {
  ...errorConfig,
  baseURL: 'http://localhost:8000',
};
