import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import Employees from "./components/Employees/Employees";
import Clients from "./components/Clients/Clients";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route
          path="/dashboard/branches/:branch_id/employees"
          element={<Employees />}
        />
        <Route
          path="/dashboard/branches/:branch_id/clients"
          element={<Clients />}
        />
      </Routes>
      <ToastContainer />
    </Router>
  );
}

export default App;
