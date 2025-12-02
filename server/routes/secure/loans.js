const express = require("express");
const router = express.Router();
const db = require("../connect.js");
const sanitizeHtml = require("sanitize-html");

// Get loans from db
// No values -> all loans
// loan id -> that loan
// customer id -> all loans for that customer
router.get("/", async (req, res) => {
  // Requires one or none of these
  let { customer_id, loan_id } = req.query;

  // Input sanitization
  customer_id = sanitizeHtml((customer_id || "").trim(), {
    allowedTags: [],
    allowedAttributes: {},
  });
  loan_id = sanitizeHtml((loan_id || "").trim(), {
    allowedTags: [],
    allowedAttributes: {},
  });

  // Only one identifier allowed
  if (customer_id && loan_id) {
    return res
      .status(400)
      .json({ error: "Provide either customer_id OR loan_id, not both." });
  }

  let sql, params;

  if (loan_id) {
    sql = "SELECT * FROM loan WHERE loan_id = ?";
    params = [loan_id];
  } else if (customer_id) {
    sql = "SELECT * FROM loan WHERE customer_id = ?";
    params = [customer_id];
  } else {
    sql = "SELECT * FROM loan";
    params = [];
  }

  try {
    const [results] = await db.promise().query(sql, params);

    if (results.length === 0) {
      return res.status(404).json({ error: "No records found." });
    }

    return res.status(200).json({ loans: results });
  } catch (err) {
    console.error("Error getting loans:", err);
    return res.status(500).json({ error: "Database error." });
  }
});

// Add a loan to the db
router.post("/", async (req, res) => {
  // Required inputs
  let {
    customer_id,
    employee_id,
    amount,
    interest_rate,
    start_date,
    end_date,
  } = req.body;

  // Input sanitization
  customer_id = sanitizeHtml((customer_id || "").toString().trim(), {
    allowedTags: [],
    allowedAttributes: {},
  });
  employee_id = sanitizeHtml((employee_id || "").toString().trim(), {
    allowedTags: [],
    allowedAttributes: {},
  });
  amount = parseFloat(
    sanitizeHtml((amount || "").toString().trim(), {
      allowedTags: [],
      allowedAttributes: {},
    })
  );
  interest_rate = parseFloat(
    sanitizeHtml((interest_rate || "").toString().trim(), {
      allowedTags: [],
      allowedAttributes: {},
    })
  );
  start_date = sanitizeHtml((start_date || "").trim(), {
    allowedTags: [],
    allowedAttributes: {},
  });
  end_date = sanitizeHtml((end_date || "").trim(), {
    allowedTags: [],
    allowedAttributes: {},
  });

  if (
    !customer_id ||
    !employee_id ||
    !amount ||
    !interest_rate ||
    !start_date ||
    !end_date
  ) {
    return res.status(400).json({ error: "All fields are required." });
  }

  try {
    const [results] = await db
      .promise()
      .query(
        "INSERT INTO loan (customer_id, employee_id, amount, interest_rate, start_date, end_date) VALUES (?, ?, ?, ?, ?, ?)",
        [customer_id, employee_id, amount, interest_rate, start_date, end_date]
      );
    return res.status(201).json({ success: true, loan_id: results.insertId });
  } catch (err) {
    console.error("Error adding loan:", err);
    return res.status(500).json({ error: "Database error." });
  }
});

// Update a loan in the db
// loan id -> that loan
// customer id -> all loans for that customer
router.put("/", async (req, res) => {
  // Required inputs
  let {
    loan_id,
    customer_id,
    employee_id,
    amount,
    interest_rate,
    start_date,
    end_date,
  } = req.body;

  // Input sanitization
  loan_id = sanitizeHtml((loan_id || "").toString().trim(), {
    allowedTags: [],
    allowedAttributes: {},
  });
  customer_id = sanitizeHtml((customer_id || "").toString().trim(), {
    allowedTags: [],
    allowedAttributes: {},
  });
  employee_id = sanitizeHtml((employee_id || "").toString().trim(), {
    allowedTags: [],
    allowedAttributes: {},
  });
  amount =
    amount !== undefined
      ? parseFloat(
          sanitizeHtml(amount.toString().trim(), {
            allowedTags: [],
            allowedAttributes: {},
          })
        )
      : undefined;
  interest_rate =
    interest_rate !== undefined
      ? parseFloat(
          sanitizeHtml(interest_rate.toString().trim(), {
            allowedTags: [],
            allowedAttributes: {},
          })
        )
      : undefined;
  start_date = sanitizeHtml((start_date || "").trim(), {
    allowedTags: [],
    allowedAttributes: {},
  });
  end_date = sanitizeHtml((end_date || "").trim(), {
    allowedTags: [],
    allowedAttributes: {},
  });

  // Must provide ONLY ONE key
  if ((loan_id && customer_id) || (!loan_id && !customer_id)) {
    return res.status(400).json({
      error: "Provide either loan_id OR customer_id, not both or neither.",
    });
  }

  // Build the SET clause dynamically
  let fields = [];
  let values = [];

  if (employee_id) {
    fields.push("employee_id = ?");
    values.push(employee_id);
  }
  if (amount !== undefined) {
    fields.push("amount = ?");
    values.push(amount);
  }
  if (interest_rate !== undefined) {
    fields.push("interest_rate = ?");
    values.push(interest_rate);
  }
  if (start_date !== undefined) {
    fields.push("start_date = ?");
    values.push(start_date);
  }
  if (end_date !== undefined) {
    fields.push("end_date = ?");
    values.push(end_date);
  }

  if (fields.length === 0) {
    return res.status(400).json({ error: "No update fields provided." });
  }

  // Final SQL construction
  let whereClause, param;
  if (loan_id) {
    whereClause = "WHERE loan_id = ?";
    param = loan_id;
  } else {
    whereClause = "WHERE customer_id = ?";
    param = customer_id;
  }
  values.push(param);

  try {
    const [results] = await db
      .promise()
      .query(`UPDATE loan SET ${fields.join(", ")} ${whereClause}`, values);
    return res
      .status(200)
      .json({ success: true, affectedRows: results.affectedRows });
  } catch (err) {
    console.error("Error updating loan(s):", err);
    return res.status(500).json({ error: "Database error." });
  }
});

// Delete a loan in the db
// loan id -> that loan
// customer id -> all loans for that customer
router.delete("/", async (req, res) => {
  // Requires one of these
  let { loan_id, customer_id } = req.body;

  // Input sanitization
  loan_id = sanitizeHtml((loan_id || "").toString().trim(), {
    allowedTags: [],
    allowedAttributes: {},
  });
  customer_id = sanitizeHtml((customer_id || "").toString().trim(), {
    allowedTags: [],
    allowedAttributes: {},
  });

  // Must provide only one key
  if ((loan_id && customer_id) || (!loan_id && !customer_id)) {
    return res.status(400).json({
      error: "Provide either loan_id OR customer_id, not both or neither.",
    });
  }

  let sql, param;
  if (loan_id) {
    sql = "DELETE FROM loan WHERE loan_id = ?";
    param = loan_id;
  } else {
    sql = "DELETE FROM loan WHERE customer_id = ?";
    param = customer_id;
  }

  try {
    const [results] = await db.promise().query(sql, [param]);
    return res
      .status(200)
      .json({ success: true, affectedRows: results.affectedRows });
  } catch (err) {
    console.error("Error deleting loan(s):", err);
    return res.status(500).json({ error: "Database error." });
  }
});

module.exports = router;
