const express = require("express");
const router = express.Router();
const db = require("./connect.js");
const sanitizeHtml = require("sanitize-html");

const { roleMiddleware } = require("../middleware/auth");

// Get accounts from db given customer_id
router.get("/", roleMiddleware("customer"), async (req, res) => {
  let { customer_id } = req.query;

  customer_id = sanitizeHtml((customer_id || "").trim(), {
    allowedTags: [],
    allowedAttributes: {},
  });

  // Call database
  try {
    const [results] = await db
      .promise()
      .query("SELECT * FROM ACCOUNTS WHERE customer_id = ?;", [customer_id]);
    res.status(200).json(results);
  } catch (err) {
    console.error("Error fetching courses:", err);
    return res.status(500).json({ error: "Database error." });
  }
});

module.exports = router;
