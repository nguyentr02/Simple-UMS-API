const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config();
const PORT = process.env.PORT || 3000;

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "University Management System (UMS) API",
      version: "1.0.0",
      description:
        "Interactive API documentation for managing students, courses, and enrollments.",
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: "Development Server",
      },
    ],
  },
  apis: [
    path.join(__dirname, "app.js"),
    path.join(__dirname, "routes", "*.js"),
    path.join(__dirname, "controllers", "*.js"),
  ],
};

const specs = swaggerJsdoc(options);


module.exports = { swaggerUi, specs };
