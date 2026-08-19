const path = require("path");
const YAML = require("yamljs");
const swaggerUi = require("swagger-ui-express");

const swaggerDocument = YAML.load(path.join(__dirname, "openapi.yaml"));

/**
 * Mounts Swagger UI at the given path, e.g. app.use('/api/docs', ...mountSwagger())
 */
function mountSwagger() {
  return [swaggerUi.serve, swaggerUi.setup(swaggerDocument)];
}

module.exports = { mountSwagger, swaggerDocument };
