(function() {
  // This script runs in the page context to access YouTube's internal objects
  //console.log('MindTube page_script.js: Checking for YouTube Player API availability');
  
  try {
    // Send a success response immediately to fallback when page scripts are ready
    function sendSuccess() {
      window.postMessage({
        type: 'MINDTUBE_YT_API_RESPONSE',
        detail: { isReady: true }
      }, '*');
    }
    
    // Send a failure response
    function sendFailure(error) {
      window.postMessage({
        type: 'MINDTUBE_YT_API_RESPONSE',
        detail: { 
          isReady: false, 
          error: error || 'Could not detect YouTube Player API' 
        }
      }, '*');
    }
    
    // First attempt: Check if the global YT object exists and has the Player constructor
    if (window.YT && typeof window.YT.Player === 'function') {
      //console.log('MindTube page_script.js: YouTube Player API is ready (YT.Player exists)');
      sendSuccess();
      return;
    }
    
    // Second attempt: Check if the player element exists and has functions like seekTo
    const moviePlayer = document.querySelector('#movie_player');
    if (moviePlayer && typeof moviePlayer.seekTo === 'function') {
      //console.log('MindTube page_script.js: YouTube Player API is ready (#movie_player exists and has seekTo)');
      sendSuccess();
      return;
    }
    
    // Third attempt: Look for video element
    const videoElement = document.querySelector('video');
    if (videoElement) {
      //console.log('MindTube page_script.js: Found video element, assuming API will be available');
      // Wait a short time to ensure the API is fully loaded
      setTimeout(sendSuccess, 500);
      return;
    }
    
    // Fourth attempt: Look for video element loading indicators
    const loadingIndicator = document.querySelector('.ytp-spinner, ytd-watch-flexy, ytd-page-manager');
    if (loadingIndicator) {
      //console.log('MindTube page_script.js: Found loading indicator, assuming API will load shortly');
      // Reduced timeout to improve user experience
      setTimeout(sendSuccess, 1000);
      return;
    }
    
    // Fifth attempt: Set up a DOM mutation observer to watch for API injection
    const observer = new MutationObserver((mutations) => {
      // Check for YT.Player after DOM changes
      if (window.YT && typeof window.YT.Player === 'function') {
        observer.disconnect();
        //console.log('MindTube page_script.js: YouTube Player API detected via mutation observer');
        sendSuccess();
        return;
      }
      
      // Check for movie_player after DOM changes
      const player = document.querySelector('#movie_player');
      if (player && typeof player.seekTo === 'function') {
        observer.disconnect();
        //console.log('MindTube page_script.js: movie_player detected via mutation observer');
        sendSuccess();
        return;
      }
      
      // Check for video element after DOM changes
      const video = document.querySelector('video');
      if (video) {
        observer.disconnect();
        //console.log('MindTube page_script.js: video element detected via mutation observer');
        sendSuccess();
        return;
      }
    });
    
    // Start observing DOM changes
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    // Fallback: Set up an interval check (for older YouTube versions)
    const checkInterval = setInterval(() => {
      if (window.YT && typeof window.YT.Player === 'function') {
        clearInterval(checkInterval);
        //console.log('MindTube page_script.js: YouTube Player API became ready (detected by interval)');
        sendSuccess();
        return;
      }
      
      const moviePlayer = document.querySelector('#movie_player');
      if (moviePlayer && typeof moviePlayer.seekTo === 'function') {
        clearInterval(checkInterval);
        //console.log('MindTube page_script.js: #movie_player became available (detected by interval)');
        sendSuccess();
        return;
      }
    }, 300);
    
    // Timeout after a shorter period
    setTimeout(() => {
      clearInterval(checkInterval);
      observer.disconnect();
      //console.log('MindTube page_script.js: Timed out waiting for YouTube Player API, but continuing anyway');
      // Send success even on timeout - we'll handle missing API in content script
      sendSuccess();
    }, 8000);
  } catch (error) {
    console.error('MindTube page_script.js: Error checking for YouTube Player API:', error);
    window.postMessage({
      type: 'MINDTUBE_YT_API_RESPONSE',
      detail: { 
        isReady: false, 
        error: error.message 
      }
    }, '*');
  }
})();