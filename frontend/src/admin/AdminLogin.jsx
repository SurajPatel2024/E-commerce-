import React, { useState, useContext } from "react";
import { useNavigate,Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext"; // import context
 
export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { setAdmin } = useContext(AuthContext); // get setAdmin
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("https://electronic-dukaan.onrender.com/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Incorrect email or password");

      // fetch admin details immediately after login
      const meRes = await fetch("https://electronic-dukaan.onrender.com/admin/me", {
        credentials: "include",
      });
      const meData = await meRes.json();
      setAdmin(meData); // update admin in context

      navigate("/admin/dashboard"); // redirect
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const togglePassword = () => setShowPassword(!showPassword);

  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit} style={styles.form}>
        <h2 style={styles.title}>
          <i className="fas fa-user-tie" style={styles.icon}></i> Admin Login
        </h2>
        {error && <p style={styles.error}>{error}</p>}
        <input
          type="email"
          placeholder="Admin email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={styles.input}
        />
        <div style={{ position: "relative" }}>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Admin password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={styles.input}
          />
          <i
            className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"}`}
            onClick={togglePassword}
            style={styles.passwordIcon}
          ></i>
        </div>
        <button type="submit" style={styles.button} disabled={loading}>
          {loading ? <i className="fas fa-spinner fa-spin"></i> : "Login"}
        </button>
      </form>
         <Link to='/admin/register'>Admin Register</Link>
    </div>
 
  );
}


const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "70vh",
    padding: "20px",

  },
  form: {
    background: "#fff",
    padding: "30px",
    borderRadius: "12px",
    boxShadow: "0 6px 18px rgba(0,0,0,0.1)",
    width: "100%",
    maxWidth: "400px",
    textAlign: "center",
  },
  title: {
    color: "#ff6600",
    marginBottom: "20px",
    fontSize: "26px",
    fontWeight: "700",
  },
  icon: { marginRight: "8px" },
  input: {
    width: "100%",
    padding: "12px 14px",
    marginBottom: "15px",
    border: "1px solid #ccc",
    borderRadius: "8px",
    fontSize: "16px",
    outline: "none",
  },
  passwordIcon: {
    position: "absolute",
    right: "10px",
    top: "12px",
    cursor: "pointer",
    color: "#555",
  },
  button: {
    width: "100%",
    padding: "12px",
    backgroundColor: "#ff6600",
    color: "#fff",
    fontSize: "16px",
    fontWeight: "600",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "background 0.3s",
  },
  error: {
    color: "red",
    fontSize: "14px",
    marginBottom: "10px",
  },
};
