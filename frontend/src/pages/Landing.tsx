import React from 'react';
import { Button, Card, Row, Col, Typography, Space, Avatar, Tag } from 'antd';
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
  BarChartOutlined
} from '@ant-design/icons';
import { history, useIntl } from '@umijs/max';

const { Title, Paragraph, Text } = Typography;

const Landing: React.FC = () => {
  const intl = useIntl();

  const handleLogin = () => {
    history.push('/user/login');
  };

  const handleSignup = () => {
    history.push('/user/register');
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

  // Styles
  const landingContainerStyle: React.CSSProperties = {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    overflowX: 'hidden',
  };

  const heroSectionStyle: React.CSSProperties = {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
    padding: '80px 0',
  };

  const gradientSectionStyle: React.CSSProperties = {
    ...sectionStyle,
    background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
  };

  const ctaSectionStyle: React.CSSProperties = {
    ...sectionStyle,
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  };

  const gradientButtonStyle: React.CSSProperties = {
    background: 'linear-gradient(45deg, #ff6b6b, #ee5a24)',
    border: 'none',
    height: '50px',
    borderRadius: '25px',
    fontWeight: 600,
    fontSize: '16px',
    transition: 'all 0.3s ease',
  };

  const secondaryButtonStyle: React.CSSProperties = {
    height: '50px',
    borderRadius: '25px',
    fontWeight: 600,
    fontSize: '16px',
    border: '2px solid white',
    transition: 'all 0.3s ease',
  };

  const featureCardStyle: React.CSSProperties = {
    height: '100%',
    border: 'none',
    borderRadius: '16px',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
    transition: 'all 0.3s ease',
  };

  const floatingCardStyle: React.CSSProperties = {
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
    border: 'none',
    borderRadius: '16px',
  };

  const testimonialCardStyle: React.CSSProperties = {
    border: 'none',
    borderRadius: '16px',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
    height: '100%',
  };

  const statsCardStyle: React.CSSProperties = {
    textAlign: 'center',
    color: 'white',
  };

  return (
    <div style={landingContainerStyle}>
      {/* Hero Section */}
      <section style={heroSectionStyle}>
        <div style={heroContentStyle}>
          <Title level={1} style={{ color: 'white', fontSize: '64px', marginBottom: '24px', fontWeight: 700 }}>
            {intl.formatMessage({ id: 'pages.landing.title' })}
            <br />
            <Text style={{ color: '#ffd700' }}>{intl.formatMessage({ id: 'pages.landing.subtitle' })}</Text>
          </Title>
          <Paragraph style={{ color: 'white', fontSize: '24px', marginBottom: '48px', opacity: 0.9 }}>
            {intl.formatMessage({ id: 'pages.landing.description' })}
          </Paragraph>

          <Space size="large" wrap>
            <Button
              type="primary"
              size="large"
              onClick={handleSignup}
              icon={<RocketOutlined />}
                            style={gradientButtonStyle}
            >
              {intl.formatMessage({ id: 'pages.landing.getStarted' })}
            </Button>
            <Button
              size="large"
              onClick={handleLogin}
              style={secondaryButtonStyle}
            >
              {intl.formatMessage({ id: 'pages.landing.signIn' })}
            </Button>
          </Space>

          {/* Stats */}
          <Row gutter={[48, 24]} style={{ marginTop: '80px' }}>
            <Col xs={24} sm={8}>
              <div style={statsCardStyle}>
                <div style={{ fontSize: '48px', fontWeight: 700, marginBottom: '8px' }}>50+</div>
                <div style={{ fontSize: '16px', opacity: 0.9 }}>Pre-built Components</div>
              </div>
            </Col>
            <Col xs={24} sm={8}>
              <div style={statsCardStyle}>
                <div style={{ fontSize: '48px', fontWeight: 700, marginBottom: '8px' }}>99.9%</div>
                <div style={{ fontSize: '16px', opacity: 0.9 }}>Uptime Guarantee</div>
              </div>
            </Col>
            <Col xs={24} sm={8}>
              <div style={statsCardStyle}>
                <div style={{ fontSize: '48px', fontWeight: 700, marginBottom: '8px' }}>24/7</div>
                <div style={{ fontSize: '16px', opacity: 0.9 }}>Developer Support</div>
              </div>
            </Col>
          </Row>
        </div>
      </section>

      {/* Features Section */}
      <section style={sectionStyle}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
          <div style={{ textAlign: 'center', marginBottom: '80px' }}>
            <Title level={2} style={{ fontSize: '48px', marginBottom: '24px' }}>
              {intl.formatMessage({ id: 'pages.landing.features.title' })}
            </Title>
            <Paragraph style={{ fontSize: '20px', color: '#666', maxWidth: '600px', margin: '0 auto' }}>
              {intl.formatMessage({ id: 'pages.landing.features.description' })}
            </Paragraph>
          </div>

          <Row gutter={[32, 32]}>
            {features.map((feature, index) => (
              <Col xs={24} md={12} lg={8} key={index}>
                <Card style={featureCardStyle}>
                  <div style={{ textAlign: 'center', padding: '24px' }}>
                    <div style={{ marginBottom: '24px' }}>
                      {feature.icon}
                    </div>
                    <Title level={4} style={{ marginBottom: '16px' }}>
                      {feature.title}
                    </Title>
                    <Paragraph style={{ color: '#666' }}>
                      {feature.description}
                    </Paragraph>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </section>

      {/* Benefits Section */}
      <section style={gradientSectionStyle}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
          <Row gutter={[48, 48]} align="middle">
            <Col xs={24} lg={12}>
              <Title level={2} style={{ fontSize: '48px', marginBottom: '24px' }}>
                Why Choose Our SaaS Template?
              </Title>

              <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <div>
                  <CheckCircleOutlined style={{ color: '#52c41a', fontSize: '24px', marginRight: '16px' }} />
                  <Text style={{ fontSize: '18px' }}>Production-ready code with best practices</Text>
                </div>
                <div>
                  <CheckCircleOutlined style={{ color: '#52c41a', fontSize: '24px', marginRight: '16px' }} />
                  <Text style={{ fontSize: '18px' }}>Complete authentication & authorization</Text>
                </div>
                <div>
                  <CheckCircleOutlined style={{ color: '#52c41a', fontSize: '24px', marginRight: '16px' }} />
                  <Text style={{ fontSize: '18px' }}>Responsive design for all devices</Text>
                </div>
                <div>
                  <CheckCircleOutlined style={{ color: '#52c41a', fontSize: '24px', marginRight: '16px' }} />
                  <Text style={{ fontSize: '18px' }}>PostgreSQL database integration</Text>
                </div>
                <div>
                  <CheckCircleOutlined style={{ color: '#52c41a', fontSize: '24px', marginRight: '16px' }} />
                  <Text style={{ fontSize: '18px' }}>Docker deployment configuration</Text>
                </div>
                <div>
                  <CheckCircleOutlined style={{ color: '#52c41a', fontSize: '24px', marginRight: '16px' }} />
                  <Text style={{ fontSize: '18px' }}>Comprehensive testing setup</Text>
                </div>
              </Space>

              <div style={{ marginTop: '32px' }}>
                <Button
                  type="primary"
                  size="large"
                  onClick={handleSignup}
                  icon={<ArrowRightOutlined />}
                  style={gradientButtonStyle}
                >
                  Start Building Now
                </Button>
              </div>
            </Col>

            <Col xs={24} lg={12}>
              <Card style={floatingCardStyle}>
                <div style={{ padding: '32px', textAlign: 'center' }}>
                  <LockOutlined style={{ fontSize: '64px', color: '#667eea', marginBottom: '24px' }} />
                  <Title level={3}>Enterprise Security</Title>
                  <Paragraph style={{ color: '#666', marginBottom: '24px' }}>
                    Built with security-first approach including JWT authentication,
                    role-based access control, and data encryption.
                  </Paragraph>
                  <Tag color="blue">JWT Tokens</Tag>
                  <Tag color="green">RBAC</Tag>
                  <Tag color="orange">Data Encryption</Tag>
                </div>
              </Card>
            </Col>
          </Row>
        </div>
      </section>

      {/* Testimonials Section */}
      <section style={sectionStyle}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
          <div style={{ textAlign: 'center', marginBottom: '80px' }}>
            <Title level={2} style={{ fontSize: '48px', marginBottom: '24px' }}>
              What Developers Say
            </Title>
            <Paragraph style={{ fontSize: '20px', color: '#666' }}>
              Join thousands of developers who trust our SaaS template
            </Paragraph>
          </div>

          <Row gutter={[32, 32]}>
            {testimonials.map((testimonial, index) => (
              <Col xs={24} md={8} key={index}>
                <Card style={testimonialCardStyle}>
                  <div style={{ padding: '24px' }}>
                    <div style={{ marginBottom: '16px' }}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <StarFilled key={star} style={{ color: '#ffd700', fontSize: '16px' }} />
                      ))}
                    </div>
                    <Paragraph style={{ fontSize: '16px', marginBottom: '24px', fontStyle: 'italic' }}>
                      &ldquo;{testimonial.content}&rdquo;
                    </Paragraph>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar src={testimonial.avatar} size={48} style={{ marginRight: '16px' }} />
                      <div>
                        <Text strong>{testimonial.name}</Text>
                        <br />
                        <Text type="secondary">{testimonial.role}</Text>
                      </div>
                    </div>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </section>

      {/* CTA Section */}
      <section style={ctaSectionStyle}>
                <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 24px', textAlign: 'center' }}>
          <Title level={2} style={{ color: 'white', fontSize: '48px', marginBottom: '24px' }}>
            {intl.formatMessage({ id: 'pages.landing.cta.title' })}
          </Title>
          <Paragraph style={{ color: 'white', fontSize: '20px', marginBottom: '48px', opacity: 0.9 }}>
            {intl.formatMessage({ id: 'pages.landing.cta.description' })}
          </Paragraph>

          <Space size="large" wrap>
            <Button
              type="primary"
              size="large"
              onClick={handleSignup}
                            style={{ background: 'white', color: '#667eea', height: '50px', borderRadius: '25px', fontWeight: 600, fontSize: '16px' }}
              icon={<RocketOutlined />}
            >
              {intl.formatMessage({ id: 'pages.landing.cta.trial' })}
            </Button>
            <Button
              size="large"
              onClick={handleLogin}
              style={secondaryButtonStyle}
            >
              {intl.formatMessage({ id: 'pages.landing.cta.demo' })}
            </Button>
          </Space>

          <div style={{ marginTop: '48px', opacity: 0.8 }}>
            <Text style={{ color: 'white' }}>
              No credit card required • Free 14-day trial • Cancel anytime
            </Text>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
