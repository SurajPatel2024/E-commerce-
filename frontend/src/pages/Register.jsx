import React, { useState } from "react";
import { Link } from "react-router-dom";
import API from "../api";
import "./register.css";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const togglePassword = () => setShowPassword(!showPassword);

  const validatePassword = (password) =>
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!validatePassword(form.password)) {
      setError("Password must be at least 8 characters, include uppercase, lowercase, number & special char.");
      return;
    }

    try {
      const res = await API.post("/register", form); // API instance
      setMessage("✅ Registration successful!");
      setForm({ name: "", email: "", password: "" });
    } catch (err) {
      setError(err.response?.data?.error || "❌ Registration failed");
    }
  };

  return (
    <div className="register-container">
      <form className="register-card" onSubmit={handleSubmit}>
        <h2><i className="fas fa-user-plus"></i> Register</h2>
        {message && <p className="success-message">{message}</p>}
        {error && <p className="error-message">{error}</p>}

        <div className="input-group">
          <label>Full Name</label>
          <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="Enter your name" required />
        </div>

        <div className="input-group">
          <label>Email</label>
          <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="Enter your email" required />
        </div>

        <div className="input-group">
          <label>Password</label>
          <input type={showPassword ? "text" : "password"} name="password" value={form.password} onChange={handleChange} placeholder="Enter your password" required />
          <i className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"} show-password`} onClick={togglePassword}></i>
        </div>

        <button type="submit" className="register-btn"><i className="fas fa-user-plus"></i> Register</button>

        <p className="login-link">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </form>
    </div>
  );
}
