import React, { useEffect, useRef, useState } from 'react';
import { Button, Card, Row, Col, Typography, Space, Avatar, Tag, FloatButton, Dropdown } from 'antd';
import {
  RocketOutlined,
  SafetyOutlined,
  ThunderboltOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  ArrowRightOutlined,
  StarFilled,
  CloudOutlined,
  LockOutlined,
  BarChartOutlined,
  GlobalOutlined,
  SunOutlined,
  MoonOutlined,
  SettingOutlined
} from '@ant-design/icons';
import { history, useIntl, setLocale, getLocale } from '@umijs/max';
import { useTheme } from '../contexts/ThemeContext';

const { Title, Paragraph, Text } = Typography;

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

const Landing: React.FC = () => {
  const intl = useIntl();
  const { isDarkMode, toggleTheme } = useTheme(); // Use global theme context
  const [animatedElements, setAnimatedElements] = useState<Set<string>>(new Set());
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Refs for scroll animations
  const heroRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const benefitsRef = useRef<HTMLDivElement>(null);
  const testimonialsRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  const handleLogin = () => {
    history.push('/user/login');
  };

  const handleSignup = () => {
    history.push('/user/register');
  };

  const handleLanguageChange = ({ key }: { key: string }) => {
    setLocale(key, false); // false to not reload page
    localStorage.setItem('app-language', key);
  };

  useEffect(() => {
    const savedLanguage = localStorage.getItem('app-language');
    if (savedLanguage) {
      setLocale(savedLanguage, false);
    }
  }, []);

  // Intersection Observer for scroll animations
  useEffect(() => {
    const elements = [
      { ref: heroRef, id: 'hero' },
      { ref: featuresRef, id: 'features' },
      { ref: benefitsRef, id: 'benefits' },
      { ref: testimonialsRef, id: 'testimonials' },
      { ref: ctaRef, id: 'cta' },
    ];

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute('data-animate-id');
            if (id) {
              setAnimatedElements((prev: Set<string>) => new Set([...prev, id]));
            }
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
      }
    );

    elements.forEach(({ ref, id }) => {
      if (ref.current) {
        ref.current.setAttribute('data-animate-id', id);
        observerRef.current?.observe(ref.current);
      }
    });

    return () => {
      observerRef.current?.disconnect();
    };
  }, []);

  // Dynamic colors based on theme
  const colors = {
    background: isDarkMode ? '#0a0a0a' : '#ffffff',
    gradientPrimary: isDarkMode
      ? 'linear-gradient(135deg, #2a2d3a 0%, #3a4464 100%)'
      : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    gradientSecondary: isDarkMode
      ? 'linear-gradient(135deg, #1a1d2a 0%, #2a2d3a 100%)'
      : 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
    text: isDarkMode ? '#ffffff' : '#000000',
    textSecondary: isDarkMode ? '#a0a0a0' : '#666666',
    cardBackground: isDarkMode ? '#1a1a1a' : '#ffffff',
    accent: '#ffd700',
  };

  const features = [
    {
      icon: <RocketOutlined style={{ fontSize: '48px', color: '#667eea' }} />,
      title: 'Fast Setup',
      description: 'Get your SaaS application up and running in minutes with our pre-built components and templates.'
    },
    {
      icon: <SafetyOutlined style={{ fontSize: '48px', color: '#667eea' }} />,
      title: 'Enterprise Security',
      description: 'Built-in authentication, authorization, and security best practices to protect your data.'
    },
    {
      icon: <ThunderboltOutlined style={{ fontSize: '48px', color: '#667eea' }} />,
      title: 'High Performance',
      description: 'Optimized for speed and scalability with modern React and FastAPI architecture.'
    },
    {
      icon: <TeamOutlined style={{ fontSize: '48px', color: '#667eea' }} />,
      title: 'Team Collaboration',
      description: 'Built-in user management, roles, and permissions for seamless team collaboration.'
    },
    {
      icon: <CloudOutlined style={{ fontSize: '48px', color: '#667eea' }} />,
      title: 'Cloud Ready',
      description: 'Deploy anywhere with Docker support and cloud-native architecture.'
    },
    {
      icon: <BarChartOutlined style={{ fontSize: '48px', color: '#667eea' }} />,
      title: 'Analytics Dashboard',
      description: 'Comprehensive analytics and reporting tools to track your business metrics.'
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'CTO, TechStartup',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b372?w=150',
      content: 'This SaaS template saved us months of development time. The code quality is exceptional!'
    },
    {
      name: 'Michael Chen',
      role: 'Product Manager, InnovateCorp',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      content: 'Perfect foundation for our B2B platform. The authentication and user management work flawlessly.'
    },
    {
      name: 'Emily Rodriguez',
      role: 'Lead Developer, StartupXYZ',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
      content: 'Clean architecture, great documentation, and excellent performance. Highly recommended!'
    }
  ];

  // Animation styles
  const getAnimationStyle = (elementId: string, delay: number = 0): React.CSSProperties => {
    const isAnimated = animatedElements.has(elementId);
    return {
      opacity: isAnimated ? 1 : 0,
      transform: isAnimated ? 'translateY(0)' : 'translateY(30px)',
      transition: `all 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
    };
  };

  // Styles
  const landingContainerStyle: React.CSSProperties = {
    minHeight: '100vh',
    background: colors.background,
    overflowX: 'hidden',
    position: 'relative',
  };

  const topBarStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    right: 0,
    zIndex: 1000,
    padding: '16px 24px',
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
  };

  const heroSectionStyle: React.CSSProperties = {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    background: colors.gradientPrimary,
    overflow: 'hidden',
  };

  const heroContentStyle: React.CSSProperties = {
    textAlign: 'center',
    color: 'white',
    zIndex: 1,
    position: 'relative',
    maxWidth: '800px',
    padding: '0 24px',
  };

  const sectionStyle: React.CSSProperties = {
    padding: '120px 0',
    background: colors.background,
    position: 'relative',
  };

  const gradientSectionStyle: React.CSSProperties = {
    ...sectionStyle,
    background: colors.gradientSecondary,
  };

  const ctaSectionStyle: React.CSSProperties = {
    ...sectionStyle,
    background: colors.gradientPrimary,
  };

  const gradientButtonStyle: React.CSSProperties = {
    background: 'linear-gradient(45deg, #ff6b6b, #ee5a24)',
    border: 'none',
    height: '56px',
    borderRadius: '28px',
    fontWeight: 600,
    fontSize: '16px',
    padding: '0 32px',
    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
    boxShadow: '0 8px 24px rgba(255, 107, 107, 0.3)',
  };

  const secondaryButtonStyle: React.CSSProperties = {
    height: '56px',
    borderRadius: '28px',
    fontWeight: 600,
    fontSize: '16px',
    border: '2px solid white',
    background: 'transparent',
    color: 'white',
    padding: '0 32px',
    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
  };

  const featureCardStyle: React.CSSProperties = {
    height: '100%',
    border: 'none',
    borderRadius: '24px',
    background: colors.cardBackground,
    boxShadow: isDarkMode
      ? '0 20px 40px rgba(0, 0, 0, 0.3)'
      : '0 20px 40px rgba(0, 0, 0, 0.1)',
    transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
    overflow: 'hidden',
    position: 'relative',
  };

  const floatingCardStyle: React.CSSProperties = {
    background: colors.cardBackground,
    boxShadow: isDarkMode
      ? '0 30px 60px rgba(0, 0, 0, 0.4)'
      : '0 30px 60px rgba(0, 0, 0, 0.15)',
    border: 'none',
    borderRadius: '24px',
    transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
    animation: 'float 6s ease-in-out infinite',
  };

  const testimonialCardStyle: React.CSSProperties = {
    border: 'none',
    borderRadius: '24px',
    background: colors.cardBackground,
    boxShadow: isDarkMode
      ? '0 20px 40px rgba(0, 0, 0, 0.3)'
      : '0 20px 40px rgba(0, 0, 0, 0.1)',
    height: '100%',
    transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
  };

  const statsCardStyle: React.CSSProperties = {
    textAlign: 'center',
    color: 'white',
    padding: '24px',
    borderRadius: '16px',
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
  };

  // Floating particles background
  const particlesStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
    opacity: 0.6,
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
    <div style={landingContainerStyle}>
        {/* Top Bar with Language Selector and Theme Toggle */}
        <div style={topBarStyle}></div>

        {/* Floating particles */}
        <div style={particlesStyle}>
          <div
            style={{
              position: 'absolute',
              top: '20%',
              left: '10%',
              width: '120px',
              height: '120px',
              background: 'radial-gradient(circle, rgba(102, 126, 234, 0.3) 0%, transparent 70%)',
              borderRadius: '50%',
              animation: 'float 8s ease-in-out infinite',
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: '60%',
              right: '15%',
              width: '80px',
              height: '80px',
              background: 'radial-gradient(circle, rgba(255, 215, 0, 0.3) 0%, transparent 70%)',
              borderRadius: '50%',
              animation: 'float 6s ease-in-out infinite reverse',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '20%',
              left: '20%',
              width: '100px',
              height: '100px',
              background: 'radial-gradient(circle, rgba(118, 75, 162, 0.3) 0%, transparent 70%)',
              borderRadius: '50%',
              animation: 'float 10s ease-in-out infinite',
            }}
          />
        </div>

        {/* Hero Section */}
        <section style={heroSectionStyle} ref={heroRef}>
          <div style={{...heroContentStyle, ...getAnimationStyle('hero')}}>
            <Title level={1} style={{ color: 'white', fontSize: '72px', marginBottom: '24px', fontWeight: 700, lineHeight: 1.1 }}>
              {intl.formatMessage({ id: 'pages.landing.title' })}
              <br />
              <Text style={{ color: colors.accent, textShadow: '0 0 30px rgba(255, 215, 0, 0.5)' }}>
                {intl.formatMessage({ id: 'pages.landing.subtitle' })}
              </Text>
            </Title>
            <Paragraph style={{ color: 'white', fontSize: '24px', marginBottom: '48px', opacity: 0.9, lineHeight: 1.6 }}>
              {intl.formatMessage({ id: 'pages.landing.description' })}
            </Paragraph>

            <Space size="large" wrap style={{ marginBottom: '80px' }}>
              <Button
                type="primary"
                size="large"
                onClick={handleSignup}
                icon={<RocketOutlined />}
                style={gradientButtonStyle}
                className="gradient-button"
              >
                {intl.formatMessage({ id: 'pages.landing.getStarted' })}
              </Button>
              <Button
                size="large"
                onClick={handleLogin}
                style={secondaryButtonStyle}
                className="secondary-button"
              >
                {intl.formatMessage({ id: 'pages.landing.signIn' })}
              </Button>
            </Space>

            {/* Stats */}
            <Row gutter={[32, 32]} style={{ maxWidth: '800px', margin: '0 auto' }}>
              <Col xs={24} sm={8}>
                <div style={statsCardStyle} className="stats-card">
                  <div style={{ fontSize: '48px', fontWeight: 700, marginBottom: '8px', color: colors.accent }}>50+</div>
                  <div style={{ fontSize: '16px', opacity: 0.9 }}>Pre-built Components</div>
                </div>
              </Col>
              <Col xs={24} sm={8}>
                <div style={statsCardStyle} className="stats-card">
                  <div style={{ fontSize: '48px', fontWeight: 700, marginBottom: '8px', color: colors.accent }}>99.9%</div>
                  <div style={{ fontSize: '16px', opacity: 0.9 }}>Uptime Guarantee</div>
                </div>
              </Col>
              <Col xs={24} sm={8}>
                <div style={statsCardStyle} className="stats-card">
                  <div style={{ fontSize: '48px', fontWeight: 700, marginBottom: '8px', color: colors.accent }}>24/7</div>
                  <div style={{ fontSize: '16px', opacity: 0.9 }}>Developer Support</div>
                </div>
              </Col>
            </Row>
          </div>
        </section>

        {/* Features Section */}
        <section style={sectionStyle} ref={featuresRef}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
            <div style={{ textAlign: 'center', marginBottom: '80px', ...getAnimationStyle('features') }}>
              <Title level={2} style={{ fontSize: '56px', marginBottom: '24px', color: colors.text }}>
                {intl.formatMessage({ id: 'pages.landing.features.title' })}
              </Title>
              <Paragraph style={{ fontSize: '20px', color: colors.textSecondary, maxWidth: '600px', margin: '0 auto' }}>
                {intl.formatMessage({ id: 'pages.landing.features.description' })}
              </Paragraph>
            </div>

            <Row gutter={[32, 32]}>
              {features.map((feature, index) => (
                <Col xs={24} md={12} lg={8} key={index}>
                  <div style={{...getAnimationStyle('features', index * 200)}}>
                    <Card
                      style={featureCardStyle}
                      className="feature-card"
                      bodyStyle={{ padding: '40px 32px' }}
                    >
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ marginBottom: '32px', transform: 'translateY(0)', transition: 'transform 0.3s ease' }}>
                          {feature.icon}
                        </div>
                        <Title level={4} style={{ marginBottom: '16px', color: colors.text, fontSize: '24px' }}>
                          {feature.title}
                        </Title>
                        <Paragraph style={{ color: colors.textSecondary, fontSize: '16px', lineHeight: 1.6 }}>
                          {feature.description}
                        </Paragraph>
                      </div>
                    </Card>
                  </div>
                </Col>
              ))}
            </Row>
          </div>
        </section>

        {/* Benefits Section */}
        <section style={gradientSectionStyle} ref={benefitsRef}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
            <Row gutter={[48, 48]} align="middle">
              <Col xs={24} lg={12}>
                <div style={getAnimationStyle('benefits')}>
                  <Title level={2} style={{ fontSize: '56px', marginBottom: '32px', color: colors.text }}>
                    Why Choose Our SaaS Template?
                  </Title>

                  <Space direction="vertical" size="large" style={{ width: '100%' }}>
                    {[
                      'Production-ready code with best practices',
                      'Complete authentication & authorization',
                      'Responsive design for all devices',
                      'PostgreSQL database integration',
                      'Docker deployment configuration',
                      'Comprehensive testing setup'
                    ].map((benefit, index) => (
                      <div key={index} style={{...getAnimationStyle('benefits', index * 100), display: 'flex', alignItems: 'center'}}>
                        <CheckCircleOutlined style={{ color: '#52c41a', fontSize: '24px', marginRight: '16px' }} />
                        <Text style={{ fontSize: '18px', color: colors.text }}>{benefit}</Text>
                      </div>
                    ))}
                  </Space>

                  <div style={{ marginTop: '40px', ...getAnimationStyle('benefits', 600) }}>
                    <Button
                      type="primary"
                      size="large"
                      onClick={handleSignup}
                      icon={<ArrowRightOutlined />}
                      style={gradientButtonStyle}
                      className="gradient-button"
                    >
                      Start Building Now
                    </Button>
                  </div>
                </div>
              </Col>

              <Col xs={24} lg={12}>
                <div style={getAnimationStyle('benefits', 300)}>
                  <Card style={floatingCardStyle} className="floating-card">
                    <div style={{ padding: '48px 32px', textAlign: 'center' }}>
                      <LockOutlined style={{ fontSize: '80px', color: '#667eea', marginBottom: '32px' }} />
                      <Title level={3} style={{ color: colors.text, marginBottom: '24px' }}>Enterprise Security</Title>
                      <Paragraph style={{ color: colors.textSecondary, marginBottom: '32px', fontSize: '16px', lineHeight: 1.6 }}>
                        Built with security-first approach including JWT authentication,
                        role-based access control, and data encryption.
                      </Paragraph>
                      <Space wrap>
                        <Tag color="blue" style={{ padding: '8px 16px', fontSize: '14px' }}>JWT Tokens</Tag>
                        <Tag color="green" style={{ padding: '8px 16px', fontSize: '14px' }}>RBAC</Tag>
                        <Tag color="orange" style={{ padding: '8px 16px', fontSize: '14px' }}>Data Encryption</Tag>
                      </Space>
                    </div>
                  </Card>
                </div>
              </Col>
            </Row>
          </div>
        </section>

        {/* Testimonials Section */}
        <section style={sectionStyle} ref={testimonialsRef}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
            <div style={{ textAlign: 'center', marginBottom: '80px', ...getAnimationStyle('testimonials') }}>
              <Title level={2} style={{ fontSize: '56px', marginBottom: '24px', color: colors.text }}>
                What Developers Say
              </Title>
              <Paragraph style={{ fontSize: '20px', color: colors.textSecondary }}>
                Join thousands of developers who trust our SaaS template
              </Paragraph>
            </div>

            <Row gutter={[32, 32]}>
              {testimonials.map((testimonial, index) => (
                <Col xs={24} md={8} key={index}>
                  <div style={getAnimationStyle('testimonials', index * 200)}>
                    <Card style={testimonialCardStyle} className="testimonial-card">
                      <div style={{ padding: '32px' }}>
                        <div style={{ marginBottom: '24px' }}>
                          {[1, 2, 3, 4, 5].map((star) => (
                            <StarFilled key={star} style={{ color: colors.accent, fontSize: '18px', marginRight: '4px' }} />
                          ))}
                        </div>
                        <Paragraph style={{ fontSize: '16px', marginBottom: '32px', fontStyle: 'italic', color: colors.text, lineHeight: 1.6 }}>
                          &ldquo;{testimonial.content}&rdquo;
                        </Paragraph>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar src={testimonial.avatar} size={56} style={{ marginRight: '16px' }} />
                          <div>
                            <Text strong style={{ color: colors.text, fontSize: '16px' }}>{testimonial.name}</Text>
                            <br />
                            <Text type="secondary" style={{ color: colors.textSecondary }}>{testimonial.role}</Text>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </div>
                </Col>
              ))}
            </Row>
          </div>
        </section>

        {/* CTA Section */}
        <section style={ctaSectionStyle} ref={ctaRef}>
          <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 24px', textAlign: 'center' }}>
            <div style={getAnimationStyle('cta')}>
              <Title level={2} style={{ color: 'white', fontSize: '56px', marginBottom: '32px' }}>
                {intl.formatMessage({ id: 'pages.landing.cta.title' })}
              </Title>
              <Paragraph style={{ color: 'white', fontSize: '20px', marginBottom: '48px', opacity: 0.9, lineHeight: 1.6 }}>
                {intl.formatMessage({ id: 'pages.landing.cta.description' })}
              </Paragraph>

              <Space size="large" wrap style={{ marginBottom: '48px' }}>
                <Button
                  type="primary"
                  size="large"
                  onClick={handleSignup}
                  style={{ background: 'white', color: '#667eea', height: '56px', borderRadius: '28px', fontWeight: 600, fontSize: '16px', padding: '0 32px', boxShadow: '0 8px 24px rgba(255, 255, 255, 0.3)' }}
                  icon={<RocketOutlined />}
                  className="cta-button"
                >
                  {intl.formatMessage({ id: 'pages.landing.cta.trial' })}
                </Button>
                <Button
                  size="large"
                  onClick={handleLogin}
                  style={secondaryButtonStyle}
                  className="secondary-button"
                >
                  {intl.formatMessage({ id: 'pages.landing.cta.demo' })}
                </Button>
              </Space>

              <div style={{ opacity: 0.8 }}>
                <Text style={{ color: 'white', fontSize: '16px' }}>
                  No credit card required • Free 14-day trial • Cancel anytime
                </Text>
              </div>
            </div>
          </div>
        </section>

        {/* Floating Action Button for Settings */}
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

        {/* CSS Animations */}
        <style>
          {`
            @keyframes float {
              0%, 100% {
                transform: translateY(0px) rotate(0deg);
              }
              50% {
                transform: translateY(-20px) rotate(5deg);
              }
            }

            @keyframes pulse {
              0%, 100% {
                transform: scale(1);
              }
              50% {
                transform: scale(1.05);
              }
            }

            .gradient-button:hover {
              transform: translateY(-4px) scale(1.05);
              box-shadow: 0 16px 40px rgba(255, 107, 107, 0.4) !important;
            }

            .secondary-button:hover {
              transform: translateY(-4px);
              background: white !important;
              color: #667eea !important;
              box-shadow: 0 16px 40px rgba(255, 255, 255, 0.3);
            }

            .feature-card:hover {
              transform: translateY(-12px) scale(1.02);
              box-shadow: 0 32px 64px rgba(0, 0, 0, ${isDarkMode ? '0.4' : '0.15'}) !important;
            }

            .feature-card:hover .anticon {
              transform: translateY(-8px) scale(1.1);
              animation: pulse 2s infinite;
            }

            .floating-card {
              animation: float 6s ease-in-out infinite;
            }

            .floating-card:hover {
              animation-play-state: paused;
              transform: translateY(-20px) scale(1.05);
            }

            .testimonial-card:hover {
              transform: translateY(-8px);
              box-shadow: 0 24px 48px rgba(0, 0, 0, ${isDarkMode ? '0.4' : '0.15'}) !important;
            }

            .stats-card:hover {
              transform: translateY(-4px) scale(1.05);
              background: rgba(255, 255, 255, 0.2) !important;
            }

            .cta-button:hover {
              transform: translateY(-4px) scale(1.05);
              box-shadow: 0 16px 40px rgba(255, 255, 255, 0.4) !important;
            }

            /* Scroll animations */
            .animate-on-scroll {
              opacity: 0;
              transform: translateY(30px);
              transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
            }

            .animate-on-scroll.animated {
              opacity: 1;
              transform: translateY(0);
            }

            /* Background animations */
            .hero-bg::before {
              content: '';
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              background: radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
                          radial-gradient(circle at 80% 20%, rgba(255, 215, 0, 0.3) 0%, transparent 50%);
              animation: float 20s ease-in-out infinite alternate;
            }
          `}
        </style>
      </div>
  );
};

export default Landing;
