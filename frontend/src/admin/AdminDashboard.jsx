import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Loading from "../components/Loading";
export default function AdminDashboard() {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState(null);

  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const res = await fetch("https://electronic-dukaan.onrender.com/admin/me", {
          credentials: "include",
        });
        if (!res.ok) throw new Error("Not authorized");
        const data = await res.json();
        setAdmin(data);
      } catch (err) {
        navigate("/admin/login");
      }
    };
    fetchAdmin();
  }, [navigate]);

  const handleLogout = async () => {
    await fetch("https://electronic-dukaan.onrender.com/admin/logout", {
      method: "POST",
      credentials: "include",
    });
    navigate("/admin/login");
  };

  if (!admin)
    return (
     
      
          <Loading text="Loading admin info..." />
    
      

    );

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>
          <i className="fas fa-user-tie"></i> Welcome, {admin.name}
        </h1>
        <p style={styles.email}>
          <i className="fas fa-envelope"></i> {admin.email}
        </p>

        <nav style={styles.nav}>
          <Link to="/AllOrders" style={styles.navLink}>
            <i className="fas fa-box"></i> Manage Orders
          </Link>
          <Link to="/ProductList" style={styles.navLink}>
            <i className="fas fa-shopping-cart"></i> Manage Products
          </Link>
          <Link to="/AddProduct" style={styles.navLink}>
            <i className="fas fa-plus-circle"></i> Add Products
          </Link>
        </nav>

        <button onClick={handleLogout} style={styles.logoutBtn}>
          <i className="fas fa-sign-out-alt"></i> Logout
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    background: "#f7f8fa",
    
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "20px",
  },
  card: {
    background: "#fff",
    padding: "40px 30px",
    borderRadius: "15px",
    boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
    width: "100%",
    maxWidth: "500px",
    textAlign: "center",
  },
  title: {
    fontSize: "2rem",
    marginBottom: "10px",
    color: "#ff6600",
    fontWeight: "700",
  },
  email: {
    fontSize: "1rem",
    color: "#555",
    marginBottom: "30px",
  },
  nav: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
    marginBottom: "30px",
  },
  navLink: {
    background: "#ff6600",
    color: "white",
    padding: "12px",
    borderRadius: "8px",
    textDecoration: "none",
    fontWeight: "600",
    fontSize: "16px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    justifyContent: "center",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  },
  logoutBtn: {
    background: "#e74c3c",
    color: "white",
    border: "none",
    padding: "12px 20px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "16px",
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    transition: "all 0.3s ease",
  },
};
