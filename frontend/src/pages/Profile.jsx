import React, { useContext, useEffect, useState } from "react";
import API from "../api";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const { user, setUser } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      setLoading(false);
    } else {
      API.get("/me")
        .then(res => {
          setUser(res.data);
          setLoading(false);
        })
        .catch(() => {
          setError("Failed to load profile. Please login.");
          setLoading(false);
          navigate("/login");
        });
    }
  }, [user, setUser, navigate]);

  if (loading) return <p style={{ textAlign: "center", marginTop: 40 }}>Loading profile...</p>;
  if (error) return <p style={{ color: "red", textAlign: "center", marginTop: 40 }}>{error}</p>;
  if (!user) return <p style={{ textAlign: "center", marginTop: 40 }}>No user data found.</p>;

  const { name, email, phone, address, role, createdAt, updatedAt } = user;
  const addr = address || {};

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>
        <i className="fas fa-user"></i> User Profile
      </h2>

      {/* Basic Info */}
      <section style={styles.section}>
        <h3 style={styles.sectionTitle}>Personal Information</h3>
        <div style={styles.infoRow}><strong>Name:</strong> {name}</div>
        <div style={styles.infoRow}><strong>Email:</strong> {email}</div>
        {phone && <div style={styles.infoRow}><strong>Phone:</strong> {phone}</div>}
        {role && <div style={styles.infoRow}><strong>Role:</strong> {role}</div>}
      </section>

      {/* Address Info */}
      {address && (
        <section style={styles.section}>
          <h3 style={styles.sectionTitle}>Address</h3>
          <div style={styles.infoRow}>{addr.street || ""}</div>
          <div style={styles.infoRow}>{addr.landmark || ""}</div>
          <div style={styles.infoRow}>
            {[addr.city, addr.state, addr.pincode].filter(Boolean).join(", ")}
          </div>
        </section>
      )}

      

      {/* Edit Profile Button */}
      <button
        onClick={() => navigate("/edit-profile")}
        style={styles.editButton}
      >
        <i className="fas fa-edit" style={{ marginRight: "8px" }}></i> Edit Profile
      </button>
    </div>
  );
}

// Styles
const styles = {
  container: {
    maxWidth: "700px",
    margin: "40px auto",
    padding: "25px",
    backgroundColor: "#fff",
    borderRadius: "12px",
    boxShadow: "0px 4px 15px rgba(0,0,0,0.1)",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
  },
  title: {
    textAlign: "center",
    marginBottom: "30px",
    fontSize: "28px",
    color: "#007bff"
  },
  section: {
    marginBottom: "25px",
    padding: "15px",
    borderRadius: "8px",
    backgroundColor: "#f9f9f9"
  },
  sectionTitle: {
    fontSize: "18px",
    marginBottom: "12px",
    color: "#4caf50",
    borderBottom: "1px solid #ddd",
    paddingBottom: "6px"
  },
  infoRow: {
    fontSize: "15px",
    marginBottom: "8px",
    color: "#333"
  },
  editButton: {
    display: "block",
    width: "100%",
    padding: "14px",
    background: "linear-gradient(45deg, #4caf50, #81c784)",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "16px",
    cursor: "pointer",
    fontWeight: "600",
    transition: "0.3s"
  }
};
