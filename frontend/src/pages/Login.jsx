import React, { useContext, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function Login() {
  const { setUser } = useContext(AuthContext);
  const [form, setForm] = useState({ email: "", password: "" });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);

    try {
      // 1️⃣ Login request
      const loginRes = await fetch(
        "https://your-backend.onrender.com/login", // replace with your backend URL
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include", // ✅ important for cookies
          body: JSON.stringify(form),
        }
      );

      const loginData = await loginRes.json();
      if (!loginRes.ok) throw new Error(loginData.error || "Login failed");

      // 2️⃣ Fetch user profile
      const profileRes = await fetch(
        "https://your-backend.onrender.com/me",
        {
          method: "GET",
          credentials: "include",
        }
      );

      const profileData = await profileRes.json();
      if (!profileRes.ok) throw new Error(profileData.error || "Failed to fetch profile");

      // 3️⃣ Save user in context
      setUser(profileData);

      // 4️⃣ Redirect
      navigate("/");
    } catch (error) {
      setErr(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <form onSubmit={submit} style={styles.form}>
        <h2 style={styles.title}>
          <i className="fas fa-user" style={styles.icon}></i> Login
        </h2>
        {err && <p style={styles.error}>{err}</p>}

        <input
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
          style={styles.input}
        />

        <div style={{ position: "relative" }}>
          <input
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
            style={styles.input}
          />
          <i
            className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"}`}
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: "absolute",
              right: "12px",
              top: "12px",
              cursor: "pointer",
              color: "#888",
            }}
          ></i>
        </div>

        <button type="submit" style={styles.button} disabled={loading}>
          {loading ? (
            <>
              <i className="fas fa-spinner fa-spin"></i> Logging in...
            </>
          ) : (
            "Login"
          )}
        </button>

        <p style={styles.registerText}>
          Don't have an account? <Link to="/register" style={styles.registerLink}>Register</Link>
        </p>
      </form>
    </div>
  );
}

const styles = {
  container: { display: "flex", justifyContent: "center", alignItems: "center", minHeight: "70vh", padding: "20px" },
  form: { background: "#fff", padding: "30px", borderRadius: "12px", boxShadow: "0 6px 18px rgba(0,0,0,0.1)", width: "100%", maxWidth: "400px", textAlign: "center" },
  title: { color: "#ff6600", marginBottom: "20px", fontSize: "26px", fontWeight: "700" },
  icon: { marginRight: "8px" },
  input: { width: "100%", padding: "12px 14px", marginBottom: "15px", border: "1px solid #ccc", borderRadius: "8px", fontSize: "16px", outline: "none" },
  button: { width: "100%", padding: "12px", backgroundColor: "#ff6600", color: "#fff", fontSize: "16px", fontWeight: "600", border: "none", borderRadius: "8px", cursor: "pointer", transition: "background 0.3s" },
  error: { color: "red", fontSize: "14px", marginBottom: "10px" },
  registerText: { marginTop: "15px", fontSize: "14px" },
  registerLink: { color: "#ff6600", fontWeight: "600", textDecoration: "none" },
};
