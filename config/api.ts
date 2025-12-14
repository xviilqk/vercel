// Centralized API configuration
// This file manages all API-related configuration and provides fallbacks

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Validate API URL format
export const getValidatedApiUrl = (): string => {
  const url = API_URL;
  
  // Ensure the URL doesn't contain 'undefined'
  if (url.includes('undefined')) {
    console.warn('API_URL contains "undefined", using fallback');
    return 'http://localhost:8000';
  }
  
  // Ensure the URL has a protocol
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    console.warn('API_URL missing protocol, adding http://');
    return `http://${url}`;
  }
  
  return url;
};

// Export the validated API URL
export const VALIDATED_API_URL = getValidatedApiUrl();

// Backward compatibility
export const apiUrl = VALIDATED_API_URL;

// API endpoints configuration
export const API_ENDPOINTS = {
  APPOINTMENTS: `${VALIDATED_API_URL}/appointments/`,
  APPOINTMENT_ACTION: (id: number, action: 'approve' | 'decline') => 
    `${VALIDATED_API_URL}/appointments/${id}/${action}/`
};