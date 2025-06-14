import {
  Box,
  Button,
  Container,
  Flex,
  Grid,
  Heading,
  Icon,
  Input,
  Text,
} from "@chakra-ui/react"
 
import React, { useState, useEffect, useRef } from "react"
import {
  FaYoutube,
  FaCheck,
  FaCircle,
  FaDownload,
  FaShareAlt,
  FaSave,
  FaCog,
  FaExclamationTriangle,
} from "react-icons/fa"
import { Link } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"
import { mindmapTheme } from "../../../theme/mindmap"
import { colors } from "../../../theme/tokens"
import { useColorModeValue } from "@/components/ui/color-mode"
// Import the API client and types
import { MindmapsService, OpenAPI, MindmapsCreateMindmapData, MindMapPublic } from "../../../client"
// Import markmap libraries
// @ts-ignore - These packages are installed according to the user
import { Transformer } from 'markmap-lib'
// @ts-ignore - These packages are installed according to the user
import { Markmap } from 'markmap-view'
// Import our custom markmap CSS
import '../../../styles/markmap.css'
import MindMapDetail from "../Detail/MindMapDetail"
import useAuth from "../../../hooks/useAuth"
import { UserPublic } from "../../../client/types.gen"
import useAnalytics from "../../../hooks/useAnalytics"

// Extended UserPublic interface to include gemini_api_key
interface ExtendedUserPublic extends UserPublic {
  gemini_api_key?: string;
}

// Extend MindMapPublic type to include status and error fields
interface MindMapResponse extends MindMapPublic {
  status?: string;
  error?: string;
  error_detail?: string;
  processing_stage?: string;
  title?: string; // For display during processing
  channel?: string; // For display during processing
}

// Configure the OpenAPI instance
OpenAPI.BASE = "http://0.0.0.0:8000"
OpenAPI.WITH_CREDENTIALS = true
OpenAPI.CREDENTIALS = "include"

// Add custom request interceptor to log requests
OpenAPI.interceptors.request.use((config) => {
  console.log('API Request:', config.url, config.method, config.data);
  return config;
});

// Add custom response interceptor to log responses and errors
OpenAPI.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.config.url);
    return response;
  }
);

enum CreateSteps {
  INPUT_URL = 0,
  PROCESSING = 1,
  COMPLETE = 2,
}

// 在文件頂部添加樣式
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.innerHTML = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    /* Markmap styling */
    .markmap-wrapper {
      width: 100%;
      height: 100%;
      position: relative;
    }
    
    .markmap-svg {
      width: 100%;
      height: 100%;
      cursor: grab;
    }
    
    .markmap-svg:active {
      cursor: grabbing;
    }
    
    .markmap-node {
      cursor: pointer;
      transition: all 0.3s ease;
    }
    
    .markmap-node:hover {
      filter: brightness(1.2);
    }
    
    .markmap-node-text {
      fill: #333;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    }
    
    .markmap-node-circle {
      stroke-width: 1.5;
    }
    
    .markmap-link {
      fill: none;
    }
    
    /* Additional markmap styles to replace the removed CSS import */
    .markmap-foreign {
      display: inline-block;
    }
    
    .markmap-foreign a {
      color: #0097e6;
      text-decoration: none;
    }
    
    .markmap-foreign a:hover {
      text-decoration: underline;
    }
    
    .markmap-foreign code {
      font-family: SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace;
      background: rgba(0, 0, 0, 0.07);
      padding: 2px 4px;
      border-radius: 3px;
    }
    
    .markmap-foreign pre {
      background: rgba(0, 0, 0, 0.07);
      padding: 0.5em;
      border-radius: 3px;
    }
  `;
  document.head.appendChild(style);
}

const CreateMindMap: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth() as { user: ExtendedUserPublic | null };
  const { 
    trackMindmapCreateStart, 
    trackMindmapCreateSuccess, 
    trackMindmapCreateError,
    trackVideoAnalysisRequest 
  } = useAnalytics();
  const [url, setUrl] = useState("")
  const [currentStep, setCurrentStep] = useState<CreateSteps>(
    CreateSteps.INPUT_URL
  )
  const [processingProgress, setProcessingProgress] = useState(0)
  const [processingStatus, setProcessingStatus] = useState(t("mindmap.preparation"))
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState("mindmap")
  const [mindmapData, setMindmapData] = useState<MindMapResponse | null>(null)
  const [error, setError] = useState("")
  const [showApiKeyError, setShowApiKeyError] = useState(false)
  
  // Form state
  const [language, setLanguage] = useState("auto")
  const [detailLevel, setDetailLevel] = useState("medium")
  
  // Reference for markmap SVG element
  const markmapRef = useRef<SVGSVGElement>(null)
  const markmapInstanceRef = useRef<any>(null)
  const transformer = useRef(new Transformer())

  // Initialize and update markmap when data changes
  useEffect(() => {
    if (markmapRef.current && mindmapData?.markmap && activeTab === 'mindmap') {
      // Clean old markmap if exists
      if (markmapInstanceRef.current) {
        // Clear the existing SVG contents
        while (markmapRef.current.firstChild) {
          markmapRef.current.removeChild(markmapRef.current.firstChild)
        }
      }

      try {
        // Parse the markdown content
        let markdown = mindmapData.markmap
        
        // If content is wrapped in ```markmap, remove it
        if (markdown.startsWith('```markmap')) {
          markdown = markdown.replace(/^```markmap\n/, '').replace(/```$/, '')
        }
        
        // Clean any other markdown code block formatting
        if (markdown.startsWith('```')) {
          markdown = markdown.replace(/^```(?:markdown)?\n/, '').replace(/```$/, '')
        }
        
        // Trim any extra whitespace
        markdown = markdown.trim()
        
        // Transform markdown to markmap data
        const { root } = transformer.current.transform(markdown)
        
        // Create the markmap
        markmapInstanceRef.current = Markmap.create(markmapRef.current, {
          autoFit: true, 
          zoom: true,
          color: (node: any) => {
            // Use different colors based on depth
            const colors = [
              mindmapTheme.colors.primary,
              mindmapTheme.colors.secondary,
              '#6c5ce7',
              '#00cec9',
              '#e84393',
              '#fdcb6e'
            ];
            return colors[node.depth % colors.length];
          },
          duration: 500, // animation duration
          maxWidth: 300, // max node width
          nodeMinHeight: 16, // minimum node height
          spacingHorizontal: 80, // horizontal spacing between nodes
          spacingVertical: 12, // vertical spacing between nodes
          paddingX: 8, // horizontal padding for node content
        }, root)
      } catch (error) {
        console.error('Error rendering markmap:', error)
      }
    }
  }, [mindmapData?.markmap, activeTab])

  // Map detail level to backend level parameter
  const mapDetailLevelToBackendLevel = (level: string): number => {
    switch (level) {
      case "high":
        return 5;
      case "medium":
        return 3;
      case "low":
        return 1;
      default:
        return 3;
    }
  }

  // Map frontend language to backend language code
  const mapLanguageToBackendCode = (lang: string): string => {
    // If auto is selected, default to 'en'
    if (lang === "auto") return "en";
    
    // Map the specific Chinese variants to their language codes
    if (lang === "zh-CN") return "zh-CN";
    if (lang === "zh-TW") return "zh-TW";
    
    return lang;
  }

  // Function to poll the mindmap status - accept an optional parameter
  const pollMindmapStatus = async (mindmapId: number | undefined): Promise<boolean> => {
    if (!mindmapId) {
      console.error("No mindmap ID provided for polling");
      return false;
    }

    try {
      // Fetch updated mindmap data
      const updatedData = await MindmapsService.readMindmap({ mindmapId });
      const mindmapResponse = updatedData as MindMapResponse;
      
      // Update our local state with the latest data
      setMindmapData(mindmapResponse);
      
      // Determine if processing is complete based on markmap content
      const hasMarkmap = typeof mindmapResponse.markmap === 'string' && 
                          mindmapResponse.markmap.length > 0 && 
                          !mindmapResponse.markmap.startsWith('Error');
                          
      // If we have markmap content, consider it complete
      if (hasMarkmap) {
        setCurrentStep(CreateSteps.COMPLETE);
        setProcessingProgress(100);
        setProcessingStatus(t("mindmap.complete"));
        setIsSubmitting(false);
        
        // Track successful mindmap creation
        if (mindmapResponse.id && mindmapResponse.youtube_video_id) {
          trackMindmapCreateSuccess(
            mindmapResponse.youtube_video_id, 
            mindmapResponse.id.toString()
          );
        }
        
        return true;
      }
      
      // If there's an error, show it
      if (mindmapResponse.markmap && mindmapResponse.markmap.startsWith('Error')) {
        // Extract the error message from the markmap string
        const errorMessage = mindmapResponse.markmap.replace('Error: ', '');
        
        // Check for specific error types
        if (errorMessage.includes('quota') || errorMessage.includes('429')) {
          // Quota error - show a more user-friendly message
          setError(t("mindmap.quotaError", { defaultValue: "API quota exceeded. Please try again later or update your API key in settings." }));
          
          // Track quota error
          if (mindmapResponse.youtube_video_id) {
            trackMindmapCreateError(mindmapResponse.youtube_video_id, 'quota_exceeded');
          }
        } else {
          // Generic error
          setError(errorMessage);
          
          // Track generic error
          if (mindmapResponse.youtube_video_id) {
            trackMindmapCreateError(mindmapResponse.youtube_video_id, 'processing_error');
          }
        }
        
        setIsSubmitting(false);
        setProcessingStatus(t("mindmap.failed"));
        return true;
      }
      
      // Update processing progress based on state or use predetermined steps
      const progress = getProcessingProgress(mindmapResponse.processing_stage);
      setProcessingProgress(progress);
      setProcessingStatus(getProcessingStatusText(mindmapResponse.processing_stage));
      
      return false; // Not done yet
    } catch (error) {
      console.error("Error polling mindmap status:", error);
      setError(t("common.error"));
      setIsSubmitting(false);
      return true; // Consider it done due to error
    }
  };

  // Helper to get processing progress percentage
  const getProcessingProgress = (stage?: string): number => {
    if (!stage) return 10;
    
    // Map stages to progress percentages
    switch (stage) {
      case 'fetching_video': return 15;
      case 'downloading_transcript': return 25;
      case 'processing_transcript': return 40;
      case 'generating_mindmap': return 60;
      case 'formatting_mindmap': return 80;
      case 'complete': return 100;
      default: return 10;
    }
  };
  
  // Helper to get status text for each processing stage
  const getProcessingStatusText = (stage?: string): string => {
    if (!stage) return t("mindmap.preparation");
    
    // Map stages to user-friendly messages
    switch (stage) {
      case 'fetching_video': return t("mindmap.fetchingVideo");
      case 'downloading_transcript': return t("mindmap.downloadingTranscript");
      case 'processing_transcript': return t("mindmap.processingTranscript");
      case 'generating_mindmap': return t("mindmap.generatingMindmap");
      case 'formatting_mindmap': return t("mindmap.formattingMindmap");
      case 'complete': return t("mindmap.complete");
      default: return t("mindmap.processing");
    }
  };

  // Helper to extract YouTube video ID from URL
  const extractYoutubeVideoId = (url: string): string | null => {
    // Regular expressions for various YouTube URL formats
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/|youtube\.com\/embed\/videoseries\?list=)([^#&?]*).*/,
      /(?:youtube\.com\/shorts\/)([^#&?]*).*/
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    
    return null;
  };

  // Function to create a mindmap through the API client
  const createMindmap = async () => {
    try {
      // Check if user has Gemini API key set
      if (!user?.gemini_api_key) {
        setShowApiKeyError(true)
        setIsSubmitting(false)
        return null
      }
      
      const level = mapDetailLevelToBackendLevel(detailLevel);
      const langCode = mapLanguageToBackendCode(language);
      
      // Extract video ID from URL
      const videoId = extractYoutubeVideoId(url);
      if (!videoId) {
        throw new Error(t("mindmap.enterYoutubeUrl"));
      }

      // Track the start of mindmap creation
      trackMindmapCreateStart(videoId);
      trackVideoAnalysisRequest(videoId);

      // Create mindmap request using the SDK client
      // The request structure should match MindmapsCreateMindmapData:
      // - level and language as query parameters
      // - requestBody containing the MindMapCreate object
      const requestData: MindmapsCreateMindmapData = {
        level: level,
        language: langCode,
        requestBody: {
          youtube_url: url,
          youtube_video_id: videoId,
          // The backend requires video_title to be non-empty
          video_title: `YouTube Video ${videoId}`, // This will likely be replaced by the backend with the actual title
        },
      };

      console.log('Sending mindmap create request:', requestData);
      
      const data = await MindmapsService.createMindmap(requestData);
      // Cast to MindMapResponse
      const mindmapResponse = data as MindMapResponse;
      setMindmapData(mindmapResponse);

      // Begin polling for mindmap status
      setCurrentStep(CreateSteps.PROCESSING);
      setProcessingProgress(10);
      setProcessingStatus(t("mindmap.downloadingTranscript"));

      // Get the mindmap ID
      const mindmapId = data.id;
      
      // Only proceed if we have a valid ID
      if (typeof mindmapId !== 'number') {
        setError(t("common.error"));
        setIsSubmitting(false);
        return null;
      }
      
      // Start polling for status updates
      const pollInterval = setInterval(() => {
        // Use an async IIFE inside the interval to properly handle the Promise
        (async () => {
          try {
            // Now TypeScript knows we can handle undefined
            const isDone = await pollMindmapStatus(mindmapId);
            if (isDone) {
              clearInterval(pollInterval);
            }
          } catch (error) {
            console.error("Error polling mindmap status:", error);
            clearInterval(pollInterval);
            setError(t("common.error"));
          }
        })();
      }, 3000);
      
      return data;
    } catch (error) {
      console.error("Error creating mindmap:", error);
      setError(error instanceof Error ? error.message : t("common.error"));
      setIsSubmitting(false);
      return null;
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset errors
    setError("");
    setShowApiKeyError(false);
    
    // Check for API key first
    if (!user?.gemini_api_key) {
      setShowApiKeyError(true);
      return;
    }
    
    if (!url) {
      setError(t("mindmap.enterYoutubeUrl"));
      return;
    }
    
    // Validate URL is a YouTube link
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;
    if (!youtubeRegex.test(url)) {
      setError(t("mindmap.enterYoutubeUrl"));
      return;
    }
    
    setIsSubmitting(true);
    await createMindmap();
  }
  
  // 步驟指示器
  const StepIndicator = () => {
    const progressWidth = 
      currentStep === CreateSteps.INPUT_URL 
        ? "0%" 
        : currentStep === CreateSteps.PROCESSING 
          ? "33%" 
          : "100%";
          
    const inactiveBg = useColorModeValue("white", "gray.700");
    const inactiveColor = useColorModeValue(mindmapTheme.colors.grayDark, "gray.400");
    const inactiveBorder = useColorModeValue(mindmapTheme.colors.gray, "gray.600");
    const primaryColor = useColorModeValue(mindmapTheme.colors.primary, colors.primary[400]);
    const trackBg = useColorModeValue(mindmapTheme.colors.gray, "gray.600");

    return (
      <Box position="relative" mb={10}>
        <Flex justify="space-between" position="relative" zIndex={2}>
          <Flex direction="column" align="center" width="33.333%">
            <Flex
              align="center"
              justify="center"
              width="50px"
              height="50px"
              borderRadius="50%"
              bg={currentStep >= CreateSteps.INPUT_URL ? primaryColor : inactiveBg}
              border={`2px solid ${currentStep >= CreateSteps.INPUT_URL ? primaryColor : inactiveBorder}`}
              color={currentStep >= CreateSteps.INPUT_URL ? "white" : inactiveColor}
              fontWeight="700"
              fontSize="1.2rem"
              mb={2}
              transition={mindmapTheme.transition}
            >
              {currentStep > CreateSteps.INPUT_URL ? <Icon as={FaCheck} /> : "1"}
            </Flex>
            <Text
              fontWeight="600"
              color={currentStep >= CreateSteps.INPUT_URL ? primaryColor : inactiveColor}
              transition={mindmapTheme.transition}
            >
              {t("mindmap.enterYoutubeUrl")}
            </Text>
          </Flex>
          
          <Flex direction="column" align="center" width="33.333%">
            <Flex
              align="center"
              justify="center"
              width="50px"
              height="50px"
              borderRadius="50%"
              bg={currentStep >= CreateSteps.PROCESSING ? primaryColor : inactiveBg}
              border={`2px solid ${currentStep >= CreateSteps.PROCESSING ? primaryColor : inactiveBorder}`}
              color={currentStep >= CreateSteps.PROCESSING ? "white" : inactiveColor}
              fontWeight="700"
              fontSize="1.2rem"
              mb={2}
              transition={mindmapTheme.transition}
            >
              {currentStep > CreateSteps.PROCESSING ? <Icon as={FaCheck} /> : "2"}
            </Flex>
            <Text
              fontWeight="600"
              color={currentStep >= CreateSteps.PROCESSING ? primaryColor : inactiveColor}
              transition={mindmapTheme.transition}
            >
              {t("mindmap.processing")}
            </Text>
          </Flex>
          
          <Flex direction="column" align="center" width="33.333%">
            <Flex
              align="center"
              justify="center"
              width="50px"
              height="50px"
              borderRadius="50%"
              bg={currentStep >= CreateSteps.COMPLETE ? primaryColor : inactiveBg}
              border={`2px solid ${currentStep >= CreateSteps.COMPLETE ? primaryColor : inactiveBorder}`}
              color={currentStep >= CreateSteps.COMPLETE ? "white" : inactiveColor}
              fontWeight="700"
              fontSize="1.2rem"
              mb={2}
              transition={mindmapTheme.transition}
            >
              {currentStep > CreateSteps.COMPLETE ? <Icon as={FaCheck} /> : "3"}
            </Flex>
            <Text
              fontWeight="600"
              color={currentStep >= CreateSteps.COMPLETE ? primaryColor : inactiveColor}
              transition={mindmapTheme.transition}
            >
              {t("mindmap.create")}
            </Text>
          </Flex>
        </Flex>
        
        {/* 步驟進度條 */}
        <Box 
          position="absolute" 
          top="24px" 
          left="0" 
          right="0" 
          height="2px" 
          bg={trackBg} 
          zIndex={1}
        />
        <Box 
          position="absolute" 
          top="24px" 
          left="0" 
          height="2px" 
          bg={primaryColor} 
          zIndex={1}
          width={progressWidth}
          transition="width 0.5s ease"
        />
      </Box>
    );
  };

  // 處理步驟項目
  const ProcessStep = ({ 
    status, 
    label 
  }: { 
    status: "completed" | "in-progress" | "pending", 
    label: string 
  }) => {
    const stepBg = useColorModeValue(mindmapTheme.colors.light, "gray.700");
    const textColor = useColorModeValue("gray.800", "white");
    
    return (
      <Flex 
        align="center" 
        mb={3} 
        py={2} 
        px={3} 
        borderRadius={mindmapTheme.borderRadius} 
        bg={stepBg}
      >
        <Flex
          align="center"
          justify="center"
          width="30px"
          height="30px"
          borderRadius="50%"
          mr={4}
          bg={
            status === "completed" 
              ? `rgba(72, 187, 120, 0.2)` 
              : status === "in-progress" 
                ? `rgba(120, 86, 255, 0.2)` 
                : `rgba(113, 128, 150, 0.2)`
          }
          color={
            status === "completed" 
              ? mindmapTheme.colors.success 
              : status === "in-progress" 
                ? mindmapTheme.colors.primary
                : mindmapTheme.colors.grayDark
          }
        >
          {status === "completed" ? (
            <Icon as={FaCheck} />
          ) : status === "in-progress" ? (
            <Box 
              width="18px" 
              height="18px" 
              borderRadius="50%" 
              border="2px solid" 
              borderColor="currentColor" 
              borderTopColor="transparent"
              style={{ animation: "spin 1s linear infinite" }}
            />
          ) : (
            <Icon as={FaCircle} fontSize="10px" />
          )}
        </Flex>
        <Text color={textColor}>{label}</Text>
      </Flex>
    );
  };

  // When the mindmap is complete, update the UI with actual data
  useEffect(() => {
    if (mindmapData && currentStep === CreateSteps.COMPLETE) {
      // Set the active tab to mindmap by default when data is available
      setActiveTab("mindmap");
    }
  }, [mindmapData, currentStep]);

  // Refresh markmap when switching to the mindmap tab
  useEffect(() => {
    if (activeTab === "mindmap" && mindmapData?.markmap && markmapRef.current) {
      // This will trigger our main markmap rendering effect
      if (markmapInstanceRef.current) {
        // Force a refresh
        let markdown = mindmapData.markmap;
        
        // Process markdown the same way as in the rendering logic
        if (markdown.startsWith('```markmap')) {
          markdown = markdown.replace(/^```markmap\n/, '').replace(/```$/, '')
        }
        
        // Clean any other markdown code block formatting
        if (markdown.startsWith('```')) {
          markdown = markdown.replace(/^```(?:markdown)?\n/, '').replace(/```$/, '')
        }
        
        // Trim any extra whitespace
        markdown = markdown.trim();
        
        const { root } = transformer.current.transform(markdown);
        markmapInstanceRef.current.setData(root);
        markmapInstanceRef.current.fit();
      }
    }
  }, [activeTab]);
  
  const renderStepContent = () => {
    switch (currentStep) {
      case CreateSteps.INPUT_URL:
        return (
          <Flex direction="column" w="100%" maxW="800px" mx="auto" p={6}>
            {showApiKeyError && (
              <Box mb={4} p={4} borderRadius="md" bg="red.50" borderColor="red.300" borderWidth="1px">
                <Flex>
                  <Icon as={FaExclamationTriangle} color="red.500" boxSize={5} mr={3} mt={1} />
                  <Box flex="1">
                    <Heading as="h3" size="sm" color="red.600">{t("mindmap.apiKeyRequired")}</Heading>
                    <Text mt={1}>
                      {t("mindmap.apiKeyMissing")}{" "}
                      <Link to="/settings" style={{ color: "blue", fontWeight: "bold" }}>
                        {t("dashboard.settings")}
                      </Link>
                      {" "}{t("mindmap.toSetApiKey")}
                    </Text>
                  </Box>
                </Flex>
              </Box>
            )}

            {error && (
              <Box mb={4} p={4} borderRadius="md" bg="red.50" borderColor="red.300" borderWidth="1px">
                <Flex>
                  <Icon as={FaExclamationTriangle} color="red.500" boxSize={5} mr={3} mt={1} />
                  <Box flex="1">
                    <Heading as="h3" size="sm" color="red.600">{t("mindmap.error")}</Heading>
                    <Text mt={1}>{error}</Text>
                  </Box>
                </Flex>
              </Box>
            )}
            
            <Box
              bg={useColorModeValue("white", "gray.800")}
              p={6}
              borderRadius={mindmapTheme.borderRadius}
              boxShadow={useColorModeValue(mindmapTheme.shadow, "dark-lg")}
              mb={8}
              borderWidth="1px"
              borderColor={useColorModeValue("gray.200", "gray.700")}
            >              
              <form onSubmit={handleSubmit}>
                <Box mb={6}>
                  <Text fontWeight="bold" mb={2} color={useColorModeValue("gray.800", "white")}>{t("mindmap.youtubeUrl")}</Text>
                  <Flex>
                    <Input
                      type="url"
                      placeholder={t("mindmap.enterYoutubeUrl")}
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      required
                      flex="1"
                      borderRightRadius="0"
                      borderColor={useColorModeValue("gray.200", "gray.600")}
                      bg={useColorModeValue("white", "gray.700")}
                      _focus={{
                        borderColor: mindmapTheme.colors.primary,
                        boxShadow: "0 0 0 1px " + mindmapTheme.colors.primary
                      }}
                    />
                    <Button
                      type="submit"
                      colorScheme="purple"
                      borderLeftRadius="0"
                      disabled={isSubmitting}
                      bg={mindmapTheme.colors.primary}
                      _hover={{ bg: mindmapTheme.colors.primaryDark }}
                    >
                      {isSubmitting ? t("common.loading") : t("mindmap.analyzing")}
                    </Button>
                  </Flex>
                  <Text fontSize="xs" color={useColorModeValue("gray.500", "gray.400")} mt={1}>
                    {t("mindmap.pasteYoutubeLink")}
                  </Text>
                </Box>
                
                <Box mb={6}>
                  <Text fontWeight="bold" mb={2} color={useColorModeValue("gray.800", "white")}>{t("mindmap.customOptions")}</Text>
                  
                  <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={5} mt={4}>
                    <Box>
                      <Text fontSize="sm" mb={1} color={useColorModeValue("gray.700", "gray.300")}>{t("mindmap.language")}</Text>
                      <Box
                        width="100%"
                        borderRadius={mindmapTheme.borderRadius}
                        border="1px solid"
                        borderColor={useColorModeValue("gray.200", "gray.600")}
                        _focus={{ borderColor: mindmapTheme.colors.primary }}
                        bg={useColorModeValue("white", "gray.700")}
                      >
                        <select
                          style={{ 
                            width: "100%", 
                            padding: "12px 16px", 
                            borderRadius: mindmapTheme.borderRadius, 
                            border: "none", 
                            outline: "none",
                            backgroundColor: "transparent",
                            color: "inherit"
                          }}
                          value={language}
                          onChange={(e) => setLanguage(e.target.value)}
                        >
                          <option value="auto">{t("mindmap.autoDetect")}</option>
                          <option value="zh-CN">{t("mindmap.chineseSimplified")}</option>
                          <option value="zh-TW">{t("mindmap.chineseTraditional")}</option>
                          <option value="en">{t("mindmap.english")}</option>
                          <option value="ja">{t("mindmap.japanese")}</option>
                          <option value="ko">{t("mindmap.korean")}</option>
                          <option value="fr">{t("mindmap.french")}</option>
                          <option value="de">{t("mindmap.german")}</option>
                        </select>
                      </Box>
                    </Box>
                    
                    <Box>
                      <Text fontSize="sm" mb={1} color={useColorModeValue("gray.700", "gray.300")}>{t("mindmap.detailLevel")}</Text>
                      <Box
                        width="100%"
                        borderRadius={mindmapTheme.borderRadius}
                        border="1px solid"
                        borderColor={useColorModeValue("gray.200", "gray.600")}
                        _focus={{ borderColor: mindmapTheme.colors.primary }}
                        bg={useColorModeValue("white", "gray.700")}
                      >
                        <select
                          style={{ 
                            width: "100%", 
                            padding: "12px 16px", 
                            borderRadius: mindmapTheme.borderRadius, 
                            border: "none", 
                            outline: "none",
                            backgroundColor: "transparent",
                            color: "inherit"
                          }}
                          value={detailLevel}
                          onChange={(e) => setDetailLevel(e.target.value)}
                        >
                          <option value="high">{t("mindmap.high")}</option>
                          <option value="medium">{t("mindmap.medium")}</option>
                          <option value="low">{t("mindmap.low")}</option>
                        </select>
                      </Box>
                    </Box>
                  </Grid>
                </Box>
              </form>
            </Box>
          </Flex>
        )

      case CreateSteps.PROCESSING: {
        // Get the YouTube video ID from URL for display
        const getVideoIdFromUrl = (url: string) => {
          const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
          const match = url.match(regExp);
          return (match && match[7].length === 11) ? match[7] : null;
        };
        
        const videoId = getVideoIdFromUrl(url);
        const videoThumbnail = videoId 
          ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` 
          : null;
        
        // Define processing steps based on current status
        const getProcessingSteps = () => {
          const steps = [
            { label: t("mindmap.fetchingVideo"), status: "completed" },
            { label: t("mindmap.downloadingTranscript"), status: processingProgress >= 30 ? "completed" : processingProgress >= 10 ? "in-progress" : "pending" },
            { label: t("mindmap.processingTranscript"), status: processingProgress >= 70 ? "completed" : processingProgress >= 30 ? "in-progress" : "pending" },
            { label: t("mindmap.generatingMindmap"), status: processingProgress >= 90 ? "completed" : processingProgress >= 70 ? "in-progress" : "pending" },
          ];
          
          return steps;
        };
        
        const processingSteps = getProcessingSteps();
        
        return (
          <Box
            bg={useColorModeValue("white", "gray.800")}
            p={6}
            borderRadius={mindmapTheme.borderRadius}
            boxShadow={useColorModeValue(mindmapTheme.shadow, "dark-lg")}
            textAlign="center"
            borderWidth="1px"
            borderColor={useColorModeValue("gray.200", "gray.700")}
          >
            <Heading as="h2" size="lg" mb={6} color={useColorModeValue("gray.800", "white")}>
              {error ? t("mindmap.processingFailed") : t("mindmap.processingVideo")}
            </Heading>
            
            <Box maxW="600px" mx="auto">
              <Flex align="center" mb={6}>
                {videoThumbnail ? (
                  <Box 
                    width="120px" 
                    height="68px" 
                    mr={5} 
                    borderRadius="md" 
                    overflow="hidden"
                    backgroundImage={`url(${videoThumbnail})`}
                    backgroundSize="cover"
                    backgroundPosition="center"
                  />
                ) : (
                  <Box width="120px" height="68px" mr={5} bg={useColorModeValue("gray.200", "gray.600")} borderRadius="md" display="flex" alignItems="center" justifyContent="center">
                    <Icon as={FaYoutube} color="red.500" fontSize="xl" />
                  </Box>
                )}
                <Box textAlign="left">
                  <Text fontWeight="500" fontSize="md" color={useColorModeValue("gray.800", "white")}>
                    {mindmapData?.video_title || t("mindmap.processingVideo")}
                  </Text>
                  <Text fontSize="sm" color={useColorModeValue(mindmapTheme.colors.grayDark, "gray.400")}>
                    {mindmapData?.youtube_url || url}
                  </Text>
                </Box>
              </Flex>
              
              {error ? (
                <Box 
                  mb={6} 
                  p={4} 
                  borderRadius="md" 
                  bg={useColorModeValue("red.50", "red.900")} 
                  borderWidth="1px" 
                  borderColor={useColorModeValue("red.200", "red.700")}
                >
                  <Flex align="center" mb={2}>
                    <Icon as={FaExclamationTriangle} color={useColorModeValue("red.500", "red.300")} mr={2} />
                    <Text fontWeight="bold" color={useColorModeValue("red.600", "red.300")}>
                      {t("mindmap.errorOccurred")}
                    </Text>
                  </Flex>
                  <Text color={useColorModeValue("red.600", "red.300")} fontSize="sm" textAlign="left">
                    {error}
                  </Text>
                  <Button 
                    mt={4} 
                    colorScheme="red" 
                    size="sm" 
                    onClick={() => {
                      setCurrentStep(CreateSteps.INPUT_URL);
                      setError("");
                      setIsSubmitting(false);
                    }}
                  >
                    {t("mindmap.tryAgain")}
                  </Button>
                </Box>
              ) : (
                <>
                  <Box mb={8}>
                    {processingSteps.map((step, index) => (
                      <ProcessStep 
                        key={index} 
                        status={step.status as "completed" | "in-progress" | "pending"} 
                        label={step.label} 
                      />
                    ))}
                  </Box>
                  
                  <Box mb={6}>
                    <Flex justify="space-between" mb={2} color={useColorModeValue("gray.800", "white")}>
                      <Text>{processingStatus}</Text>
                      <Text>{processingProgress}%</Text>
                    </Flex>
                    <Box 
                      h="8px" 
                      bg={useColorModeValue(mindmapTheme.colors.gray, "gray.600")} 
                      borderRadius="4px" 
                      overflow="hidden"
                    >
                      <Box 
                        h="100%" 
                        width={`${processingProgress}%`}
                        bg={mindmapTheme.colors.primary}
                        borderRadius="4px"
                        transition="width 0.5s ease"
                      />
                    </Box>
                  </Box>
                </>
              )}
            </Box>
          </Box>
        );
      }

      case CreateSteps.COMPLETE: {
        return (
          <Box>
            <Box
              bg={useColorModeValue("white", "gray.800")}
              p={6}
              borderRadius={mindmapTheme.borderRadius}
              boxShadow={useColorModeValue(mindmapTheme.shadow, "dark-lg")}
              mb={8}
              borderWidth="1px"
              borderColor={useColorModeValue("gray.200", "gray.700")}
            >
              <MindMapDetail id={mindmapData?.id?.toString() || ""} />
              
              <Flex justify="flex-end" gap={3}>
                <Button variant="ghost" colorScheme="purple">
                  <Icon as={FaCog} mr={2} />
                  {t("common.edit")}
                </Button>
                <Button variant="ghost" colorScheme="purple">
                  <Icon as={FaDownload} mr={2} />
                  {t("mindmap.download")}
                </Button>
                <Button variant="ghost" colorScheme="purple">
                  <Icon as={FaShareAlt} mr={2} />
                  {t("mindmap.share")}
                </Button>
                <Button colorScheme="purple" bg={mindmapTheme.colors.primary} _hover={{ bg: mindmapTheme.colors.primaryDark }}>
                  <Icon as={FaSave} mr={2} />
                  {t("common.save")}
                </Button>
              </Flex>
            </Box>
          </Box>
        );
      }

      default:
        return null;
    }
  }

  return (
    <Box bg={useColorModeValue("#f8fafc", "gray.800")} minHeight="100vh">
      <Container maxW="1200px" py={8}>
        <Box mb={8}>
          <Heading as="h1" size="xl" mb={2} color={useColorModeValue("gray.800", "white")}>
            {t("mindmap.create")}
          </Heading>
          <Text color={useColorModeValue(mindmapTheme.colors.grayDark, "gray.400")}>
            {t("mindmap.pasteYoutubeLink")}
          </Text>
        </Box>
        
        <StepIndicator />
        {renderStepContent()}
      </Container>
    </Box>
  )
}

export default CreateMindMap
