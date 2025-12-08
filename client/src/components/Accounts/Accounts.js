import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import Add_Account from "./Add_Account";
import Edit_Account from "./Edit_Account";

function Accounts() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingAccount, setEditingAccount] = useState(null);
  const { customer_id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { customerName } = location.state || {};

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("No authentication token found");
        navigate("/");
        return;
      }

      const response = await fetch(
        `/api/secure/accounts?customer_id=${encodeURIComponent(customer_id)}`,
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
          // No accounts found, set empty array
          setAccounts([]);
          return;
        }
        toast.error(`Failed to fetch accounts. Status: ${response.status}`);
        return;
      }

      const data = await response.json();
      setAccounts(data.accounts || []);
    } catch (err) {
      toast.error(`An error occurred. ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (customer_id) {
      fetchAccounts();
    }
  }, [customer_id]);

  const deleteAccount = async (account_id) => {
    if (!window.confirm("Are you sure you want to delete this account?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("No authentication token found");
        return;
      }

      const response = await fetch(`/api/secure/accounts`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ account_id }),
      });

      if (!response.ok) {
        const data = await response.json();
        toast.error(`Failed to delete account. ${data.error || ""}`);
        return;
      }

      toast.success("Account deleted successfully");
      fetchAccounts();
    } catch (err) {
      toast.error(`An error occurred. ${err.message}`);
    }
  };

  if (loading) return <div className="loading">Loading accounts...</div>;

  return (
    <>
      <h1 className="title">Bank Manager</h1>
      <div className="dashboard">
        <h1>Accounts for {customerName || `Customer ${customer_id}`}</h1>
        <button className="button" onClick={() => navigate(-1)}>
          Back
        </button>

        <div className="accounts-section">
          {accounts.length === 0 ? (
            <p className="no-data">No accounts found for this customer.</p>
          ) : (
            <div className="grid">
              {accounts.map((account) => (
                <div key={account.account_id} className="card">
                  <h2>Account #{account.account_id}</h2>
                  <p>
                    <strong>Type:</strong> {account.account_type || "N/A"}
                  </p>
                  <p>
                    <strong>Balance:</strong> ${parseFloat(account.balance || 0).toFixed(2)}
                  </p>
                  <p>
                    <strong>Branch ID:</strong> {account.branch_id || "N/A"}
                  </p>
                  <p>
                    <strong>Date Opened:</strong>{" "}
                    {account.date_opened
                      ? new Date(account.date_opened).toLocaleDateString()
                      : "N/A"}
                  </p>
                  <div className="account-actions">
                    <button
                      className="button"
                      onClick={() =>
                        navigate(
                          `/dashboard/customers/${customer_id}/accounts/${account.account_id}/transactions`,
                          {
                            state: {
                              accountNumber: account.account_id,
                              customerName: customerName,
                            },
                          }
                        )
                      }
                    >
                      View Transactions
                    </button>
                    <button
                      className="button"
                      onClick={() => setEditingAccount(account)}
                    >
                      Edit
                    </button>
                    <button
                      className="button-danger-inline"
                      onClick={() => deleteAccount(account.account_id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        {editingAccount ? (
          <Edit_Account
            account={editingAccount}
            onAccountUpdated={() => {
              fetchAccounts();
              setEditingAccount(null);
            }}
            onCancel={() => setEditingAccount(null)}
          />
        ) : (
          <Add_Account customerId={customer_id} onAccountAdded={fetchAccounts} />
        )}
      </div>
    </>
  );
}

export default Accounts;

