import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    toast.success("Logged out successfully");
    navigate("/");
  };

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <h2 className="navbar-title" onClick={() => navigate("/dashboard")}>
          Bank Manager
        </h2>
        <div className="navbar-actions">
          <button className="button-nav" onClick={() => navigate("/dashboard")}>
            Dashboard
          </button>
          <button className="button-nav" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;

