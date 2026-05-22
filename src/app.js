require("dotenv").config();
const express = require("express");
const { specs } = require("./swagger");
const { initialize } = require("./database");
const studentRoutes = require("./routes/students");
const subjectRoutes = require("./routes/subjects.js");
const classRoutes = require("./routes/class.js");
const enrollRoutes = require("./routes/enroll.js");
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());


// Serve swagger spec as JSON
app.get("/api-docs/swagger.json", (req, res) => {
  res.json(specs);
});

// Serve Swagger UI via CDN
app.get("/api-docs", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>UMS API Docs</title>
        <meta charset="utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" >
      </head>
      <body>
        <div id="swagger-ui"></div>
        <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"> </script>
        <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-standalone-preset.js"> </script>
        <script>
          window.onload = function() {
            SwaggerUIBundle({
              url: "/api-docs/swagger.json",
              dom_id: '#swagger-ui',
              presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset],
              layout: "StandaloneLayout"
            })
          }
        </script>
      </body>
    </html>
  `);
});

app.use("/student", studentRoutes);
app.use("/subject", subjectRoutes);
app.use("/class", classRoutes);
app.use("/enroll", enrollRoutes);

app.get("/", (req, res) => {
  res.json({ message: "API is Running" });
});

async function start() {
  await initialize();
  app.listen(PORT, () => {
    console.log(` Server running on http://localhost:${PORT}`);
    console.log(`API Docs available at http://localhost:${PORT}/api-docs`);
  });
}

start();
