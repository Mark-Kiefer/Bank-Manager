import { useState, useEffect } from "react";
import { toast } from "react-toastify";

function Edit_Loan({ loan, onLoanUpdated, onCancel }) {
  const [form, setForm] = useState({
    amount: "",
    interest_rate: "",
    employee_id: "",
    start_date: "",
    end_date: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (loan) {
      setForm({
        amount: loan.amount || "",
        interest_rate: loan.interest_rate || "",
        employee_id: loan.employee_id || "",
        start_date: loan.start_date
          ? loan.start_date.split("T")[0]
          : new Date().toISOString().split("T")[0],
        end_date: loan.end_date
          ? loan.end_date.split("T")[0]
          : "",
      });
    }
  }, [loan]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!loan || !loan.loan_id) {
      toast.error("Missing loan ID");
      return;
    }

    if (
      !form.amount ||
      !form.interest_rate ||
      !form.employee_id ||
      !form.start_date ||
      !form.end_date
    ) {
      toast.error("Please fill in all required fields.");
      return;
    }

    const amount = parseFloat(form.amount);
    const interestRate = parseFloat(form.interest_rate);

    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid loan amount.");
      return;
    }

    if (isNaN(interestRate) || interestRate < 0 || interestRate > 100) {
      toast.error("Please enter a valid interest rate (0-100).");
      return;
    }

    if (new Date(form.start_date) >= new Date(form.end_date)) {
      toast.error("End date must be after start date.");
      return;
    }

    try {
      setSubmitting(true);
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("No authentication token found");
        return;
      }

      const response = await fetch(`/api/secure/loans`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          loan_id: loan.loan_id,
          amount: amount,
          interest_rate: interestRate,
          employee_id: form.employee_id,
          start_date: form.start_date,
          end_date: form.end_date,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        toast.error(`Failed to update loan. ${data.error || ""}`);
        return;
      }

      toast.success("Loan updated successfully");

      if (onLoanUpdated) {
        onLoanUpdated();
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

  if (!loan) return null;

  return (
    <div className="card edit-form">
      <h2>Edit Loan</h2>
      <form className="form" onSubmit={handleSubmit}>
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
          Interest Rate (%) *
          <input
            type="number"
            step="0.01"
            min="0"
            max="100"
            name="interest_rate"
            value={form.interest_rate}
            onChange={handleChange}
            placeholder="0.00"
            required
          />
        </label>

        <label>
          Employee ID *
          <input
            type="number"
            name="employee_id"
            value={form.employee_id}
            onChange={handleChange}
            placeholder="Employee ID"
            required
          />
        </label>

        <label>
          Start Date *
          <input
            type="date"
            name="start_date"
            value={form.start_date}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          End Date *
          <input
            type="date"
            name="end_date"
            value={form.end_date}
            onChange={handleChange}
            required
          />
        </label>

        <div className="form-actions">
          <button className="button" type="submit" disabled={submitting}>
            {submitting ? "Updating..." : "Update Loan"}
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

export default Edit_Loan;

