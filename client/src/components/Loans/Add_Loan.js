import { useState } from "react";
import { toast } from "react-toastify";

function Add_Loan({ customerId, onLoanAdded }) {
  const [form, setForm] = useState({
    amount: "",
    interest_rate: "",
    employee_id: "",
    start_date: new Date().toISOString().split("T")[0],
    end_date: "",
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
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customer_id: customerId,
          amount: amount,
          interest_rate: interestRate,
          employee_id: form.employee_id,
          start_date: form.start_date,
          end_date: form.end_date,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        toast.error(`Failed to add loan. ${data.error || ""}`);
        return;
      }

      toast.success("Loan added successfully");

      if (onLoanAdded) {
        onLoanAdded();
      }

      // Clear form
      setForm({
        amount: "",
        interest_rate: "",
        employee_id: "",
        start_date: new Date().toISOString().split("T")[0],
        end_date: "",
      });
    } catch (err) {
      toast.error(`An error occurred. ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="card">
      <h2>Add New Loan</h2>
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

        <button className="button" type="submit" disabled={submitting}>
          {submitting ? "Adding..." : "Add Loan"}
        </button>
      </form>
    </div>
  );
}

export default Add_Loan;

