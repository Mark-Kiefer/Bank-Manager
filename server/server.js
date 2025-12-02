const express = require("express");
const app = express();
const path = require("path");

require("dotenv").config();
const PORT = process.env.PORT;

// Middleware
app.use(express.json());
// app.use(express.static(path.join(__dirname, "../client")));

// const { authMiddleware } = require("./middleware/auth");

/*
 * Public routes
 */
// Import login route
const loginRoutes = require("./routes/login");
app.use("/api/login", loginRoutes);

/*
 * Secure routes (token required, role checks done individually)
 * Only employees should have access
 */

// Import account routes
const accountRoutes = require("./routes/secure/accounts");
app.use("/api/secure/accounts", accountRoutes);

// Import loan routes
const loanRoutes = require("./routes/secure/loans");
app.use("/api/secure/loans", loanRoutes);

// Import branch routes
const branchRoutes = require("./routes/secure/branches");
app.use("/api/secure/branches", branchRoutes);

// Import employee routes
const employeeRoutes = require("./routes/secure/employees");
app.use("/api/secure/employees", employeeRoutes);

// Import customer routes
const customerRoutes = require("./routes/secure/customers");
app.use("/api/secure/customers", customerRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
