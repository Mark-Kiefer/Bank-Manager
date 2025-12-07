// src/Login.js
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/dashboard");
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Simple validation
    if (!email.includes("@")) {
      toast.error("Please enter a valid email address.");
      return;
    }

    if (password.trim() === "") {
      toast.error("Password cannot be empty.");
      return;
    }

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      // Check if response is ok and is JSON
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        // Backend is not running or returned HTML error page
        toast.error("Cannot connect to server. Please ensure the backend server is running on http://localhost:5000");
        console.error("Response is not JSON. Status:", res.status);
        return;
      }

      const data = await res.json();

      if (!res.ok) {
        toast.error(`Login failed: ${data.error || "Invalid email or password"}`);
        return;
      }

      const token = data.token;
      if (!token) {
        toast.error("Login failed: No authentication token received");
        return;
      }

      toast.success("Login successful!");

      // Save token
      localStorage.setItem("token", token);

      // Navigate to dashboard
      navigate("/dashboard");
    } catch (err) {
      console.error("Login error:", err);
      if (err.message.includes("Failed to fetch") || err.message.includes("NetworkError")) {
        toast.error("Cannot connect to server. Please check:\n1. Is the backend server running? (http://localhost:5000)\n2. Is your network connection working?");
      } else if (err.message.includes("JSON")) {
        toast.error("Server response format error. Please ensure the backend server is running");
      } else {
        toast.error(`An error occurred: ${err.message}`);
      }
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>

      <form onSubmit={handleSubmit} className="login-form">
        <label>
          Email
          <input
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </label>

        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Your password"
          />
        </label>

        <button type="submit">Log in</button>
      </form>
    </div>
  );
}

export default Login;
