import {
  Box,
  Button,
  ButtonGroup,
  Flex,
  Icon,
} from "@chakra-ui/react";
import { useColorModeValue } from "@/components/ui/color-mode";
import React, { useEffect, useRef, useState } from "react";
import {
  FaCompressArrowsAlt,
  FaExpandArrowsAlt,
  FaMinus,
  FaPlus,
  FaFolder,
  FaFolderOpen,
  FaPause,
  FaPlay,
} from "react-icons/fa";
import { MdCenterFocusWeak } from "react-icons/md";
import { mindmapTheme } from "../../../theme/mindmap";
import { Tooltip } from "../../Common/Tooltips";
import { MindMapPublic } from "@/client/types.gen";
import { Markmap } from "markmap-view";
import { Transformer } from "markmap-lib";
import { VideoPlayerRef } from "./VideoPlayer";
import useLanguage from "@/hooks/useLanguage";

interface MindMapViewerProps {
  mindMapData: MindMapPublic;
  videoPlayerRef?: React.RefObject<VideoPlayerRef>;
  parentContainerRef?: React.RefObject<HTMLDivElement>;
}

const transformer = new Transformer();

// Function to generate random color
const getRandomColor = () => {
  const hue = Math.floor(Math.random() * 360);
  const saturation = 60 + Math.floor(Math.random() * 20); // 60-80%
  const lightness = 45 + Math.floor(Math.random() * 10); // 45-55%
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};

// Function to extract timestamp from node text
const extractTimestamp = (text: string): number | null => {
  // Primary format: look for [XX.XXs] which is our standardized format
  let match = text.match(/\[(\d+(?:\.\d+)?)s\]/);
  if (match) {
    return parseFloat(match[1]);
  }
  
  // Fallback formats
  
  // Look for timestamps in format [MM:SS] or [MM:SS.ms]
  match = text.match(/\[(\d+):(\d+(?:\.\d+)?)\]/);
  if (match) {
    const minutes = parseInt(match[1], 10);
    const seconds = parseFloat(match[2]);
    return minutes * 60 + seconds;
  }
  
  // Look for timestamps in format (MM:SS) or (MM:SS.ms) or (HH:MM:SS)
  match = text.match(/\((\d+):(\d+(?:\.\d+)?)(?::(\d+))?\)/);
  if (match) {
    if (match[3]) {
      // HH:MM:SS format
      const hours = parseInt(match[1], 10);
      const minutes = parseInt(match[2], 10);
      const seconds = parseInt(match[3], 10);
      return hours * 3600 + minutes * 60 + seconds;
    } else {
      // MM:SS format or MM:SS.ms format
      const minutes = parseInt(match[1], 10);
      const seconds = parseFloat(match[2]);
      return minutes * 60 + seconds;
    }
  }
  
  // Look for any number followed by 's' or 'seconds'
  match = text.match(/(\d+(?:\.\d+)?)\s*(?:s|seconds)/i);
  if (match) {
    return parseFloat(match[1]);
  }
  
  // As a last resort, try to extract any time patterns we might have missed
  const timePatterns = [
    // MM:SS format
    /(\d+):(\d+)/,
    // H:MM:SS format
    /(\d+):(\d+):(\d+)/,
    // Any single number that might be seconds
    /\b(\d+(?:\.\d+)?)\b/
  ];
  
  for (const pattern of timePatterns) {
    match = text.match(pattern);
    if (match) {
      if (match.length === 3) {
        // MM:SS format
        const minutes = parseInt(match[1], 10);
        const seconds = parseInt(match[2], 10);
        return minutes * 60 + seconds;
      } else if (match.length === 4) {
        // H:MM:SS format
        const hours = parseInt(match[1], 10);
        const minutes = parseInt(match[2], 10);
        const seconds = parseInt(match[3], 10);
        return hours * 3600 + minutes * 60 + seconds;
      } else {
        // Single number
        return parseFloat(match[1]);
      }
    }
  }
  
  // If we get here, no timestamp was found
  console.log('No timestamp pattern found in:', text);
  return null;
};

const MindMapViewer: React.FC<MindMapViewerProps> = ({ 
  mindMapData, 
  videoPlayerRef,
  parentContainerRef
}) => {
  const { t } = useLanguage();
  const svgRef = useRef<SVGSVGElement>(null);
  const markmapRef = useRef<Markmap | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isFolded, setIsFolded] = useState(false);
  const [bgOpacity, setBgOpacity] = useState(0.5);
  const [showTooltip, setShowTooltip] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const sliderRef = useRef<HTMLDivElement>(null);

  // Color mode values
  const bgColor = useColorModeValue(`rgba(255, 255, 255, ${bgOpacity})`, `rgba(26, 32, 44, ${bgOpacity})`);
  const fullscreenBg = useColorModeValue("white", "gray.800");
  const controlBg = useColorModeValue("rgba(255, 255, 255, 0.8)", "rgba(45, 55, 72, 0.8)");
  const textColor = useColorModeValue("gray.500", "gray.400");
  const buttonHoverBg = useColorModeValue("gray.100", "gray.700");
  const boxShadowColor = useColorModeValue("rgba(0, 0, 0, 0.1)", "rgba(191, 17, 17, 0.3)");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  
  // SVG-specific variables for mindmap
  const nodeFillColor = useColorModeValue("#1a202c", "#ffffff");
  const nodeStrokeColor = useColorModeValue("#4a5568", "#a0aec0");
  const linkStrokeColor = useColorModeValue("#718096", "#a0aec0");
  const isDarkMode = useColorModeValue(false, true);

  // Apply dark mode styles to SVG
  const applyMarkmapStyles = (svgElement: SVGSVGElement) => {
    if (svgElement) {
      // Add style with CSS rules
      console.log('isDarkMode: ', isDarkMode);
      
      // Clear any existing style elements we added previously
      const existingStyles = svgElement.querySelectorAll('style[data-custom-style="true"]');
      existingStyles.forEach(el => el.remove());
      
      const style = document.createElement('style');
      style.setAttribute('data-custom-style', 'true');
      style.textContent = isDarkMode 
        ? `
          .markmap-node text {
            fill: #ffffff !important;
            font-weight: 500 !important;
            stroke: none !important;
          }
          .markmap-node div {
            color: #ffffff !important;
            font-weight: 500 !important;
          }
          .markmap-node foreignObject div {
            color: #ffffff !important;
            font-weight: 500 !important;
          }
          .markmap-node > g > circle {
            stroke: ${nodeStrokeColor} !important;
          }
          .markmap-link {
            stroke: ${linkStrokeColor} !important;
          }
          
          /* Apply to XHTML namespace divs */
          div[xmlns="http://www.w3.org/1999/xhtml"] {
            color: #ffffff !important;
          }
        `
        : `
          .markmap-node text {
            fill: ${nodeFillColor} !important;
            font-weight: 500 !important;
            stroke: none !important;
          }
          .markmap-node div {
            color: ${nodeFillColor} !important;
            font-weight: 500 !important;
          }
          .markmap-node foreignObject div {
            color: ${nodeFillColor} !important;
            font-weight: 500 !important;
          }
          .markmap-node > g > circle {
            stroke: ${nodeStrokeColor} !important;
          }
          .markmap-link {
            stroke: ${linkStrokeColor} !important;
          }
          
          /* Apply to XHTML namespace divs */
          div[xmlns="http://www.w3.org/1999/xhtml"] {
            color: ${nodeFillColor} !important;
          }
        `;
      svgElement.appendChild(style);
      
      // Directly set attributes on SVG text elements
      const textElements = svgElement.querySelectorAll('.markmap-node text');
      textElements.forEach(textEl => {
        textEl.setAttribute('fill', isDarkMode ? '#ffffff' : nodeFillColor);
        textEl.setAttribute('style', `fill: ${isDarkMode ? '#ffffff' : nodeFillColor} !important`);
      });
      
      // Handle XHTML div elements
      const foreignObjects = svgElement.querySelectorAll('.markmap-node foreignObject');
      foreignObjects.forEach(foreignObj => {
        const divs = foreignObj.querySelectorAll('div');
        divs.forEach(div => {
          div.setAttribute('style', `color: ${isDarkMode ? '#ffffff' : nodeFillColor} !important; font-weight: 500;`);
        });
      });
      
      // Also add a global stylesheet to the document head
      const globalStyleId = 'mindmap-xhtml-styles';
      let globalStyleEl = document.getElementById(globalStyleId) as HTMLStyleElement;
      
      if (!globalStyleEl) {
        globalStyleEl = document.createElement('style');
        globalStyleEl.id = globalStyleId;
        document.head.appendChild(globalStyleEl);
      }
      
      globalStyleEl.textContent = `
        /* Target XHTML divs in markmap */
        div[xmlns="http://www.w3.org/1999/xhtml"] {
          color: ${isDarkMode ? '#ffffff' : nodeFillColor} !important;
        }
      `;
    }
  };

  useEffect(() => {
    if (svgRef.current && markmapRef.current) {
      // Reapply styles when dark mode changes
      applyMarkmapStyles(svgRef.current);
    }
  }, [isDarkMode, nodeStrokeColor, linkStrokeColor, nodeFillColor]);

  // Function to process all XHTML divs in the SVG
  const processXHTMLNodes = React.useCallback(() => {
    if (!svgRef.current) return;
    
    // First approach: select all foreignObject elements and their divs
    const foreignObjects = svgRef.current.querySelectorAll('foreignObject');
    foreignObjects.forEach(foreignObj => {
      const divs = foreignObj.querySelectorAll('div');
      divs.forEach(div => {
        div.setAttribute('style', `color: ${isDarkMode ? '#ffffff' : nodeFillColor} !important; font-weight: 500;`);
      });
    });
    
    // Second approach: directly query the document
    // This can find elements that might be injected into the DOM differently
    document.querySelectorAll('div[xmlns="http://www.w3.org/1999/xhtml"]').forEach(div => {
      div.setAttribute('style', `color: ${isDarkMode ? '#ffffff' : nodeFillColor} !important; font-weight: 500;`);
    });
    
    // Get all inline SVG text elements too - sometimes they're not processed above
    svgRef.current.querySelectorAll('.markmap text').forEach(text => {
      text.setAttribute('fill', isDarkMode ? '#ffffff' : nodeFillColor);
    });
  }, [isDarkMode, nodeFillColor]);

  useEffect(() => {
    if (!svgRef.current) return;

    // Transform the markdown content to markmap data
    const { root } = transformer.transform(mindMapData.markmap || '# No mindmap data available');

    // Create or update markmap
    if (!markmapRef.current) {
      // Create markmap with base options
      markmapRef.current = Markmap.create(svgRef.current, {
        autoFit: true,
        color: () => getRandomColor(),
        duration: 500,
        nodeMinHeight: 16,
        spacingVertical: 5,
        spacingHorizontal: 80,
        lineWidth: () => 2,
      }, root);

      // Apply styles for dark mode
      applyMarkmapStyles(svgRef.current);

      // Apply immediately and also after a short delay to catch any dynamically added elements
      processXHTMLNodes();
      setTimeout(processXHTMLNodes, 100);
      setTimeout(processXHTMLNodes, 500);

      // Add click event listener to the SVG element
      svgRef.current.addEventListener('click', (event) => {
        if (!videoPlayerRef?.current) return;

        // Find the clicked node element
        const target = event.target as Element;
        const nodeElement = target.closest('.markmap-node');
        
        if (nodeElement) {
          // Don't trigger video seeking if clicking on the circle (fold/unfold) or fold button
          const targetIsCircle = target.tagName === 'circle' || target.closest('circle');
          const targetIsFoldButton = target.classList?.contains('markmap-fold') || target.closest('.markmap-fold');
          
          if (targetIsCircle || targetIsFoldButton) {
            // This is a fold/unfold action, don't trigger timestamp seeking
            return;
          }
          
          // Extract the text content from the node element
          const text = nodeElement.textContent || '';
          
          if (text) {
            // Extract timestamp from the node text
            const timestamp = extractTimestamp(text);
            
            if (timestamp !== null && videoPlayerRef.current) {
              // Apply a temporary highlight effect to the clicked node
              const originalStyle = nodeElement.getAttribute('style') || '';
              nodeElement.setAttribute('style', originalStyle + `; filter: brightness(${isDarkMode ? '1.5' : '1.3'}); transition: all 0.3s ease;`);
              
              // Revert the highlight after a short delay
              setTimeout(() => {
                nodeElement.setAttribute('style', originalStyle);
              }, 500);
              
              // Seek the video to the timestamp
              videoPlayerRef.current.seekTo(timestamp);
              
              console.log('Seeking to timestamp:', timestamp, 'seconds from text:', text);
            }
          }
        }
      });
    } else {
      markmapRef.current.setData(root);
      markmapRef.current.fit();
      
      // Reapply styles after update
      applyMarkmapStyles(svgRef.current);
      
      // Apply to XHTML nodes as well
      processXHTMLNodes();
      setTimeout(processXHTMLNodes, 100);
    }
  }, [mindMapData.markmap, videoPlayerRef, isDarkMode, nodeFillColor, nodeStrokeColor, linkStrokeColor]);
  
  // Effect to recreate markmap when dark mode changes
  useEffect(() => {
    if (svgRef.current && markmapRef.current && mindMapData.markmap) {
      // Force reapply styles when dark mode changes
      applyMarkmapStyles(svgRef.current);
      
      // Apply to XHTML nodes
      processXHTMLNodes();
      setTimeout(processXHTMLNodes, 100);
    }
  }, [isDarkMode, nodeFillColor, nodeStrokeColor, linkStrokeColor]);

  // Zoom controls
  const handleZoomIn = () => {
    if (markmapRef.current) {
      markmapRef.current.rescale(1.25);
    }
  };

  const handleZoomOut = () => {
    if (markmapRef.current) {
      markmapRef.current.rescale(0.8);
    }
  };

  const handleResetView = () => {
    if (markmapRef.current) {
      markmapRef.current.fit();
    }
  };

  const handleFullscreen = () => {
    // Prefer the parent container if available
    const targetEl = parentContainerRef?.current || containerRef.current;
    if (!targetEl) return;
    
    if (!isFullscreen) {
      if (targetEl.requestFullscreen) {
        targetEl.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  // Fold/Unfold controls
  const handleToggleFold = () => {
    if (!markmapRef.current || !svgRef.current) return;
    
    // Get markdown data and transform it
    const markdown = mindMapData.markmap || '# No mindmap data available';
    
    // Clear the current SVG content
    while (svgRef.current.firstChild) {
      svgRef.current.removeChild(svgRef.current.firstChild);
    }
    
    // Transform the markdown content to markmap data
    const { root } = transformer.transform(markdown);
    
    // Create new markmap with appropriate expand level
    markmapRef.current = Markmap.create(svgRef.current, {
      autoFit: true,
      color: () => getRandomColor(),
      duration: 500,
      nodeMinHeight: 16,
      spacingVertical: 5,
      spacingHorizontal: 80,
      lineWidth: () => 2,
      initialExpandLevel: isFolded ? -1 : 1, // -1 expands all, 1 expands only first level
    }, root);
    
    // Apply dark mode styles
    applyMarkmapStyles(svgRef.current);
    
    // Toggle folded state
    setIsFolded(!isFolded);
    
    // Reattach click event listener
    if (videoPlayerRef?.current) {
      const currentVideoPlayerRef = videoPlayerRef.current;
      svgRef.current.addEventListener('click', (event) => {
        // Find the clicked node element
        const target = event.target as Element;
        const nodeElement = target.closest('.markmap-node');
        
        if (nodeElement) {
          // Don't trigger video seeking if clicking on the circle (fold/unfold) or fold button
          const targetIsCircle = target.tagName === 'circle' || target.closest('circle');
          const targetIsFoldButton = target.classList?.contains('markmap-fold') || target.closest('.markmap-fold');
          
          if (targetIsCircle || targetIsFoldButton) {
            // This is a fold/unfold action, don't trigger timestamp seeking
            return;
          }
          
          // Extract the text content from the node element
          const text = nodeElement.textContent || '';
          
          if (text) {
            // Extract timestamp from the node text
            const timestamp = extractTimestamp(text);
            
            if (timestamp !== null) {
              // Apply a temporary highlight effect to the clicked node
              const originalStyle = nodeElement.getAttribute('style') || '';
              nodeElement.setAttribute('style', originalStyle + `; filter: brightness(${isDarkMode ? '1.5' : '1.3'}); transition: all 0.3s ease;`);
              
              // Revert the highlight after a short delay
              setTimeout(() => {
                nodeElement.setAttribute('style', originalStyle);
              }, 500);
              
              // Seek the video to the timestamp
              currentVideoPlayerRef.seekTo(timestamp);
              
              console.log('Seeking to timestamp:', timestamp, 'seconds from text:', text);
            }
          }
        }
      });
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      // Check if either our container or parent container is fullscreen
      const isOurContainerFullscreen = document.fullscreenElement === containerRef.current;
      const isParentContainerFullscreen = document.fullscreenElement === parentContainerRef?.current;
      
      setIsFullscreen(isOurContainerFullscreen || isParentContainerFullscreen);
      
      if (markmapRef.current) {
        // Adjust the view after fullscreen change
        setTimeout(() => {
          markmapRef.current?.fit();
        }, 100);
      }
      
      // Apply dark mode styles if needed
      if ((isOurContainerFullscreen || isParentContainerFullscreen) && svgRef.current) {
        applyMarkmapStyles(svgRef.current);
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [parentContainerRef, isDarkMode]);

  // Handle drag operations for the opacity slider
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!sliderRef.current) return;
    
    const track = sliderRef.current;
    const rect = track.getBoundingClientRect();
    
    const updateOpacity = (clientX: number) => {
      const x = clientX - rect.left;
      const newOpacity = Math.max(0, Math.min(1, x / rect.width));
      setBgOpacity(newOpacity);
    };
    
    updateOpacity(e.clientX);
    
    const handleMouseMove = (e: MouseEvent) => {
      updateOpacity(e.clientX);
    };
    
    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // Video controls
  const handleTogglePlayPause = () => {
    if (!videoPlayerRef?.current) return;
    
    if (isPlaying) {
      videoPlayerRef.current.pause();
    } else {
      videoPlayerRef.current.play();
    }
    // No need to set isPlaying here, since the videoPlayerRef will emit the state change
  };

  // Effect to sync with the video player's state
  useEffect(() => {
    if (!videoPlayerRef?.current) return;
    
    // Initial sync with video state
    setIsPlaying(videoPlayerRef.current.isPlaying);
    
    // Subscribe to playing state changes
    const unsubscribe = videoPlayerRef.current.onPlayingChange((playing) => {
      setIsPlaying(playing);
    });
    
    // Cleanup subscription on unmount
    return unsubscribe;
  }, [videoPlayerRef]);

  // Effect to handle keyboard events
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't capture events if they are from input elements
      if (event.target instanceof HTMLInputElement || 
          event.target instanceof HTMLTextAreaElement) {
        return;
      }
      
      if (event.code === 'Space' && videoPlayerRef?.current) {
        event.preventDefault(); // Prevent scrolling
        handleTogglePlayPause();
      } else if (event.code === 'Escape' && !isFullscreen) {
        event.preventDefault();
        setIsVisible(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isPlaying, videoPlayerRef, isFullscreen]);

  return (
    <Box
      ref={containerRef}
      bg={bgColor}
      borderRadius={mindmapTheme.borderRadius}
      boxShadow={mindmapTheme.shadow}
      overflow="hidden"
      position="absolute"
      top={0}
      left={0}
      right={0}
      bottom={0}
      width="100%"
      height="100%"
      borderWidth="1px"
      borderColor={borderColor}
      display={isVisible ? 'block' : 'none'}
      css={{
        '&:fullscreen': {
          padding: '20px',
          background: fullscreenBg,
        },
        // When parent is fullscreen, ensure this component fills the space
        ':fullscreen &': {
          height: '100%',
          width: '100%',
          background: bgColor,
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        },
        // These CSS variables need to be on the top level for them to work in SVG
        '--node-fill-color': isDarkMode ? '#ffffff' : nodeFillColor,
        '--node-stroke-color': nodeStrokeColor,
        '--link-stroke-color': linkStrokeColor,
      }}
    >
      {/* Control toolbar - positioned as overlay in top left */}
      <Flex 
        position="absolute" 
        top="10px" 
        left="10px" 
        zIndex="20" 
        bg={controlBg}
        p={2} 
        borderRadius="md"
        alignItems="center"
        boxShadow={`0 2px 5px ${boxShadowColor}`}
        borderWidth="1px"
        borderColor={borderColor}
        css={{
          ':fullscreen &': {
            top: '20px',
            left: '20px',
          }
        }}
      >
        <ButtonGroup size="sm" variant="outline">
          <Tooltip content={t("mindmap.controls.zoomIn", "放大")} showArrow>
            <Button onClick={handleZoomIn} _hover={{ bg: buttonHoverBg }}>
              <Icon as={FaPlus} />
            </Button>
          </Tooltip>
          <Tooltip content={t("mindmap.controls.zoomOut", "縮小")} showArrow>
            <Button onClick={handleZoomOut} _hover={{ bg: buttonHoverBg }}>
              <Icon as={FaMinus} />
            </Button>
          </Tooltip>
          <Tooltip content={t("mindmap.controls.resetView", "重置視圖")} showArrow>
            <Button onClick={handleResetView} _hover={{ bg: buttonHoverBg }}>
              <Icon as={MdCenterFocusWeak} />
            </Button>
          </Tooltip>
          <Tooltip content={isFolded ? t("mindmap.controls.showAllNodes", "顯示所有節點") : t("mindmap.controls.hideChildNodes", "隱藏子節點")} showArrow>
            <Button onClick={handleToggleFold} _hover={{ bg: buttonHoverBg }}>
              <Icon as={isFolded ? FaFolderOpen : FaFolder} />
            </Button>
          </Tooltip>
          {videoPlayerRef && (
            <Tooltip content={isPlaying ? t("mindmap.controls.pauseVideo", "暂停视频") : t("mindmap.controls.playVideo", "播放视频")} showArrow>
              <Button onClick={handleTogglePlayPause} _hover={{ bg: buttonHoverBg }}>
                <Icon as={isPlaying ? FaPause : FaPlay} />
              </Button>
            </Tooltip>
          )}
          <Tooltip content={isFullscreen ? t("mindmap.controls.exitFullscreen", "退出全屏") : t("mindmap.controls.fullscreen", "全屏")} showArrow>
            <Button onClick={handleFullscreen} colorScheme={isFullscreen ? "red" : "gray"} _hover={{ bg: buttonHoverBg }}>
              <Icon as={isFullscreen ? FaCompressArrowsAlt : FaExpandArrowsAlt} />
            </Button>
          </Tooltip>
          {/* <Tooltip content={t("mindmap.controls.toggleVisibility", "顯示/隱藏思維導圖")} showArrow>
            <Button onClick={() => setIsVisible(prev => !prev)} colorScheme="gray" _hover={{ bg: buttonHoverBg }}>
              <Icon as={isVisible ? FaCompressArrowsAlt : FaExpandArrowsAlt} />
            </Button>
          </Tooltip> */}
        </ButtonGroup>
      </Flex>
      
      {/* Transparency Control - positioned at the top center */}
      <Flex 
        position="absolute" 
        top="10px" 
        left="50%" 
        transform="translateX(-50%)"
        zIndex="20" 
        bg={controlBg}
        p={2} 
        borderRadius="md"
        alignItems="center"
        boxShadow={`0 2px 5px ${boxShadowColor}`}
        borderWidth="1px"
        borderColor={borderColor}
        width="200px"
        css={{
          ':fullscreen &': {
            top: '20px',
          }
        }}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <Flex width="100%" alignItems="center">
          <Box fontSize="xs" mr={2}>{t("mindmap.controls.transparent", "透明")}</Box>
          <Box 
            ref={sliderRef}
            flex="1" 
            height="4px" 
            borderRadius="full" 
            bg="gray.200" 
            position="relative"
            _hover={{ cursor: "pointer" }}
            onClick={(e) => {
              if (!sliderRef.current) return;
              const rect = sliderRef.current.getBoundingClientRect();
              const x = e.clientX - rect.left;
              const newOpacity = Math.max(0, Math.min(1, x / rect.width));
              setBgOpacity(newOpacity);
            }}
          >
            <Box 
              height="100%" 
              width={`${bgOpacity * 100}%`} 
              bg="teal.500" 
              borderRadius="full"
            />
            <Box
              position="absolute"
              top="-4px"
              left={`${bgOpacity * 100}%`}
              transform="translateX(-50%)"
              width="12px"
              height="12px"
              borderRadius="full"
              bg="white"
              boxShadow="md"
              onMouseDown={handleMouseDown}
              _hover={{
                cursor: "grab"
              }}
              _active={{
                cursor: "grabbing"
              }}
            />
          </Box>
          <Box fontSize="xs" ml={2}>{t("mindmap.controls.opaque", "不透明")}</Box>
        </Flex>
        <Box 
          position="absolute" 
          bottom="-25px" 
          left="50%" 
          transform="translateX(-50%)" 
          bg={controlBg} 
          px={2} 
          py={1} 
          borderRadius="md" 
          fontSize="xs"
          opacity={showTooltip ? 1 : 0}
          transition="opacity 0.2s"
          pointerEvents="none"
        >
          {t("mindmap.controls.opacity", "透明度")}: {Math.round(bgOpacity * 100)}%
        </Box>
      </Flex>
      
      {/* Markmap SVG - full height now that toolbar is an overlay */}
      <Box
        width="100%"
        height="100%"
        overflow="hidden"
      >
        {!mindMapData.markmap ? (
          <Flex 
            width="100%" 
            height="100%" 
            alignItems="center" 
            justifyContent="center"
          >
            <Box color={textColor}>{t("mindmap.noMindmapData", "No mindmap data available")}</Box>
          </Flex>
        ) : (
          <svg
            ref={svgRef}
            style={{
              width: "100%",
              height: "100%",
            }}
          />
        )}
      </Box>
    </Box>
  );
};

export default MindMapViewer;
