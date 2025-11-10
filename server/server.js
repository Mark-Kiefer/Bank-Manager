const express = require("express");
const app = express();
const path = require("path");
const PORT = process.env.PORT;
require("dotenv").config();

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, "../client")));

const { authMiddleware } = require("./middleware/auth");

/*
 * Public routes
 */
// Import login route
const loginRoutes = require("./routes/login");
app.use("/api/login", loginRoutes);

/*
 * Secure routes (token required, role checks done individually)
 */
// Import account routes
const courseRoutes = require("./routes/accounts");
app.use("/api/secure/accounts", authMiddleware, courseRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${process.env.PORT}`);
});
