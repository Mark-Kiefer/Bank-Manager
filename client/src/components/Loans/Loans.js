import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import Add_Loan from "./Add_Loan";
import Edit_Loan from "./Edit_Loan";

function Loans() {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingLoan, setEditingLoan] = useState(null);
  const { customer_id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { customerName } = location.state || {};

  const fetchLoans = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("No authentication token found");
        navigate("/");
        return;
      }

      const response = await fetch(
        `/api/secure/loans?customer_id=${encodeURIComponent(customer_id)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          toast.error("Session expired. Please login again.");
          localStorage.removeItem("token");
          navigate("/");
          return;
        }
        if (response.status === 404) {
          // No loans found, set empty array
          setLoans([]);
          return;
        }
        toast.error(`Failed to fetch loans. Status: ${response.status}`);
        return;
      }

      const data = await response.json();
      setLoans(data.loans || []);
    } catch (err) {
      toast.error(`An error occurred. ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (customer_id) {
      fetchLoans();
    }
  }, [customer_id]);

  const deleteLoan = async (loan_id) => {
    if (!window.confirm("Are you sure you want to delete this loan?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("No authentication token found");
        return;
      }

      const response = await fetch(`/api/secure/loans`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ loan_id }),
      });

      if (!response.ok) {
        const data = await response.json();
        toast.error(`Failed to delete loan. ${data.error || ""}`);
        return;
      }

      toast.success("Loan deleted successfully");
      fetchLoans();
    } catch (err) {
      toast.error(`An error occurred. ${err.message}`);
    }
  };

  if (loading) return <div className="loading">Loading loans...</div>;

  return (
    <>
      <h1 className="title">Bank Manager</h1>
      <div className="dashboard">
        <h1>Loans for {customerName || `Customer ${customer_id}`}</h1>
        <button className="button" onClick={() => navigate(-1)}>
          Back
        </button>

        <div className="loans-section">
          {loans.length === 0 ? (
            <p className="no-data">No loans found for this customer.</p>
          ) : (
            <div className="grid">
              {loans.map((loan) => (
                <div key={loan.loan_id} className="card">
                  <h2>Loan #{loan.loan_id}</h2>
                  <p>
                    <strong>Amount:</strong> ${parseFloat(loan.amount || 0).toFixed(2)}
                  </p>
                  <p>
                    <strong>Interest Rate:</strong> {parseFloat(loan.interest_rate || 0).toFixed(2)}%
                  </p>
                  <p>
                    <strong>Start Date:</strong>{" "}
                    {loan.start_date
                      ? new Date(loan.start_date).toLocaleDateString()
                      : "N/A"}
                  </p>
                  <p>
                    <strong>End Date:</strong>{" "}
                    {loan.end_date
                      ? new Date(loan.end_date).toLocaleDateString()
                      : "N/A"}
                  </p>
                  <p>
                    <strong>Employee ID:</strong> {loan.employee_id || "N/A"}
                  </p>
                  <div className="loan-actions">
                    <button
                      className="button"
                      onClick={() => setEditingLoan(loan)}
                    >
                      Edit
                    </button>
                    <button
                      className="button-danger-inline"
                      onClick={() => deleteLoan(loan.loan_id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        {editingLoan ? (
          <Edit_Loan
            loan={editingLoan}
            onLoanUpdated={() => {
              fetchLoans();
              setEditingLoan(null);
            }}
            onCancel={() => setEditingLoan(null)}
          />
        ) : (
          <Add_Loan customerId={customer_id} onLoanAdded={fetchLoans} />
        )}
      </div>
    </>
  );
}

export default Loans;

