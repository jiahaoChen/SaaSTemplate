import {
  Box,
  Flex,
  Spinner,
} from "@chakra-ui/react"
import { useRef, useImperativeHandle, forwardRef, useEffect, useState, useCallback } from "react"
import { mindmapTheme } from "../../../theme/mindmap"
import { MindMapPublic } from "@/client/types.gen"

interface VideoPlayerProps {
  mindMapData: MindMapPublic
}

export interface VideoPlayerRef {
  seekTo: (seconds: number) => void;
  play: () => void;
  pause: () => void;
  isPlaying: boolean;
  onPlayingChange: (callback: (isPlaying: boolean) => void) => () => void;
}

declare global {
  interface Window {
    onYouTubeIframeAPIReady?: () => void;
    YT?: {
      Player: new (
        elementId: string,
        options: {
          videoId: string;
          events: {
            onReady: (event: any) => void;
            onStateChange: (event: any) => void;
            onError?: (event: any) => void;
          };
          playerVars?: {
            autoplay?: 0 | 1;
            playsinline?: 0 | 1;
            rel?: 0 | 1;
            origin?: string;
          };
        }
      ) => void;
      PlayerState?: {
        UNSTARTED: number;
        ENDED: number;
        PLAYING: number;
        PAUSED: number;
        BUFFERING: number;
        CUED: number;
      };
    };
    ytPlayerInitAttempt?: boolean;
  }
}

const VideoPlayer = forwardRef<VideoPlayerRef, VideoPlayerProps>(({ mindMapData }, ref) => {
  const playerRef = useRef<any>(null);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const playerContainerId = 'youtube-player';
  const [apiLoaded, setApiLoaded] = useState(false);
  const playingChangeCallbacks = useRef<((isPlaying: boolean) => void)[]>([]);

  // Function to notify all listeners about playing state changes
  const notifyPlayingChange = useCallback((playing: boolean) => {
    setIsPlaying(playing);
    playingChangeCallbacks.current.forEach(callback => callback(playing));
  }, []);

  // Check if YouTube API is already loaded
  const isYouTubeApiLoaded = () => {
    return typeof window.YT !== 'undefined' && typeof window.YT.Player !== 'undefined';
  };

  const createPlayer = () => {
    if (!isYouTubeApiLoaded() || !document.getElementById(playerContainerId)) {
      return;
    }

    // Create the player instance
    try {
      playerRef.current = new window.YT!.Player(playerContainerId, {
        videoId: mindMapData.youtube_video_id,
        events: {
          onReady: () => {
            setIsPlayerReady(true);
            setIsLoading(false);
          },
          onStateChange: (event) => {
            // Handle player state changes
            if (event.data === window.YT?.PlayerState?.PLAYING) {
              notifyPlayingChange(true);
            } else if (event.data === window.YT?.PlayerState?.PAUSED || 
                      event.data === window.YT?.PlayerState?.ENDED) {
              notifyPlayingChange(false);
            }
          },
          onError: (event: any) => {
            console.error("YouTube player error:", event);
            setIsLoading(false);
          }
        },
        playerVars: {
          playsinline: 1,
          rel: 0,
          origin: window.location.origin
        }
      });
    } catch (error) {
      console.error("Error creating YouTube player:", error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Function to initialize YouTube iframe API
    const loadYouTubeApi = () => {
      // If API is already loaded
      if (isYouTubeApiLoaded()) {
        setApiLoaded(true);
        createPlayer();
        return;
      }

      // Prevent multiple initialization attempts
      if (window.ytPlayerInitAttempt) return;
      window.ytPlayerInitAttempt = true;

      // Load the API script
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      tag.async = true;
      tag.onload = () => {
        console.log("YouTube iframe API script loaded");
      };
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

      // This function will be called by the YouTube iframe API when ready
      window.onYouTubeIframeAPIReady = () => {
        console.log("YouTube iframe API ready");
        setApiLoaded(true);
        createPlayer();
      };
    };

    // Check if container exists before initializing
    const checkContainerAndInit = () => {
      if (document.getElementById(playerContainerId)) {
        loadYouTubeApi();
      } else {
        // If container doesn't exist yet, try again after a short delay
        setTimeout(checkContainerAndInit, 100);
      }
    };

    checkContainerAndInit();

    return () => {
      // Cleanup
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch (e) {
          console.error("Error destroying YouTube player:", e);
        }
      }
    };
  }, [mindMapData.youtube_video_id]);

  // Re-attempt player creation if API is loaded but player isn't
  useEffect(() => {
    if (apiLoaded && !playerRef.current) {
      createPlayer();
    }
  }, [apiLoaded]);

  useImperativeHandle(ref, () => ({
    seekTo: (seconds: number) => {
      if (playerRef.current && isPlayerReady) {
        playerRef.current.seekTo(seconds, true);
      }
    },
    play: () => {
      if (playerRef.current && isPlayerReady) {
        playerRef.current.playVideo();
        // We don't set isPlaying here because the onStateChange event will handle it
      }
    },
    pause: () => {
      if (playerRef.current && isPlayerReady) {
        playerRef.current.pauseVideo();
        // We don't set isPlaying here because the onStateChange event will handle it
      }
    },
    get isPlaying() {
      return isPlaying;
    },
    onPlayingChange: (callback: (isPlaying: boolean) => void) => {
      playingChangeCallbacks.current.push(callback);
      
      // Return a cleanup function to remove the callback
      return () => {
        playingChangeCallbacks.current = playingChangeCallbacks.current.filter(cb => cb !== callback);
      };
    }
  }), [isPlayerReady, isPlaying, notifyPlayingChange]);

  return (
    <Box
      bg="white"
      borderRadius={mindmapTheme.borderRadius}
      boxShadow={mindmapTheme.shadow}
      overflow="hidden"
    >
      {/* 視頻播放器 */}
      <Box
        position="relative"
        paddingTop="56.25%" /* 16:9 寬高比 */
        bg="black"
      >
        {isLoading && (
          <Flex
            position="absolute"
            top="0"
            left="0"
            width="100%"
            height="100%"
            justifyContent="center"
            alignItems="center"
            bg="rgba(0, 0, 0, 0.7)"
            zIndex="2"
          >
            <Spinner size="xl" color="white" />
          </Flex>
        )}
        <div
          id={playerContainerId}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
          }}
        />
      </Box>

      {/* 視頻信息 */}
      {/* <Box p={6}>
        <Heading as="h2" size="lg" mb={2} color={mindmapTheme.colors.dark}>
          {mindMapData.video_title}
        </Heading>

        <Flex
          wrap="wrap"
          gap={4}
          align="center"
          mb={4}
          color={mindmapTheme.colors.grayDark}
          fontSize="sm"
        >
          <Flex align="center">
            <Icon as={FaYoutube} color="red.500" mr={1} />
            <Text>{mindMapData.author_name}</Text>
          </Flex>
          <Flex align="center">
            <Icon as={FaCalendarAlt} mr={1} />
            <Text>發布於 {formatDate(mindMapData.created_at)}</Text>
          </Flex>
        </Flex>
      </Box> */}
    </Box>
  )
});

export default VideoPlayer 