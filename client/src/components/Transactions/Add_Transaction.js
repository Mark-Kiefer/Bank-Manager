import { useState } from "react";
import { toast } from "react-toastify";

function Add_Transaction({ accountId, onTransactionAdded }) {
  const [form, setForm] = useState({
    customer_id: "",
    transaction_type: "",
    amount: "",
    timestamp: new Date().toISOString().slice(0, 16),
    completed: true,
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!accountId) {
      toast.error("Missing account ID");
      return;
    }

    if (!form.customer_id || !form.transaction_type || !form.amount || !form.timestamp) {
      toast.error("Please fill in all required fields.");
      return;
    }

    const amount = parseFloat(form.amount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount.");
      return;
    }

    try {
      setSubmitting(true);
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("No authentication token found");
        return;
      }

      // Convert timestamp to MySQL format
      const timestamp = new Date(form.timestamp).toISOString().slice(0, 19).replace("T", " ");

      const response = await fetch(`/api/secure/transactions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          account_id: accountId,
          customer_id: form.customer_id,
          transaction_type: form.transaction_type,
          amount: amount,
          timestamp: timestamp,
          completed: form.completed ? 1 : 0,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        toast.error(`Failed to add transaction. ${data.error || ""}`);
        return;
      }

      toast.success("Transaction added successfully");

      if (onTransactionAdded) {
        onTransactionAdded();
      }

      // Clear form
      setForm({
        customer_id: "",
        transaction_type: "",
        amount: "",
        timestamp: new Date().toISOString().slice(0, 16),
        completed: true,
      });
    } catch (err) {
      toast.error(`An error occurred. ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="card">
      <h2>Add New Transaction</h2>
      <form className="form" onSubmit={handleSubmit}>
        <label>
          Customer ID *
          <input
            type="number"
            name="customer_id"
            value={form.customer_id}
            onChange={handleChange}
            placeholder="Customer ID"
            required
          />
        </label>

        <label>
          Transaction Type *
          <select
            name="transaction_type"
            value={form.transaction_type}
            onChange={handleChange}
            required
          >
            <option value="">Select type</option>
            <option value="Deposit">Deposit</option>
            <option value="Withdrawal">Withdrawal</option>
            <option value="Transfer">Transfer</option>
            <option value="Payment">Payment</option>
          </select>
        </label>

        <label>
          Amount *
          <input
            type="number"
            step="0.01"
            min="0"
            name="amount"
            value={form.amount}
            onChange={handleChange}
            placeholder="0.00"
            required
          />
        </label>

        <label>
          Date & Time *
          <input
            type="datetime-local"
            name="timestamp"
            value={form.timestamp}
            onChange={handleChange}
            required
          />
        </label>

        <label className="checkbox-label">
          <input
            type="checkbox"
            name="completed"
            checked={form.completed}
            onChange={handleChange}
          />
          Completed
        </label>

        <button className="button" type="submit" disabled={submitting}>
          {submitting ? "Adding..." : "Add Transaction"}
        </button>
      </form>
    </div>
  );
}

export default Add_Transaction;

