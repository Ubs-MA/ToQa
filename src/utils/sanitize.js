/**
 * Strips keys containing Mongo operator characters ($ and .) from an object,
 * recursively. Mutates the object in place rather than reassigning it,
 * because Express 5 makes req.query a read-only getter (which is what broke
 * the express-mongo-sanitize package here).
 */
function sanitizeInPlace(obj) {
  if (!obj || typeof obj !== "object") return obj;

  for (const key of Object.keys(obj)) {
    if (key.startsWith("$") || key.includes(".")) {
      delete obj[key];
      continue;
    }
    if (obj[key] && typeof obj[key] === "object") {
      sanitizeInPlace(obj[key]);
    }
  }

  return obj;
}

/**
 * Express middleware: sanitizes req.body, req.params, and req.query.
 */
function mongoSanitizeMiddleware(req, _res, next) {
  if (req.body) sanitizeInPlace(req.body);
  if (req.params) sanitizeInPlace(req.params);
  if (req.query) sanitizeInPlace(req.query);
  next();
}

module.exports = mongoSanitizeMiddleware;
