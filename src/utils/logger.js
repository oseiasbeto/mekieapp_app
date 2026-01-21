// utils/logger.js
export const logger = {
  log: (...args) => {
    if (process.env.NODE_ENV !== 'production') {
      console.log('[LOG]', ...args)
    }
  },
  warn: (...args) => {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[WARN]', ...args)
    }
  },
  error: (...args) => {
    console.error('[ERROR]', ...args)
  },
  debug: (...args) => {
    if (process.env.NODE_ENV !== 'production') {
      console.debug('[DEBUG]', ...args)
    }
  }
}