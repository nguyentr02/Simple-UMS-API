const express = require("express");
const { swaggerUi, specs } = require("./swagger");
const dotenv = require("dotenv");
const { testConnection } = require("./config/db.js");
const { initialize } = require("./database.js");
const studentRoutes = require("./routes/students");
const subjectRoutes = require("./routes/subjects.js");
const classRoutes = require("./routes/class.js");
const enrollRoutes = require("./routes/enroll.js");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
console.log("App.js received specs:", !!specs);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));
app.use("/student", studentRoutes);
app.use("/subject", subjectRoutes);
app.use("/class", classRoutes);
app.use("/enroll", enrollRoutes);

app.get("/", (req, res) => {
  res.json({ message: "API is Running" });
});

const start = async () => {
  await initialize();
  app.listen(PORT, () => {
    console.log(` Server running on http://localhost:${PORT}`);
    console.log(`API Docs available at http://localhost:${PORT}/api-docs`);
  });
};

start();
