import React, { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api"; // Axios instance
import { AuthContext } from "../context/AuthContext";

export default function Login() {
  const { setUser } = useContext(AuthContext);
  const [form, setForm] = useState({ email: "", password: "" });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr(""); 
    setLoading(true);

    try {
      await API.post("/login", form, { withCredentials: true }); // Login + send cookies

      // Fetch profile
      const profileRes = await API.get("/me", { withCredentials: true });
      setUser(profileRes.data);

      navigate("/"); // Redirect after login
    } catch (error) {
      setErr(error.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit} className="login-card">
        <h2><i className="fas fa-user"></i> Login</h2>

        {err && <p className="error-message">{err}</p>}

        <input type="email" name="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        <div className="input-group">
          <input type={showPassword ? "text" : "password"} name="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          <i className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"}`} onClick={() => setShowPassword(!showPassword)}></i>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>

        <p className="register-link">
          Don't have an account? <Link to="/register">Register</Link>
        </p>
      </form>
    </div>
  );
}
