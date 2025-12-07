import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import Employees from "./components/Employees/Employees";
import Clients from "./components/Clients/Clients";
import Accounts from "./components/Accounts/Accounts";
import Loans from "./components/Loans/Loans";
import Transactions from "./components/Transactions/Transactions";
import Navbar from "./components/Layout/Navbar";
import ProtectedRoute from "./components/Layout/ProtectedRoute";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Navbar />
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/branches/:branch_id/employees"
          element={
            <ProtectedRoute>
              <Navbar />
              <Employees />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/branches/:branch_id/clients"
          element={
            <ProtectedRoute>
              <Navbar />
              <Clients />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/customers/:customer_id/accounts"
          element={
            <ProtectedRoute>
              <Navbar />
              <Accounts />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/customers/:customer_id/loans"
          element={
            <ProtectedRoute>
              <Navbar />
              <Loans />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/customers/:customer_id/accounts/:account_id/transactions"
          element={
            <ProtectedRoute>
              <Navbar />
              <Transactions />
            </ProtectedRoute>
          }
        />
      </Routes>
      <ToastContainer />
    </Router>
  );
}

export default App;
