const express = require("express");
const router = express.Router();
const db = require("./connect.js");
const sanitizeHtml = require("sanitize-html");

const bcrypt = require("bcrypt");

const jwt = require("jsonwebtoken");
const SECRET = process.env.JWT_SECRET;

router.post("/", async (req, res) => {
  const { email, password } = req.body;

  email = sanitizeHtml((email || "").trim(), {
    allowedTags: [],
    allowedAttributes: {},
  });
  password = sanitizeHtml((password || "").trim(), {
    allowedTags: [],
    allowedAttributes: {},
  });

  // Match email
  const [rows] = await db
    .promise()
    .query("SELECT email, password FROM CUSTOMERS WHERE email = ?", [email]);

  if (rows.length === 0)
    return res.status(401).json({ error: "Invalid credentials" });

  const user = rows[0];

  // Match password
  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(401).json({ error: "Invalid credentials" });

  // Issue token and their role
  const token = jwt.sign(
    { customer_id: user.customer_id, role: "customer" },
    SECRET,
    {
      expiresIn: "2h",
    }
  );

  res.json({ token, role: user.role });
});

module.exports = router;
