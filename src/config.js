const config = {
  // API Configuration
  API_BASE_URL: process.env.REACT_APP_API_URL || 'https://h1q0720gz9.execute-api.us-east-1.amazonaws.com/prod',
  
  // Chat Configuration
  MAX_MESSAGE_LENGTH: 4000,
  TYPING_INDICATOR_DELAY: 1000,
  
  // UI Configuration
  MESSAGE_ANIMATION_DURATION: 300,
  AUTO_SCROLL_BEHAVIOR: 'smooth',
  
  // Session Configuration
  SESSION_ID_PREFIX: 'session',
  
  // Error Messages
  ERROR_MESSAGES: {
    NETWORK_ERROR: 'Network error. Please check your connection.',
    API_ERROR: 'Server error. Please try again later.',
    RATE_LIMIT: 'Rate limit exceeded. Please wait before sending another message.',
    TIMEOUT: 'Request timeout. Please try again.',
    UNKNOWN: 'An unexpected error occurred. Please try again.'
  }
};

export default config; 