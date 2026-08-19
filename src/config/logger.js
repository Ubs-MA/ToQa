/* Minimal logger wrapper so the rest of the app doesn't call console.* directly.
 * Kept intentionally simple — swap the implementation here (e.g. winston/pino)
 * without touching call sites elsewhere in the codebase. */

const isTest = process.env.NODE_ENV === "test";

const logger = {
  info: (...args) => {
    if (!isTest) console.log(...args);
  },
  warn: (...args) => {
    if (!isTest) console.warn(...args);
  },
  error: (...args) => {
    if (!isTest) console.error(...args);
  },
};

module.exports = logger;
