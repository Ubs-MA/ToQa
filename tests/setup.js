process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test_jwt_secret_key_for_automated_tests_only_do_not_use_in_prod";
process.env.JWT_EXPIRES_IN = "1h";
process.env.JWT_COOKIE_EXPIRES_DAYS = "1";
process.env.MONGO_URI = "mongodb://127.0.0.1:27017/toqa_test";
process.env.BCRYPT_SALT_ROUNDS = "4"; // low cost factor — faster tests, still exercises real bcrypt
process.env.CORS_ORIGIN = "*";
process.env.RATE_LIMIT_MAX = "10000";
process.env.RATE_LIMIT_WINDOW_MS = "900000";
// Individual rate-limit tests override AUTH_RATE_LIMIT_MAX at the top of
// their own file (before requiring the app) — reset to a permissive
// default here so it never leaks between test files in --runInBand mode.
process.env.AUTH_RATE_LIMIT_MAX = "10000";
process.env.AUTH_RATE_LIMIT_WINDOW_MS = "900000";

jest.setTimeout(15000);
