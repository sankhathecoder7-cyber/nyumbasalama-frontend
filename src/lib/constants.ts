export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://nyumba-salama-api.onrender.com/api';

export const APP_NAME = 'NyumbaSalama';
export const APP_DESCRIPTION = 'Student housing platform - Dar es Salaam, Tanzania';

// Other constants
export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 50;

export const USER_ROLES = {
  STUDENT: 'student',
  PROPERTY_OWNER: 'property_owner',
  ADMIN: 'admin',
} as const;

export const PROPERTY_STATUS = {
  AVAILABLE: 'AVAILABLE',
  RENTED: 'RENTED',
  PENDING: 'PENDING',
} as const;

export const VIDEO_STATUS = {
  PENDING: 'PENDING',
  VERIFIED: 'VERIFIED',
  REJECTED: 'REJECTED',
} as const;

export const REVIEW_STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
} as const;
