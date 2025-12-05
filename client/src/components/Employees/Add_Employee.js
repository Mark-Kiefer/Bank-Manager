import { useState } from "react";
import { toast } from "react-toastify";

function Add_Employee({ branchId, onEmployeeAdded }) {
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    password: "",
    position: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!branchId) {
      toast.error("Missing branch ID");
      return;
    }

    // Simple validation
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
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          salary: form.salary ? Number(form.salary) : null,
          branch_id: branchId,
          hire_date: new Date().toISOString().split("T")[0],
        }),
      });

      if (!response.ok) {
        toast.error(`Failed to add employee. ${response.status}`);
        return;
      }

      const data = await response.json();
      toast.success("Employee added successfully");

      // Let parent refresh employee list (pass new employee or trigger refetch)
      if (onEmployeeAdded) {
        onEmployeeAdded(data.employee || null);
      }

      // Clear form
      setForm({
        first_name: "",
        last_name: "",
        email: "",
        position: "",
        phone_number: "",
        password: "",
      });
    } catch (err) {
      toast.error(`An error occurred. ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="card">
      <h2>Add New Employee</h2>
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
            value={form.email}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Password
          <input
            name="password"
            value={form.password}
            onChange={handleChange}
            required
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

        <label>
          Phone Number
          <input
            name="phone_number"
            value={form.phone_number}
            onChange={handleChange}
          />
        </label>

        <button className="button" type="submit" disabled={submitting}>
          {submitting ? "Adding..." : "Add Employee"}
        </button>
      </form>
    </div>
  );
}

export default Add_Employee;
