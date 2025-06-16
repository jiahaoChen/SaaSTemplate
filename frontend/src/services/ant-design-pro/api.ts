// API compatibility layer
// Re-exports functions from generated services to maintain compatibility with existing code

// Login functions
export { loginLoginAccessToken as login } from './login';

// User functions
export { usersReadUserMe as currentUser } from './users';

// Logout function - clears authentication token
export const outLogin = async () => {
  localStorage.removeItem('token');
  sessionStorage.removeItem('token');
};

// Items functions (replacing the demo rule functions with real item functions)
export { itemsReadItems as rule } from './items';
export { itemsCreateItem as addRule } from './items';
export { itemsUpdateItem as updateRule } from './items';
export { itemsDeleteItem as removeRule } from './items';

// Captcha function - for demo purposes, returns success
export const getFakeCaptcha = async (_phone: string) => {
  // In a real app, this would call a captcha service
  console.log('getFakeCaptcha called with:', _phone);
  return Promise.resolve({ success: true });
};
