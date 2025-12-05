import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          toast.error(`No authentication token found`);
          return;
        }

        const response = await fetch("/api/secure/branches", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          toast.error(
            `Failed to fetch branches. HTTP error! status: ${response.status}`
          );
          return;
        }

        const data = await response.json();
        setBranches(data.branches || []);
      } catch (err) {
        toast.error(`An error occurred. ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchBranches();
  }, []);

  if (loading) return <div className="loading">Loading branches...</div>;

  return (
    <>
      <h1 className="title">Bank Manager</h1>
      <div className="dashboard">
        <h1>Bank Branches</h1>
        <div className="grid">
          {branches.map((branch) => (
            <div key={branch.branch_id} className="card">
              <h2>{branch.branch_name || "N/A"}</h2>
              <p>
                <strong>ID:</strong> {branch.branch_id}
              </p>
              <p>
                <strong>Address:</strong> {branch.address || "N/A"}
              </p>
              <p>
                <strong>City:</strong> {branch.city || "N/A"}
              </p>
              <p>
                <strong>Manager ID:</strong> {branch.manager_id || "N/A"}
              </p>
              <button
                className="button"
                onClick={() =>
                  navigate(`/dashboard/branches/${branch.branch_id}/clients`)
                }
              >
                Search for Client
              </button>
              <button
                className="button"
                onClick={() =>
                  navigate(
                    `/dashboard/branches/${branch.branch_id}/employees`,
                    {
                      state: { branchName: branch.branch_name },
                    }
                  )
                }
              >
                View Employees
              </button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default Dashboard;
