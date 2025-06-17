import { Footer } from '@/components';
import { usersRegisterUser as signup } from '@/services/ant-design-pro/users';
import {
  LockOutlined,
  UserOutlined,
  BulbOutlined,
  BulbFilled,
} from '@ant-design/icons';
import {
  LoginForm,
  ProFormText,
} from '@ant-design/pro-components';
import { FormattedMessage, Helmet, useIntl, Link, history } from '@umijs/max';
import { SelectLang as CustomSelectLang } from '@/components';
import { Alert, message, Button } from 'antd';
import { createStyles } from 'antd-style';
import React, { useState } from 'react';
import Settings from '../../../../config/defaultSettings';
import { useTheme } from '@/contexts/ThemeContext';

interface SignupStateType {
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

const Lang = ({ isDark }: { isDark: boolean }) => {
  const { styles } = useStyles(isDark);

  return (
    <div className={styles.lang} data-lang>
      {CustomSelectLang && <CustomSelectLang isDark={isDark} />}
    </div>
  );
};

const SignupMessage: React.FC<{
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

const Signup: React.FC = () => {
  const [userSignupState, setUserSignupState] = useState<SignupStateType>({});
  const { isDarkMode, toggleTheme } = useTheme();
  const { styles } = useStyles(isDarkMode);
  const intl = useIntl();

  const handleSubmit = async (values: any) => {
    try {
      // Create account
      const response = await signup({
        email: values.email,
        password: values.password,
        full_name: values.email, // Use email as full_name for simplicity
      });

      if (response) {
        const defaultSignupSuccessMessage = intl.formatMessage({
          id: 'pages.signup.success',
          defaultMessage: 'Account created successfully!',
        });
        message.success(defaultSignupSuccessMessage);

        // Redirect to login page after successful signup
        history.push('/user/login');
        return;
      }

      // If we get here, signup failed
      setUserSignupState({ status: 'error' });
    } catch (error: any) {
      console.log('Signup error:', error);

      let errorMessage = intl.formatMessage({
        id: 'pages.signup.failure',
        defaultMessage: 'Registration failed, please try again!',
      });

      // Check for specific error messages
      if (error?.response?.data?.detail === 'The user with this email already exists in the system') {
        errorMessage = intl.formatMessage({
          id: 'pages.signup.existsError',
          defaultMessage: 'An account with this email already exists!',
        });
      }

      message.error(errorMessage);
      setUserSignupState({ status: 'error' });
    }
  };

  return (
    <div className={styles.container}>
      <Helmet>
        <title>
          {intl.formatMessage({
            id: 'pages.signup.title',
            defaultMessage: 'Create Account',
          })}
          {` - ${Settings.title}`}
        </title>
      </Helmet>

      {/* Top right controls */}
      <div className={styles.topRightIcons}>
        <Lang isDark={isDarkMode} />
        <Button
          className={styles.darkModeToggle}
          type="text"
          icon={isDarkMode ? <BulbFilled /> : <BulbOutlined />}
          onClick={toggleTheme}
          style={{
            color: isDarkMode ? 'white' : undefined,
          }}
        />
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
        <div className={styles.loginFormContainer}>
          <LoginForm
            contentStyle={{
              minWidth: 280,
              maxWidth: '75vw',
            }}
            logo={<img alt="logo" src="/logo.svg" />}
            title={intl.formatMessage({
              id: 'pages.signup.title',
              defaultMessage: 'Create Account',
            })}
            subTitle={intl.formatMessage({
              id: 'pages.signup.subtitle',
              defaultMessage: 'Join us today!',
            })}
            onFinish={async (values) => {
              await handleSubmit(values);
            }}
            submitter={{
              searchConfig: {
                submitText: intl.formatMessage({
                  id: 'pages.signup.submit',
                  defaultMessage: 'Sign Up',
                }),
              },
            }}
          >
            {userSignupState.status === 'error' && (
              <SignupMessage
                content={intl.formatMessage({
                  id: 'pages.signup.failure',
                  defaultMessage: 'Registration failed, please try again!',
                })}
              />
            )}

            <ProFormText
              name="email"
              fieldProps={{
                size: 'large',
                prefix: <UserOutlined className={styles.action} />,
              }}
              placeholder={intl.formatMessage({
                id: 'pages.signup.email.placeholder',
                defaultMessage: 'Email address',
              })}
              rules={[
                {
                  required: true,
                  message: (
                    <FormattedMessage
                      id="pages.signup.email.required"
                      defaultMessage="Please input your email address!"
                    />
                  ),
                },
                {
                  type: 'email',
                  message: (
                    <FormattedMessage
                      id="pages.signup.email.invalid"
                      defaultMessage="Please enter a valid email address!"
                    />
                  ),
                },
              ]}
            />

            <ProFormText.Password
              name="password"
              fieldProps={{
                size: 'large',
                prefix: <LockOutlined className={styles.action} />,
              }}
              placeholder={intl.formatMessage({
                id: 'pages.signup.password.placeholder',
                defaultMessage: 'Password',
              })}
              rules={[
                {
                  required: true,
                  message: (
                    <FormattedMessage
                      id="pages.signup.password.required"
                      defaultMessage="Please input your password!"
                    />
                  ),
                },
                {
                  min: 8,
                  message: (
                    <FormattedMessage
                      id="pages.signup.password.min"
                      defaultMessage="Password must be at least 8 characters long!"
                    />
                  ),
                },
              ]}
            />

            <ProFormText.Password
              name="confirmPassword"
              fieldProps={{
                size: 'large',
                prefix: <LockOutlined className={styles.action} />,
              }}
              placeholder={intl.formatMessage({
                id: 'pages.signup.confirmPassword.placeholder',
                defaultMessage: 'Confirm password',
              })}
              rules={[
                {
                  required: true,
                  message: (
                    <FormattedMessage
                      id="pages.signup.confirmPassword.required"
                      defaultMessage="Please confirm your password!"
                    />
                  ),
                },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      new Error(
                        intl.formatMessage({
                          id: 'pages.signup.confirmPassword.match',
                          defaultMessage: 'Passwords do not match!',
                        })
                      )
                    );
                  },
                }),
              ]}
            />

            <div
              style={{
                marginBottom: 24,
                textAlign: 'center',
              }}
            >
              <Link to="/user/login" className={styles.darkText}>
                <FormattedMessage
                  id="pages.signup.loginAccount"
                  defaultMessage="Already have an account? Sign in"
                />
              </Link>
            </div>
          </LoginForm>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Signup;
