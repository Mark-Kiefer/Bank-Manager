import { useState, useEffect } from "react";
import { toast } from "react-toastify";

function Edit_Client({ client, onClientUpdated, onCancel }) {
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    address: "",
    date_of_birth: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (client) {
      setForm({
        first_name: client.first_name || "",
        last_name: client.last_name || "",
        email: client.email || "",
        phone_number: client.phone_number || "",
        address: client.address || "",
        date_of_birth: client.date_of_birth
          ? client.date_of_birth.split("T")[0]
          : "",
      });
    }
  }, [client]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!client || !client.customer_id) {
      toast.error("Missing customer ID");
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

      const response = await fetch(`/api/secure/customers`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customer_id: client.customer_id,
          first_name: form.first_name,
          last_name: form.last_name,
          email: form.email,
          phone_number: form.phone_number,
          address: form.address,
          date_of_birth: form.date_of_birth || null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        toast.error(`Failed to update client. ${data.error || ""}`);
        return;
      }

      toast.success("Client updated successfully");

      if (onClientUpdated) {
        onClientUpdated();
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

  if (!client) return null;

  return (
    <div className="card edit-form">
      <h2>Edit Client</h2>
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
          Address
          <input
            name="address"
            value={form.address}
            onChange={handleChange}
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

        <div className="form-actions">
          <button className="button" type="submit" disabled={submitting}>
            {submitting ? "Updating..." : "Update Client"}
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

export default Edit_Client;

