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

// Import loan routes
const loanRoutes = require("./routes/loans");
app.use("/api/secure/loans", loanRoutes);

// Import branch routes
const branchRoutes = require("./routes/branches");
app.use("/api/secure/loans", branchRoutes);

// Import employee routes
const employeeRoutes = require("./routes/employees");
app.use("/api/secure/loans", employeeRoutes);

// Import customer routes
const customerRoutes = require("./routes/customers");
app.use("/api/secure/loans", customerRoutes);

/*
 * Secure routes (token required, role checks done individually)
 */

// leave this for now, requires successful login and token

// Import account routes
// const courseRoutes = require("./routes/accounts");
// app.use("/api/secure/accounts", authMiddleware, courseRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${process.env.PORT}`);
});
