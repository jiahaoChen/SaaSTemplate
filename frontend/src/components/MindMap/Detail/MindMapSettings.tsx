import {
  Box,
  Flex,
  Heading,
  Input,
  Text,
} from "@chakra-ui/react"
import { useState } from "react"
import { mindmapTheme } from "../../../theme/mindmap"
import { Field } from "@/components/ui/field"

interface MindMapSettingsProps {
  mindMapId: string
}

interface Settings {
  title: string
  description: string
  visibility: string
  allowComments: boolean
  allowDuplication: boolean
  theme: string
  tags: string[]
}

const MindMapSettings: React.FC<MindMapSettingsProps> = ({ mindMapId }) => {
  console.log('MindMapSettings for ID:', mindMapId); // Use the parameter to avoid TS error
  const [settings, setSettings] = useState<Settings>({
    title: "",
    description: "",
    visibility: "public",
    allowComments: true,
    allowDuplication: true,
    theme: "default",
    tags: [],
  })

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setSettings(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target
    setSettings(prev => ({
      ...prev,
      [name]: checked,
    }))
  }

  return (
    <Box>
      <Box my={6}>
        <Heading as="h3" size="md" mb={4} color={mindmapTheme.colors.dark}>
          權限設置
        </Heading>

        <Field label="可見性">
          <Input
            as="select"
            name="visibility"
            value={settings.visibility}
            onChange={handleInputChange}
          >
            <option value="public">公開</option>
            <option value="private">私人</option>
            <option value="unlisted">不公開</option>
          </Input>
        </Field>

        <Flex align="center" mb={4}>
          <Text fontWeight="bold" mr={4}>允許評論</Text>
          <Input
            type="checkbox"
            name="allowComments"
            checked={settings.allowComments}
            onChange={handleCheckboxChange}
            width="auto"
          />
        </Flex>

        <Flex align="center" mb={4}>
          <Text fontWeight="bold" mr={4}>允許複製</Text>
          <Input
            type="checkbox"
            name="allowDuplication"
            checked={settings.allowDuplication}
            onChange={handleCheckboxChange}
            width="auto"
          />
        </Flex>
      </Box>
    </Box>
  )
}

export default MindMapSettings