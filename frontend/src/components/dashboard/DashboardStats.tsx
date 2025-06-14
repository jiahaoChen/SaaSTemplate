import React from "react";
import { Box, Grid, Flex, Text, Icon, Spinner, Center } from "@chakra-ui/react";
import { FaSitemap, FaDatabase, FaChartLine, FaArrowUp, FaExclamationTriangle } from "react-icons/fa";
import { colors, shadows } from "../../theme/tokens";
import { useColorModeValue } from "@/components/ui/color-mode";
import { useItemStats } from "../../hooks/useItemStats";
import useLanguage from "@/hooks/useLanguage";

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
  icon,
  iconBg,
  iconColor,
  trend,
  progress,
}) => {
  const cardBg = useColorModeValue("white", "gray.800");
  const cardBorder = useColorModeValue("gray.100", "gray.700");
  const titleColor = useColorModeValue("gray.800", "white");
  const descriptionColor = useColorModeValue("gray.500", "gray.400");
  const valueColor = useColorModeValue("gray.800", "white");
  const progressBg = useColorModeValue("gray.100", "gray.600");
  const { t } = useLanguage();

  return (
    <Box
      bg={cardBg}
      borderRadius="lg"
      p={5}
      boxShadow={shadows.sm}
      borderWidth="1px"
      borderColor={cardBorder}
      transition="transform 0.3s, box-shadow 0.3s"
      _hover={{
        transform: "translateY(-5px)",
        boxShadow: "md",
      }}
    >
      <Flex mb={5} justify="space-between" align="start">
        <Flex direction="column">
          <Text fontWeight="600" fontSize="sm" mb={1} color={titleColor}>
            {title}
          </Text>
          <Text fontSize="xs" color={descriptionColor}>
            {description}
          </Text>
        </Flex>
        <Flex
          bg={iconBg}
          color={iconColor}
          p={2}
          borderRadius="md"
          boxSize="40px"
          align="center"
          justify="center"
        >
          <Icon as={icon} boxSize={5} />
        </Flex>
      </Flex>

      <Flex align="baseline">
        <Text fontSize="2xl" fontWeight="700" mr={1} color={valueColor}>
          {value}
        </Text>
        {unit && (
          <Text fontSize="sm" color={descriptionColor} fontWeight="medium">
            {unit}
          </Text>
        )}
      </Flex>

      {trend && (
        <Flex mt={2} align="center">
          <Icon
            as={FaArrowUp}
            color={trend.color}
            boxSize={3}
            transform={trend.isUp ? "rotate(0deg)" : "rotate(180deg)"}
            mr={1}
          />
          <Text color={trend.color} fontSize="xs" fontWeight="medium">
            {trend.value}
          </Text>
        </Flex>
      )}

      {progress && (
        <Box mt={3}>
          <Flex justify="space-between" mb={1}>
            <Text fontSize="xs" color={descriptionColor} fontWeight="medium">
              {t("dashboard.usage", "使用量")}
            </Text>
            <Text fontSize="xs" color={descriptionColor} fontWeight="medium">
              {progress.value}/{progress.max}
            </Text>
          </Flex>
          <Box bg={progressBg} borderRadius="full" h="4px" overflow="hidden">
            <Box
              bg={progress.color}
              h="100%"
              borderRadius="full"
              w={`${(progress.value / progress.max) * 100}%`}
            />
          </Box>
        </Box>
      )}
    </Box>
  );
};

const DashboardStats: React.FC = () => {
  const { data: stats, isLoading, error } = useItemStats();
  const { t } = useLanguage();

  if (isLoading) {
    return (
      <Center py={10}>
        <Spinner size="xl" color={colors.primary[500]} />
      </Center>
    );
  }

  if (error || !stats) {
    return (
      <Flex 
        direction="column" 
        align="center" 
        justify="center" 
        py={10}
      >
        <Icon as={FaExclamationTriangle} color="red.500" boxSize={10} mb={4} />
        <Text color="red.500">{t("dashboard.statsLoadFailed", "無法載入統計資料")}</Text>
      </Flex>
    );
  }

  return (
    <Box mb={8}>
      <Grid
        templateColumns={{ base: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" }}
        gap={5}
      >
        <StatCard
          title={t("dashboard.totalItems", "Total Items")}
          description={t("dashboard.allCreatedItems", "All created items")}
          value={stats.totalItems}
          icon={FaSitemap}
          iconBg={colors.primary[50]}
          iconColor={colors.primary[500]}
          trend={{
            isUp: true,
            value: `${t("dashboard.total", "Total")} ${stats.totalItems} ${t("dashboard.itemsUnit", "items")}`,
            color: colors.success,
          }}
        />

        <StatCard
          title={t("dashboard.usedSpace", "Used Space")}
          description={t("dashboard.totalItemCapacity", "Total item capacity")}
          value={stats.totalItems}
          unit={`/${stats.maxItems}`}
          icon={FaDatabase}
          iconBg="rgba(246, 173, 85, 0.2)"
          iconColor={colors.warning}
          progress={{
            value: stats.totalItems,
            max: stats.maxItems,
            color: colors.warning,
          }}
        />

        <StatCard
          title={t("dashboard.monthlyUsage", "Monthly Usage")}
          description={`${t("dashboard.thisMonthGenerated", "Generated this month")} ${stats.currentMonthItems} ${t("dashboard.itemsUnit", "items")}`}
          value={stats.currentMonthItems}
          icon={FaChartLine}
          iconBg="rgba(72, 187, 120, 0.2)"
          iconColor={colors.success}
          progress={{
            value: stats.currentMonthItems,
            max: 50,
            color: colors.success,
          }}
        />

        {/* <StatCard
          title={t("dashboard.shared", "已分享")}
          description={t("dashboard.sharedMindmapsCount", "已分享的思維導圖數量")}
          value={8}
          icon={FaShareAlt}
          iconBg="rgba(255, 108, 135, 0.2)"
          iconColor={colors.secondary[400]}
          trend={{
            isUp: true,
            value: t("dashboard.increasedFromLastMonth", "較上個月增加 {{count}} 個", { count: 2 }),
            color: colors.secondary[400],
          }}
        /> */}
      </Grid>
    </Box>
  );
};

export default DashboardStats; 