import { useState, useEffect } from "react";
import { toast } from "react-toastify";

function Edit_Employee({ employee, onEmployeeUpdated, onCancel }) {
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    position: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (employee) {
      setForm({
        first_name: employee.first_name || "",
        last_name: employee.last_name || "",
        email: employee.email || "",
        phone_number: employee.phone_number || "",
        position: employee.position || "",
      });
    }
  }, [employee]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!employee || !employee.employee_id) {
      toast.error("Missing employee ID");
      return;
    }

    if (!form.email.includes("@")) {
      toast.error("Please enter a valid email address.");
      return;
    }

    try {
      setSubmitting(true);
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("No authentication token found");
        return;
      }

      const response = await fetch(`/api/secure/employees`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          employee_id: employee.employee_id,
          first_name: form.first_name,
          last_name: form.last_name,
          email: form.email,
          phone_number: form.phone_number,
          position: form.position,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        toast.error(`Failed to update employee. ${data.error || ""}`);
        return;
      }

      toast.success("Employee updated successfully");

      if (onEmployeeUpdated) {
        onEmployeeUpdated();
      }

      if (onCancel) {
        onCancel();
      }
    } catch (err) {
      toast.error(`An error occurred. ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (!employee) return null;

  return (
    <div className="card edit-form">
      <h2>Edit Employee</h2>
      <form className="form" onSubmit={handleSubmit}>
        <label>
          First Name
          <input
            name="first_name"
            value={form.first_name}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Last Name
          <input
            name="last_name"
            value={form.last_name}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Email
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Phone Number
          <input
            name="phone_number"
            value={form.phone_number}
            onChange={handleChange}
          />
        </label>

        <label>
          Position
          <input
            name="position"
            value={form.position}
            onChange={handleChange}
          />
        </label>

        <div className="form-actions">
          <button className="button" type="submit" disabled={submitting}>
            {submitting ? "Updating..." : "Update Employee"}
          </button>
          {onCancel && (
            <button
              className="button-danger-inline"
              type="button"
              onClick={onCancel}
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

export default Edit_Employee;

