import { Footer } from '@/components';
import { loginLoginAccessToken as login } from '@/services/ant-design-pro/login';
import {
  AlipayCircleOutlined,
  LockOutlined,
  MobileOutlined,
  TaobaoCircleOutlined,
  UserOutlined,
  WeiboCircleOutlined,
} from '@ant-design/icons';
import {
  LoginForm,
  ProFormCaptcha,
  ProFormCheckbox,
  ProFormText,
} from '@ant-design/pro-components';
import { FormattedMessage, Helmet, SelectLang, useIntl, useModel } from '@umijs/max';
import { Alert, message, Tabs } from 'antd';
import { createStyles } from 'antd-style';
import React, { useState } from 'react';
import { flushSync } from 'react-dom';
import Settings from '../../../../config/defaultSettings';

interface LoginStateType extends Partial<API.Token> {
  status?: string;
  type?: string;
}

const useStyles = createStyles(({ token }) => {
  return {
    action: {
      marginLeft: '8px',
      color: 'rgba(0, 0, 0, 0.2)',
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
      position: 'fixed',
      right: 16,
      borderRadius: token.borderRadius,
      ':hover': {
        backgroundColor: token.colorBgTextHover,
      },
    },
    container: {
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      overflow: 'auto',
      backgroundImage:
        "url('https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/V-_oS6r-i7wAAAAAAAAAAAAAFl94AQBr')",
      backgroundSize: '100% 100%',
    },
  };
});

const ActionIcons = () => {
  const { styles } = useStyles();

  return (
    <>
      <AlipayCircleOutlined key="AlipayCircleOutlined" className={styles.action} />
      <TaobaoCircleOutlined key="TaobaoCircleOutlined" className={styles.action} />
      <WeiboCircleOutlined key="WeiboCircleOutlined" className={styles.action} />
    </>
  );
};

const Lang = () => {
  const { styles } = useStyles();

  return (
    <div className={styles.lang} data-lang>
      {SelectLang && <SelectLang />}
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
  const [type, setType] = useState<string>('account');
  const { initialState, setInitialState } = useModel('@@initialState');
  const { styles } = useStyles();
  const intl = useIntl();

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
      setUserLoginState({ status: 'error', type: 'account' });
    } catch (error) {
      const defaultLoginFailureMessage = intl.formatMessage({
        id: 'pages.login.failure',
        defaultMessage: '登录失败，请重试！',
      });
      console.log(error);
      message.error(defaultLoginFailureMessage);
      setUserLoginState({ status: 'error', type: 'account' });
    }
  };
  const { status, type: loginType } = userLoginState;

  return (
    <div className={styles.container}>
      <Helmet>
        <title>{` ${Settings.title || ''}`}</title>
      </Helmet>
      <Lang />
      <div
        style={{
          flex: '1',
          padding: '32px 0',
        }}
      >
        <LoginForm
          contentStyle={{
            minWidth: 280,
            maxWidth: '75vw',
          }}
          logo={<img alt="logo" src="/logo.svg" />}
          title="Ant Design"
          subTitle={intl.formatMessage({ id: 'pages.layouts.userLayout.title' })}
          initialValues={{
            autoLogin: true,
          }}
          actions={[
            <FormattedMessage
              key="loginWith"
              id="pages.login.loginWith"
              defaultMessage="其他登录方式"
            />,
            <ActionIcons key="icons" />,
          ]}
          onFinish={async (values) => {
            await handleSubmit(values as API.BodyLoginLoginAccessToken);
          }}
        >
          <Tabs
            activeKey={type}
            onChange={setType}
            centered
            items={[
              {
                key: 'account',
                label: intl.formatMessage({
                  id: 'pages.login.accountLogin.tab',
                  defaultMessage: '账户密码登录',
                }),
                children: (
                  <>
                    {status === 'error' && loginType === 'account' && (
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
                      }}
                      placeholder={intl.formatMessage({
                        id: 'pages.login.password.placeholder',
                        defaultMessage: '密码: ant.design',
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
                  </>
                ),
              },
              {
                key: 'mobile',
                label: intl.formatMessage({
                  id: 'pages.login.phoneLogin.tab',
                  defaultMessage: '手机号登录',
                }),
                children: (
                  <>
                    {status === 'error' && loginType === 'mobile' && (
                      <LoginMessage content={intl.formatMessage({
                        id: 'pages.login.phoneLogin.errorMessage',
                        defaultMessage: '验证码错误',
                      })} />
                    )}
                    <ProFormText
                      fieldProps={{
                        size: 'large',
                        prefix: <MobileOutlined />,
                      }}
                      name="mobile"
                      placeholder={intl.formatMessage({
                        id: 'pages.login.phoneNumber.placeholder',
                        defaultMessage: '手机号',
                      })}
                      rules={[
                        {
                          required: true,
                          message: (
                            <FormattedMessage
                              id="pages.login.phoneNumber.required"
                              defaultMessage="请输入手机号！"
                            />
                          ),
                        },
                        {
                          pattern: /^1\d{10}$/,
                          message: (
                            <FormattedMessage
                              id="pages.login.phoneNumber.invalid"
                              defaultMessage="手机号格式错误！"
                            />
                          ),
                        },
                      ]}
                    />
                    <ProFormCaptcha
                      fieldProps={{
                        size: 'large',
                        prefix: <LockOutlined />,
                      }}
                      captchaProps={{
                        size: 'large',
                      }}
                      placeholder={intl.formatMessage({
                        id: 'pages.login.verificationCode.placeholder',
                        defaultMessage: '请输入验证码！',
                      })}
                      captchaTextRender={(timing, count) => {
                        if (timing) {
                          return `${count} ${intl.formatMessage({
                            id: 'pages.getCaptchaSecondText',
                            defaultMessage: '秒后重获',
                          })}`;
                        }
                        return intl.formatMessage({
                          id: 'pages.login.getCaptcha',
                          defaultMessage: '获取验证码',
                        });
                      }}
                      name="captcha"
                      rules={[
                        {
                          required: true,
                          message: (
                            <FormattedMessage
                              id="pages.login.verificationCode.required"
                              defaultMessage="请输入验证码！"
                            />
                          ),
                        },
                      ]}
                      onGetCaptcha={async () => {
                        const defaultMessage = intl.formatMessage({
                          id: 'pages.login.captcha.errorMessage',
                          defaultMessage: '获取验证码失败！',
                        });
                        message.error(defaultMessage);
                        // Mocking captcha success for demo
                        return new Promise<void>((resolve) => {
                          setTimeout(() => {
                            resolve();
                          }, 1000);
                        });
                      }}
                    />
                  </>
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
        </LoginForm>
      </div>
      <Footer />
    </div>
  );
};

export default Login;
