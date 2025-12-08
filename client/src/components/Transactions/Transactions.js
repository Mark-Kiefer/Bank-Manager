import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import Add_Transaction from "./Add_Transaction";
import Edit_Transaction from "./Edit_Transaction";

function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const { account_id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { accountNumber, customerName } = location.state || {};

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("No authentication token found");
        navigate("/");
        return;
      }

      const response = await fetch(
        `/api/secure/transactions?account_id=${encodeURIComponent(account_id)}`,
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
          // No transactions found, set empty array
          setTransactions([]);
          return;
        }
        toast.error(`Failed to fetch transactions. Status: ${response.status}`);
        return;
      }

      const data = await response.json();
      setTransactions(data.transactions || []);
    } catch (err) {
      toast.error(`An error occurred. ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (account_id) {
      fetchTransactions();
    }
  }, [account_id]);

  const deleteTransaction = async (transaction_id) => {
    if (!window.confirm("Are you sure you want to delete this transaction?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("No authentication token found");
        return;
      }

      const response = await fetch(`/api/secure/transactions`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ transaction_id }),
      });

      if (!response.ok) {
        const data = await response.json();
        toast.error(`Failed to delete transaction. ${data.error || ""}`);
        return;
      }

      toast.success("Transaction deleted successfully");
      fetchTransactions();
    } catch (err) {
      toast.error(`An error occurred. ${err.message}`);
    }
  };

  if (loading) return <div className="loading">Loading transactions...</div>;

  return (
    <>
      <h1 className="title">Bank Manager</h1>
      <div className="dashboard">
        <h1>
          Transactions for Account #{accountNumber || account_id}
          {customerName && ` - ${customerName}`}
        </h1>
        <button className="button" onClick={() => navigate(-1)}>
          Back
        </button>

        <div className="transactions-section">
          {transactions.length === 0 ? (
            <p className="no-data">No transactions found for this account.</p>
          ) : (
            <div className="grid">
              {transactions.map((transaction) => (
                <div key={transaction.transaction_id} className="card">
                  <h2>Transaction #{transaction.transaction_id}</h2>
                  <p>
                    <strong>Type:</strong> {transaction.transaction_type || "N/A"}
                  </p>
                  <p>
                    <strong>Amount:</strong> ${parseFloat(transaction.amount || 0).toFixed(2)}
                  </p>
                  <p>
                    <strong>Date:</strong>{" "}
                    {transaction.timestamp
                      ? new Date(transaction.timestamp).toLocaleString()
                      : "N/A"}
                  </p>
                  <p>
                    <strong>Status:</strong>{" "}
                    {transaction.completed ? "Completed" : "Pending"}
                  </p>
                  <p>
                    <strong>Account ID:</strong> {transaction.account_id || "N/A"}
                  </p>
                  <div className="transaction-actions">
                    <button
                      className="button"
                      onClick={() => setEditingTransaction(transaction)}
                    >
                      Edit
                    </button>
                    <button
                      className="button-danger-inline"
                      onClick={() => deleteTransaction(transaction.transaction_id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        {editingTransaction ? (
          <Edit_Transaction
            transaction={editingTransaction}
            onTransactionUpdated={() => {
              fetchTransactions();
              setEditingTransaction(null);
            }}
            onCancel={() => setEditingTransaction(null)}
          />
        ) : (
          <Add_Transaction accountId={account_id} onTransactionAdded={fetchTransactions} />
        )}
      </div>
    </>
  );
}

export default Transactions;

