import { useState, useEffect } from "react";
import { toast } from "react-toastify";

function Edit_Transaction({ transaction, onTransactionUpdated, onCancel }) {
  const [form, setForm] = useState({
    transaction_type: "",
    amount: "",
    timestamp: "",
    completed: true,
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (transaction) {
      const timestamp = transaction.timestamp
        ? new Date(transaction.timestamp).toISOString().slice(0, 16)
        : new Date().toISOString().slice(0, 16);

      setForm({
        transaction_type: transaction.transaction_type || "",
        amount: transaction.amount || "",
        timestamp: timestamp,
        completed: transaction.completed !== undefined ? transaction.completed : true,
      });
    }
  }, [transaction]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!transaction || !transaction.transaction_id) {
      toast.error("Missing transaction ID");
      return;
    }

    if (!form.transaction_type || !form.amount || !form.timestamp) {
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
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          transaction_id: transaction.transaction_id,
          transaction_type: form.transaction_type,
          amount: amount,
          timestamp: timestamp,
          completed: form.completed ? 1 : 0,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        toast.error(`Failed to update transaction. ${data.error || ""}`);
        return;
      }

      toast.success("Transaction updated successfully");

      if (onTransactionUpdated) {
        onTransactionUpdated();
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

  if (!transaction) return null;

  return (
    <div className="card edit-form">
      <h2>Edit Transaction</h2>
      <form className="form" onSubmit={handleSubmit}>
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

        <div className="form-actions">
          <button className="button" type="submit" disabled={submitting}>
            {submitting ? "Updating..." : "Update Transaction"}
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

export default Edit_Transaction;

