import { Footer } from '@/components';
import { loginLoginAccessToken as login } from '@/services/ant-design-pro/login';
import {
  LockOutlined,
  FacebookOutlined,
  UserOutlined,
  BulbOutlined,
  BulbFilled,
} from '@ant-design/icons';
import GoogleColorIcon from '@/components/icons/GoogleColorIcon';
import {
  LoginForm,
  ProFormCheckbox,
  ProFormText,
} from '@ant-design/pro-components';
import { FormattedMessage, Helmet, useIntl, useModel, Link } from '@umijs/max';
import { SelectLang as CustomSelectLang } from '@/components';
import { Alert, message, ConfigProvider, theme, Button } from 'antd';
import { createStyles } from 'antd-style';
import React, { useState, useEffect } from 'react';
import { flushSync } from 'react-dom';
import Settings from '../../../../config/defaultSettings';

interface LoginStateType extends Partial<API.Token> {
  status?: string;
}

const useStyles = createStyles(({ token }, isDark: boolean) => {
  return {
    action: {
      marginLeft: '8px',
      fontSize: '24px',
      verticalAlign: 'middle',
      cursor: 'pointer',
      transition: 'color 0.3s',
      '&:hover': {
        color: token.colorPrimaryActive,
      },
    },
    lang: {
      width: 42,
      height: 42,
      lineHeight: '42px',
      borderRadius: token.borderRadius,
      ':hover': {
        backgroundColor: token.colorBgTextHover,
      },
      color: isDark ? 'white' : undefined,
      '.anticon': {
        color: isDark ? 'white' : undefined,
      },
      '.ant-dropdown-trigger': {
        color: isDark ? 'white' : undefined,
      },
    },
    darkModeToggle: {
      zIndex: 1000,
      borderRadius: '50%',
      width: 42,
      height: 42,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: 8,
    },
    container: {
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      overflow: 'auto',
      backgroundImage: isDark
        ? "linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('https://gw.alipayobjects.com/zos/rmsportal/TVYTbAXWheQpRcWDaDMu.svg')"
        : "url('https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/V-_oS6r-i7wAAAAAAAAAAAAAFl94AQBr')",
      backgroundSize: '100% 100%',
      backgroundColor: isDark ? '#141414' : '#f0f2f5',
    },
    loginFormContainer: {
      backgroundColor: isDark ? 'rgba(20, 20, 20, 0.9)' : 'rgba(255, 255, 255, 0.9)',
      borderRadius: token.borderRadius,
      backdropFilter: 'blur(10px)',
      border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.06)',
    },
    darkText: {
      color: isDark ? 'white' : undefined,
    },
    topRightIcons: {
      display: 'flex',
      alignItems: 'center',
      position: 'fixed',
      top: 16,
      right: 16,
      zIndex: 1000,
    },
  };
});

const ActionIcons = ({ isDark }: { isDark: boolean }) => {
  const { styles } = useStyles(isDark);

  return (
    <>
      <GoogleColorIcon key="GoogleColorIcon" className={styles.action} />
      <FacebookOutlined key="FacebookOutlined" className={styles.action} style={{ color: '#4267B2' }} />
    </>
  );
};

const Lang = ({ isDark }: { isDark: boolean }) => {
  const { styles } = useStyles(isDark);

  return (
    <div className={styles.lang} data-lang>
      {CustomSelectLang && <CustomSelectLang isDark={isDark} />}
    </div>
  );
};

const LoginMessage: React.FC<{
  content: string;
}> = ({ content }) => {
  return (
    <Alert
      style={{
        marginBottom: 24,
      }}
      message={content}
      type="error"
      showIcon
    />
  );
};

const Login: React.FC = () => {
  const [userLoginState, setUserLoginState] = useState<LoginStateType>({});
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const { initialState, setInitialState } = useModel('@@initialState');
  const { styles } = useStyles(isDarkMode);
  const intl = useIntl();

  // Initialize dark mode from localStorage or global settings
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('login-dark-mode');
    if (savedDarkMode !== null) {
      setIsDarkMode(savedDarkMode === 'true');
    } else {
      // Fallback to global settings
      setIsDarkMode(initialState?.settings?.navTheme === 'realDark');
    }
  }, [initialState?.settings?.navTheme]);

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    localStorage.setItem('login-dark-mode', newDarkMode.toString());
  };

  const fetchUserInfo = async () => {
    const userInfo = await initialState?.fetchUserInfo?.();
    if (userInfo) {
      flushSync(() => {
        setInitialState((s) => ({
          ...s,
          currentUser: userInfo,
        }));
      });
    }
  };

  const handleSubmit = async (values: API.BodyLoginLoginAccessToken) => {
    try {
      // 登录
      const tokenResponse = await login({
        username: values.username,
        password: values.password
      });

      if (tokenResponse.access_token) {
        // Store the token in localStorage (using 'token' key to match request interceptor)
        localStorage.setItem('token', tokenResponse.access_token);

        const defaultLoginSuccessMessage = intl.formatMessage({
          id: 'pages.login.success',
          defaultMessage: '登录成功！',
        });
        message.success(defaultLoginSuccessMessage);
        await fetchUserInfo();
        const urlParams = new URL(window.location.href).searchParams;
        window.location.href = urlParams.get('redirect') || '/';
        return;
      }

      // If we get here, login failed
      setUserLoginState({ status: 'error' });
    } catch (error) {
      const defaultLoginFailureMessage = intl.formatMessage({
        id: 'pages.login.failure',
        defaultMessage: '登录失败，请重试！',
      });
      console.log(error);
      message.error(defaultLoginFailureMessage);
      setUserLoginState({ status: 'error' });
    }
  };
  const { status } = userLoginState;

  return (
    <ConfigProvider
      theme={{
        algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          colorBgBase: isDarkMode ? '#141414' : '#ffffff',
          colorTextBase: isDarkMode ? '#ffffff' : '#000000',
          colorText: isDarkMode ? 'rgba(255, 255, 255, 0.85)' : 'rgba(0, 0, 0, 0.88)',
          colorBorder: isDarkMode ? 'rgba(255, 255, 255, 0.12)' : '#d9d9d9',
        },
      }}
    >
      <div className={styles.container}>
        <Helmet>
          <title>{` ${Settings.title || ''}`}</title>
        </Helmet>

        <div className={styles.topRightIcons}>
          {/* Dark Mode Toggle */}
          <Button
            className={styles.darkModeToggle}
            type="text"
            icon={isDarkMode ? <BulbFilled /> : <BulbOutlined />}
            onClick={toggleDarkMode}
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            style={{ color: isDarkMode ? 'white' : undefined }}
          />

          <Lang isDark={isDarkMode} />
        </div>

        <div
          style={{
            flex: '1',
            padding: '32px 0',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <div className={styles.loginFormContainer} style={{ padding: '40px' }}>
            <LoginForm
              contentStyle={{
                minWidth: 280,
                maxWidth: '75vw',
                backgroundColor: 'transparent',
              }}
              logo={<img alt="logo" src="/logo.svg" />}
              title={<span style={{ color: isDarkMode ? 'white' : undefined }}>Ant Design</span>}
              subTitle={intl.formatMessage({ id: 'pages.layouts.userLayout.title' })}
              initialValues={{
                autoLogin: true,
              }}
              actions={[
                <span key="loginWith" className={styles.darkText}>
                  <FormattedMessage
                    id="pages.login.loginWith"
                    defaultMessage="其他登录方式"
                  />
                </span>,
                <ActionIcons key="icons" isDark={isDarkMode} />,
              ]}
              onFinish={async (values) => {
                await handleSubmit(values as API.BodyLoginLoginAccessToken);
              }}
            >
              {status === 'error' && (
                <LoginMessage
                  content={intl.formatMessage({
                    id: 'pages.login.accountLogin.errorMessage',
                    defaultMessage: '账户或密码错误(admin/ant.design)',
                  })}
                />
              )}
              <ProFormText
                name="username"
                fieldProps={{
                  size: 'large',
                  prefix: <UserOutlined />,
                  style: { color: isDarkMode ? 'white' : undefined },
                }}
                placeholder={intl.formatMessage({
                  id: 'pages.login.username.placeholder',
                  defaultMessage: '用户名: admin or user',
                })}
                rules={[
                  {
                    required: true,
                    message: (
                      <FormattedMessage
                        id="pages.login.username.required"
                        defaultMessage="请输入用户名!"
                      />
                    ),
                  },
                ]}
              />
              <ProFormText.Password
                name="password"
                fieldProps={{
                  size: 'large',
                  prefix: <LockOutlined />,
                  style: { color: isDarkMode ? 'white' : undefined },
                }}
                placeholder={intl.formatMessage({
                  id: 'pages.login.password.placeholder',
                  defaultMessage: '',
                })}
                rules={[
                  {
                    required: true,
                    message: (
                      <FormattedMessage
                        id="pages.login.password.required"
                        defaultMessage="请输入密码！"
                      />
                    ),
                  },
                ]}
              />
              <div
                style={{
                  marginBottom: 24,
                }}
              >
                <ProFormCheckbox noStyle name="autoLogin">
                  <FormattedMessage id="pages.login.rememberMe" defaultMessage="自动登录" />
                </ProFormCheckbox>
                <a
                  style={{
                    float: 'right',
                  }}
                >
                  <FormattedMessage
                    id="pages.login.forgotPassword"
                    defaultMessage="忘记密码"
                  />
                </a>
              </div>
              <div
                style={{
                  marginBottom: 24,
                  textAlign: 'center',
                }}
              >
                <Link to="/user/register" className={styles.darkText}>
                  <FormattedMessage
                    id="pages.login.registerAccount"
                    defaultMessage="Register Account"
                  />
                </Link>
              </div>
            </LoginForm>
          </div>
        </div>
        <Footer />
      </div>
    </ConfigProvider>
  );
};

export default Login;
