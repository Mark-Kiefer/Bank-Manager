// src/ClientSearch.js
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useParams, useNavigate, useLocation } from "react-router-dom";

import Add_Client from "./Add_Client";

function Clients({ branchId }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [allResults, setAllResults] = useState([]);

  const { branch_id } = useParams();

  const navigate = useNavigate();
  const location = useLocation();

  const currentBranchId = branchId || branch_id;
  const { branchName } = location.state || {};

  const fetchClients = async (query = "") => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      if (!token) {
        toast.error("No authentication token found");
        return;
      }

      const response = await fetch(
        `/api/secure/customers?searchTerm=${encodeURIComponent(
          query
        )}&branch_id=${encodeURIComponent(currentBranchId)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        toast.error(`Failed to fetch clients. Status: ${response.status}`);
        return;
      }

      const data = await response.json();
      setAllResults(data.customers || []);
    } catch (err) {
      toast.error(`An error occurred. ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      fetchClients(searchTerm);
    }
  };

  const deleteClient = async (customer_id) => {
    if (!window.confirm("Are you sure you want to delete this client?")) {
      return;
    }

    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      if (!token) {
        toast.error("No authentication token found");
        return;
      }

      const response = await fetch(`/api/secure/customers`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        method: "DELETE",
        body: JSON.stringify({ customer_id }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(`Failed to delete client. ${data.error}`);
        return;
      }

      toast.success("Client deleted successfully");

      // Refresh client list
      fetchClients(searchTerm);
    } catch (err) {
      toast.error(`An error occurred. ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Filter displayed results (max 10)
  const displayedClients = allResults.slice(0, 10);

  return (
    <>
      <h1 className="title">Bank Manager</h1>

      <div className="dashboard">
        <h1>Clients for the {branchName} Branch</h1>
        <button className="button" onClick={() => navigate(-1)}>
          Back
        </button>

        <form className="form" onSubmit={handleSearch}>
          <div className="search-input-group">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search clients"
            />
            <button type="submit" className="button" disabled={loading}>
              {loading ? "Searching..." : "Search"}
            </button>
          </div>
        </form>

        <div className="clients-section">
          {loading ? (
            <div className="loading">Searching clients...</div>
          ) : displayedClients.length > 0 ? (
            <>
              <p className="results-count">
                Showing {displayedClients.length} of {allResults.length} results
              </p>
              <div className="grid">
                {displayedClients.map((client) => (
                  <div key={client.customer_id} className="card">
                    <h2>
                      {client.first_name} {client.last_name}
                    </h2>
                    <p>
                      <strong>ID:</strong> {client.customer_id}
                    </p>
                    <p>
                      <strong>Phone:</strong> {client.phone_number || "N/A"}
                    </p>
                    <p>
                      <strong>Email:</strong> {client.email || "N/A"}
                    </p>
                    <p>
                      <strong>Address:</strong> {client.address || "N/A"}
                    </p>
                    {client.account_number && (
                      <p>
                        <strong>Account:</strong> {client.account_number}
                      </p>
                    )}
                    <div className="client-actions">
                      <button className="button">View Accounts</button>
                      <button
                        className="button-danger-inline"
                        onClick={() => deleteClient(client.customer_id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="no-results">
              <p>
                No clients found. Try searching by name, phone, or account
                number.
              </p>
            </div>
          )}
        </div>
        <Add_Client branchId={currentBranchId} />
      </div>
    </>
  );
}

export default Clients;
