/**
 * Utility functions for JWT token management
 */

/**
 * Decode a JWT token to get its payload
 * @param {string} token - The JWT token to decode
 * @returns {object|null} - The decoded payload or null if invalid
 */
export const decodeToken = (token) => {
  if (!token) return null;
  
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

/**
 * Check if a JWT token is expired
 * @param {string} token - The JWT token to check
 * @returns {boolean} - True if token is expired, false otherwise
 */
export const isTokenExpired = (token) => {
  if (!token) return true;
  
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return true;
  
  // Check if token expiration time is in the past
  // exp is in seconds, Date.now() is in milliseconds
  const currentTime = Date.now() / 1000;
  return decoded.exp < currentTime;
};

/**
 * Check if a token will expire soon (within specified minutes)
 * @param {string} token - The JWT token to check
 * @param {number} minutes - Number of minutes threshold (default: 5)
 * @returns {boolean} - True if token will expire soon
 */
export const isTokenExpiringSoon = (token, minutes = 5) => {
  if (!token) return true;
  
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return true;
  
  const currentTime = Date.now() / 1000;
  const expirationTime = decoded.exp;
  const thresholdTime = currentTime + (minutes * 60);
  
  return expirationTime < thresholdTime;
};

/**
 * Get token expiration time as a Date object
 * @param {string} token - The JWT token
 * @returns {Date|null} - Expiration date or null if invalid
 */
export const getTokenExpiration = (token) => {
  if (!token) return null;
  
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return null;
  
  return new Date(decoded.exp * 1000);
};

/**
 * Validate if tokens are present and not expired
 * @returns {boolean} - True if tokens are valid
 */
export const areTokensValid = () => {
  const accessToken = localStorage.getItem('access_token');
  const refreshToken = localStorage.getItem('refresh_token');
  
  // Both tokens must exist
  if (!accessToken || !refreshToken) {
    return false;
  }
  
  // Refresh token must not be expired (access token can be refreshed)
  return !isTokenExpired(refreshToken);
};

/**
 * Clear all authentication data from localStorage
 */
export const clearAuthData = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user');
};
