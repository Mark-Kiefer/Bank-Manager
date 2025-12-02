const express = require("express");
const router = express.Router();
const db = require("../connect.js");
const sanitizeHtml = require("sanitize-html");

// GET customers
// No values -> all customers
// customer_id -> that customer
router.get("/", async (req, res) => {
  let { customer_id } = req.query;

  // Input Sanitization
  customer_id = sanitizeHtml((customer_id || "").trim(), {
    allowedTags: [],
    allowedAttributes: {},
  });

  let sql, params;
  if (customer_id) {
    sql = "SELECT * FROM customer WHERE customer_id = ?";
    params = [customer_id];
  } else {
    sql = "SELECT * FROM customer";
    params = [];
  }

  try {
    const [results] = await db.promise().query(sql, params);
    if (results.length === 0) {
      return res.status(404).json({ error: "No records found." });
    }
    return res.status(200).json({ customers: results });
  } catch (err) {
    console.error("Error getting customers:", err);
    return res.status(500).json({ error: "Database error." });
  }
});

// POST customer
router.post("/", async (req, res) => {
  let {
    first_name,
    last_name,
    email,
    phone_number,
    address,
    date_of_birth,
    branch_id,
  } = req.body;

  // Input Sanitization
  first_name = sanitizeHtml((first_name || "").trim(), {
    allowedTags: [],
    allowedAttributes: {},
  });
  last_name = sanitizeHtml((last_name || "").trim(), {
    allowedTags: [],
    allowedAttributes: {},
  });
  email = sanitizeHtml((email || "").trim(), {
    allowedTags: [],
    allowedAttributes: {},
  });
  phone_number = sanitizeHtml((phone_number || "").trim(), {
    allowedTags: [],
    allowedAttributes: {},
  });
  address = sanitizeHtml((address || "").trim(), {
    allowedTags: [],
    allowedAttributes: {},
  });
  date_of_birth = sanitizeHtml((date_of_birth || "").trim(), {
    allowedTags: [],
    allowedAttributes: {},
  });
  branch_id = sanitizeHtml((branch_id || "").trim(), {
    allowedTags: [],
    allowedAttributes: {},
  });

  if (
    !first_name ||
    !last_name ||
    !email ||
    !phone_number ||
    !address ||
    !date_of_birth ||
    !branch_id
  ) {
    return res.status(400).json({ error: "All fields are required." });
  }

  // Query
  try {
    const [results] = await db
      .promise()
      .query(
        "INSERT INTO customer (first_name, last_name, email, phone_number, address, date_of_birth, branch_id) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [
          first_name,
          last_name,
          email,
          phone_number,
          address,
          date_of_birth,
          branch_id,
        ]
      );
    return res
      .status(201)
      .json({ success: true, customer_id: results.insertId });
  } catch (err) {
    console.error("Error adding customer:", err);
    return res.status(500).json({ error: "Database error." });
  }
});

// PUT customer
router.put("/", async (req, res) => {
  let {
    customer_id,
    first_name,
    last_name,
    email,
    phone_number,
    address,
    date_of_birth,
    branch_id,
  } = req.body;

  // Input Sanitization
  customer_id = sanitizeHtml((customer_id || "").trim(), {
    allowedTags: [],
    allowedAttributes: {},
  });
  first_name =
    first_name !== undefined
      ? sanitizeHtml(first_name.toString().trim(), {
          allowedTags: [],
          allowedAttributes: {},
        })
      : undefined;
  last_name =
    last_name !== undefined
      ? sanitizeHtml(last_name.toString().trim(), {
          allowedTags: [],
          allowedAttributes: {},
        })
      : undefined;
  email =
    email !== undefined
      ? sanitizeHtml(email.toString().trim(), {
          allowedTags: [],
          allowedAttributes: {},
        })
      : undefined;
  phone_number =
    phone_number !== undefined
      ? sanitizeHtml(phone_number.toString().trim(), {
          allowedTags: [],
          allowedAttributes: {},
        })
      : undefined;
  address =
    address !== undefined
      ? sanitizeHtml(address.toString().trim(), {
          allowedTags: [],
          allowedAttributes: {},
        })
      : undefined;
  date_of_birth =
    date_of_birth !== undefined
      ? sanitizeHtml(date_of_birth.toString().trim(), {
          allowedTags: [],
          allowedAttributes: {},
        })
      : undefined;
  branch_id =
    branch_id !== undefined
      ? sanitizeHtml(branch_id.toString().trim(), {
          allowedTags: [],
          allowedAttributes: {},
        })
      : undefined;

  if (!customer_id) {
    return res.status(400).json({ error: "customer_id is required." });
  }

  // Build the SET clause dynamically
  let fields = [];
  let values = [];
  if (first_name !== undefined) {
    fields.push("first_name = ?");
    values.push(first_name);
  }
  if (last_name !== undefined) {
    fields.push("last_name = ?");
    values.push(last_name);
  }
  if (email !== undefined) {
    fields.push("email = ?");
    values.push(email);
  }
  if (phone_number !== undefined) {
    fields.push("phone_number = ?");
    values.push(phone_number);
  }
  if (address !== undefined) {
    fields.push("address = ?");
    values.push(address);
  }
  if (date_of_birth !== undefined) {
    fields.push("date_of_birth = ?");
    values.push(date_of_birth);
  }
  if (branch_id !== undefined) {
    fields.push("branch_id = ?");
    values.push(branch_id);
  }

  if (fields.length === 0) {
    return res.status(400).json({ error: "No update fields provided." });
  }

  values.push(customer_id);

  // Query
  try {
    const [results] = await db
      .promise()
      .query(
        `UPDATE customer SET ${fields.join(", ")} WHERE customer_id = ?`,
        values
      );
    return res
      .status(200)
      .json({ success: true, affectedRows: results.affectedRows });
  } catch (err) {
    console.error("Error updating customer(s):", err);
    return res.status(500).json({ error: "Database error." });
  }
});

// DELETE customer
router.delete("/", async (req, res) => {
  let { customer_id } = req.body;

  // Input Sanitization
  customer_id = sanitizeHtml((customer_id || "").trim(), {
    allowedTags: [],
    allowedAttributes: {},
  });

  if (!customer_id) {
    return res.status(400).json({ error: "customer_id is required." });
  }

  // Query
  try {
    const [results] = await db
      .promise()
      .query("DELETE FROM customer WHERE customer_id = ?", [customer_id]);
    return res
      .status(200)
      .json({ success: true, affectedRows: results.affectedRows });
  } catch (err) {
    console.error("Error deleting customer(s):", err);
    return res.status(500).json({ error: "Database error." });
  }
});

module.exports = router;
