const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Checkout + Orders + Payment API',
      version: '1.0.0',
      description:
        'REST API for Checkout, Orders and Payment module (Node.js, Express, MongoDB/Mongoose, JWT)'
    },

    servers: [
      {
        url: `http://localhost:${process.env.PORT || 5000}${process.env.API_PREFIX || '/api/v1'}`,
        description: 'Local server'
      }
    ],

    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },

    security: [{ bearerAuth: [] }]
  },

  apis: [
    './src/routes/*.js',
    './src/controllers/*.js',
    './src/models/*.js'
  ]
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;