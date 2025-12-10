
/**
 * Executes a database operation with retry logic to handle transient failures
 * (like serverless cold starts or connection timeouts).
 */
export async function withDbRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 500
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      console.warn(`Database operation failed on attempt ${attempt + 1}/${maxRetries + 1}:`, error);

      if (attempt === maxRetries) {
        break;
      }

      // Exponential backoff: 500ms, 1000ms, 2000ms, etc.
      const delay = baseDelay * Math.pow(2, attempt);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}
