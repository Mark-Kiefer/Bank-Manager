const express = require("express");
const router = express.Router();
const db = require("../connect.js");
const sanitizeHtml = require("sanitize-html");
const bcrypt = require("bcrypt");

const { roleMiddleware } = require("../../middleware/auth.js");

// Get employees from db
// No values -> all employees
// employee id -> that employee
// branch id -> all employees in that branch
router.get("/", roleMiddleware("employee"), async (req, res) => {
  let { employee_id, branch_id } = req.query;

  // Input sanitization
  employee_id = sanitizeHtml((employee_id || "").trim(), {
    allowedTags: [],
    allowedAttributes: {},
  });
  branch_id = sanitizeHtml((branch_id || "").trim(), {
    allowedTags: [],
    allowedAttributes: {},
  });

  let sql, params;

  if (employee_id) {
    sql = "SELECT * FROM employee WHERE employee_id = ?";
    params = [employee_id];
  } else if (branch_id) {
    sql = "SELECT * FROM employee WHERE branch_id = ?";
    params = [branch_id];
  } else {
    sql = "SELECT * FROM employee";
    params = [];
  }

  try {
    const [results] = await db.promise().query(sql, params);

    if (results.length === 0) {
      return res.status(404).json({ error: "No records found." });
    }

    return res.status(200).json({ employees: results });
  } catch (err) {
    console.error("Error getting employees:", err);
    return res.status(500).json({ error: "Database error." });
  }
});

// Add an employee to the db
router.post("/", roleMiddleware("employee"), async (req, res) => {
  // Required inputs
  let {
    first_name,
    last_name,
    email,
    phone_number,
    position,
    hire_date,
    branch_id,
    password,
  } = req.body;

  // Input sanitization
  first_name = sanitizeHtml((first_name || "").toString().trim(), {
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
  position = sanitizeHtml((position || "").trim(), {
    allowedTags: [],
    allowedAttributes: {},
  });
  hire_date = sanitizeHtml((hire_date || "").trim(), {
    allowedTags: [],
    allowedAttributes: {},
  });
  branch_id = sanitizeHtml((branch_id || "").trim(), {
    allowedTags: [],
    allowedAttributes: {},
  });
  password = sanitizeHtml((password || "").trim(), {
    allowedTags: [],
    allowedAttributes: {},
  });

  if (
    !first_name ||
    !last_name ||
    !email ||
    !email.includes("@") ||
    !phone_number ||
    !position ||
    !hire_date ||
    !branch_id ||
    !password
  ) {
    return res
      .status(400)
      .json({ error: "All fields must be correctly filled." });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const [results] = await db
      .promise()
      .query(
        "INSERT INTO employee (first_name, last_name, email, phone_number, position, hire_date, branch_id, password) VALUES ( ?, ?, ?, ?, ?, ?, ?, ?)",
        [
          first_name,
          last_name,
          email,
          phone_number,
          position,
          hire_date,
          branch_id,
          hashedPassword,
        ]
      );
    return res
      .status(201)
      .json({ success: true, employee_id: results.insertId });
  } catch (err) {
    console.error("Error adding employee:", err);
    return res.status(500).json({ error: "Database error." });
  }
});

// Update an employee in the db
// employee id -> that employee
router.put("/", roleMiddleware("employee"), async (req, res) => {
  // Required inputs
  let {
    employee_id,
    first_name,
    last_name,
    email,
    phone_number,
    position,
    hire_date,
    branch_id,
  } = req.body;

  // Input sanitization
  employee_id = sanitizeHtml((employee_id || "").toString().trim(), {
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
  position =
    position !== undefined
      ? sanitizeHtml(position.toString().trim(), {
          allowedTags: [],
          allowedAttributes: {},
        })
      : undefined;
  hire_date =
    hire_date !== undefined
      ? sanitizeHtml(hire_date.toString().trim(), {
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

  if (!employee_id) {
    return res.status(400).json({ error: "employee_id is required." });
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
  if (position !== undefined) {
    fields.push("position = ?");
    values.push(position);
  }
  if (hire_date !== undefined) {
    fields.push("hire_date = ?");
    values.push(hire_date);
  }
  if (branch_id !== undefined) {
    fields.push("branch_id = ?");
    values.push(branch_id);
  }

  if (fields.length === 0) {
    return res.status(400).json({ error: "No update fields provided." });
  }

  // Final SQL construction
  let whereClause, param;
  if (employee_id) {
    whereClause = "WHERE employee_id = ?";
    param = employee_id;
  }

  values.push(param);

  try {
    const [results] = await db
      .promise()
      .query(`UPDATE employee SET ${fields.join(", ")} ${whereClause}`, values);
    return res
      .status(200)
      .json({ success: true, affectedRows: results.affectedRows });
  } catch (err) {
    console.error("Error updating employee(s):", err);
    return res.status(500).json({ error: "Database error." });
  }
});

// Delete an employee in the db
// employee id -> that employee
router.delete("/", roleMiddleware("employee"), async (req, res) => {
  let { employee_id } = req.body;

  // Input sanitization
  employee_id = sanitizeHtml((employee_id || "").toString().trim(), {
    allowedTags: [],
    allowedAttributes: {},
  });

  // Must provide the key
  if (!employee_id) {
    return res.status(400).json({
      error: "Provide employee_id.",
    });
  }

  let sql, param;
  if (employee_id) {
    sql = "DELETE FROM employee WHERE employee_id = ?";
    param = employee_id;
  }

  try {
    const [results] = await db.promise().query(sql, [param]);
    return res
      .status(200)
      .json({ success: true, affectedRows: results.affectedRows });
  } catch (err) {
    console.error("Error deleting employee(s):", err);
    return res.status(500).json({ error: "Database error." });
  }
});

module.exports = router;
