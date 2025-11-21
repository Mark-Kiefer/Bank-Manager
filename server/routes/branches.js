const express = require("express");
const router = express.Router();
const db = require("./connect.js");
const sanitizeHtml = require("sanitize-html");

// Get branches from db
// No values -> all branches
// branch id -> that branch
router.get("/", async (req, res) => {
  let { branch_id } = req.query;

  // Input sanitization
  branch_id = sanitizeHtml((branch_id || "").trim(), {
    allowedTags: [],
    allowedAttributes: {},
  });

  let sql, params;

  if (branch_id) {
    sql = "SELECT * FROM branch WHERE branch_id = ?";
    params = [branch_id];
  } else {
    sql = "SELECT * FROM branch";
    params = [];
  }

  try {
    const [results] = await db.promise().query(sql, params);

    if (results.length === 0) {
      return res.status(404).json({ error: "No records found." });
    }

    return res.status(200).json({ branches: results });
  } catch (err) {
    console.error("Error getting branches:", err);
    return res.status(500).json({ error: "Database error." });
  }
});

// Add a branch to the db
router.post("/", async (req, res) => {
  // Required inputs
  let { branch_id, branch_name, address, city, manager_id } = req.body;

  // Input sanitization
  branch_id = sanitizeHtml((branch_id || "").toString().trim(), {
    allowedTags: [],
    allowedAttributes: {},
  });
  branch_name = sanitizeHtml((branch_name || "").toString().trim(), {
    allowedTags: [],
    allowedAttributes: {},
  });
  address = sanitizeHtml((address || "").trim(), {
    allowedTags: [],
    allowedAttributes: {},
  });
  city = sanitizeHtml((city || "").trim(), {
    allowedTags: [],
    allowedAttributes: {},
  });
  manager_id = sanitizeHtml((manager_id || "").trim(), {
    allowedTags: [],
    allowedAttributes: {},
  });

  if (!branch_id || !branch_name || !address || !city || !manager_id) {
    return res.status(400).json({ error: "All fields are required." });
  }

  try {
    const [results] = await db
      .promise()
      .query(
        "INSERT INTO branch (branch_id, banch_name, address, city, manager_id) VALUES (?, ?, ?, ?, ?)",
        [branch_id, banch_name, address, city, manager_id]
      );
    return res.status(201).json({ success: true, branch_id: results.insertId });
  } catch (err) {
    console.error("Error adding branch:", err);
    return res.status(500).json({ error: "Database error." });
  }
});

// Update a branch in the db
// branch id -> that branch
router.put("/", async (req, res) => {
  // Required inputs
  let { branch_id, branch_name, address, city, manager_id } = req.body;

  // Input sanitization
  branch_id = sanitizeHtml((branch_id || "").toString().trim(), {
    allowedTags: [],
    allowedAttributes: {},
  });
  branch_name =
    branch_name !== undefined
      ? sanitizeHtml(branch_name.toString().trim(), {
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
  city =
    city !== undefined
      ? sanitizeHtml(city.toString().trim(), {
          allowedTags: [],
          allowedAttributes: {},
        })
      : undefined;
  manager_id =
    manager_id !== undefined
      ? sanitizeHtml(manager_id.toString().trim(), {
          allowedTags: [],
          allowedAttributes: {},
        })
      : undefined;

  if (!branch_id) {
    return res.status(400).json({ error: "branch_id is required." });
  }

  // Build the SET clause dynamically
  let fields = [];
  let values = [];

  if (branch_name !== undefined) {
    fields.push("branch_name = ?");
    values.push(branch_name);
  }
  if (address !== undefined) {
    fields.push("address = ?");
    values.push(address);
  }
  if (city) {
    fields.push("city = ?");
    values.push(city);
  }
  if (manager_id) {
    fields.push("manager_id = ?");
    values.push(manager_id);
  }

  if (fields.length === 0) {
    return res.status(400).json({ error: "No update fields provided." });
  }

  // Final SQL construction
  let whereClause, param;
  if (branch_id) {
    whereClause = "WHERE branch_id = ?";
    param = branch_id;
  }

  values.push(param);

  try {
    const [results] = await db
      .promise()
      .query(`UPDATE branch SET ${fields.join(", ")} ${whereClause}`, values);
    return res
      .status(200)
      .json({ success: true, affectedRows: results.affectedRows });
  } catch (err) {
    console.error("Error updating branch(s):", err);
    return res.status(500).json({ error: "Database error." });
  }
});

// Delete a branch in the db
// branch id -> that branch
router.delete("/", async (req, res) => {
  let { branch_id } = req.body;

  // Input sanitization
  branch_id = sanitizeHtml((branch_id || "").toString().trim(), {
    allowedTags: [],
    allowedAttributes: {},
  });

  // Must provide the key
  if (!branch_id) {
    return res.status(400).json({
      error: "Provide branch_id.",
    });
  }

  let sql, param;
  if (branch_id) {
    sql = "DELETE FROM branch WHERE branch_id = ?";
    param = branch_id;
  }

  try {
    const [results] = await db.promise().query(sql, [param]);
    return res
      .status(200)
      .json({ success: true, affectedRows: results.affectedRows });
  } catch (err) {
    console.error("Error deleting branch(s):", err);
    return res.status(500).json({ error: "Database error." });
  }
});

module.exports = router;
