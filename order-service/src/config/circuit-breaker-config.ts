// Circuit breaker configuration for the Order Service.
//
// It prevents repeated calls to an unhealthy downstream service.
// When failures cross the threshold, requests are blocked temporarily.

export const circuitBreakerConfig = {
  // Maximum time a request can take before it is considered failed.
  timeout: 5000, // 5 seconds

  // Circuit opens when the failure rate reaches 50%.
  errorThresholdPercentage: 50, // 50% failure rate

  // After 30 seconds, the circuit allows a test request.
  resetTimeout: 30000,  // 30 seconds

  // Wait for at least 5 requests before evaluating failure rate.
  volumeThreshold: 5,  // Minimum number of requests before the circuit breaker evaluates the error rate.
};