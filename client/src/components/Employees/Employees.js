import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useParams, useNavigate, useLocation } from "react-router-dom";

import Add_Employee from "./Add_Employee";
import Edit_Employee from "./Edit_Employee";

function Employees({ branchId }) {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const { branch_id } = useParams();

  const navigate = useNavigate();
  const location = useLocation();

  const currentBranchId = branchId || branch_id;
  const { branchName } = location.state || {};

  const fetchEmployees = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("No authentication token found");
        return;
      }

      const response = await fetch(
        `/api/secure/employees?branch_id=${encodeURIComponent(
          currentBranchId
        )}`,
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
        toast.error(
          `Failed to fetch employees. HTTP error! status: ${response.status}`
        );
        return;
      }

      const data = await response.json();
      setEmployees(data.employees || []);
    } catch (err) {
      toast.error(`An error occurred. ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentBranchId) {
      fetchEmployees();
    }
  }, [currentBranchId]);

  if (loading) return <div className="loading">Loading employees...</div>;

  const deleteEmployee = async (employeeId) => {
    if (!window.confirm("Are you sure you want to delete this employee?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("No authentication token found");
        return;
      }

      const response = await fetch(`/api/secure/employees/`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          employee_id: employeeId,
        }),
      });

      if (!response.ok) {
        toast.error(
          `Failed to delete employee. HTTP error! status: ${response.status}`
        );
        return;
      }

      toast.success("Employee deleted successfully.");
      fetchEmployees();
    } catch (err) {
      toast.error(`An error occurred. ${err.message}`);
    }
  };

  return (
    <>
      <h1 className="title">Bank Manager</h1>

      <div className="dashboard">
        <h1>Employees for the {branchName} Branch</h1>
        <button className="button" onClick={() => navigate(-1)}>
          Back
        </button>
        <div className="grid">
          {employees.length === 0 ? (
            <p className="no-data">No employees found for this branch.</p>
          ) : (
            employees.map((employee) => (
              <div key={employee.employee_id || employee.id} className="card">
                <h2>
                  {employee.first_name} {employee.last_name}
                </h2>
                <p>
                  <strong>ID:</strong> {employee.employee_id || employee.id}
                </p>
                <p>
                  <strong>Email:</strong> {employee.email || "N/A"}
                </p>
                <p>
                  <strong>Position:</strong> {employee.position || "N/A"}
                </p>
                <div className="employee-actions">
                  <button
                    className="button"
                    onClick={() => setEditingEmployee(employee)}
                  >
                    Edit
                  </button>
                  <button
                    className="button-danger-inline"
                    onClick={() => deleteEmployee(employee.employee_id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
        {editingEmployee ? (
          <Edit_Employee
            employee={editingEmployee}
            onEmployeeUpdated={() => {
              fetchEmployees();
              setEditingEmployee(null);
            }}
            onCancel={() => setEditingEmployee(null)}
          />
        ) : (
          <Add_Employee
            branchId={currentBranchId}
            onEmployeeAdded={() => fetchEmployees()}
          />
        )}
      </div>
    </>
  );
}

export default Employees;
