// src/Login.js
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

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

      const data = await res.json();

      if (!res.ok) {
        toast.error(`Login failed. ${data.error || ""}`);
        return;
      }

      const token = data.token;
      toast.success("Login successful!");

      // Save token
      localStorage.setItem("token", token);

      // Navigate to dashboard
      navigate("/dashboard");
    } catch (err) {
      toast.error(`An error occurred. ${err.message}`);
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
