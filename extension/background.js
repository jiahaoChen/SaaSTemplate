// Background script for MindTube Chrome Extension

// Configuration
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8000/api/v1'; // Fallback for development
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173'; // Fallback for development

// Listen for installation
chrome.runtime.onInstalled.addListener(() => {
  //console.log('MindTube Background: Extension installed');
  // Check for existing cookies on installation
  checkLocalHostCookies();
});

// Function to check if we can get a token directly from the API
function checkLocalHostCookies() {
  //console.log('MindTube Background: Checking for auth directly from API endpoint');
  
  // Check if localhost URLs are in host_permissions
  const hostPermissions = chrome.runtime.getManifest().host_permissions || [];
  //console.log('MindTube Background: Host permissions:', hostPermissions);
  
  const hasLocalhost8000 = hostPermissions.some(p => p.includes('localhost:8000'));
  
  if (!hasLocalhost8000) {
    //console.log('MindTube Background: localhost:8000 not in host_permissions, cannot access API');
    return;
  }
  
  // Try the API endpoint directly - this might work if the user is already logged in elsewhere
  fetchWithTimeout(`${API_BASE_URL}/extension-auth`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  })
  .then(response => {
    //console.log('MindTube Background: Backend extension-auth response status:', response.status);
    if (response.ok) {
      return response.json();
    } else {
      throw new Error(`Backend extension-auth returned status ${response.status}`);
    }
  })
  .then(data => {
    //console.log('MindTube Background: Backend extension-auth data:', data);
    if (data && data.token) {
      //console.log('MindTube Background: Received token from backend extension-auth endpoint');
      chrome.storage.local.set({ 'mindtubeToken': data.token }, function() {
        //console.log('MindTube Background: Token saved from backend extension-auth endpoint');
      });
      return true;
    } else {
      //console.log('MindTube Background: No token in response (user not logged in)');
      throw new Error('No token in response');
    }
  })
  .catch(error => {
    console.error('MindTube Background: Error with backend extension-auth:', error);
    //console.log('MindTube Background: User will need to login via extension popup');
    // We don't try anything else - user will need to use the popup to login
  });
}

// Utility function for fetch with timeout
function fetchWithTimeout(url, options, timeout = 5000) {
  return Promise.race([
    fetch(url, options),
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Request timed out')), timeout)
    )
  ]);
}

// Utility function to handle failed auth - just log that the user needs to login via popup
function handleFailedAuth() {
  //console.log('MindTube Background: Auth check failed - user needs to login using the extension popup');
}

// Function to handle manual login 
function handleManualLogin(authData) {
  if (authData && authData.token) {
    //console.log('MindTube Background: Received manual login token');
    chrome.storage.local.set({ 'mindtubeToken': authData.token }, function() {
      //console.log('MindTube Background: Manual login token saved');
    });
    return true;
  }
  return false;
}

// Handle messages from content script or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  //console.log('MindTube Background: Received message:', request);
  
  if (request.action === 'manualLogin') {
    //console.log('MindTube Background: Action: manualLogin', request.authData);
    const success = handleManualLogin(request.authData);
    sendResponse({ success });
    return true;
  }
  
  if (request.action === 'getToken') {
    //console.log('MindTube Background: Action: getToken');
    chrome.storage.local.get(['mindtubeToken'], function(result) {
      //console.log('MindTube Background: getToken result from storage:', result);
      
      // Just return what we have (or null if no token)
      sendResponse({ token: result.mindtubeToken || null });
    });
    return true; // Indicates we will respond asynchronously
  }
  
  if (request.action === 'saveToken') {
    //console.log('MindTube Background: Action: saveToken', request.token);
    chrome.storage.local.set({ 'mindtubeToken': request.token }, function() {
      //console.log('MindTube Background: Token saved successfully');
      sendResponse({ success: true });
    });
    return true; // Indicates we will respond asynchronously
  }
  
  if (request.action === 'clearToken') {
    //console.log('MindTube Background: Action: clearToken');
    chrome.storage.local.remove(['mindtubeToken'], function() {
      //console.log('MindTube Background: Token cleared successfully');
      sendResponse({ success: true });
    });
    return true; // Indicates we will respond asynchronously
  }
  
  if (request.action === 'checkAuth') {
    //console.log('MindTube Background: Action: checkAuth');
    chrome.storage.local.get(['mindtubeToken'], function(result) {
      //console.log('MindTube Background: checkAuth token from storage:', result.mindtubeToken);
      if (!result.mindtubeToken) {
        //console.log('MindTube Background: No token found for checkAuth');
        sendResponse({ isAuthenticated: false });
        return;
      }
      
      //console.log(`MindTube Background: Verifying token with API: ${API_BASE_URL}/users/me`);
      // Verify token is valid by making a request to the API
      fetch(`${API_BASE_URL}/users/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${result.mindtubeToken}`,
          'Content-Type': 'application/json',
        }
      })
      .then(response => {
        //console.log('MindTube Background: checkAuth API response status:', response.status);
        if (response.ok) {
          //console.log('MindTube Background: Token is valid');
          sendResponse({ isAuthenticated: true });
        } else {
          //console.log('MindTube Background: Token is invalid, clearing from storage.');
          // Clear invalid token
          chrome.storage.local.remove(['mindtubeToken']);
          sendResponse({ isAuthenticated: false });
        }
      })
      .catch(error => {
        console.error('MindTube Background: Error verifying token:', error);
        sendResponse({ isAuthenticated: false, error: error.message });
      });
    });
    return true; // Indicates we will respond asynchronously
  }
  
  if (request.action === 'checkLocalHostAuth') {
    //console.log('MindTube Background: Action: checkLocalHostAuth');
    // We no longer check localhost - just return success to acknowledge the request
    sendResponse({ success: true });
    return true;
  }
  
  if (request.action === 'openTab') {
    //console.log('MindTube Background: Action: openTab', request.url);
    chrome.tabs.create({ url: request.url });
    sendResponse({ success: true });
    return true;
  }
  
  // We've removed the openPopup action as it's not needed
  
  if (request.action === 'fetchApi') {
    //console.log('MindTube Background: Action: fetchApi', request.url);
    
    const { url, options } = request;
    
    if (!url) {
      console.error('MindTube Background: fetchApi missing url');
      sendResponse({ error: 'Missing url parameter', status: 400 });
      return true;
    }
    
    // Create fetch options based on the passed options
    const fetchOptions = {
      method: options?.method || 'GET',
      headers: options?.headers || {},
      credentials: options?.credentials || 'same-origin'
    };
    
    // If body is provided, convert it appropriately
    if (options?.rawBody) {
      // Use raw body string (used for URL-encoded forms)
      fetchOptions.body = options.rawBody;
    } else if (options?.body) {
      // Convert JSON object to string
      fetchOptions.body = JSON.stringify(options.body);
    }
    
    // Make the API request
    fetch(url, fetchOptions)
      .then(async response => {
        let data;
        let error;
        
        try {
          // Try to parse response as JSON first
          const text = await response.text();
          try {
            data = JSON.parse(text);
          } catch (e) {
            data = text;
          }
        } catch (e) {
          error = e.message;
          data = null;
        }
        
        sendResponse({
          status: response.status,
          ok: response.ok,
          data: data,
          error: error
        });
      })
      .catch(error => {
        console.error('MindTube Background: fetchApi error:', error);
        sendResponse({
          status: 0,
          ok: false,
          data: null,
          error: error.message
        });
      });
    
    return true; // Indicates we will respond asynchronously
  }
  
  //console.log('MindTube Background: Message action not recognized:', request.action);
});

// We no longer need tab monitoring since all auth is handled through the extension popup