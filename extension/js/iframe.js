// Configuration
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8000/api/v1'; // Fallback for development

// Create a global transformer object to match MindMapViewer.tsx
// This needs to be done after markmap-lib.js is loaded, but before iframe.js tries to use it.
// Since iframe.js is loaded last, and its logic runs on DOMContentLoaded or later,
// this should be fine here, assuming markmap-lib.js has already populated window.markmap.
if (window.markmap && !window.markmap.transformer && window.markmap.Transformer) {
  //console.log('Creating transformer from Transformer constructor');
  window.markmap.transformer = new window.markmap.Transformer();
}

// Add CSS to prevent pointer cursor on mindmap nodes
function addMarkmapStyles() {
  const styleEl = document.createElement('style');
  styleEl.textContent = `
    /* Set cursor for markmap nodes to pointer (finger) */
    .markmap-node, 
    .markmap-node * {
      cursor: pointer !important;
    }
    
    /* Ensure consistent pointer cursor when hovering over control elements */
    .markmap-node circle, 
    .markmap-fold {
      cursor: pointer !important;
    }
  `;
  document.head.appendChild(styleEl);
  //console.log('Added custom styles to set cursor to pointer for mindmap nodes');
}

// Get the mindmap ID from URL
const urlParams = new URLSearchParams(window.location.search);
const mindmapId = urlParams.get('id');

// References to DOM elements
let markmapElement;
let loadingElement;
let videoPlayButton;
let videoPauseButton;
let zoomInButton;
let zoomOutButton;
let resetViewButton;
let toggleFoldButton;
let toggleFullscreenButton;
let transparencySlider;
let transparencySliderFill;
let transparencySliderThumb;

// Markmap instance
let markmap = null;

// Transformed mindmap data (the root object for rendering)
let transformedMindmapRoot = null; 
// Store the original API response that contains the .markmap string
let originalMarkmapApiResponseData = null; 

// Folding state
let isFolded = false; // if true, means currently folded, next click will unfold

// Fullscreen state
let isFullscreen = false;

// Transparency state (0-1, where 1 is opaque)
let transparency = 0.5;

// Function to generate random color like in MindMapViewer.tsx
const getRandomColor = () => {
  const hue = Math.floor(Math.random() * 360);
  const saturation = 60 + Math.floor(Math.random() * 20); // 60-80%
  const lightness = 45 + Math.floor(Math.random() * 10); // 45-55%
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};

// Function to extract timestamp from node text
// This is the same function from MindMapViewer.tsx
const extractTimestamp = (text) => {
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
  //console.log('No timestamp pattern found in:', text);
  return null;
};

// Error handling
function showError(message) {
  const loadingElement = document.querySelector('.loading');
  const spinner = loadingElement.querySelector('.spinner');
  const text = loadingElement.querySelector('.loading-text');
  
  spinner.style.display = 'none';
  text.classList.add('error');
  text.textContent = message;
  console.error('Error: ' + message);
}

// Initialize Markmap
function initializeMarkmap(data) {
  try {
    //console.log('Initializing markmap with data:', data);
    
    // Get SVG element
    markmapElement = document.getElementById('markmap');
    
    // Check if markmap library is available
    if (!window.markmap || !window.markmap.Markmap) {
      console.error('Markmap library not found or not properly loaded');
      showError('Markmap library not found. Please check if markmap-view.js is loaded properly.');
      return;
    }
    
    // Create markmap using the global markmap variable with options similar to MindMapViewer.tsx
    markmap = window.markmap.Markmap.create(markmapElement, {
      autoFit: true,
      color: () => getRandomColor(),
      duration: 500,
      nodeMinHeight: 16,
      spacingVertical: 5,
      spacingHorizontal: 80,
      lineWidth: () => 2,
    }, data);
    
    //console.log('Markmap created successfully:', markmap);
    
    // Hide loading screen
    loadingElement.style.display = 'none';
    
    // Initialize controls
    initializeControls();
    
    // Set initial transparency
    updateTransparency(transparency);
    
    // Add click event listener to the SVG element for seeking video
    addNodeClickHandler();
  } catch (error) {
    console.error('Error initializing markmap:', error);
    showError('Error initializing mindmap: ' + error.message);
  }
}

// Add click event handler to the mindmap for seeking the video
function addNodeClickHandler() {
  if (!markmapElement) {
    console.error('Markmap SVG element not found, cannot add click handler');
    return;
  }
  
  markmapElement.addEventListener('click', (event) => {
    // Find the clicked node element
    const target = event.target;
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
          const isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
          const originalStyle = nodeElement.getAttribute('style') || '';
          nodeElement.setAttribute('style', originalStyle + `; filter: brightness(${isDarkMode ? '1.5' : '1.3'}); transition: all 0.3s ease;`);
          
          // Revert the highlight after a short delay
          setTimeout(() => {
            nodeElement.setAttribute('style', originalStyle);
          }, 500);
          
          // Send a message to the parent window to seek the video
          window.parent.postMessage({ 
            type: 'SEEK_VIDEO',
            time: timestamp 
          }, '*');
          
          //console.log('Sending request to seek to timestamp:', timestamp, 'seconds from text:', text);
        }
      }
    }
  });
}

// Initialize UI controls
function initializeControls() {
  videoPlayButton = document.getElementById('video-play');
  videoPauseButton = document.getElementById('video-pause');
  zoomInButton = document.getElementById('zoom-in');
  zoomOutButton = document.getElementById('zoom-out');
  resetViewButton = document.getElementById('reset-view');
  toggleFoldButton = document.getElementById('toggle-fold');
  toggleFullscreenButton = document.getElementById('toggle-fullscreen');
  transparencySlider = document.getElementById('transparency-slider');
  transparencySliderFill = document.getElementById('transparency-slider-fill');
  transparencySliderThumb = document.getElementById('transparency-slider-thumb');
  
  // Video play/pause controls
  videoPlayButton.addEventListener('click', () => {
    // Send a message to the parent window to play the video
    window.parent.postMessage({ type: 'PLAY_VIDEO' }, '*');
  });
  
  videoPauseButton.addEventListener('click', () => {
    // Send a message to the parent window to pause the video
    window.parent.postMessage({ type: 'PAUSE_VIDEO' }, '*');
  });
  
  // Zoom in
  zoomInButton.addEventListener('click', () => {
    if (markmap) {
      markmap.rescale(1.25); // Apply a zoom-in factor
    } else {
      console.warn('Markmap instance not available for zoom in.');
    }
  });
  
  // Zoom out
  zoomOutButton.addEventListener('click', () => {
    if (markmap) {
      markmap.rescale(0.8); // Apply a zoom-out factor
    } else {
      console.warn('Markmap instance not available for zoom out.');
    }
  });
  
  // Reset view
  resetViewButton.addEventListener('click', () => {
    markmap.fit();
  });
  
  // Toggle fold/unfold
  toggleFoldButton.addEventListener('click', () => {
    if (!markmap || !window.markmap.transformer || !originalMarkmapApiResponseData || !originalMarkmapApiResponseData.markmap) {
      console.error('Markmap not initialized or transformer/original markdown not available for folding.');
      showError('Cannot perform fold/unfold: Markmap data missing.');
      return;
    }

    isFolded = !isFolded; // Toggle the desired state for the *next* render

    if (isFolded) { // If we are now going to a folded state
      toggleFoldButton.title = '展開所有分支';
      toggleFoldButton.classList.add('active');
    } else { // If we are now going to an unfolded state
      toggleFoldButton.title = '摺疊所有分支';
      toggleFoldButton.classList.remove('active');
    }

    // Ensure markmapElement is defined
    if (!markmapElement) {
      markmapElement = document.getElementById('markmap');
      if (!markmapElement) {
        showError('Markmap SVG element not found for re-rendering.');
        return;
      }
    }
    markmapElement.innerHTML = ''; // Clear the current SVG content
    
    // Re-transform the original markdown data
    const { root } = window.markmap.transformer.transform(originalMarkmapApiResponseData.markmap);
    transformedMindmapRoot = root; // Update the stored root

    // Create new markmap with appropriate expand level
    // If isFolded is true, it means we want to display it folded (initialExpandLevel = 1)
    // If isFolded is false, it means we want to display it unfolded (initialExpandLevel = -1)
    markmap = window.markmap.Markmap.create(markmapElement, {
      autoFit: true,
      color: () => getRandomColor(),
      duration: 500,
      nodeMinHeight: 16,
      spacingVertical: 5,
      spacingHorizontal: 80,
      lineWidth: () => 2,
      initialExpandLevel: isFolded ? 1 : -1, 
    }, transformedMindmapRoot);

    //console.log(`Mindmap view re-rendered. Currently ${isFolded ? 'folded' : 'unfolded'}.`);
    
    // Re-add click event handler after recreating the markmap
    addNodeClickHandler();
  });
  
  // Toggle fullscreen
  toggleFullscreenButton.addEventListener('click', () => {
    // Send a message to the parent window (content script) to handle video fullscreen
    window.parent.postMessage({ type: 'TOGGLE_FULLSCREEN_VIDEO' }, '*');
    
    // Note: we no longer update the button state here, as we'll get a message back from content.js
    // with the actual fullscreen state. This ensures the button always shows the correct state.
    
    //console.log('MindTube iframe: Sent TOGGLE_FULLSCREEN_VIDEO message to parent.');
  });
  
  // Handle fullscreen change events (for the iframe itself, if it were to go fullscreen independently)
  // Since we removed the iframe's own fullscreen logic, this specific handler might become less relevant
  // unless content.js decides to make the iframe element itself fullscreen.
  document.addEventListener('fullscreenchange', handleFullscreenChange);
  document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
  document.addEventListener('mozfullscreenchange', handleFullscreenChange);
  document.addEventListener('MSFullscreenChange', handleFullscreenChange);
  
  // Transparency slider events
  let isDragging = false;
  
  transparencySlider.addEventListener('mousedown', (e) => {
    isDragging = true;
    updateSliderPosition(e);
  });
  
  window.addEventListener('mousemove', (e) => {
    if (isDragging) {
      updateSliderPosition(e);
    }
  });
  
  window.addEventListener('mouseup', () => {
    isDragging = false;
  });
  
  // Touch events for mobile
  transparencySlider.addEventListener('touchstart', (e) => {
    isDragging = true;
    updateSliderPosition(e.touches[0]);
  });
  
  window.addEventListener('touchmove', (e) => {
    if (isDragging) {
      e.preventDefault();
      updateSliderPosition(e.touches[0]);
    }
  });
  
  window.addEventListener('touchend', () => {
    isDragging = false;
  });
}

// Handle fullscreen change (primarily if the iframe's #container was made fullscreen)
function handleFullscreenChange() {
  const iframeDocument = document; // The iframe's document
  const isIframeFullscreenNow = iframeDocument.fullscreenElement || 
                                iframeDocument.webkitFullscreenElement || 
                                iframeDocument.mozFullScreenElement || 
                                iframeDocument.msFullscreenElement;

  // This 'isFullscreen' variable tracks the state of the iframe's fullscreen button icon.
  // It will be updated by messages from content.js.
  if (!isIframeFullscreenNow && isFullscreen) { // If iframe was made fullscreen and now exits
    //console.log("MindTube iframe: Iframe's own container exited fullscreen.");
    // Potentially notify content.js or just reset local UI if content.js manages video fullscreen separately
    // For now, this primarily handles the iframe's own fullscreen state if it were used.
    // updateFullscreenButtonState(false); // Update based on actual state
  }
}

function updateFullscreenButtonState(isVideoFs) {
  isFullscreen = isVideoFs; // Update internal state based on video's fullscreen status
  if (toggleFullscreenButton) {
    // Don't use toggle - explicitly set or remove the class to avoid state sync issues
    if (isFullscreen) {
      toggleFullscreenButton.classList.add('active');
    } else {
      toggleFullscreenButton.classList.remove('active');
    }
    toggleFullscreenButton.title = isFullscreen ? '退出全屏' : '全屏';
    //console.log('MindTube iframe: updateFullscreenButtonState called. isVideoFs:', isVideoFs, 'Button active class:', toggleFullscreenButton.classList.contains('active'));
  } else {
    console.warn('MindTube iframe: toggleFullscreenButton element not found in updateFullscreenButtonState.');
  }

  // Center the mindmap when fullscreen state changes
  if (markmap) {
    // Delay fitting to allow browser to resize iframe
    // Delay fitting to allow browser to resize iframe and then robustly fit
    setTimeout(() => {
      fitMarkmapRobustly();
      //console.log('MindTube iframe: Called fitMarkmapRobustly on fullscreen change after delay.');
    }, 250); // Increased delay for robust fit checks during fullscreen changes
  } else {
    console.warn('MindTube iframe: markmap instance not available to fit on fullscreen change.');
  }
  updateVideoControlButtons(isVideoFs);
}

// Update video play/pause button states based on video playing status
function updateVideoControlButtons(isPlaying) {
  if (videoPlayButton && videoPauseButton) {
    if (isPlaying) {
      // Video is playing - show pause button, hide play button
      videoPlayButton.classList.add('hidden');
      videoPauseButton.classList.remove('hidden');
    } else {
      // Video is paused - show play button, hide pause button
      videoPlayButton.classList.remove('hidden');
      videoPauseButton.classList.add('hidden');
    }
    //console.log('MindTube iframe: Updated video control buttons. isPlaying:', isPlaying);
  } else {
    console.warn('MindTube iframe: Video control buttons not found in updateVideoControlButtons.');
  }
}

// New helper function to robustly fit the markmap
function fitMarkmapRobustly() {
  if (!markmap || !markmapElement) {
    //console.warn('MindTube iframe: Markmap or element not available for robust fitting.');
    return;
  }

  let attempts = 0;
  const maxAttempts = 300; // Approx. 5 seconds (300 frames / 60fps)

  const attemptFit = () => {
    attempts++;
    if (markmapElement.offsetWidth > 0 && markmapElement.offsetHeight > 0) {
      markmap.fit().catch(e => console.error('Error fitting markmap robustly:', e));
      //console.log('MindTube iframe: Executed markmap.fit() robustly. Attempts:', attempts);
    } else if (attempts < maxAttempts) {
      //console.log('MindTube iframe: Markmap element not ready for fit (robustly), retrying next frame. Attempt:', attempts, 'Dimensions:', markmapElement.offsetWidth, markmapElement.offsetHeight);
      requestAnimationFrame(attemptFit);
    } else {
      console.error('MindTube iframe: Max attempts reached for fitting markmap. Element dimensions remained zero.');
    }
  };
  requestAnimationFrame(attemptFit);
}

// Update transparency slider position
function updateSliderPosition(e) {
  const rect = transparencySlider.getBoundingClientRect();
  const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
  const percent = x / rect.width;
  
  transparency = percent;
  transparencySliderFill.style.width = `${percent * 100}%`;
  transparencySliderThumb.style.left = `${percent * 100}%`;
  
  updateTransparency(transparency);
}

// Update transparency
function updateTransparency(value) {
  const container = document.getElementById('mindmap-container');
  container.style.backgroundColor = `rgba(255, 255, 255, ${value})`;
  
  // Update for dark mode
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    container.style.backgroundColor = `rgba(26, 32, 44, ${value})`;
  }
}

// Transform markdown content to markmap data
function transformMarkdown(markdown) {
  //console.log('Transforming markdown:', markdown);
  
  // Check if transformer is available on window.markmap
  if (!window.markmap || !window.markmap.transformer) {
    console.error('Markmap transformer not found');
    // Attempt to create it again if it wasn't created at the top
    if (window.markmap && window.markmap.Transformer && !window.markmap.transformer) {
        //console.log('Attempting to create transformer instance in transformMarkdown');
        window.markmap.transformer = new window.markmap.Transformer();
    }
    // If still not available, return fallback
    if (!window.markmap || !window.markmap.transformer) {
        // Ensure a default empty string if markdown is null or undefined
        return { content: markdown || '' };
    }
  }
  
  try {
    // Use transformer if available
    return window.markmap.transformer.transform(markdown).root;
  } catch (error) {
    console.error('Error transforming markdown:', error);
    // Fallback to simple object
    return { content: markdown || '# No content available' };
  }
}

// Fetch mindmap data
function fetchMindmap() {
  try {
    //console.log('Fetching mindmap with ID:', mindmapId);
    loadingElement = document.querySelector('.loading');
    
    if (!mindmapId) {
      showError('No mindmap ID provided');
      return;
    }
    
    // Communicate with the background script
    window.parent.postMessage({ 
      type: 'fetchApi', 
      endpoint: `/mindmaps/${mindmapId}`
    }, '*');
    
    //console.log('Sent fetchApi request to parent');
    
    // Listen for the API response from the content script
    window.addEventListener('message', (event) => {
      //console.log('Received message from parent:', event.data);
      const { type, data, error } = event.data;
      
      if (type === 'apiResponse') {
        if (error) {
          console.error('API error:', error);
          showError(`Error: ${error}`);
          return;
        }
        
        if (data && data.markmap) { 
          originalMarkmapApiResponseData = data; // Store the full API response data
          //console.log('Received markmap content:', data.markmap.substring(0, 100) + '...');
          
          // Transform and store the root for initial rendering
          transformedMindmapRoot = transformMarkdown(data.markmap); 
          //console.log('Transformed to mindmap data for initial render:', transformedMindmapRoot);
          
          // Initialize markmap with the transformed root
          initializeMarkmap(transformedMindmapRoot);
        } else {
          console.error('Invalid or empty markmap data in API response:', data);
          showError('Mindmap content (markmap) is invalid or empty in API response');
        }
      } else if (type === 'SET_MINDMAP_TRANSPARENCY' && event.data.hasOwnProperty('alpha')) {
        //console.log('MindTube iframe: Received SET_MINDMAP_TRANSPARENCY', event.data.alpha);
        // Directly update the visual transparency without changing the slider's logical value
        const mindmapBgContainer = document.getElementById('mindmap-container');
        if (mindmapBgContainer) {
            const currentBgColor = window.getComputedStyle(mindmapBgContainer).backgroundColor;
            const isDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
            const baseRgb = isDark ? '26, 32, 44' : '255, 255, 255';
            mindmapBgContainer.style.backgroundColor = `rgba(${baseRgb}, ${event.data.alpha})`;
        }
      } else if (type === 'UPDATE_FULLSCREEN_BUTTON_STATE' && event.data.hasOwnProperty('isFullscreen')) {
        //console.log('MindTube iframe: Received UPDATE_FULLSCREEN_BUTTON_STATE', event.data.isFullscreen);
        updateFullscreenButtonState(event.data.isFullscreen);
      } else if (type === 'UPDATE_VIDEO_STATUS' && event.data.hasOwnProperty('isPlaying')) {
        //console.log('MindTube iframe: Received UPDATE_VIDEO_STATUS', event.data.isPlaying);
        updateVideoControlButtons(event.data.isPlaying);
      } else if (type === 'FIT_MARKMAP') {
        //console.log('MindTube iframe: Received FIT_MARKMAP request.');
        if (markmap) {
          // Delay slightly to allow initial rendering after visibility change, then robustly fit
          setTimeout(() => {
            fitMarkmapRobustly();
          }, 100); // Initial delay before starting robust fit checks
        } else {
          console.warn('MindTube iframe: FIT_MARKMAP received but markmap instance not available.');
        }
      }
    });
  } catch (error) {
    console.error('Error fetching mindmap:', error);
    showError('Error loading mindmap: ' + error.message);
  }
}

// When DOM is loaded, fetch mindmap
document.addEventListener('DOMContentLoaded', () => {
  //console.log('DOM loaded, fetching mindmap');
  // Ensure transformer is created if not already (e.g. if script was reordered)
  if (window.markmap && !window.markmap.transformer && window.markmap.Transformer) {
    //console.log('Creating transformer from Transformer constructor (DOMContentLoaded)');
    window.markmap.transformer = new window.markmap.Transformer();
  }
  
  // Add styles to override cursor for markmap nodes
  addMarkmapStyles();
  
  // Fetch the mindmap data
  fetchMindmap(); // This sets up the message listener

  // Notify the parent window that the iframe is ready to receive messages
  //console.log('MindTube iframe: DOMContentLoaded, sending IFRAME_READY_FOR_MESSAGES to parent.');
  window.parent.postMessage({ type: 'IFRAME_READY_FOR_MESSAGES' }, '*');
});
