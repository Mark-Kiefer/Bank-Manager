const express = require("express");
const router = express.Router();
const db = require("../connect.js");
const sanitizeHtml = require("sanitize-html");

const { roleMiddleware } = require("../../middleware/auth.js");

// Get accounts from db given customer_id
router.get("/", roleMiddleware("employee"), async (req, res) => {
  let { customer_id } = req.query;

  // Input sanitization
  customer_id = sanitizeHtml((customer_id || "").trim(), {
    allowedTags: [],
    allowedAttributes: {},
  });

  // Call database
  try {
    const [results] = await db
      .promise()
      .query("SELECT * FROM account WHERE customer_id = ?", [customer_id]);

    // Return empty array instead of 404 when no accounts found
    res.status(200).json({ accounts: results || [] });
  } catch (err) {
    console.error("Error getting accounts:", err);
    return res.status(500).json({ error: "Database error." });
  }
});

// POST account
router.post("/", roleMiddleware("employee"), async (req, res) => {
  let { customer_id, branch_id, account_type, balance, date_opened } = req.body;

  // Input sanitization
  customer_id = sanitizeHtml((customer_id || "").toString().trim(), {
    allowedTags: [],
    allowedAttributes: {},
  });
  branch_id = sanitizeHtml((branch_id || "").toString().trim(), {
    allowedTags: [],
    allowedAttributes: {},
  });
  account_type = sanitizeHtml((account_type || "").trim(), {
    allowedTags: [],
    allowedAttributes: {},
  });
  balance = parseFloat(
    sanitizeHtml((balance || "").toString().trim(), {
      allowedTags: [],
      allowedAttributes: {},
    })
  );
  date_opened = sanitizeHtml((date_opened || "").trim(), {
    allowedTags: [],
    allowedAttributes: {},
  });

  if (
    !customer_id ||
    !account_type ||
    balance === undefined ||
    balance === null ||
    !date_opened
  ) {
    return res.status(400).json({
      error:
        "Required fields: customer_id, account_type, balance, date_opened.",
    });
  }

  // Call database
  try {
    const [results] = await db
      .promise()
      .query(
        "INSERT INTO account (customer_id, branch_id, account_type, balance, date_opened) VALUES (?, ?, ?, ?, ?)",
        [customer_id, branch_id, account_type, balance, date_opened]
      );
    return res
      .status(201)
      .json({ success: true, account_id: results.insertId });
  } catch (err) {
    console.error("Error adding account:", err);
    return res.status(500).json({ error: "Database error." });
  }
});

// PUT account
// account id -> update that account
// customer id -> update all accounts for that customer
router.put("/", roleMiddleware("employee"), async (req, res) => {
  let {
    account_id,
    customer_id,
    branch_id,
    account_type,
    balance,
    date_opened,
  } = req.body;

  // Input sanitization
  account_id = sanitizeHtml((account_id || "").toString().trim(), {
    allowedTags: [],
    allowedAttributes: {},
  });
  customer_id = sanitizeHtml((customer_id || "").toString().trim(), {
    allowedTags: [],
    allowedAttributes: {},
  });
  branch_id =
    branch_id !== undefined
      ? sanitizeHtml(branch_id.toString().trim(), {
          allowedTags: [],
          allowedAttributes: {},
        })
      : undefined;
  account_type =
    account_type !== undefined
      ? sanitizeHtml(account_type.toString().trim(), {
          allowedTags: [],
          allowedAttributes: {},
        })
      : undefined;
  balance =
    balance !== undefined
      ? parseFloat(
          sanitizeHtml(balance.toString().trim(), {
            allowedTags: [],
            allowedAttributes: {},
          })
        )
      : undefined;
  date_opened =
    date_opened !== undefined
      ? sanitizeHtml(date_opened.toString().trim(), {
          allowedTags: [],
          allowedAttributes: {},
        })
      : undefined;

  // Must provide only one key
  if ((account_id && customer_id) || (!account_id && !customer_id)) {
    return res.status(400).json({
      error: "Provide either account_id OR customer_id, not both or neither.",
    });
  }

  // Build the SET clause dynamically
  let fields = [];
  let values = [];

  if (branch_id !== undefined) {
    fields.push("branch_id = ?");
    values.push(branch_id);
  }
  if (account_type !== undefined) {
    fields.push("account_type = ?");
    values.push(account_type);
  }
  if (balance !== undefined) {
    fields.push("balance = ?");
    values.push(balance);
  }
  if (date_opened !== undefined) {
    fields.push("date_opened = ?");
    values.push(date_opened);
  }

  if (fields.length === 0) {
    return res.status(400).json({ error: "No update fields provided." });
  }

  // Final SQL construction
  let whereClause, param;
  if (account_id) {
    whereClause = "WHERE account_id = ?";
    param = account_id;
  } else {
    whereClause = "WHERE customer_id = ?";
    param = customer_id;
  }
  values.push(param);

  try {
    const [results] = await db
      .promise()
      .query(`UPDATE account SET ${fields.join(", ")} ${whereClause}`, values);
    return res
      .status(200)
      .json({ success: true, affectedRows: results.affectedRows });
  } catch (err) {
    console.error("Error updating account(s):", err);
    return res.status(500).json({ error: "Database error." });
  }
});

// DELETE account
// account id -> delete that account
// customer id -> delete all accounts for that customer
router.delete("/", roleMiddleware("employee"), async (req, res) => {
  let { account_id, customer_id } = req.body;

  // Input sanitization
  account_id = sanitizeHtml((account_id || "").toString().trim(), {
    allowedTags: [],
    allowedAttributes: {},
  });
  customer_id = sanitizeHtml((customer_id || "").toString().trim(), {
    allowedTags: [],
    allowedAttributes: {},
  });

  // Must provide only one key
  if ((account_id && customer_id) || (!account_id && !customer_id)) {
    return res.status(400).json({
      error: "Provide either account_id OR customer_id, not both or neither.",
    });
  }

  let sql, param;
  if (account_id) {
    sql = "DELETE FROM account WHERE account_id = ?";
    param = account_id;
  } else {
    sql = "DELETE FROM account WHERE customer_id = ?";
    param = customer_id;
  }

  // Call database
  try {
    const [results] = await db.promise().query(sql, [param]);
    return res
      .status(200)
      .json({ success: true, affectedRows: results.affectedRows });
  } catch (err) {
    console.error("Error deleting account(s):", err);
    return res.status(500).json({ error: "Database error." });
  }
});

module.exports = router;
