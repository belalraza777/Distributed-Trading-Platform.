import CircuitBreaker from 'opossum'; //Library for implementing circuit breaker pattern in Node.js
import { circuitBreakerConfig } from '../config/circuit-breaker-config';

// Creates a reusable breaker; each client can override its own settings.
export const createCircuitBreaker = (
  action: (...args: any[]) => Promise<any>,
  options: Partial<typeof circuitBreakerConfig> = {}
) => {
  return new CircuitBreaker(action, {
    ...circuitBreakerConfig,
    ...options,
  });
};