// MindTube Extension Login Popup Script

// Configuration
// Use environment variables for URLs, with fallbacks to development URLs
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8000/api/v1';

// DOM elements
let loginForm;
let mindtubeLink;
let userInfoDiv;
let emailInput;
let passwordInput;
let loginButton;
let logoutButton;
let userEmailSpan;
let statusContainer;

// Helper for showing status messages
function showStatus(message, type = 'loading') {
  const statusElement = document.createElement('div');
  statusElement.className = `status-message ${type}`;
  
  if (type === 'loading') {
    statusElement.innerHTML = `<div class="loading-spinner"></div>${message}`;
  } else {
    statusElement.textContent = message;
  }
  
  statusContainer.innerHTML = '';
  statusContainer.appendChild(statusElement);
  
  // Auto-hide success and error messages after 5 seconds
  if (type === 'success' || type === 'error') {
    setTimeout(() => {
      if (statusContainer.contains(statusElement)) {
        statusElement.style.opacity = '0';
        setTimeout(() => {
          if (statusContainer.contains(statusElement)) {
            statusContainer.removeChild(statusElement);
          }
        }, 300);
      }
    }, 5000);
  }
  
  return statusElement;
}

// Check if user is already logged in
async function checkAuthStatus() {
  showStatus('檢查登入狀態...');
  
  try {
    // Send message to background script to check auth status
    const response = await chrome.runtime.sendMessage({ action: 'checkAuth' });
    //console.log('Auth status response:', response);
    
    if (response && response.isAuthenticated) {
      // User is authenticated, show user info
      const userInfo = await getUserInfo();
      if (userInfo) {
        showUserInfo(userInfo);
        showStatus('登入成功', 'success');
      } else {
        // Got auth status but couldn't get user info - possible token issue
        showLoginForm();
        showStatus('請重新登入', 'error');
      }
    } else {
      // User is not authenticated, show login form
      showLoginForm();
      statusContainer.innerHTML = ''; // Clear the status
    }
  } catch (error) {
    console.error('Error checking auth status:', error);
    showLoginForm();
    showStatus('無法檢查登入狀態', 'error');
  }
}

// Get user information
async function getUserInfo() {
  try {
    // Get token from background script
    const tokenResponse = await chrome.runtime.sendMessage({ action: 'getToken' });
    
    if (!tokenResponse || !tokenResponse.token) {
      // Don't log as error since this is expected when user is not logged in
      //console.log('No token available - user needs to log in');
      return null;
    }
    
    // Use background script to get user info from API to avoid CORS issues
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({
        action: 'fetchApi',
        url: `${API_BASE_URL}/users/me`,
        options: {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${tokenResponse.token}`,
            'Content-Type': 'application/json',
          }
        }
      }, response => {
        if (chrome.runtime.lastError) {
          console.error('Error getting user info:', chrome.runtime.lastError);
          reject(chrome.runtime.lastError);
          return;
        }
        
        if (!response.ok) {
          // If token is invalid (401/403), clear it
          if (response.status === 401 || response.status === 403) {
            chrome.runtime.sendMessage({ action: 'clearToken' });
            //console.log('Invalid token cleared, user needs to log in again');
          }
          console.error('API error:', response);
          reject(new Error(`API error: ${response.status}`));
          return;
        }
        
        resolve(response.data);
      });
    });
  } catch (error) {
    console.error('Error getting user info:', error);
    return null;
  }
}

// Show the login form
function showLoginForm() {
  loginForm.style.display = 'block';
  userInfoDiv.style.display = 'none';
}

// Show user info
function showUserInfo(user) {
  loginForm.style.display = 'none';
  userInfoDiv.style.display = 'block';
  
  if (user && user.email) {
    userEmailSpan.textContent = user.email;
  } else {
    userEmailSpan.textContent = '(未知使用者)';
  }
}

// Handle login form submission
async function handleLogin() {
  const email = emailInput.value.trim();
  const password = passwordInput.value;
  
  if (!email || !password) {
    showStatus('請填寫電子郵件和密碼', 'error');
    return;
  }
  
  const statusMsg = showStatus('正在登入...');
  
  try {
    // Call login API through background script to avoid CORS issues
    const response = await new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({
        action: 'fetchApi',
        url: `${API_BASE_URL}/login/access-token`,
        options: {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          // For URL encoded form data, we need special handling
          rawBody: new URLSearchParams({
            username: email,
            password: password,
          }).toString()
        }
      }, response => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
          return;
        }
        
        if (!response.ok) {
          reject(new Error(`Login failed: ${response.status}`));
          return;
        }
        
        resolve(response);
      });
    });
    
    const data = response.data;
    
    if (data && data.access_token) {
      // Save token in background script
      await chrome.runtime.sendMessage({ 
        action: 'saveToken', 
        token: data.access_token 
      });
      
      // Show success message
      showStatus('登入成功', 'success');
      
      // Get user info and update UI
      const userInfo = await getUserInfo();
      if (userInfo) {
        showUserInfo(userInfo);
      }
      
      // Reset form
      emailInput.value = '';
      passwordInput.value = '';
    } else {
      showStatus('登入失敗: 伺服器回應無效', 'error');
    }
  } catch (error) {
    console.error('Login error:', error);
    showStatus(`登入失敗: ${error.message}`, 'error');
  }
}

// Handle logout
async function handleLogout() {
  const statusMsg = showStatus('正在登出...');
  
  try {
    // Clear token in background script
    await chrome.runtime.sendMessage({ action: 'clearToken' });
    
    // Show login form
    showLoginForm();
    showStatus('已登出', 'success');
  } catch (error) {
    console.error('Logout error:', error);
    showStatus('登出失敗', 'error');
  }
}

// Initialize popup when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  // Cache DOM elements
  loginForm = document.getElementById('login-form');
  userInfoDiv = document.getElementById('user-info');
  emailInput = document.getElementById('email');
  passwordInput = document.getElementById('password');
  loginButton = document.getElementById('login-button');
  logoutButton = document.getElementById('logout-button');
  userEmailSpan = document.getElementById('user-email');
  statusContainer = document.getElementById('status-container');
  mindtubeLink = document.getElementById('mindtube-link');

  // Determine environment and set URLs
  if (chrome.runtime.getManifest && chrome.runtime.getManifest().update_url) {
    // Likely production (extension from store)
    mindtubeLink.href = FRONTEND_URL;
  } else {
    // Likely development (unpacked extension)
    mindtubeLink.href = FRONTEND_URL;
  }
  
  // Add event listeners
  loginButton.addEventListener('click', handleLogin);
  logoutButton.addEventListener('click', handleLogout);
  mindtubeLink.addEventListener('click', function(event) {
    event.preventDefault(); // Prevent default link behavior
    chrome.tabs.create({ url: mindtubeLink.href });
  });
  
  // Handle Enter key in password field
  passwordInput.addEventListener('keyup', function(event) {
    if (event.key === 'Enter') {
      handleLogin();
    }
  });
  
  // Check if user is already logged in
  checkAuthStatus();
}); 