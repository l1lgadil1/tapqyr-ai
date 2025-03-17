/**
 * Custom API error class for consistent error handling
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public data?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
    
    // Ensures proper instanceof checks work in ES5
    Object.setPrototypeOf(this, ApiError.prototype);
  }
} 