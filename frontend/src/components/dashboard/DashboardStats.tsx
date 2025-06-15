import React from "react";
import styled, { useTheme } from 'styled-components';
import { Typography, Spin } from "antd";
import { FaSitemap, FaDatabase, FaChartLine, FaArrowUp, FaExclamationTriangle } from "react-icons/fa";
import { useItemStats } from "../../hooks/useItemStats";
import useLanguage from "@/hooks/useLanguage";

const { Text } = Typography;

const StatsContainer = styled.div`
  margin-bottom: 32px;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
  
  @media (min-width: 576px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (min-width: 992px) {
    grid-template-columns: repeat(4, 1fr);
  }
`;

const StatCardContainer = styled.div<{ $bg: string; $border: string }>`
  background: ${props => props.$bg};
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid ${props => props.$border};
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
`;

const CardContent = styled.div`
  display: flex;
  flex-direction: column;
`;

const CardTitle = styled(Text)<{ $color: string }>`
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 4px;
  color: ${props => props.$color};
`;

const CardDescription = styled(Text)<{ $color: string }>`
  font-size: 12px;
  color: ${props => props.$color};
`;

const IconContainer = styled.div<{ $bg: string; $color: string }>`
  background: ${props => props.$bg};
  color: ${props => props.$color};
  padding: 8px;
  border-radius: 6px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ValueContainer = styled.div`
  display: flex;
  align-items: baseline;
`;

const Value = styled(Text)<{ $color: string }>`
  font-size: 24px;
  font-weight: 700;
  margin-right: 4px;
  color: ${props => props.$color};
`;

const Unit = styled(Text)<{ $color: string }>`
  font-size: 14px;
  color: ${props => props.$color};
  font-weight: 500;
`;

const TrendContainer = styled.div`
  display: flex;
  align-items: center;
  margin-top: 8px;
`;

const TrendIcon = styled.div<{ $color: string; $isUp: boolean }>`
  color: ${props => props.$color};
  margin-right: 4px;
  transform: ${props => props.$isUp ? 'rotate(0deg)' : 'rotate(180deg)'};
`;

const TrendText = styled(Text)<{ $color: string }>`
  color: ${props => props.$color};
  font-size: 12px;
  font-weight: 500;
`;

const ProgressContainer = styled.div`
  margin-top: 12px;
`;

const ProgressHeader = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
`;

const ProgressLabel = styled(Text)<{ $color: string }>`
  font-size: 12px;
  color: ${props => props.$color};
  font-weight: 500;
`;

const ProgressBar = styled.div<{ $bg: string }>`
  background: ${props => props.$bg};
  border-radius: 4px;
  height: 4px;
  overflow: hidden;
`;

const ProgressFill = styled.div<{ $bg: string; $width: number }>`
  background: ${props => props.$bg};
  height: 100%;
  border-radius: 4px;
  width: ${props => props.$width}%;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px 0;
`;

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
`;

const ErrorIcon = styled.div`
  font-size: 40px;
  color: #ff4d4f;
  margin-bottom: 16px;
`;

const ErrorText = styled(Text)`
  color: #ff4d4f;
`;

interface StatCardProps {
  title: string;
  description: string;
  value: string | number;
  unit?: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  trend?: {
    isUp: boolean;
    value: string;
    color: string;
  };
  progress?: {
    value: number;
    max: number;
    color: string;
  };
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  description,
  value,
  unit,
  icon: Icon,
  iconBg,
  iconColor,
  trend,
  progress,
}) => {
  const theme = useTheme() as any;
  const isDark = theme.algorithm === theme.darkAlgorithm;
  const { t } = useLanguage();
  
  const cardBg = isDark ? '#1f1f1f' : '#ffffff';
  const cardBorder = isDark ? '#303030' : '#d9d9d9';
  const titleColor = isDark ? '#ffffff' : '#262626';
  const descriptionColor = isDark ? '#a6a6a6' : '#8c8c8c';
  const valueColor = isDark ? '#ffffff' : '#262626';
  const progressBg = isDark ? '#404040' : '#f0f0f0';

  return (
    <StatCardContainer $bg={cardBg} $border={cardBorder}>
      <CardHeader>
        <CardContent>
          <CardTitle $color={titleColor}>
            {title}
          </CardTitle>
          <CardDescription $color={descriptionColor}>
            {description}
          </CardDescription>
        </CardContent>
        <IconContainer $bg={iconBg} $color={iconColor}>
          <Icon size={20} />
        </IconContainer>
      </CardHeader>

      <ValueContainer>
        <Value $color={valueColor}>
          {value}
        </Value>
        {unit && (
          <Unit $color={descriptionColor}>
            {unit}
          </Unit>
        )}
      </ValueContainer>

      {trend && (
        <TrendContainer>
          <TrendIcon $color={trend.color} $isUp={trend.isUp}>
            <FaArrowUp size={12} />
          </TrendIcon>
          <TrendText $color={trend.color}>
            {trend.value}
          </TrendText>
        </TrendContainer>
      )}

      {progress && (
        <ProgressContainer>
          <ProgressHeader>
            <ProgressLabel $color={descriptionColor}>
              {t("dashboard.usage", "使用量")}
            </ProgressLabel>
            <ProgressLabel $color={descriptionColor}>
              {progress.value}/{progress.max}
            </ProgressLabel>
          </ProgressHeader>
          <ProgressBar $bg={progressBg}>
            <ProgressFill
              $bg={progress.color}
              $width={(progress.value / progress.max) * 100}
            />
          </ProgressBar>
        </ProgressContainer>
      )}
    </StatCardContainer>
  );
};

const DashboardStats: React.FC = () => {
  const { data: stats, isLoading, error } = useItemStats();
  const { t } = useLanguage();

  if (isLoading) {
    return (
      <LoadingContainer>
        <Spin size="large" />
      </LoadingContainer>
    );
  }

  if (error || !stats) {
    return (
      <ErrorContainer>
        <ErrorIcon>
          <FaExclamationTriangle />
        </ErrorIcon>
        <ErrorText>{t("dashboard.statsLoadFailed", "無法載入統計資料")}</ErrorText>
      </ErrorContainer>
    );
  }

  return (
    <StatsContainer>
      <StatsGrid>
        <StatCard
          title={t("dashboard.totalItems", "Total Items")}
          description={t("dashboard.allCreatedItems", "All created items")}
          value={stats.totalItems}
          icon={FaSitemap}
          iconBg="rgba(22, 119, 255, 0.1)"
          iconColor="#1677ff"
          trend={{
            isUp: true,
            value: `${t("dashboard.total", "Total")} ${stats.totalItems} ${t("dashboard.itemsUnit", "items")}`,
            color: "#52c41a",
          }}
        />

        <StatCard
          title={t("dashboard.usedSpace", "Used Space")}
          description={t("dashboard.totalItemCapacity", "Total item capacity")}
          value={stats.totalItems}
          unit={`/${stats.maxItems}`}
          icon={FaDatabase}
          iconBg="rgba(250, 173, 20, 0.2)"
          iconColor="#faad14"
          progress={{
            value: stats.totalItems,
            max: stats.maxItems,
            color: "#faad14",
          }}
        />

        <StatCard
          title={t("dashboard.monthlyUsage", "Monthly Usage")}
          description={`${t("dashboard.thisMonthGenerated", "Generated this month")} ${stats.currentMonthItems} ${t("dashboard.itemsUnit", "items")}`}
          value={stats.currentMonthItems}
          icon={FaChartLine}
          iconBg="rgba(82, 196, 26, 0.2)"
          iconColor="#52c41a"
          progress={{
            value: stats.currentMonthItems,
            max: 50,
            color: "#52c41a",
          }}
        />
      </StatsGrid>
    </StatsContainer>
  );
};

export default DashboardStats; 