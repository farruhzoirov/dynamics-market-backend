// Application-wide constants to replace magic numbers and strings

export const PAGINATION_CONSTANTS = {
  DEFAULT_PAGE_SIZE: 12,
  MAX_PAGE_SIZE: 100,
  DEFAULT_BATCH_SIZE: 100,
  MIN_PAGE_SIZE: 1,
} as const;

export const LANGUAGE_FIELDS = {
  UZ: 'Uz',
  RU: 'Ru',
  EN: 'En',
} as const;

export const LANGUAGE_CODES = {
  UZBEK: 'uz',
  RUSSIAN: 'ru',
  ENGLISH: 'en',
} as const;

export const ORDER_CODE_CONFIG = {
  PAD_LENGTH: 4,
  PAD_CHARACTER: '0',
  COUNTER_NAME: 'order',
} as const;

export const SEARCH_CONSTANTS = {
  CASE_INSENSITIVE_FLAG: 'i',
  DEFAULT_SORT: { createdAt: -1, views: -1 },
  ELASTICSEARCH_TIMEOUT: '30s',
} as const;

export const DATABASE_CONSTANTS = {
  SOFT_DELETE_FIELD: 'isDeleted',
  STATUS_ACTIVE: 1,
  STATUS_INACTIVE: 0,
} as const;

export const VIEW_TRACKING = {
  BATCH_PROCESS_INTERVAL: 30000, // 30 seconds
  MAX_BATCH_SIZE: 1000,
} as const;

export const CACHE_TTL = {
  SHORT: 300,     // 5 minutes
  MEDIUM: 600,    // 10 minutes
  LONG: 3600,     // 1 hour
  VERY_LONG: 86400, // 24 hours
} as const;

// Error messages for consistent error handling
export const ERROR_MESSAGES = {
  ENTITY_NOT_FOUND: (entity: string, id: string) => `${entity} with ID ${id} not found`,
  INVALID_ID_FORMAT: (entity: string) => `Invalid ${entity} ID format`,
  REQUIRED_FIELD: (field: string) => `${field} is required`,
  INVALID_INPUT: (field: string) => `Invalid ${field} provided`,
  OPERATION_FAILED: (operation: string) => `Failed to ${operation}`,
  UNAUTHORIZED_ACCESS: 'Unauthorized access',
  VALIDATION_FAILED: 'Validation failed',
} as const;