import React from "react";
import { Box, Flex, Icon, Text } from "@chakra-ui/react";
import { FaQuoteLeft, FaStar } from "react-icons/fa";
import { mindmapTheme } from "../../../theme/mindmap";

// Define the interface for Avatar props
interface AvatarProps {
  src: string;
  size?: "sm" | "md" | "lg";
  mr?: number | string;
}

// Create a custom Avatar component
const Avatar: React.FC<AvatarProps> = ({ src, size = "md", mr }) => {
  return (
    <Box
      width={size === "md" ? "48px" : size === "lg" ? "56px" : "36px"}
      height={size === "md" ? "48px" : size === "lg" ? "56px" : "36px"}
      borderRadius="full"
      backgroundImage={`url(${src})`}
      backgroundSize="cover"
      backgroundPosition="center"
      mr={mr}
    />
  );
};

interface TestimonialProps {
  content: string;
  author: string;
  role: string;
  avatarSrc: string;
  rating: number;
}

const Testimonial: React.FC<TestimonialProps> = ({
  content,
  author,
  role,
  avatarSrc,
  rating,
}) => {
  return (
    <Box
      bg="white"
      p={6}
      borderRadius={mindmapTheme.borderRadius}
      boxShadow={mindmapTheme.shadow}
      position="relative"
      transition={mindmapTheme.transition}
      _hover={{
        transform: "translateY(-5px)",
        boxShadow: "xl",
      }}
    >
      <Icon
        as={FaQuoteLeft}
        color={mindmapTheme.colors.primaryLight}
        fontSize="2xl"
        position="absolute"
        top={4}
        left={4}
        opacity={0.3}
      />
      <Box pt={8} pb={4}>
        <Text color={mindmapTheme.colors.grayDark} fontSize="md" lineHeight="1.7">
          {content}
        </Text>
      </Box>
      <Flex mt={4} align="center" justify="space-between">
        <Flex align="center">
          <Avatar src={avatarSrc} size="md" mr={3} />
          <Box>
            <Text fontWeight="bold" color={mindmapTheme.colors.dark}>
              {author}
            </Text>
            <Text fontSize="sm" color={mindmapTheme.colors.grayDark}>
              {role}
            </Text>
          </Box>
        </Flex>
        <Flex>
          {[...Array(5)].map((_, i) => (
            <Icon
              key={i}
              as={FaStar}
              color={i < rating ? mindmapTheme.colors.warning : "gray.200"}
              ml={1}
            />
          ))}
        </Flex>
      </Flex>
    </Box>
  );
};

export default Testimonial; 