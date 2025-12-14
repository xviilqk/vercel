// API utility functions - now using centralized config
// This file is kept for backward compatibility

export { VALIDATED_API_URL as apiUrl } from '../../config/api';

// Legacy function for backward compatibility
export const getApiUrl = (): string => {
  return process.env.NEXT_PUBLIC_API_URL || '';
};
