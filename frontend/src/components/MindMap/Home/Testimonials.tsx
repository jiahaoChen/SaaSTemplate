import {
  Box,
  Container,
  Flex,
  Heading,
  Text,
} from "@chakra-ui/react"
import { mindmapTheme } from "../../../theme/mindmap"
import TestimonialComponent from "./Testimonial"

const Testimonials = () => {
  const testimonials = [
    {
      content:
        "這個工具徹底改變了我學習線上課程的方式。現在我可以快速理解複雜的視頻內容，並且記憶效果提升了至少50%。",
      author: "陳小明",
      role: "大學生",
      avatarSrc: "https://randomuser.me/api/portraits/men/32.jpg",
      rating: 5,
    },
    {
      content:
        "作為一名教師，我使用這個工具來幫助學生更好地理解教學視頻。思維導圖的視覺化效果讓抽象概念變得具體可見。",
      author: "林老師",
      role: "高中教師",
      avatarSrc: "https://randomuser.me/api/portraits/women/44.jpg",
      rating: 4,
    },
    {
      content:
        "我用它來學習技術視頻，AI生成的思維導圖準確捕捉了關鍵點，讓我節省了大量做筆記的時間。絕對值得推薦！",
      author: "王工程師",
      role: "軟體開發者",
      avatarSrc: "https://randomuser.me/api/portraits/men/67.jpg",
      rating: 5,
    },
  ]

  return (
    <Box py={16} bg="white">
      <Container maxW="1200px">
        <Box textAlign="center" mb={16}>
          <Heading
            as="h2"
            size="xl"
            mb={4}
            color={mindmapTheme.colors.dark}
          >
            用戶怎麼說
          </Heading>
          <Text
            fontSize="lg"
            color={mindmapTheme.colors.grayDark}
            maxW="700px"
            mx="auto"
          >
            來自各行各業的用戶分享他們使用YouTube思維導圖的體驗
          </Text>
        </Box>

        <Flex
          direction={{ base: "column", lg: "row" }}
          align="stretch"
          justify="center"
          gap={8}
        >
          {testimonials.map((testimonial, index) => (
            <Box key={index} flex="1">
              <TestimonialComponent {...testimonial} />
            </Box>
          ))}
        </Flex>
      </Container>
    </Box>
  )
}

export default Testimonials 