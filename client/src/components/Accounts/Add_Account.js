import { useState } from "react";
import { toast } from "react-toastify";

function Add_Account({ customerId, onAccountAdded }) {
  const [form, setForm] = useState({
    account_type: "",
    balance: "",
    branch_id: "",
    date_opened: new Date().toISOString().split("T")[0],
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!customerId) {
      toast.error("Missing customer ID");
      return;
    }

    if (!form.account_type || !form.balance || !form.date_opened) {
      toast.error("Please fill in all required fields.");
      return;
    }

    const balance = parseFloat(form.balance);
    if (isNaN(balance) || balance < 0) {
      toast.error("Please enter a valid balance amount.");
      return;
    }

    try {
      setSubmitting(true);
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("No authentication token found");
        return;
      }

      const response = await fetch(`/api/secure/accounts`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customer_id: customerId,
          account_type: form.account_type,
          balance: balance,
          branch_id: form.branch_id || null,
          date_opened: form.date_opened,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        toast.error(`Failed to add account. ${data.error || ""}`);
        return;
      }

      toast.success("Account added successfully");

      if (onAccountAdded) {
        onAccountAdded();
      }

      // Clear form
      setForm({
        account_type: "",
        balance: "",
        branch_id: "",
        date_opened: new Date().toISOString().split("T")[0],
      });
    } catch (err) {
      toast.error(`An error occurred. ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="card">
      <h2>Add New Account</h2>
      <form className="form" onSubmit={handleSubmit}>
        <label>
          Account Type *
          <input
            name="account_type"
            value={form.account_type}
            onChange={handleChange}
            placeholder="e.g., Checking, Savings"
            required
          />
        </label>

        <label>
          Balance *
          <input
            type="number"
            step="0.01"
            min="0"
            name="balance"
            value={form.balance}
            onChange={handleChange}
            placeholder="0.00"
            required
          />
        </label>

        <label>
          Branch ID
          <input
            type="number"
            name="branch_id"
            value={form.branch_id}
            onChange={handleChange}
            placeholder="Optional"
          />
        </label>

        <label>
          Date Opened *
          <input
            type="date"
            name="date_opened"
            value={form.date_opened}
            onChange={handleChange}
            required
          />
        </label>

        <button className="button" type="submit" disabled={submitting}>
          {submitting ? "Adding..." : "Add Account"}
        </button>
      </form>
    </div>
  );
}

export default Add_Account;

