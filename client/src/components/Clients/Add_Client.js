import { useState } from "react";
import { toast } from "react-toastify";

function Add_Client({ branchId }) {
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    address: "",
    date_of_birth: "",
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

      const response = await fetch(`/api/secure/customers`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          branch_id: branchId,
        }),
      });

      if (!response.ok) {
        toast.error(`Failed to add client. ${response.error}`);
        return;
      }

      const data = await response.json();
      toast.success("Client added successfully");

      // Clear form
      setForm({
        first_name: "",
        last_name: "",
        email: "",
        phone_number: "",
        address: "",
        date_of_birth: "",
      });
    } catch (err) {
      toast.error(`An error occurred. ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="card">
      <h2>Add New Client</h2>
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
          Address
          <input
            name="address"
            value={form.address}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Date of Birth
          <input
            type="date"
            name="date_of_birth"
            value={form.date_of_birth}
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
          {submitting ? "Adding..." : "Add Client"}
        </button>
      </form>
    </div>
  );
}

export default Add_Client;
