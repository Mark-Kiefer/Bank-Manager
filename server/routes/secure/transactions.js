const express = require("express");
const router = express.Router();
const db = require("../connect.js");
const sanitizeHtml = require("sanitize-html");

const { roleMiddleware } = require("../../middleware/auth.js");

// Get transactions from db
// No values -> all transactions
// transaction_id -> that transaction
// account_id -> transactions for that account
// customer_id -> transactions for that customer
router.get("/", roleMiddleware("employee"), async (req, res) => {
  // Requires one or none of these
  let { customer_id, account_id, transaction_id } = req.query;

  // Input sanitization
  customer_id = sanitizeHtml((customer_id || "").trim(), {
    allowedTags: [],
    allowedAttributes: {},
  });
  account_id = sanitizeHtml((account_id || "").trim(), {
    allowedTags: [],
    allowedAttributes: {},
  });
  transaction_id = sanitizeHtml((transaction_id || "").trim(), {
    allowedTags: [],
    allowedAttributes: {},
  });

  // Only one identifier allowed
  if (transaction_id && (account_id || customer_id)) {
    return res.status(400).json({
      error: "Provide only one of: transaction_id, account_id, or customer_id.",
    });
  }
  if (account_id && customer_id) {
    return res
      .status(400)
      .json({ error: "Provide either account_id OR customer_id, not both." });
  }

  let sql, params;

  if (transaction_id) {
    sql = "SELECT * FROM transaction WHERE transaction_id = ?";
    params = [transaction_id];
  } else if (account_id) {
    sql = "SELECT * FROM transaction WHERE account_id = ?";
    params = [account_id];
  } else if (customer_id) {
    sql = "SELECT * FROM transaction WHERE customer_id = ?";
    params = [customer_id];
  } else {
    sql = "SELECT * FROM transaction";
    params = [];
  }

  try {
    const [results] = await db.promise().query(sql, params);

    if (results.length === 0) {
      return res.status(404).json({ error: "No records found." });
    }

    return res.status(200).json({ transactions: results });
  } catch (err) {
    console.error("Error getting transactions:", err);
    return res.status(500).json({ error: "Database error." });
  }
});

// POST transaction
router.post("/", roleMiddleware("employee"), async (req, res) => {
  let {
    account_id,
    customer_id,
    transaction_type,
    amount,
    timestamp,
    completed,
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
  transaction_type = sanitizeHtml((transaction_type || "").trim(), {
    allowedTags: [],
    allowedAttributes: {},
  });
  amount = parseFloat(
    sanitizeHtml((amount || "").toString().trim(), {
      allowedTags: [],
      allowedAttributes: {},
    })
  );
  timestamp = sanitizeHtml((timestamp || "").trim(), {
    allowedTags: [],
    allowedAttributes: {},
  });
  completed = completed !== undefined ? parseInt(completed) : undefined;

  if (
    !account_id ||
    !customer_id ||
    !transaction_type ||
    amount === undefined ||
    amount === null ||
    !timestamp
  ) {
    return res.status(400).json({
      error:
        "Required fields: account_id, customer_id, transaction_type, amount, timestamp.",
    });
  }

  try {
    const [results] = await db
      .promise()
      .query(
        "INSERT INTO transaction ( account_id, customer_id, transaction_type, amount, timestamp, completed) VALUES (?, ?, ?, ?, ?, ?)",
        [
          account_id,
          customer_id,
          transaction_type,
          amount,
          timestamp,
          completed,
        ]
      );
    return res
      .status(201)
      .json({ success: true, transaction_id: results.insertId });
  } catch (err) {
    console.error("Error adding transaction:", err);
    return res.status(500).json({ error: "Database error." });
  }
});

// PUT transaction
// transaction_id -> that transaction
// account_id -> transactions for that account
// customer_id -> transactions for that customer
router.put("/", roleMiddleware("employee"), async (req, res) => {
  let {
    transaction_id,
    account_id,
    customer_id,
    transaction_type,
    amount,
    timestamp,
    completed,
  } = req.body;

  // Input sanitization
  transaction_id = sanitizeHtml((transaction_id || "").toString().trim(), {
    allowedTags: [],
    allowedAttributes: {},
  });
  account_id = sanitizeHtml((account_id || "").toString().trim(), {
    allowedTags: [],
    allowedAttributes: {},
  });
  customer_id = sanitizeHtml((customer_id || "").toString().trim(), {
    allowedTags: [],
    allowedAttributes: {},
  });
  transaction_type =
    transaction_type !== undefined
      ? sanitizeHtml(transaction_type.toString().trim(), {
          allowedTags: [],
          allowedAttributes: {},
        })
      : undefined;
  amount =
    amount !== undefined
      ? parseFloat(
          sanitizeHtml(amount.toString().trim(), {
            allowedTags: [],
            allowedAttributes: {},
          })
        )
      : undefined;
  timestamp =
    timestamp !== undefined
      ? sanitizeHtml(timestamp.toString().trim(), {
          allowedTags: [],
          allowedAttributes: {},
        })
      : undefined;
  completed = completed !== undefined ? parseInt(completed) : undefined;

  // Must provide only one key
  if (transaction_id && (account_id || customer_id)) {
    return res.status(400).json({
      error:
        "Provide only transaction_id for updates, not account_id or customer_id.",
    });
  }
  if (
    (account_id && customer_id) ||
    (!transaction_id && !account_id && !customer_id)
  ) {
    return res.status(400).json({
      error:
        "Provide either transaction_id OR account_id OR customer_id, not combinations or none.",
    });
  }

  // Build the SET clause dynamically
  let fields = [];
  let values = [];

  if (transaction_type !== undefined) {
    fields.push("transaction_type = ?");
    values.push(transaction_type);
  }
  if (amount !== undefined) {
    fields.push("amount = ?");
    values.push(amount);
  }
  if (timestamp !== undefined) {
    fields.push("timestamp = ?");
    values.push(timestamp);
  }
  if (completed !== undefined) {
    fields.push("completed = ?");
    values.push(completed);
  }

  if (fields.length === 0) {
    return res.status(400).json({ error: "No update fields provided." });
  }

  // Final SQL construction
  let whereClause, param;
  if (transaction_id) {
    whereClause = "WHERE transaction_id = ?";
    param = transaction_id;
  } else if (account_id) {
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
      .query(
        `UPDATE transaction SET ${fields.join(", ")} ${whereClause}`,
        values
      );
    return res
      .status(200)
      .json({ success: true, affectedRows: results.affectedRows });
  } catch (err) {
    console.error("Error updating transaction(s):", err);
    return res.status(500).json({ error: "Database error." });
  }
});

// DELETE transaction
// transaction_id -> that transaction
// account_id -> transactions for that account
// customer_id -> transactions for that customer
router.delete("/", roleMiddleware("employee"), async (req, res) => {
  let { transaction_id, account_id, customer_id } = req.body;

  // Input sanitization
  transaction_id = sanitizeHtml((transaction_id || "").toString().trim(), {
    allowedTags: [],
    allowedAttributes: {},
  });
  account_id = sanitizeHtml((account_id || "").toString().trim(), {
    allowedTags: [],
    allowedAttributes: {},
  });
  customer_id = sanitizeHtml((customer_id || "").toString().trim(), {
    allowedTags: [],
    allowedAttributes: {},
  });

  // Must provide only one key
  let keyCount = [transaction_id, account_id, customer_id].filter(
    Boolean
  ).length;
  if (keyCount !== 1) {
    return res.status(400).json({
      error:
        "Provide exactly one of: transaction_id, account_id, or customer_id.",
    });
  }

  let sql, param;
  if (transaction_id) {
    sql = "DELETE FROM transaction WHERE transaction_id = ?";
    param = transaction_id;
  } else if (account_id) {
    sql = "DELETE FROM transaction WHERE account_id = ?";
    param = account_id;
  } else {
    sql = "DELETE FROM transaction WHERE customer_id = ?";
    param = customer_id;
  }

  try {
    const [results] = await db.promise().query(sql, [param]);
    return res
      .status(200)
      .json({ success: true, affectedRows: results.affectedRows });
  } catch (err) {
    console.error("Error deleting transaction(s):", err);
    return res.status(500).json({ error: "Database error." });
  }
});

module.exports = router;
