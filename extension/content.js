// Configuration
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8000/api/v1'; // Fallback for development

// Main functionality
(function() {
  // Track if mindmap is already displayed
  let mindmapDisplayed = false;
  let mindmapContainer = null;
  let mindmapOverlay = null;
  let isMindmapGUIVisible = true; // To track visibility state for the toggle button
  let currentVideoId = null;
  let ytPlayer = null;
  let accessToken = null;
  let isIframeContentReady = false;
  let pendingIframeMessages = [];
  let mindmapElementsInitialized = false; // For Req 3
  let mindmapInitiallyPresent = null; // null: unknown, true: exists, false: not exists/no token/error

  // Ensure Font Awesome is loaded
  function ensureFontAwesomeLoaded() {
    // Check if Font Awesome is already loaded
    const fontAwesomeLoaded = document.querySelector('link[href*="font-awesome"]') !== null;
    if (!fontAwesomeLoaded) {
      // Create link element for Font Awesome
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = chrome.runtime.getURL('font-awesome/css/font-awesome.min.css');
      document.head.appendChild(link);
      //console.log('MindTube Content: Font Awesome stylesheet has been added to the page.');
    }
  }

  // Handle ESC key to hide mindmap
  document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape' && mindmapDisplayed) {
      //console.log('MindTube Content: ESC key pressed, hiding mindmap');
      concealMindmapVisuals();
    }
  });

  // Initialize
  function init() {
    //console.log('MindTube Content: init() called for URL:', window.location.href);
    // Check if we're on a YouTube watch page
    if (!window.location.href.includes('youtube.com/watch')) {
      //console.log('MindTube Content: Not a YouTube watch page. Exiting init().');
      return;
    }
    //console.log('MindTube Content: YouTube watch page detected.');

    // Ensure Font Awesome is loaded for icons
    ensureFontAwesomeLoaded();

    // Get video ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const videoId = urlParams.get('v');
    
    if (!videoId) {
      console.error('MindTube Content: No video ID found in URL');
      return;
    }
    //console.log('MindTube Content: Video ID found:', videoId);

    currentVideoId = videoId;

    // First check if we have an access token
    chrome.runtime.sendMessage({ action: 'getToken' }, function(response) {
      //console.log('MindTube Content: Token check response:', response);
      
      // If we have a token, it will be set in the accessToken variable
      if (response && response.token) {
        accessToken = response.token;
      }
      
      // Add a floating button regardless of auth status (button click will handle auth check)
      // The button's initial style will be set/updated once token and mindmap status are known.
      const existingButton = document.querySelector('.mindtube-btn-container');
      if (!existingButton) {
        addFloatingButton(); 
      }

      // Asynchronously check token and initial mindmap status
      if (response && response.token) {
        accessToken = response.token;
        findExistingMindmap(currentVideoId)
          .then(mindmap => {
            mindmapInitiallyPresent = !!mindmap;
            updateAllMindmapButtonStyles();
          })
          .catch(error => {
            console.error('MindTube Content: Error checking initial mindmap status:', error);
            mindmapInitiallyPresent = false;
            updateAllMindmapButtonStyles();
          });
      } else {
        mindmapInitiallyPresent = false; // No token
        updateAllMindmapButtonStyles();
      }
    });

    // Add button after video loaded with better resilience and retries
    tryToAddButtonWithRetries();
  }

  // New function to attempt adding the button with retries
  function tryToAddButtonWithRetries(attemptsRemaining = 5) {
    //console.log('MindTube Content: tryToAddButtonWithRetries called. Attempts remaining:', attemptsRemaining);
    
    // If we already have a properly integrated button (not floating), no need to try again
    const existingIntegratedButton = document.querySelector('.mindtube-btn-container:not([style*="position: fixed"])');
    if (existingIntegratedButton) {
      //console.log('MindTube Content: Integrated button already exists, no need for retry.');
      return;
    }
    
    waitForYouTubePlayerAPI()
      .then(() => {
        //console.log('MindTube Content: YouTube Player API ready.');
        // Wait for YouTube elements to be loaded using multiple possible selectors
        const selectors = [
          '#above-the-fold',
          'ytd-watch-metadata',
          '#primary-inner',
          '#primary',
          '#info-contents',
          '#meta-contents',
          '#info',
          '#meta',
          // Additional selectors for better coverage
          'ytd-menu-renderer[has-items]',
          '#actions-inner', 
          '#actions',
          'ytd-video-primary-info-renderer #info #menu',
          'ytd-video-primary-info-renderer #info',
          'ytd-watch-metadata #actions',
          'ytd-watch-metadata',
          // Try the newer redesigned layout buttons
          '#top-level-buttons-computed'
        ];
        
        // Try each selector in sequence to find a better position for the button
        tryNextSelector(selectors, 0);
      })
      .catch(err => {
        console.error('MindTube Content: Error waiting for YouTube Player API', err);
        if (attemptsRemaining > 0) {
          //console.log(`MindTube Content: Retrying button addition in 1 second. ${attemptsRemaining} attempts remaining.`);
          setTimeout(() => tryToAddButtonWithRetries(attemptsRemaining - 1), 1000);
        } else {
          console.error('MindTube Content: Failed to add button after all retry attempts.');
          // Ensure we at least have a floating button
          const existingButton = document.querySelector('.mindtube-btn-container');
          if (!existingButton) {
            addFloatingButton();
          }
        }
      });
  }

  // Wait for YouTube Player API to be available
  function waitForYouTubePlayerAPI() {
    return new Promise((resolve, reject) => {
      //console.log('MindTube Content: waitForYouTubePlayerAPI (script injection method) initiated.');
      const scriptId = 'mindtube-yt-api-checker';
      
      const existingScript = document.getElementById(scriptId);
      if (existingScript) {
        existingScript.remove();
      }

      const timeoutDuration = 20000; // 20 seconds overall timeout

      let fallbackTimerId = setTimeout(() => {
        console.error('MindTube Content: waitForYouTubePlayerAPI timed out.');
        window.removeEventListener('message', messageHandler);
        document.getElementById(scriptId)?.remove();
        
        // If timeout occurs, try direct approach as a fallback
        if (window.YT && typeof window.YT.Player === 'function') {
          //console.log('MindTube Content: YT.Player API is available despite timeout.');
          resolve();
          return;
        }
        
        const moviePlayer = document.querySelector('#movie_player');
        if (moviePlayer && typeof moviePlayer.seekTo === 'function') {
          //console.log('MindTube Content: #movie_player is available despite timeout.');
          resolve();
          return;
        }
        
        reject(new Error('YouTube Player API detection timed out.'));
      }, timeoutDuration);

      const messageHandler = (event) => {
        if (event.source === window && event.data && event.data.type === 'MINDTUBE_YT_API_RESPONSE') {
          //console.log('MindTube Content: Received message from injected script:', event.data.detail);
          clearTimeout(fallbackTimerId);
          window.removeEventListener('message', messageHandler);
          document.getElementById(scriptId)?.remove();
          if (event.data.detail && event.data.detail.isReady) {
            //console.log('MindTube Content: YT.Player API is confirmed ready by injected script.');
            resolve();
          } else {
            console.error('MindTube Content: Injected script reported YT.Player API not ready or error:', event.data.detail?.error);
            reject(new Error(event.data.detail?.error || 'Injected script reported API not ready.'));
          }
        }
      };
      window.addEventListener('message', messageHandler, false);

      const script = document.createElement('script');
      script.id = scriptId;
      script.src = chrome.runtime.getURL('dist/page_script.bundle.js');
      (document.head || document.documentElement).appendChild(script);
      script.onload = () => {
        // The script will now run in the page context and post a message.
        // We don't need to remove it immediately after onload as it's self-contained.
        // It will be removed if it times out or after it posts its message.
      };
      script.onerror = (e) => {
        console.error('MindTube Content: Error loading injected page_script.js:', e);
        clearTimeout(fallbackTimerId);
        window.removeEventListener('message', messageHandler);
        document.getElementById(scriptId)?.remove();
        reject(new Error('Failed to load page_script.js for YT API check.'));
      };
    });
  }

  // Wait for a specific element to be loaded in the DOM
  function waitForElement(selector) {
    return new Promise((resolve, reject) => {
      const existingElement = document.querySelector(selector);
      if (existingElement) {
        return resolve(existingElement);
      }

      const observer = new MutationObserver(mutations => {
        const foundElement = document.querySelector(selector);
        if (foundElement) {
          observer.disconnect();
          resolve(foundElement);
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true
      });

      // Set timeout to avoid waiting forever
      setTimeout(() => {
        observer.disconnect();
        reject(new Error(`Element ${selector} not found within timeout`));
      }, 10000);
    });
  }

  // Try selectors in sequence until one works
  function tryNextSelector(selectors, index) {
    if (index >= selectors.length) {
      console.error('MindTube Content: All selectors failed. Keeping floating button.');
      // Last resort - add floating button
      addFloatingButton();
      return;
    }
    
    const selector = selectors[index];
    //console.log(`MindTube Content: Trying selector ${selector} (${index + 1}/${selectors.length})...`);
    
    waitForElement(selector)
      .then(targetElement => {
        //console.log(`MindTube Content: Element ${selector} found.`, targetElement);
        
        // Try to replace the floating button with an embedded one
        const floatingButton = document.querySelector('.mindtube-btn-container[style*="position: fixed"]');
        if (floatingButton) {
          //console.log('MindTube Content: Replacing floating button with embedded one.');
          addMindmapButton(targetElement, floatingButton);
        } else {
          // Only add a new button if there's no existing button
          const existingButton = document.querySelector('.mindtube-btn-container:not([style*="position: fixed"])');
          if (!existingButton) {
            addMindmapButton(targetElement);
          } else {
            //console.log('MindTube Content: Button already exists in the UI. No need to add another one.');
          }
        }
      })
      .catch(err => {
        //console.log(`MindTube Content: Selector ${selector} failed:`, err.message);
        // Try next selector
        tryNextSelector(selectors, index + 1);
      });
  }

  // Add the mindmap button to the YouTube interface
  function addMindmapButton(targetElement, floatingButtonToReplace) { // targetElement is the found YouTube element
    //console.log('MindTube Content: addMindmapButton() called.');
    
    // If we need to replace an existing floating button
    if (floatingButtonToReplace) {
      // Remove the existing floating button
      floatingButtonToReplace.remove();
    }
    
    // Check if another button already exists
    const existingButton = document.querySelector('.mindtube-btn-container');
    if (existingButton && !floatingButtonToReplace) {
      //console.log('MindTube Content: Button already exists. Not adding another one.');
      return;
    }
    
    // Create button container
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'mindtube-btn-container';
    
    // Create button with Font Awesome icons
    const mindmapButton = document.createElement('button');
    mindmapButton.className = 'mindtube-btn';
    
    // Always use Font Awesome icons with YouTube-like styling
    mindmapButton.innerHTML = '<img src="' + chrome.runtime.getURL('icons/logo1.png') + '" alt="MindTube" style="width: 16px; height: 16px; vertical-align: middle;"><span>MindTube</span><i class="fa fa-eye mindtube-eye"></i>';
    
    mindmapButton.title = '顯示MindTube思維導圖';

    // Apply initial style if known
    if (mindmapInitiallyPresent !== null) {
      mindmapButton.style.backgroundColor = mindmapInitiallyPresent ? '' : 'transparent';
    }

    // Add event listener to button
    mindmapButton.addEventListener('click', handleMindmapButtonClick);
    
    // Add button to container
    buttonContainer.appendChild(mindmapButton);
    
    // Try various selectors for the button container (YouTube's UI structure changes frequently)
    let inserted = false;
    
    // YouTube Shorts has a completely different UI structure
    if (window.location.pathname.includes('/shorts/')) {
      // If we're on the Shorts page, add floating button in the bottom right
      addFloatingButton(true); // true = shorts mode
      return;
    }
    
    // Primary option: Insert after the Save/Watch Later button which is a more consistent placement
    const saveButton = document.querySelector('ytd-button-renderer.ytd-menu-renderer ytd-save-button-renderer, ytd-button-renderer.ytd-menu-renderer:has([aria-label="Save"]), button[aria-label="Save"]');
    if (saveButton && saveButton.parentNode) {
      const saveButtonParent = saveButton.closest('ytd-menu-renderer') || saveButton.parentNode;
      //console.log('MindTube Content: Found Save button. Inserting after it.');
      
      // Get all visible top-level buttons
      const allButtons = Array.from(saveButtonParent.querySelectorAll('ytd-button-renderer, button.yt-spec-button-shape-next'))
        .filter(button => {
          // Only include visible buttons
          const style = window.getComputedStyle(button);
          return style.display !== 'none' && style.visibility !== 'hidden';
        });
      
      // Find the Save button's index
      const saveIndex = allButtons.findIndex(button => {
        return button === saveButton || button.contains(saveButton);
      });
      
      // Check if there's a Download button (often follows Save)
      const downloadButton = allButtons.find(button => {
        const label = button.getAttribute('aria-label') || '';
        const innerText = button.innerText || '';
        return label.toLowerCase().includes('download') || innerText.toLowerCase().includes('download');
      });
      
      // If there's a download button after save, insert after it
      if (downloadButton && saveIndex >= 0) {
        const downloadIndex = allButtons.indexOf(downloadButton);
        if (downloadIndex > saveIndex) {
          if (downloadButton.nextSibling) {
            downloadButton.parentNode.insertBefore(buttonContainer, downloadButton.nextSibling);
          } else {
            downloadButton.parentNode.appendChild(buttonContainer);
          }
          inserted = true;
          //console.log('MindTube Content: Inserted after Download button.');
          return; // Exit early if inserted successfully
        }
      }
      
      // Otherwise insert after the Save button
      if (saveButton.nextSibling) {
        saveButton.parentNode.insertBefore(buttonContainer, saveButton.nextSibling);
      } else {
        saveButton.parentNode.appendChild(buttonContainer);
      }
      inserted = true;
      //console.log('MindTube Content: Inserted after Save button.');
      return; // Exit early if inserted successfully
    }
    
    // Modern YouTube selectors (2023-2024)
    if (!inserted) {
      const topLevelButtons = document.querySelector('ytd-watch-metadata ytd-menu-renderer #top-level-buttons-computed');
      if (topLevelButtons) {
        //console.log('MindTube Content: Found modern top-level-buttons-computed. Appending button.');
        
        // Check if we need to add spacing with other buttons
        const existingButtons = topLevelButtons.querySelectorAll('ytd-button-renderer, .mindtube-btn-container');
        if (existingButtons.length > 0) {
          buttonContainer.style.marginLeft = '8px';
        }
        
        topLevelButtons.appendChild(buttonContainer);
        inserted = true;
      }
    }
    
    // Alternative modern path
    if (!inserted) {
      const flexTopLevelButtons = document.querySelector('ytd-watch-flexy #above-the-fold #top-level-buttons-computed');
      if (flexTopLevelButtons) {
        //console.log('MindTube Content: Found flexy top-level-buttons-computed. Appending button.');
        
        // Check if we need to add spacing with other buttons
        const existingButtons = flexTopLevelButtons.querySelectorAll('ytd-button-renderer, .mindtube-btn-container');
        if (existingButtons.length > 0) {
          buttonContainer.style.marginLeft = '8px';
        }
        
        flexTopLevelButtons.appendChild(buttonContainer);
        inserted = true;
      }
    }
    
    // Try the new redesigned layout (late 2023)
    if (!inserted) {
      const segmentedButtons = document.querySelector('#actions #segmented-buttons ytd-segmented-like-dislike-button-renderer');
      if (segmentedButtons && segmentedButtons.parentNode) {
        //console.log('MindTube Content: Found segmented-buttons. Appending button after.');
        
        // Make sure we add adequate spacing after the like/dislike button
        buttonContainer.style.marginLeft = '8px';
        
        // Check for YouTube's new design with dark buttons
        const isDarkButtonDesign = document.querySelector('.yt-spec-button-shape-next--mono') !== null;
        
        // In the new design, buttons are frequently repositioned, so position carefully
        if (isDarkButtonDesign) {
          // Try to find buttons in the correct order: Share, Download, Clip, etc.
          const actionButtons = document.querySelectorAll('#actions .yt-spec-button-shape-next');
          const shareButton = Array.from(actionButtons).find(btn => 
            btn.textContent.toLowerCase().includes('share') || 
            btn.getAttribute('aria-label')?.toLowerCase().includes('share')
          );
          
          const downloadButton = Array.from(actionButtons).find(btn => 
            btn.textContent.toLowerCase().includes('download') || 
            btn.getAttribute('aria-label')?.toLowerCase().includes('download')
          );
          
          // Find the rightmost standard button to insert after
          let insertAfterButton = null;
          if (downloadButton) {
            insertAfterButton = downloadButton;
          } else if (shareButton) {
            insertAfterButton = shareButton;
          }
          
          if (insertAfterButton && insertAfterButton.parentNode) {
            insertAfterButton.parentNode.insertBefore(buttonContainer, insertAfterButton.nextSibling);
            inserted = true;
            return; // Successfully inserted
          }
        }
        
        // Try to find the share button, which usually comes after like/dislike
        const shareButton = document.querySelector('#actions #segmented-buttons + * ytd-button-renderer:has([aria-label="Share"]), #actions button[aria-label="Share"]');
        if (shareButton) {
          // Insert before share button to maintain YouTube's layout
          shareButton.parentNode.insertBefore(buttonContainer, shareButton);
        } else {
          // If no share button, insert after the segmented buttons
          segmentedButtons.parentNode.insertBefore(buttonContainer, segmentedButtons.nextSibling);
        }
        inserted = true;
      }
    }
    
    // Try the menu renderer directly
    if (!inserted) {
      const menuRenderer = document.querySelector('ytd-menu-renderer[has-items]');
      if (menuRenderer) {
        //console.log('MindTube Content: Found ytd-menu-renderer[has-items]. Appending button.');
        
        // Check if buttons already exist and need spacing
        const existingButtons = menuRenderer.querySelectorAll('ytd-button-renderer, .mindtube-btn-container');
        if (existingButtons.length > 0) {
          buttonContainer.style.marginLeft = '8px';
        }
        
        menuRenderer.appendChild(buttonContainer);
        inserted = true;
      }
    }
    
    // Try various action buttons containers
    if (!inserted) {
      const actionContainers = [
        '#actions-inner', 
        '#actions',
        'ytd-video-primary-info-renderer #info #menu',
        'ytd-video-primary-info-renderer #info',
        'ytd-watch-metadata #actions',
        'ytd-watch-metadata'
      ];
      
      for (const selector of actionContainers) {
        const container = document.querySelector(selector);
        if (container) {
          //console.log(`MindTube Content: Found ${selector}. Appending button.`);
          
          // Check for existing buttons to maintain proper spacing
          const existingButtons = container.querySelectorAll('ytd-button-renderer, .mindtube-btn-container');
          if (existingButtons.length > 0) {
            buttonContainer.style.marginLeft = '8px';
          }
          
          container.appendChild(buttonContainer);
          inserted = true;
          break;
        }
      }
    }
    
    // Try to insert next to share button if it exists
    if (!inserted) {
      const shareButton = document.querySelector('ytd-button-renderer.ytd-menu-renderer:has([aria-label="Share"]), button[aria-label="Share"]');
      if (shareButton && shareButton.parentNode) {
        //console.log('MindTube Content: Found share button. Inserting after it.');
        
        // Set margin to create space between share and MindTube
        buttonContainer.style.marginLeft = '8px';
        
        if (shareButton.nextSibling) {
          shareButton.parentNode.insertBefore(buttonContainer, shareButton.nextSibling);
        } else {
          shareButton.parentNode.appendChild(buttonContainer);
        }
        inserted = true;
      }
    }
    
    // Try to add below video title
    if (!inserted) {
      const titleElement = document.querySelector('h1.title, h1.ytd-watch-metadata, ytd-watch-metadata h1');
      if (titleElement && titleElement.parentNode) {
        //console.log('MindTube Content: Found title element. Inserting after it.');
        titleElement.parentNode.insertBefore(buttonContainer, titleElement.nextSibling);
        inserted = true;
      }
    }
    
    // If we have a target element, try to append to it or after it
    if (!inserted && targetElement) {
      //console.log('MindTube Content: Using provided target element.');
      try {
        targetElement.appendChild(buttonContainer);
        inserted = true;
      } catch (e) {
        //console.log('MindTube Content: Could not append to target element, trying insertBefore.');
        if (targetElement.parentNode) {
          targetElement.parentNode.insertBefore(buttonContainer, targetElement.nextSibling);
          inserted = true;
        }
      }
    }
    
    // Last resort - floating button
    if (!inserted) {
      console.error('MindTube Content: Could not find any suitable container. Adding floating button.');
      addFloatingButton();
    }
    
    // Set up an observer to detect if our button gets removed by YouTube
    // (which can happen during dynamic UI updates)
    if (inserted) {
      const buttonObserver = new MutationObserver((mutations) => {
        // Check if our button was removed
        if (!document.body.contains(buttonContainer)) {
          //console.log('MindTube Content: Button was removed from DOM, reinserting');
          buttonObserver.disconnect();
          // Re-attempt to add the button after a short delay
          setTimeout(() => tryToAddButtonWithRetries(3), 1000);
        }
      });
      
      // Observe the parent element for child removals
      if (buttonContainer.parentNode) {
        buttonObserver.observe(buttonContainer.parentNode, { childList: true });
        
        // Disconnect after a reasonable time to avoid memory leaks
        setTimeout(() => {
          buttonObserver.disconnect();
        }, 60000); // Stop observing after 1 minute
      }
    }
  }

  // Add a floating button as last resort
  function addFloatingButton(shortsMode = false) {
    //console.log('MindTube Content: addFloatingButton() called.');
    
    // Create container
    const floatingContainer = document.createElement('div');
    floatingContainer.className = 'mindtube-btn-container';
    floatingContainer.style.position = 'fixed';
    
    // Position differently for shorts vs regular videos
    if (shortsMode) {
      floatingContainer.style.bottom = '140px'; // Higher position for Shorts
      floatingContainer.style.right = '16px';
    } else {
      floatingContainer.style.bottom = '80px';
      floatingContainer.style.right = '16px';
    }
    
    floatingContainer.style.zIndex = '9000';
    
    // Create button
    const mindmapButton = document.createElement('button');
    mindmapButton.className = 'mindtube-btn';
    
    // Always use Font Awesome icons
    if (shortsMode) {
      // Simplified button for shorts without text
      mindmapButton.innerHTML = '<img src="' + chrome.runtime.getURL('icons/logo1.png') + '" alt="MindTube" style="width: 16px; height: 16px; margin: 0;"><i class="fa fa-eye mindtube-eye" style="margin-left: 4px;"></i>';
      mindmapButton.style.borderRadius = '50%';
      mindmapButton.style.width = '40px';
      mindmapButton.style.height = '40px';
      mindmapButton.style.padding = '0';
      mindmapButton.style.justifyContent = 'center';
    } else {
      mindmapButton.innerHTML = '<img src="' + chrome.runtime.getURL('icons/logo1.png') + '" alt="MindTube" style="width: 16px; height: 16px; vertical-align: middle; margin-right: 5px;"><span>MindTube</span><i class="fa fa-eye mindtube-eye"></i>';
    }
    
    mindmapButton.title = '顯示MindTube思維導圖';

    // Apply initial style if known
    if (mindmapInitiallyPresent !== null) {
      mindmapButton.style.backgroundColor = mindmapInitiallyPresent ? '' : 'transparent';
    }

    // Add event listener to button
    mindmapButton.addEventListener('click', handleMindmapButtonClick);
    
    // Add button to container
    floatingContainer.appendChild(mindmapButton);
    
    document.body.appendChild(floatingContainer);
  }

  // Handle the mindmap button click
  async function handleMindmapButtonClick() {
    //console.log('MindTube Content: handleMindmapButtonClick called. mindmapElementsInitialized:', mindmapElementsInitialized, 'mindmapDisplayed:', mindmapDisplayed);

    if (!mindmapElementsInitialized) {
      //console.log('MindTube Content: Mindmap elements not initialized. Starting full setup.');
      // First time click: Full setup flow
      chrome.runtime.sendMessage({ action: 'getToken' }, async function(response) {
        if (chrome.runtime.lastError) {
          console.error('MindTube Content: Error getting token:', chrome.runtime.lastError);
          alert('Error: Could not connect to MindTube. Please try refreshing.');
          return;
        }
        accessToken = response?.token;

        if (!accessToken) {
          //console.log('MindTube Content: No token. Attempting localhost auth then manual prompt.');
          showLoadingIndicator('連接到 MindTube...');
          chrome.runtime.sendMessage({ action: 'checkLocalHostAuth' }, () => {
            setTimeout(() => {
              chrome.runtime.sendMessage({ action: 'getToken' }, async function(retryResponse) {
                hideLoadingIndicator();
                if (retryResponse?.token) {
                  accessToken = retryResponse.token;
                  await proceedWithMindmapCreationOrDisplay();
                } else {
                  promptForManualLogin();
                }
              });
            }, 1000);
          });
          return;
        }
        await proceedWithMindmapCreationOrDisplay();
      });
    } else {
      // Elements already initialized, just toggle visibility
      if (mindmapDisplayed) {
        concealMindmapVisuals();
        // Update the eye icon in the main button
        updateEyeIcon(false);
      } else {
        displayMindmapVisuals();
        // Update the eye icon in the main button
        updateEyeIcon(true);
      }
    }
  }

  async function proceedWithMindmapCreationOrDisplay() {
    try {
      const mindmap = await findExistingMindmap(currentVideoId);
      const mindmapButtons = document.querySelectorAll('.mindtube-btn');

      if (mindmap) {
        mindmapButtons.forEach(btn => btn.style.backgroundColor = ''); // Reset to default (let CSS handle it)
        initializeAndDisplayMindmap(mindmap); // Initializes if needed, then displays
      } else {
        mindmapButtons.forEach(btn => btn.style.backgroundColor = 'transparent');
        // When createNewMindmap eventually calls initializeAndDisplayMindmap, 
        // the background color will be reset/handled there.
        createNewMindmap(currentVideoId); // This will eventually call initializeAndDisplayMindmap
      }
    } catch (error) {
      hideLoadingIndicator(); // Ensure loading is hidden on error
      console.error('MindTube Content: Error in proceedWithMindmapCreationOrDisplay:', error);
      alert('Error: Could not load or create mindmap. Please ensure you are logged in to MindTube.');
    }
  }

  // Check if a mindmap exists for the current video
  async function findExistingMindmap(videoId) {
    //console.log(`MindTube Content: findExistingMindmap(${videoId}) called.`);
    try {
      // First try to find a user-owned mindmap
      //console.log(`MindTube Content: Fetching user's mindmaps from ${API_BASE_URL}/mindmaps/`);
      const userMindmap = await fetchMindmaps(videoId, false);
      if (userMindmap) {
        //console.log('MindTube Content: Found user-owned mindmap:', userMindmap);
        return userMindmap;
      }
      
      // If no user-owned mindmap, try to find a public one
      //console.log(`MindTube Content: Fetching public mindmaps from ${API_BASE_URL}/mindmaps/?public_only=true`);
      const publicMindmap = await fetchMindmaps(videoId, true);
      if (publicMindmap) {
        //console.log('MindTube Content: Found public mindmap:', publicMindmap);
        return publicMindmap;
      }
      
      return null;
    } catch (error) {
      console.error('MindTube Content: Error finding existing mindmap:', error);
      throw error;
    }
  }
  
  // Helper function to fetch mindmaps with specific query parameters
  function fetchMindmaps(videoId, publicOnly) {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({
        action: 'fetchApi',
        url: `${API_BASE_URL}/mindmaps/${publicOnly ? '?public_only=true' : ''}`,
        options: {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          }
        }
      }, response => {
        if (chrome.runtime.lastError) {
          console.error('MindTube Content: Runtime error:', chrome.runtime.lastError);
          reject(chrome.runtime.lastError);
          return;
        }
        
        if (response.error) {
          console.error('MindTube Content: API error:', response.error);
          reject(new Error(response.error));
          return;
        }
        
        //console.log(`MindTube Content: fetchMindmaps API response status (publicOnly=${publicOnly}):`, response.status);
        
        if (response.status !== 200) {
          // If not authorized, clear the token
          if (response.status === 401 || response.status === 403) {
            console.warn('MindTube Content: Authentication failed (401/403). Clearing token.');
            chrome.runtime.sendMessage({ action: 'clearToken' });
            reject(new Error('Authentication failed. Please log in to MindTube again.'));
            return;
          }
          reject(new Error(`API request failed with status ${response.status}`));
          return;
        }
        
        const data = response.data;
        //console.log(`MindTube Content: fetchMindmaps API response data (publicOnly=${publicOnly}):`, data);
        
        // Find a mindmap with matching video ID
        const mindmap = data.data.find(m => m.youtube_video_id === videoId);
        
        resolve(mindmap || null);
      });
    });
  }

  // Create a new mindmap for the current video
  async function createNewMindmap(videoId) {
    //console.log(`MindTube Content: createNewMindmap(${videoId}) called.`);
    try {
      // Show loading indicator
      showLoadingIndicator('創建思維導圖中...');
      
      // Get video URL and title
      const videoTitleElement = document.querySelector('h1.title.ytd-watch-metadata');
      const videoTitle = videoTitleElement?.textContent?.trim() || 'YouTube Video';
      const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
      //console.log('MindTube Content: Video Title:', videoTitle, 'Video URL:', videoUrl);
      
      // Create new mindmap via API through background script to avoid CORS issues
      //console.log(`MindTube Content: Posting to ${API_BASE_URL}/mindmaps/ to create new mindmap.`);
      const response = await new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({
          action: 'fetchApi',
          url: `${API_BASE_URL}/mindmaps/`,
          options: {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
            body: {
              youtube_url: videoUrl,
              youtube_video_id: videoId,
              video_title: videoTitle
            }
          }
        }, response => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
            return;
          }
          resolve(response);
        });
      });
      //console.log('MindTube Content: createNewMindmap API response status:', response.status);
      
      if (response.status !== 200 && response.status !== 201) {
        hideLoadingIndicator();
        console.error('MindTube Content: createNewMindmap API error response:', response.error || response.data);
        throw new Error(`API request failed with status ${response.status}: ${response.error || 'Unknown error'}`);
      }
      
      const mindmap = response.data;
      //console.log('MindTube Content: createNewMindmap API response data:', mindmap);
      
      // Now check periodically for mindmap processing to complete
      //console.log('MindTube Content: Starting to check mindmap processing status for ID:', mindmap.id);
      // checkMindmapProcessingStatus will call initializeAndDisplayMindmap upon completion
      checkMindmapProcessingStatus(mindmap.id, initializeAndDisplayMindmap);
    } catch (error) {
      hideLoadingIndicator();
      console.error('MindTube Content: Error creating new mindmap:', error);
      alert(`Error creating mindmap: ${error.message}. Please try again later.`);
    }
  }

  // Check the processing status of a mindmap until it's ready
  function checkMindmapProcessingStatus(mindmapId, successCallback) {
    //console.log(`MindTube Content: checkMindmapProcessingStatus(${mindmapId}) initiated.`);
    let attempts = 0;
    const maxAttempts = 100; // 5 minutes / 3 seconds per attempt

    // Make sure loading indicator is showing with correct text
    hideLoadingIndicator(); // Hide any previous one
    showLoadingIndicator('處理思維導圖中...');

    const checkInterval = setInterval(async () => {
      attempts++;
      //console.log(`MindTube Content: Checking status for mindmap ${mindmapId}, attempt ${attempts}`);
      try {
        const response = await new Promise((resolve, reject) => {
          chrome.runtime.sendMessage({
            action: 'fetchApi',
            url: `${API_BASE_URL}/mindmaps/${mindmapId}`,
            options: {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
              }
            }
          }, response => {
            if (chrome.runtime.lastError) {
              reject(chrome.runtime.lastError);
              return;
            }
            resolve(response);
          });
        });
        
        if (response.status !== 200) {
          clearInterval(checkInterval);
          hideLoadingIndicator();
          console.error(`MindTube Content: Status check API error for ${mindmapId}:`, response.error || response.data);
          throw new Error(`API request failed with status ${response.status}: ${response.error || 'Unknown error'}`);
        }
        
        const mindmap = response.data;
        
        // Check if processing is complete (markmap should be populated)
        if (mindmap.markmap && mindmap.markmap.length > 0) {
          //console.log(`MindTube Content: Mindmap ${mindmapId} processing complete. Markmap data found.`);
          clearInterval(checkInterval);
          hideLoadingIndicator();
          successCallback(mindmap); // Call the success callback (initializeAndDisplayMindmap)
        } else {
          //console.log(`MindTube Content: Mindmap ${mindmapId} still processing...`);
        }
      } catch (error) {
        clearInterval(checkInterval);
        hideLoadingIndicator();
        console.error(`MindTube Content: Error checking mindmap status for ${mindmapId}:`, error);
        alert(`Error checking mindmap status: ${error.message}. Please try again later.`);
      }
    }, 3000); // Check every 3 seconds
    
    // Set a timeout to stop checking after 5 minutes
    setTimeout(() => {
      if (document.querySelector('.mindtube-loading-overlay')) { // Check if still loading
        console.warn(`MindTube Content: Mindmap ${mindmapId} generation timed out after 5 minutes.`);
        clearInterval(checkInterval);
        hideLoadingIndicator();
        alert('Mindmap generation is taking longer than expected. Please check the MindTube website later.');
      }
    }, 5 * 60 * 1000);
  }

  // Show loading indicator while creating/processing mindmap
  function showLoadingIndicator(text = '加載中...') {
    //console.log('MindTube Content: showLoadingIndicator() called.');
    if (document.querySelector('.mindtube-loading-overlay')) {
      //console.log('MindTube Content: Loading indicator already visible.');
      return;
    }
    const loadingOverlay = document.createElement('div');
    loadingOverlay.className = 'mindtube-loading-overlay';
    loadingOverlay.innerHTML = `
      <div class="mindtube-loading-spinner"></div>
      <div class="mindtube-loading-text">${text}</div>
    `;
    
    document.body.appendChild(loadingOverlay);
  }

  // Hide loading indicator
  function hideLoadingIndicator() {
    //console.log('MindTube Content: hideLoadingIndicator() called.');
    const loadingOverlay = document.querySelector('.mindtube-loading-overlay');
    if (loadingOverlay) {
      loadingOverlay.remove();
      //console.log('MindTube Content: Loading indicator removed.');
    } else {
      //console.log('MindTube Content: No loading indicator found to remove.');
    }
  }

  // Renamed from showMindmap - creates elements if they don't exist and displays them.
  function initializeAndDisplayMindmap(mindmapData) {
    //console.log('MindTube Content: initializeAndDisplayMindmap() called with data:', mindmapData);
    
    // Ensure Font Awesome is loaded for the toggle button icons
    ensureFontAwesomeLoaded();
    
    // Update the eye icon to show mindmap is visible
    updateEyeIcon(true);

    // Reset background color of the main MindTube button(s) as a mindmap is being displayed
    const mindmapButtons = document.querySelectorAll('.mindtube-btn');
    mindmapButtons.forEach(btn => btn.style.backgroundColor = ''); // Reset to default or CSS defined
    
    if (!mindmapElementsInitialized) {
      // Create container for the mindmap
      mindmapContainer = document.createElement('div');
      mindmapContainer.className = 'mindtube-mindmap-container';
      
      // Create overlay background
      mindmapOverlay = document.createElement('div');
      mindmapOverlay.className = 'mindtube-overlay';
      mindmapOverlay.style.display = 'none'; // Initially hidden

      // Create iframe to display the mindmap
      const iframe = document.createElement('iframe');
      iframe.className = 'mindtube-iframe';
      iframe.src = `${chrome.runtime.getURL('iframe.html')}?id=${mindmapData.id}`;
      iframe.allow = 'fullscreen';
      
      // Create and append the close button
      const mindmapToggleButton = document.createElement('button');
      mindmapToggleButton.className = 'mindtube-toggle-btn';
      // Set a distinct, visible background color for the button
      mindmapToggleButton.style.backgroundColor = 'rgba(123, 104, 238, 0.9)';
      mindmapToggleButton.style.color = 'white';
      updateToggleButtonState(true); // Initialize with shown state since we're displaying after creation
      
      mindmapToggleButton.addEventListener('click', toggleMindmapVisibility);
      mindmapContainer.appendChild(mindmapToggleButton);
      mindmapContainer.appendChild(iframe);
      document.body.appendChild(mindmapOverlay);
      document.body.appendChild(mindmapContainer);
      
      // Update YouTube player reference using multiple methods to ensure we have a valid reference
      updateYouTubePlayerReference();
      
      // Set up message listener for iframe communication (add only once)
      window.addEventListener('message', handleIframeMessage);
      mindmapElementsInitialized = true;
      //console.log('MindTube Content: Mindmap elements initialized.');
    }
    displayMindmapVisuals();
  }

  // New function to toggle mindmap visibility
  function toggleMindmapVisibility() {
    if (mindmapDisplayed) {
      concealMindmapVisuals();
    } else {
      displayMindmapVisuals();
    }
    updateToggleButtonState(mindmapDisplayed);
  }

  // New function to update toggle button state
  function updateToggleButtonState(isVisible) {
    const toggleButton = document.querySelector('.mindtube-toggle-btn');
    if (!toggleButton) return;
    
    if (isVisible) {
      toggleButton.title = '隱藏思維導圖';
      // Always use the icon directly
      toggleButton.innerHTML = '<i class="fa fa-eye-slash"></i>';
    } else {
      toggleButton.title = '顯示思維導圖';
      // Always use the icon directly
      toggleButton.innerHTML = '<i class="fa fa-eye"></i>';
    }
  }

  // Display the mindmap by showing container and overlay
  function displayMindmapVisuals() {
    // Set the global flag
    mindmapDisplayed = true;

    // Update the eye icon in all buttons to show that mindmap is visible
    updateEyeIcon(true);

    // Stop observing button-specific positioning
    stopObservingButtonPosition();
    
    // Remove the resize listener for button-only positioning
    window.removeEventListener('resize', updateButtonPositionWhenHidden);

    // Show the mindmap container and overlay
    if (mindmapContainer) {
      const iframe = mindmapContainer.querySelector('.mindtube-iframe');
      if (iframe) iframe.style.display = 'block';
      mindmapContainer.classList.add('mindmap-visible');
      
      const toggleButton = mindmapContainer.querySelector('.mindtube-toggle-btn');
      if (toggleButton) {
        toggleButton.style.position = 'absolute';
        toggleButton.style.top = '12px';
        toggleButton.style.right = '12px';
        toggleButton.style.left = 'auto';
        toggleButton.style.margin = '';
      }

      if (currentEffectiveFullscreenState) {
        // In fullscreen: set container to 100vw/vh and fit map
        //console.log('MindTube Content (displayMindmapVisuals): In fullscreen, setting container to 100vw/100vh.');
        mindmapContainer.style.position = 'fixed';
        mindmapContainer.style.top = '0';
        mindmapContainer.style.left = '0';
        mindmapContainer.style.width = '100vw';
        mindmapContainer.style.height = '100vh';
        mindmapContainer.style.maxWidth = 'none';
        mindmapContainer.style.transform = 'none';
        mindmapContainer.style.zIndex = '9999';
        
        // Delay FIT_MARKMAP to allow browser to apply new dimensions
        setTimeout(() => {
            postMessageToMindmapIframe({ type: 'FIT_MARKMAP' });
        }, 100);
      } else {
        // Not in fullscreen: reset styles for updateMindmapPositionAndSize
        mindmapContainer.style.position = 'fixed'; // Default for updateMindmapPositionAndSize
        mindmapContainer.style.top = '';
        mindmapContainer.style.left = '';
        mindmapContainer.style.width = '';
        mindmapContainer.style.height = '';
        mindmapContainer.style.maxWidth = '';
        mindmapContainer.style.transform = '';
        mindmapContainer.style.zIndex = '9999'; // Default z-index
      }
    }

    if (mindmapOverlay) {
      // Show overlay only if not in fullscreen and player isn't found/visible (fallback mode)
      const playerElement = document.getElementById('movie_player') || document.querySelector('ytd-player');
      mindmapOverlay.style.display = (currentEffectiveFullscreenState || (playerElement && playerElement.offsetParent !== null)) ? 'none' : 'block';
    }
    
    // Update toggle button to show hide icon
    updateToggleButtonState(true);

    // Track fullscreen changes using the Fullscreen API
    document.addEventListener('fullscreenchange', handleBrowserFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleBrowserFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleBrowserFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleBrowserFullscreenChange);

    // Only add resize listener - no scroll listener
    window.addEventListener('resize', updateMindmapPositionAndSize);

    // Set initial position or update if not in fullscreen
    updateMindmapPositionAndSize(); // This will bail out if fullscreen due to its internal check

    // If not in fullscreen, updateMindmapPositionAndSize positioned it.
    // Send FIT_MARKMAP to ensure map fits after container is sized.
    if (!currentEffectiveFullscreenState && mindmapContainer) {
        //console.log('MindTube Content (displayMindmapVisuals): Not in fullscreen, sending FIT_MARKMAP after positioning.');
        setTimeout(() => {
            postMessageToMindmapIframe({ type: 'FIT_MARKMAP' });
        }, 100); // Delay to allow updateMindmapPositionAndSize to apply dimensions
    }

    // Begin observing player element changes (resize/attributes/style)
    observePlayerChanges();
    
    // Start monitoring video status for play/pause button sync
    startVideoStatusMonitoring();
  }

  // Hide the mindmap by hiding container and overlay
  function concealMindmapVisuals() {
    // Set the global flag
    mindmapDisplayed = false;
    
    // Update the eye icon in all buttons to show that mindmap is hidden
    updateEyeIcon(false);

    // Hide the mindmap content but keep the container visible for the toggle button
    if (mindmapContainer) {
      // Hide the iframe but keep the container visible
      const iframe = mindmapContainer.querySelector('.mindtube-iframe');
      if (iframe) iframe.style.display = 'none';
      mindmapContainer.classList.remove('mindmap-visible');
      
      // Get the video player element to position relative to it
      const playerElement = document.getElementById('movie_player') || 
                           document.querySelector('.html5-video-player') || 
                           document.querySelector('ytd-player');
                           
      if (playerElement) {
        // Get player position
        const playerRect = playerElement.getBoundingClientRect();
        
        // Resize container to only cover the toggle button area
        const toggleButton = mindmapContainer.querySelector('.mindtube-toggle-btn');
        if (toggleButton) {
          const buttonWidth = toggleButton.offsetWidth || 40;
          const buttonHeight = toggleButton.offsetHeight || 40;
          
          // Add some padding around the button
          const padding = 4;
          mindmapContainer.style.width = `${buttonWidth + padding * 2}px`;
          mindmapContainer.style.height = `${buttonHeight + padding * 2}px`;
          
          // Position is fixed relative to viewport
          mindmapContainer.style.position = 'fixed';
          
          // Position at top right of the video player
          mindmapContainer.style.top = `${playerRect.top + 12}px`;
          mindmapContainer.style.left = `${playerRect.right - buttonWidth - padding * 2 - 12}px`;
          mindmapContainer.style.right = 'auto'; // Clear right positioning if set
          
          // Ensure the toggle button is positioned correctly within the resized container
          toggleButton.style.position = 'absolute';
          toggleButton.style.top = `${padding}px`;
          toggleButton.style.left = `${padding}px`;
          toggleButton.style.right = 'auto';
          toggleButton.style.margin = '0';
          
          // Add resize event listener to keep button positioned correctly when window resizes
          window.addEventListener('resize', updateButtonPositionWhenHidden);
        }
      }
    }
    if (mindmapOverlay) mindmapOverlay.style.display = 'none';

    // Update toggle button to show display icon
    updateToggleButtonState(false);

    // Remove event listeners to avoid memory leaks
    window.removeEventListener('resize', updateMindmapPositionAndSize);
    
    // Add resize listener specifically for the button when hidden
    window.addEventListener('resize', updateButtonPositionWhenHidden);

    // Remove fullscreen change listeners
    document.removeEventListener('fullscreenchange', handleBrowserFullscreenChange);
    document.removeEventListener('webkitfullscreenchange', handleBrowserFullscreenChange);
    document.removeEventListener('mozfullscreenchange', handleBrowserFullscreenChange);
    document.removeEventListener('MSFullscreenChange', handleBrowserFullscreenChange);

    // Stop observing player element changes
    stopObservingPlayerChanges();
    
    // Start observing player changes just for button positioning
    observePlayerForButtonPosition();
  }
  
  // Function to update button position when mindmap is hidden
  function updateButtonPositionWhenHidden() {
    if (!mindmapContainer || mindmapDisplayed) return;
    
    const playerElement = document.getElementById('movie_player') || 
                         document.querySelector('.html5-video-player') || 
                         document.querySelector('ytd-player');
                         
    if (!playerElement) return;
    
    const playerRect = playerElement.getBoundingClientRect();
    const toggleButton = mindmapContainer.querySelector('.mindtube-toggle-btn');
    
    if (toggleButton) {
      const buttonWidth = toggleButton.offsetWidth || 40;
      const padding = 4;
      
      // Update position to stay at top right of video
      mindmapContainer.style.top = `${playerRect.top + 12}px`;
      mindmapContainer.style.left = `${playerRect.right - buttonWidth - padding * 2 - 12}px`;
    }
  }
  
  // Observer for player position changes when mindmap is hidden
  let buttonPositionObserver = null;
  let observedPlayerForButton = null;
  
  function observePlayerForButtonPosition() {
    if (mindmapDisplayed) return; // Only observe when mindmap is hidden
    
    const playerElement = document.getElementById('movie_player') || 
                         document.querySelector('.html5-video-player') || 
                         document.querySelector('ytd-player');
    
    if (!playerElement) return;
    
    observedPlayerForButton = playerElement;
    
    // Using ResizeObserver to detect player size/position changes
    if (typeof ResizeObserver !== 'undefined' && !buttonPositionObserver) {
      buttonPositionObserver = new ResizeObserver(() => {
        updateButtonPositionWhenHidden();
      });
      buttonPositionObserver.observe(playerElement);
      
      // Also observe the player's container
      const playerContainer = playerElement.closest('ytd-player') || 
                             playerElement.parentElement || 
                             document.querySelector('#player-container');
      
      if (playerContainer && playerContainer !== playerElement) {
        buttonPositionObserver.observe(playerContainer);
      }
    }
  }
  
  function stopObservingButtonPosition() {
    if (buttonPositionObserver) {
      buttonPositionObserver.disconnect();
      buttonPositionObserver = null;
    }
    observedPlayerForButton = null;
    window.removeEventListener('resize', updateButtonPositionWhenHidden);
  }

  // Helper function to update the eye icon in mindtube-btn
  function updateEyeIcon(isVisible) {
    const buttons = document.querySelectorAll('.mindtube-btn');
    buttons.forEach(button => {
      const eyeIcon = button.querySelector('.mindtube-eye');
      if (eyeIcon) {
        if (isVisible) {
          eyeIcon.classList.remove('fa-eye');
          eyeIcon.classList.add('fa-eye-slash');
        } else {
          eyeIcon.classList.remove('fa-eye-slash');
          eyeIcon.classList.add('fa-eye');
        }
      }
    });
  }

  // This function is for complete removal, e.g., on URL change
  function removeMindmapCompletely() {
    //console.log('MindTube Content: removeMindmapCompletely() called.');
    if (mindmapContainer) {
      mindmapContainer.remove();
      mindmapContainer = null;
    }
    if (mindmapOverlay) {
      mindmapOverlay.remove();
      mindmapOverlay = null;
    }
    window.removeEventListener('message', handleIframeMessage); // Remove the persistent listener
    // Other listeners like resize/scroll are already removed by concealMindmapVisuals or if not shown.
    stopObservingPlayerChanges();
    
    mindmapDisplayed = false;
    mindmapElementsInitialized = false; // Reset for next video
    isIframeContentReady = false;
    pendingIframeMessages = [];
    
    // Update the eye icon to reflect mindmap is hidden
    updateEyeIcon(false);
    
    const button = document.querySelector('.mindtube-btn');
    if (button) {
      button.classList.remove('active');
    }
  }

  // Helper function to post messages to the mindmap iframe
  function postMessageToMindmapIframe(messageObject) {
    if (!mindmapContainer) {
      console.warn('MindTube Content: Mindmap container not found, cannot post message:', messageObject);
      pendingIframeMessages.push(messageObject); // Queue if container not even there yet
      return;
    }
    const iframe = mindmapContainer.querySelector('iframe');
    if (iframe && iframe.contentWindow) {
      if (isIframeContentReady) {
        iframe.contentWindow.postMessage(messageObject, '*');
      } else {
        //console.log('MindTube Content: Iframe not ready, queuing message:', messageObject);
        pendingIframeMessages.push(messageObject);
      }
    } else {
      console.warn('MindTube Content: Iframe contentWindow not found, queuing message:', messageObject);
      pendingIframeMessages.push(messageObject);
    }
  }

  // Handle messages from the iframe
  function handleIframeMessage(event) {
    // Verify the origin of the message - should be chrome-extension://
    // For IFRAME_READY_FOR_MESSAGES, the origin will be the iframe's origin (chrome-extension://...)
    if (event.origin !== `chrome-extension://${chrome.runtime.id}`) {
        // For other messages like SEEK_VIDEO, if they were to come from a different (e.g. http) source,
        // this check would be important. Given current setup, most messages are from our own extension.
        // console.warn('MindTube Content: Message from unexpected origin ignored:', event.origin);
        // return; // Be strict if necessary, but for now, let's check type first.
    }
    
    const message = event.data;
    if (!message || !message.type) return; // Ignore messages without a type

    //console.log('MindTube Content: Message from iframe:', message);
    
    // Handle specific message types
    if (message.type === 'IFRAME_READY_FOR_MESSAGES') {
        //console.log('MindTube Content: Received IFRAME_READY_FOR_MESSAGES.');
        isIframeContentReady = true;
        // Process any pending messages
        if (pendingIframeMessages.length > 0) {
            //console.log('MindTube Content: Processing pending messages for iframe:', pendingIframeMessages.length);
            // Use the helper which also checks for iframe existence
            pendingIframeMessages.forEach(msg => postMessageToMindmapIframe(msg)); // This will re-check readiness but it's fine
            pendingIframeMessages = []; // Clear queue after attempting to send
        }
    } else if (message.type === 'SEEK_VIDEO' && message.time !== undefined) {
        //console.log('MindTube Content: Seeking video to time:', message.time);
        
        // First try immediate seek
        seekVideo(message.time);
        
        // Set up retry attempts for seeking, in case the player wasn't fully loaded yet
        let retryCount = 0;
        const maxRetries = 5;
        const retryDelay = 500; // 500ms between retries
        
        const retrySeek = () => {
            // Check if ytPlayer is valid now, or try to update it
            if (!ytPlayer || typeof ytPlayer.seekTo !== 'function') {
                updateYouTubePlayerReference();
            }
            
            if (ytPlayer && typeof ytPlayer.seekTo === 'function') {
                //console.log(`MindTube Content: Retry ${retryCount+1} successful - YouTube player now available`);
                ytPlayer.seekTo(message.time, true);
                return true; // Successfully sought
            }
            
            // Try other methods
            try {
                // Try with video element directly
                const videoElement = document.querySelector('#movie_player video.html5-main-video') || 
                                    document.querySelector('ytd-player video') ||
                                    document.querySelector('video');
                if (videoElement) {
                    videoElement.currentTime = message.time;
                    //console.log(`MindTube Content: Retry ${retryCount+1} successful - used video.currentTime`);
                    return true;
                }
            } catch (e) {
                console.warn(`MindTube Content: Retry ${retryCount+1} failed with error:`, e);
            }
            
            return false; // Seek failed
        };
        
        const attemptRetry = () => {
            retryCount++;
            //console.log(`MindTube Content: Attempt ${retryCount} to retry seeking to ${message.time}`);
            
            if (retryCount <= maxRetries) {
                if (!retrySeek()) {
                    // If seek still fails, schedule another retry
                    setTimeout(attemptRetry, retryDelay);
                }
            } else {
                console.warn(`MindTube Content: Failed to seek after ${maxRetries} retry attempts`);
            }
        };
        
        // Start retry attempts after a short delay
        setTimeout(attemptRetry, retryDelay);
    } else if (message.type === 'fetchApi' && message.endpoint) {
      //console.log('MindTube Content: Received fetchApi request from iframe for endpoint:', message.endpoint);
      // Forward this request to the background script
      chrome.runtime.sendMessage({
        action: 'fetchApi',
        url: `${API_BASE_URL}${message.endpoint}`, // Construct full URL
        options: { // Assuming GET request with Authorization header for mindmap data
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`, // accessToken should be available in content.js scope
            'Content-Type': 'application/json',
          }
        }
      }, response => {
        if (chrome.runtime.lastError) {
          console.error('MindTube Content: Error sending fetchApi to background or receiving response:', chrome.runtime.lastError);
          // Send an error response back to the iframe
          if (event.source) {
            event.source.postMessage({
              type: 'apiResponse',
              error: chrome.runtime.lastError.message || 'Failed to fetch from background'
            }, event.origin);
          }
          return;
        }
        // Send the response from background script back to the iframe
        //console.log('MindTube Content: Received response from background for fetchApi, sending to iframe:', response);
        if (event.source) {
          event.source.postMessage({
            type: 'apiResponse',
            data: response.data,
            error: response.error,
            status: response.status,
            ok: response.ok
          }, event.origin);
        }
      });
    } else if (message && message.type === 'TOGGLE_FULLSCREEN_VIDEO') {
      //console.log('MindTube Content: Received TOGGLE_FULLSCREEN_VIDEO from iframe.');
      toggleVideoFullscreen();
    } else if (message && message.type === 'PLAY_VIDEO') {
      //console.log('MindTube Content: Received PLAY_VIDEO from iframe.');
      playVideo();
    } else if (message && message.type === 'PAUSE_VIDEO') {
      //console.log('MindTube Content: Received PAUSE_VIDEO from iframe.');
      pauseVideo();
    }
  }

  // Seek the YouTube video to a specific time
  function seekVideo(timeInSeconds) {
    //console.log(`MindTube Content: seekVideo(${timeInSeconds}) called.`);
    
    // First try with the stored ytPlayer reference
    if (ytPlayer && typeof ytPlayer.seekTo === 'function') {
      //console.log('MindTube Content: Seeking video using stored ytPlayer.');
      ytPlayer.seekTo(timeInSeconds, true);
      return; // Successfully used ytPlayer
    }
    
    // Try to find the YouTube player using various methods
    
    // Method 1: Try standard #movie_player element
    const moviePlayer = document.getElementById('movie_player');
    if (moviePlayer && typeof moviePlayer.seekTo === 'function') {
      //console.log('MindTube Content: Seeking video using #movie_player element.');
      moviePlayer.seekTo(timeInSeconds, true);
      // Update our reference for future use
      ytPlayer = moviePlayer;
      return;
    }
    
    // Method 2: Try to find player through the video element
    const videoElement = document.querySelector('#movie_player video.html5-main-video') || 
                         document.querySelector('ytd-player video') ||
                         document.querySelector('video');
                         
    if (videoElement) {
      //console.log('MindTube Content: Found video element, checking if we can use video.currentTime');
      try {
        // For direct video elements we can try setting currentTime directly
        videoElement.currentTime = timeInSeconds;
        //console.log('MindTube Content: Seeking video using video.currentTime property.');
        return;
      } catch (e) {
        console.warn('MindTube Content: Error seeking using video.currentTime:', e);
        // Continue to other methods
      }
    }
    
    // Method 3: Try to access player through YouTube's JavaScript API
    if (window.YT && window.YT.Player) {
      //console.log('MindTube Content: YT.Player API available, trying to find player instance.');
      
      // YouTube might have a hidden player instance accessible via DOM
      const possiblePlayers = document.querySelectorAll('.html5-video-player');
      for (const player of possiblePlayers) {
        if (player && typeof player.seekTo === 'function') {
          //console.log('MindTube Content: Found player instance with seekTo method.');
          player.seekTo(timeInSeconds, true);
          // Update our reference for future use
          ytPlayer = player;
          return;
        }
      }
    }
    
    // Method 4: Try YouTube API commands that might be available on window
    if (window.yt && window.yt.player && window.yt.player.getPlayerByElement) {
      //console.log('MindTube Content: Trying to get player via yt.player.getPlayerByElement');
      try {
        const playerContainers = document.querySelectorAll('#movie_player, ytd-player, .html5-video-player');
        for (const container of playerContainers) {
          const playerInstance = window.yt.player.getPlayerByElement(container);
          if (playerInstance && typeof playerInstance.seekTo === 'function') {
            //console.log('MindTube Content: Found player via yt.player.getPlayerByElement');
            playerInstance.seekTo(timeInSeconds, true);
            // Update our reference for future use
            ytPlayer = playerInstance;
            return;
          }
        }
      } catch (e) {
        console.warn('MindTube Content: Error using yt.player.getPlayerByElement:', e);
      }
    }
    
    // Method 5: Last resort - try to simulate clicking on the video timeline
    //console.log('MindTube Content: All direct methods failed. Trying timeline simulation.');
    try {
      const playerProgress = document.querySelector('.ytp-progress-bar');
      if (playerProgress) {
        const videoDuration = getVideoDuration();
        if (videoDuration > 0) {
          const clickPosition = (timeInSeconds / videoDuration) * playerProgress.offsetWidth;
          
          // Create and dispatch a mouse event on the progress bar
          const clickEvent = new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            clientX: playerProgress.getBoundingClientRect().left + clickPosition,
            clientY: playerProgress.getBoundingClientRect().top + (playerProgress.offsetHeight / 2)
          });
          
          playerProgress.dispatchEvent(clickEvent);
          //console.log('MindTube Content: Simulated click on timeline at position', clickPosition);
          return;
        }
      }
    } catch (e) {
      console.warn('MindTube Content: Error simulating timeline click:', e);
    }
    
    // If we get here, all methods failed
    console.warn('MindTube Content: All methods to control YouTube player failed. Unable to seek.');
    
    // Try updating our ytPlayer reference for future attempts
    updateYouTubePlayerReference();
  }
  
  // Helper function to update the YouTube player reference
  function updateYouTubePlayerReference() {
    // Try various methods to get a reference to the player
    ytPlayer = document.getElementById('movie_player') || 
               document.querySelector('.html5-video-player') ||
               document.querySelector('ytd-player');
               
    if (ytPlayer) {
      //console.log('MindTube Content: Updated ytPlayer reference for future use.');
    } else {
      console.warn('MindTube Content: Could not update ytPlayer reference.');
    }
  }
  
  // Helper function to get the total duration of the video
  function getVideoDuration() {
    try {
      // Try various methods to get the video duration
      
      // Method 1: From video element
      const videoElement = document.querySelector('#movie_player video.html5-main-video') || 
                           document.querySelector('ytd-player video') ||
                           document.querySelector('video');
      if (videoElement && isFinite(videoElement.duration)) {
        return videoElement.duration;
      }
      
      // Method 2: From player API
      if (ytPlayer && typeof ytPlayer.getDuration === 'function') {
        const duration = ytPlayer.getDuration();
        if (isFinite(duration)) {
          return duration;
        }
      }
      
      // Method 3: From DOM elements that show duration
      const durationElement = document.querySelector('.ytp-time-duration');
      if (durationElement) {
        const timeText = durationElement.textContent;
        const timeParts = timeText.split(':').map(Number);
        if (timeParts.length === 3) { // HH:MM:SS
          return timeParts[0] * 3600 + timeParts[1] * 60 + timeParts[2];
        } else if (timeParts.length === 2) { // MM:SS
          return timeParts[0] * 60 + timeParts[1];
        }
      }
      
      // Default if all methods fail
      return 0;
    } catch (e) {
      console.warn('MindTube Content: Error getting video duration:', e);
      return 0;
    }
  }

  // Monitor video playing state and sync with iframe buttons
  function startVideoStatusMonitoring() {
    // Only start monitoring if mindmap is displayed
    if (!mindmapDisplayed) return;
    
    let lastPlayingState = null;
    
    const checkVideoStatus = () => {
      if (!mindmapDisplayed) return; // Stop checking if mindmap is hidden
      
      let isPlaying = false;
      
      // Method 1: Check via ytPlayer API
      if (ytPlayer && typeof ytPlayer.getPlayerState === 'function') {
        const state = ytPlayer.getPlayerState();
        // YouTube player states: 1 = playing, 2 = paused
        isPlaying = (state === 1);
      } else {
        // Method 2: Check via video element
        const videoElement = document.querySelector('#movie_player video.html5-main-video') || 
                             document.querySelector('ytd-player video') ||
                             document.querySelector('video');
        if (videoElement) {
          isPlaying = !videoElement.paused;
        } else {
          // Method 3: Check play button state
          const playButton = document.querySelector('.ytp-play-button');
          if (playButton) {
            const ariaLabel = playButton.getAttribute('aria-label') || '';
            const title = playButton.getAttribute('title') || '';
            // If button shows "Pause", video is playing
            isPlaying = ariaLabel.includes('Pause') || title.includes('Pause');
          }
        }
      }
      
      // Only send update if state changed
      if (lastPlayingState !== isPlaying) {
        lastPlayingState = isPlaying;
        //console.log('MindTube Content: Video playing state changed to:', isPlaying);
        postMessageToMindmapIframe({ type: 'UPDATE_VIDEO_STATUS', isPlaying: isPlaying });
      }
      
      // Continue monitoring
      setTimeout(checkVideoStatus, 500); // Check every 500ms
    };
    
    // Start monitoring after a short delay
    setTimeout(checkVideoStatus, 1000);
  }

  // Watch for URL changes (when user navigates to different videos)
  let lastUrl = window.location.href;
  
  // Create an observer to watch for URL changes
  const urlObserver = new MutationObserver(() => {
    // Check if URL has changed
    const currentUrl = window.location.href;
    if (lastUrl !== currentUrl) {
      //console.log('MindTube Content: URL changed from', lastUrl, 'to', currentUrl);
      lastUrl = currentUrl;
      
      // Completely remove mindmap elements and reset state on URL change
      // No need to check mindmapDisplayed, just if elements were ever made.
      if (mindmapElementsInitialized) { 
        //console.log('MindTube Content: Removing mindmap completely due to URL change.');
        removeMindmapCompletely();
      }
      
      // Reset variables
      //console.log('MindTube Content: Resetting currentVideoId and ytPlayer for new page.');
      currentVideoId = null;
      ytPlayer = null;
      
      // Re-initialize on new video page if it's a YouTube watch page
      if (currentUrl.includes('youtube.com/watch')) {
        //console.log('MindTube Content: Re-initializing due to URL change.');
        init();
      }
    } else {
      // Same URL, but check if we need to initialize the button
      // This helps when YouTube uses history API or client-side routing
      if (window.location.href.includes('youtube.com/watch') && 
          !document.querySelector('.mindtube-btn-container') && 
          !mindmapElementsInitialized) {
        //console.log('MindTube Content: Same URL but no button found, trying to initialize');
        setTimeout(init, 1000); // Slight delay to ensure YouTube's UI has updated
      }
    }
  });

  // Start observing
  urlObserver.observe(document, { subtree: true, childList: true });

  // Add an additional check for URL changes that might not trigger the MutationObserver
  // This can happen with YouTube's AJAX navigation and history API
  setInterval(() => {
    const currentUrl = window.location.href;
    if (lastUrl !== currentUrl) {
      //console.log('MindTube Content: URL change detected via interval');
      lastUrl = currentUrl;
      
      if (mindmapElementsInitialized) {
        removeMindmapCompletely();
      }
      
      currentVideoId = null;
      ytPlayer = null;
      
      if (currentUrl.includes('youtube.com/watch')) {
        init();
      }
    } else if (window.location.href.includes('youtube.com/watch') && 
               !document.querySelector('.mindtube-btn-container') && 
               !mindmapElementsInitialized) {
      //console.log('MindTube Content: Same URL but no button detected via interval, trying to initialize');
      setTimeout(init, 1000);
    }
  }, 2000);

  // Try to handle YouTube's SPA navigation events by injecting a script
  // This helps with detecting navigation that happens when liking videos from other pages
  (function injectYouTubeNavigationListener() {
    const scriptId = 'mindtube-yt-navigation-detector';
    
    // Remove any existing script
    if (document.getElementById(scriptId)) {
      document.getElementById(scriptId).remove();
    }
    
    // Create and inject script
    const script = document.createElement('script');
    script.id = scriptId;
    script.textContent = `
      // Listen for YouTube's navigation events
      (function() {
        let lastPath = window.location.pathname + window.location.search;
        
        // Function to check for navigation changes
        function checkForNavigation() {
          const currentPath = window.location.pathname + window.location.search;
          if (currentPath !== lastPath) {
            // Path changed, dispatch custom event
            lastPath = currentPath;
            window.dispatchEvent(new CustomEvent('yt-navigation-changed', { 
              detail: { path: currentPath }
            }));
          }
          
          // Check for video player initialization
          if (window.location.pathname === '/watch' && 
              document.querySelector('#movie_player') && 
              !document.querySelector('#mindtube-player-ready-marker')) {
            // Create a marker so we don't fire this event repeatedly
            const marker = document.createElement('div');
            marker.id = 'mindtube-player-ready-marker';
            marker.style.display = 'none';
            document.body.appendChild(marker);
            
            // Dispatch player ready event
            window.dispatchEvent(new CustomEvent('yt-player-ready', {
              detail: { videoId: new URLSearchParams(window.location.search).get('v') }
            }));
          }
        }
        
        // Monitor navigation with multiple methods
        
        // 1. History API
        const originalPushState = history.pushState;
        const originalReplaceState = history.replaceState;
        
        history.pushState = function() {
          originalPushState.apply(this, arguments);
          setTimeout(checkForNavigation, 100);
        };
        
        history.replaceState = function() {
          originalReplaceState.apply(this, arguments);
          setTimeout(checkForNavigation, 100);
        };
        
        // 2. Regular interval check
        setInterval(checkForNavigation, 500);
        
        // 3. Listen for popstate events
        window.addEventListener('popstate', function() {
          setTimeout(checkForNavigation, 100);
        });
        
        // 4. Try to detect YouTube's own navigation events if possible
        // YouTube's custom element events
        document.addEventListener('yt-navigate-start', function() {
          setTimeout(checkForNavigation, 300);
        });
        
        document.addEventListener('yt-navigate-finish', function() {
          setTimeout(checkForNavigation, 300);
        });
        
        // Initial check
        checkForNavigation();
      })();
    `;
    
    (document.head || document.documentElement).appendChild(script);
    
    // Listen for the custom events from our injected script
    window.addEventListener('yt-navigation-changed', function(e) {
      //console.log('MindTube Content: Detected YouTube navigation via custom event', e.detail);
      if (e.detail.path.includes('/watch')) {
        // We're on a watch page after navigation
        setTimeout(() => {
          // Check if we need to initialize
          if (!document.querySelector('.mindtube-btn-container') || !mindmapElementsInitialized) {
            //console.log('MindTube Content: Navigation to watch page detected, initializing button');
            // Update lastUrl to avoid double initialization
            lastUrl = window.location.href;
            init();
          }
        }, 1000);
      }
    });
    
    window.addEventListener('yt-player-ready', function(e) {
      //console.log('MindTube Content: YouTube player ready event detected');
      // If we don't have a button yet, try to add one
      if (!document.querySelector('.mindtube-btn-container')) {
        //console.log('MindTube Content: Player ready but no button, trying to add');
        setTimeout(tryToAddButtonWithRetries, 500);
      }
    });
  })();

  // Initialize on page load
  init();

  // Add event listener for browser fullscreen changes
  document.addEventListener('fullscreenchange', handleBrowserFullscreenChange);
  document.addEventListener('webkitfullscreenchange', handleBrowserFullscreenChange); // Safari, Chrome
  document.addEventListener('mozfullscreenchange', handleBrowserFullscreenChange); // Firefox
  document.addEventListener('MSFullscreenChange', handleBrowserFullscreenChange); // IE/Edge


  // let playerResizeObserver = null; // Commented out as handleToggleMindmapGUIVisibility is removed
  let playerMutationObserver = null;
  let observedPlayerElement = null;
  let originalMindmapContainerStyles = null; // To store original styles
  let currentEffectiveFullscreenState = false; // Track our managed fullscreen state
  let playerResizeObserver = null; // Moved declaration to be accessible by stopObservingPlayerChanges
  let playerContainerResizeObserver = null; // For observing the player container

  function handleBrowserFullscreenChange() {
    const browserFullscreenElement = document.fullscreenElement ||
                                   document.webkitFullscreenElement ||
                                   document.mozFullScreenElement ||
                                   document.msFullscreenElement;

    const ytPlayerContainer = document.getElementById('movie_player') || document.querySelector('ytd-player');
    
    let isNowEffectivelyFullscreen = false;
    if (browserFullscreenElement && ytPlayerContainer && 
        (browserFullscreenElement === ytPlayerContainer || ytPlayerContainer.contains(browserFullscreenElement))) {
        isNowEffectivelyFullscreen = true;
        //console.log('MindTube Content: Detected browser fullscreen for video player element via fullscreenElement.');
    } else if (ytPlayerContainer && ytPlayerContainer.classList.contains('ytp-fullscreen')) {
        isNowEffectivelyFullscreen = true;
        //console.log('MindTube Content: Detected YouTube player-specific fullscreen (ytp-fullscreen class).');
    }
    // Note: If browserFullscreenElement is null, it means we've exited browser fullscreen.
    // isNowEffectivelyFullscreen will be false unless ytp-fullscreen class is still present (unlikely if truly exited).

    //console.log('MindTube Content: Fullscreenchange event. browserFullscreenElement:', browserFullscreenElement, 'isNowEffectivelyFullscreen:', isNowEffectivelyFullscreen);

    // Always update the fullscreen button state regardless of previous state
    // This ensures that the button always reflects the current state
    postMessageToMindmapIframe({ type: 'UPDATE_FULLSCREEN_BUTTON_STATE', isFullscreen: isNowEffectivelyFullscreen });

    if (isNowEffectivelyFullscreen !== currentEffectiveFullscreenState) {
        currentEffectiveFullscreenState = isNowEffectivelyFullscreen;
        //console.log('MindTube Content: Effective fullscreen state for mindmap overlay CHANGED to:', currentEffectiveFullscreenState);

        // Hide or show MindTube button in fullscreen
        const mindtubeBtnContainers = document.querySelectorAll('.mindtube-btn-container');
        mindtubeBtnContainers.forEach(el => {
            el.style.display = isNowEffectivelyFullscreen ? 'none' : '';
        });

        if (mindmapContainer) {
            if (currentEffectiveFullscreenState) {
                //console.log('MindTube Content: Applying fullscreen overlay styles to mindmap.');
                if (!originalMindmapContainerStyles) { // Store only if not already stored
                    originalMindmapContainerStyles = {
                        position: mindmapContainer.style.position,
                        top: mindmapContainer.style.top,
                        left: mindmapContainer.style.left,
                        width: mindmapContainer.style.width,
                        height: mindmapContainer.style.height,
                        maxWidth: mindmapContainer.style.maxWidth,
                        transform: mindmapContainer.style.transform,
                        zIndex: mindmapContainer.style.zIndex
                    };
                }
                mindmapContainer.style.position = 'fixed';
                mindmapContainer.style.top = '0';
                mindmapContainer.style.left = '0';
                mindmapContainer.style.width = '100vw';
                mindmapContainer.style.height = '100vh';
                mindmapContainer.style.maxWidth = 'none';
                mindmapContainer.style.transform = 'none';
                mindmapContainer.style.zIndex = '2147483647';
                
                // Ensure container has minimum size for toggle button even in fullscreen
                if (!mindmapDisplayed) {
                    const toggleBtn = mindmapContainer.querySelector('.mindtube-toggle-btn');
                    if (toggleBtn) {
                        // Always use absolute positioning to keep in top-right corner
                        toggleBtn.style.position = 'absolute';
                        toggleBtn.style.top = '12px';
                        toggleBtn.style.right = '12px';
                    }
                }
                
                if (mindmapOverlay) {
                    mindmapOverlay.style.display = 'none';
                }
                // Requirement 1: Do not change transparency on fullscreen toggle
                // postMessageToMindmapIframe({ type: 'SET_MINDMAP_TRANSPARENCY', alpha: 0.2 }); 
                // Delay FIT_MARKMAP to allow browser to apply new dimensions
                setTimeout(() => {
                    postMessageToMindmapIframe({ type: 'FIT_MARKMAP' });
                }, 100); // Req 2: Fit markmap on entering fullscreen with delay
            } else { // This means currentEffectiveFullscreenState is false
                if (originalMindmapContainerStyles) { // Only revert if we had applied styles
                    //console.log('MindTube Content: Reverting mindmap styles from fullscreen overlay.');
                    mindmapContainer.style.position = originalMindmapContainerStyles.position;
                    mindmapContainer.style.top = originalMindmapContainerStyles.top;
                    mindmapContainer.style.left = originalMindmapContainerStyles.left;
                    mindmapContainer.style.width = originalMindmapContainerStyles.width;
                    mindmapContainer.style.height = originalMindmapContainerStyles.height;
                    mindmapContainer.style.maxWidth = originalMindmapContainerStyles.maxWidth;
                    mindmapContainer.style.transform = originalMindmapContainerStyles.transform;
                    mindmapContainer.style.zIndex = originalMindmapContainerStyles.zIndex || '9999';
                    
                    // Reset toggle button position if needed
                    const toggleBtn = mindmapContainer.querySelector('.mindtube-toggle-btn');
                    if (toggleBtn) {
                        // Always use absolute positioning to keep in top-right corner
                        toggleBtn.style.position = 'absolute';
                        toggleBtn.style.top = '12px';
                        toggleBtn.style.right = '12px';
                    }
                    
                    originalMindmapContainerStyles = null;
                    // Requirement 1: Do not change transparency on fullscreen toggle
                    // postMessageToMindmapIframe({ type: 'SET_MINDMAP_TRANSPARENCY', alpha: 0.5 });
                    updateMindmapPositionAndSize(); // Recalculate position based on player in normal view
                    // Delay FIT_MARKMAP to allow browser to apply new dimensions
                    setTimeout(() => {
                        postMessageToMindmapIframe({ type: 'FIT_MARKMAP' });
                    }, 100); // Req 2: Fit markmap on exiting fullscreen with delay
                } else {
                    //console.log('MindTube Content: No fullscreen styles to revert, but ensuring button state is correct.');
                    // We don't need this line anymore since we're always updating the button state at the beginning of this function
                    // postMessageToMindmapIframe({ type: 'UPDATE_FULLSCREEN_BUTTON_STATE', isFullscreen: false });
                }
            }
        }
    } else if (currentEffectiveFullscreenState && mindmapContainer && originalMindmapContainerStyles) {
        // This case is to re-assert styles if something (like a resize) happened while fullscreen.
        // This ensures the mindmap stays 100vw/100vh.
        //console.log('MindTube Content: Re-asserting fullscreen overlay styles for mindmap due to potential resize.');
        mindmapContainer.style.position = 'fixed';
        mindmapContainer.style.top = '0';
        mindmapContainer.style.left = '0';
        mindmapContainer.style.width = '100vw';
        mindmapContainer.style.height = '100vh';
        // zIndex and other properties should still be set from the initial application.
    }
  }

  function updateMindmapPositionAndSize() {
    if (!mindmapContainer) {
      return;
    }

    // Do not update if browser is fullscreen and mindmap is adjusted for it
    const fullscreenElement = document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement;
    if (fullscreenElement && originalMindmapContainerStyles) { // originalMindmapContainerStyles is set when we are in our custom fullscreen overlay mode
      //console.log('MindTube Content: Browser is fullscreen, updateMindmapPositionAndSize skipped to maintain overlay.');
      return;
    }

    const playerElement = document.getElementById('movie_player') || 
                          document.querySelector('.html5-video-player') || 
                          document.querySelector('ytd-player video') || // More specific to video element
                          document.querySelector('ytd-player'); 

    if (playerElement && playerElement.offsetParent !== null) { // Check if element is visible
      const rect = playerElement.getBoundingClientRect();
      
      // If player is too small (e.g. miniplayer), fallback or hide
      if (rect.width < 100 || rect.height < 100) {
          //console.log('MindTube Content: Player element is too small, using fallback or hiding.');
          // Fallback to centered, large view
          mindmapContainer.style.position = 'fixed'; // Ensure it's fixed for centering
          mindmapContainer.style.top = '50%';
          mindmapContainer.style.left = '50%';
          mindmapContainer.style.transform = 'translate(-50%, -50%)';
          mindmapContainer.style.width = '90%';
          mindmapContainer.style.height = '90%';
          mindmapContainer.style.maxWidth = '1200px';
          mindmapContainer.style.zIndex = '9999';
          if (mindmapOverlay) mindmapOverlay.style.display = 'block'; // Show overlay for fallback
          return;
      }

      // Use fixed position with viewport coordinates to stay over the video regardless of scrolling
      mindmapContainer.style.position = 'fixed';
      mindmapContainer.style.top = `${rect.top}px`; // Viewport-relative position
      mindmapContainer.style.left = `${rect.left}px`; // Viewport-relative position
      mindmapContainer.style.width = `${rect.width}px`;
      mindmapContainer.style.height = `${rect.height}px`;
      mindmapContainer.style.maxWidth = 'none';
      mindmapContainer.style.transform = 'none';
      mindmapContainer.style.zIndex = '9999'; // Default z-index
      
      // If mindmap is hidden, ensure the container has minimum size for the toggle button
      if (!mindmapDisplayed) {
        // Set minimum size to ensure the toggle button is accessible
        mindmapContainer.style.minWidth = '40px';
        mindmapContainer.style.minHeight = '40px';
      }
      
      if (mindmapOverlay) mindmapOverlay.style.display = 'none'; // Hide overlay when attached to player

      // Update observed element if it changed
      if (observedPlayerElement !== playerElement) {
        stopObservingPlayerChanges(); // Stop observing old element
        observedPlayerElement = playerElement;
        observePlayerChanges(); // Start observing new element
      }

    } else {
      // Fallback to centered, large view if player not found or not visible
      mindmapContainer.style.position = 'fixed'; // Ensure it's fixed for centering
      mindmapContainer.style.top = '50%';
      mindmapContainer.style.left = '50%';
      mindmapContainer.style.transform = 'translate(-50%, -50%)';
      mindmapContainer.style.width = '90%';
      mindmapContainer.style.height = '90%';
      mindmapContainer.style.maxWidth = '1200px';
      mindmapContainer.style.zIndex = '9999';
      
      // If mindmap is hidden, ensure the container has minimum size for the toggle button
      if (!mindmapDisplayed) {
        // Set minimum size to ensure the toggle button is accessible
        mindmapContainer.style.minWidth = '40px';
        mindmapContainer.style.minHeight = '40px';
      }
      
      if (mindmapOverlay) mindmapOverlay.style.display = 'block'; // Show overlay for fallback
      console.warn('MindTube Content: YouTube player element not found or not visible. Using fallback positioning.');
    }
  }

  function observePlayerChanges() {
    if (!observedPlayerElement) {
      // Try to find it again if not set
      observedPlayerElement = document.getElementById('movie_player') || 
                              document.querySelector('.html5-video-player') ||
                              document.querySelector('ytd-player video') ||
                              document.querySelector('ytd-player');
      if (!observedPlayerElement) return; // Still not found
    }

    // Using ResizeObserver to detect player size changes (e.g., theater mode)
    // ResizeObserver is generally more reliable for size changes than MutationObserver
    if (typeof ResizeObserver !== 'undefined' && !playerResizeObserver) { // Check if already observing
        playerResizeObserver = new ResizeObserver(entries => {
            for (let entry of entries) {
                //console.log('MindTube Content: Player size changed (ResizeObserver).');
                updateMindmapPositionAndSize();
            }
        });
        playerResizeObserver.observe(observedPlayerElement);
    }

    // Also observe the player's parent container to detect position changes
    const playerContainer = observedPlayerElement.closest('ytd-player') || 
                            observedPlayerElement.parentElement || 
                            document.querySelector('#player-container-outer') ||
                            document.querySelector('#player-container');
                            
    if (playerContainer && typeof ResizeObserver !== 'undefined' && !playerContainerResizeObserver) {
        playerContainerResizeObserver = new ResizeObserver(() => {
            //console.log('MindTube Content: Player container size/position changed.');
            updateMindmapPositionAndSize();
        });
        playerContainerResizeObserver.observe(playerContainer);
    }

    // Using MutationObserver to detect attribute changes or DOM structure changes around player
    // This can help with full-screen mode changes or other dynamic UI updates by YouTube
    if (typeof MutationObserver !== 'undefined' && !playerMutationObserver) { // Check if already observing
      playerMutationObserver = new MutationObserver(mutations => {
        // Filter mutations to avoid excessive calls if possible
        // For example, only react to specific attribute changes like 'class', 'style', 'fullscreen'
        let relevantChange = mutations.some(mutation => 
            mutation.type === 'attributes' && ['class', 'style', 'fullscreen', 'data-fullscreen'].includes(mutation.attributeName) ||
            mutation.type === 'childList'
        );
        if (relevantChange) {
            //console.log('MindTube Content: Player or parent DOM changed (MutationObserver).');
            updateMindmapPositionAndSize();
        }
      });
      // Observe attributes of the player and its parent, and childList/subtree of parent
      // More targeted observation: player itself and its immediate parent or a known container like ytd-player
      const playerContainer = observedPlayerElement.closest('ytd-player') || observedPlayerElement.parentElement || document.body;
      playerMutationObserver.observe(playerContainer, { 
        attributes: true, 
        childList: true, 
        subtree: true, // Subtree might be too broad, consider if needed
        attributeFilter: ['class', 'style', 'fullscreen', 'hidden', 'data-fullscreen'] // Common attributes that change
      });
    }
  }

  function stopObservingPlayerChanges() {
    if (playerResizeObserver) {
      playerResizeObserver.disconnect();
      playerResizeObserver = null;
    }
    if (playerContainerResizeObserver) {
      playerContainerResizeObserver.disconnect();
      playerContainerResizeObserver = null;
    }
    if (playerMutationObserver) {
      playerMutationObserver.disconnect();
      playerMutationObserver = null;
    }
    observedPlayerElement = null; // Clear the observed element
  }

  // Prompt user for manual login when automatic methods fail
  function promptForManualLogin() {
    //console.log('MindTube Content: Prompting for manual login via extension popup');
    
    // Show an alert with clear instructions
    alert('請先登入 MindTube 才能使用思維導圖功能。請點擊瀏覽器工具列中的 MindTube 圖示進行登入。');
  }

  // Toggle YouTube video player fullscreen
  function toggleVideoFullscreen() {
    //console.log('MindTube Content: toggleVideoFullscreen() called.');
    const playerElement = document.querySelector('#movie_player video.html5-main-video') || // Standard video element
                          document.querySelector('#movie_player .html5-video-container video') || // Another common selector
                          document.querySelector('ytd-player video') || // More generic
                          document.getElementById('movie_player'); // Fallback to the player container

    if (!playerElement) {
      console.warn('MindTube Content: Could not find YouTube video player element for fullscreen.');
      return;
    }

    // Check if already in fullscreen (browser-level fullscreen)
    const isVideoFullscreen = document.fullscreenElement === playerElement ||
                              document.webkitFullscreenElement === playerElement ||
                              document.mozFullScreenElement === playerElement ||
                              document.msFullscreenElement === playerElement;

    // YouTube also has its own fullscreen button and classes, e.g., .ytp-fullscreen-button
    // We can try to click that button if available, or use the Fullscreen API directly on the video element.

    const ytFullscreenButton = document.querySelector('.ytp-fullscreen-button');

    if (ytFullscreenButton) {
      //console.log('MindTube Content: Clicking YouTube native fullscreen button.');
      
      // Check the current class state of the player before clicking
      const ytPlayerContainer = document.getElementById('movie_player') || document.querySelector('ytd-player');
      const wasFullscreenBefore = ytPlayerContainer && ytPlayerContainer.classList.contains('ytp-fullscreen');
      
      // Click the button to toggle fullscreen
      ytFullscreenButton.click();
      
      // Immediately update the button based on expected new state
      // This handles cases where the event might not trigger correctly
      const expectedFullscreenState = !wasFullscreenBefore;
      //console.log('MindTube Content: Expected new fullscreen state:', expectedFullscreenState);
      
      // Update the button state immediately based on our expectation
      // This is important for rapid multiple toggles where events might not fire as expected
      postMessageToMindmapIframe({ 
        type: 'UPDATE_FULLSCREEN_BUTTON_STATE', 
        isFullscreen: expectedFullscreenState 
      });
      
      // For safety, set a timeout to check again after the click has had time to take effect
      setTimeout(() => {
        // Get the actual state after the click
        const isNowFullscreen = document.fullscreenElement !== null || 
                              (ytPlayerContainer && ytPlayerContainer.classList.contains('ytp-fullscreen'));
        
        //console.log('MindTube Content: Actual fullscreen state after click:', isNowFullscreen);
        
        // Update again if the expected state doesn't match the actual state
        if (isNowFullscreen !== expectedFullscreenState) {
          //console.log('MindTube Content: Fullscreen state mismatched expectation, updating button again');
          postMessageToMindmapIframe({ 
            type: 'UPDATE_FULLSCREEN_BUTTON_STATE', 
            isFullscreen: isNowFullscreen 
          });
        }
      }, 300); // Small delay to allow fullscreen change to complete
    } else {
      console.warn('MindTube Content: YouTube native fullscreen button not found. Cannot toggle fullscreen.');
      // We are removing the direct playerElement.requestFullscreen() calls here
      // as they are likely to be blocked due to not being a direct user gesture
      // in the main page's context. Relying on YouTube's own button is more robust.
      // If the button isn't found, we can't reliably enter/exit fullscreen.
      // The user might need to use YouTube's controls directly.
    }
    // Note: Exiting fullscreen is also typically handled by YouTube's button (it toggles)
    // or by the 'Escape' key, which would trigger handleBrowserFullscreenChange.
  }

  // Helper function to update all mindmap button styles based on mindmapInitiallyPresent
  function updateAllMindmapButtonStyles() {
    const buttons = document.querySelectorAll('.mindtube-btn');
    if (mindmapInitiallyPresent === true) {
      buttons.forEach(btn => btn.style.backgroundColor = ''); // Non-transparent
    } else { // Covers false and null (if somehow called before set, though logic aims to prevent this)
      buttons.forEach(btn => btn.style.backgroundColor = 'transparent'); // Transparent
    }
  }

  // Play the YouTube video
  function playVideo() {
    //console.log('MindTube Content: playVideo() called.');
    
    // First try with the stored ytPlayer reference
    if (ytPlayer && typeof ytPlayer.playVideo === 'function') {
      //console.log('MindTube Content: Playing video using stored ytPlayer.');
      ytPlayer.playVideo();
      // Send status update to iframe
      postMessageToMindmapIframe({ type: 'UPDATE_VIDEO_STATUS', isPlaying: true });
      return;
    }
    
    // Try to find the YouTube player using various methods
    
    // Method 1: Try standard #movie_player element
    const moviePlayer = document.getElementById('movie_player');
    if (moviePlayer && typeof moviePlayer.playVideo === 'function') {
      //console.log('MindTube Content: Playing video using #movie_player element.');
      moviePlayer.playVideo();
      ytPlayer = moviePlayer; // Update reference
      postMessageToMindmapIframe({ type: 'UPDATE_VIDEO_STATUS', isPlaying: true });
      return;
    }
    
    // Method 2: Try to find player through the video element
    const videoElement = document.querySelector('#movie_player video.html5-main-video') || 
                         document.querySelector('ytd-player video') ||
                         document.querySelector('video');
                         
    if (videoElement) {
      //console.log('MindTube Content: Found video element, trying to play.');
      try {
        videoElement.play();
        //console.log('MindTube Content: Playing video using video.play() method.');
        postMessageToMindmapIframe({ type: 'UPDATE_VIDEO_STATUS', isPlaying: true });
        return;
      } catch (e) {
        console.warn('MindTube Content: Error playing using video.play():', e);
      }
    }
    
    // Method 3: Try clicking the play button
    const playButton = document.querySelector('.ytp-play-button[aria-label*="Play"], .ytp-play-button[title*="Play"]');
    if (playButton && playButton.getAttribute('aria-label')?.includes('Play')) {
      //console.log('MindTube Content: Clicking play button.');
      playButton.click();
      postMessageToMindmapIframe({ type: 'UPDATE_VIDEO_STATUS', isPlaying: true });
      return;
    }
    
    console.warn('MindTube Content: All methods to play YouTube video failed.');
    updateYouTubePlayerReference();
  }

  // Pause the YouTube video
  function pauseVideo() {
    //console.log('MindTube Content: pauseVideo() called.');
    
    // First try with the stored ytPlayer reference
    if (ytPlayer && typeof ytPlayer.pauseVideo === 'function') {
      //console.log('MindTube Content: Pausing video using stored ytPlayer.');
      ytPlayer.pauseVideo();
      // Send status update to iframe
      postMessageToMindmapIframe({ type: 'UPDATE_VIDEO_STATUS', isPlaying: false });
      return;
    }
    
    // Try to find the YouTube player using various methods
    
    // Method 1: Try standard #movie_player element
    const moviePlayer = document.getElementById('movie_player');
    if (moviePlayer && typeof moviePlayer.pauseVideo === 'function') {
      //console.log('MindTube Content: Pausing video using #movie_player element.');
      moviePlayer.pauseVideo();
      ytPlayer = moviePlayer; // Update reference
      postMessageToMindmapIframe({ type: 'UPDATE_VIDEO_STATUS', isPlaying: false });
      return;
    }
    
    // Method 2: Try to find player through the video element
    const videoElement = document.querySelector('#movie_player video.html5-main-video') || 
                         document.querySelector('ytd-player video') ||
                         document.querySelector('video');
                         
    if (videoElement) {
      //console.log('MindTube Content: Found video element, trying to pause.');
      try {
        videoElement.pause();
        //console.log('MindTube Content: Pausing video using video.pause() method.');
        postMessageToMindmapIframe({ type: 'UPDATE_VIDEO_STATUS', isPlaying: false });
        return;
      } catch (e) {
        console.warn('MindTube Content: Error pausing using video.pause():', e);
      }
    }
    
    // Method 3: Try clicking the pause button
    const pauseButton = document.querySelector('.ytp-play-button[aria-label*="Pause"], .ytp-play-button[title*="Pause"]');
    if (pauseButton && pauseButton.getAttribute('aria-label')?.includes('Pause')) {
      //console.log('MindTube Content: Clicking pause button.');
      pauseButton.click();
      postMessageToMindmapIframe({ type: 'UPDATE_VIDEO_STATUS', isPlaying: false });
      return;
    }
    
    console.warn('MindTube Content: All methods to pause YouTube video failed.');
    updateYouTubePlayerReference();
  }
})();
