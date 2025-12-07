import { useState, useEffect } from "react";
import { toast } from "react-toastify";

function Edit_Account({ account, onAccountUpdated, onCancel }) {
  const [form, setForm] = useState({
    account_type: "",
    balance: "",
    branch_id: "",
    date_opened: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (account) {
      setForm({
        account_type: account.account_type || "",
        balance: account.balance || "",
        branch_id: account.branch_id || "",
        date_opened: account.date_opened
          ? account.date_opened.split("T")[0]
          : new Date().toISOString().split("T")[0],
      });
    }
  }, [account]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!account || !account.account_id) {
      toast.error("Missing account ID");
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
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          account_id: account.account_id,
          account_type: form.account_type,
          balance: balance,
          branch_id: form.branch_id || null,
          date_opened: form.date_opened,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        toast.error(`Failed to update account. ${data.error || ""}`);
        return;
      }

      toast.success("Account updated successfully");

      if (onAccountUpdated) {
        onAccountUpdated();
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

  if (!account) return null;

  return (
    <div className="card edit-form">
      <h2>Edit Account</h2>
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

        <div className="form-actions">
          <button className="button" type="submit" disabled={submitting}>
            {submitting ? "Updating..." : "Update Account"}
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

export default Edit_Account;

