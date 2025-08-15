import React, { useEffect, useState, useContext } from "react";
import API from "../api";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "./home.css";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [popup, setPopup] = useState({ show: false, message: "", type: "" });
  const navigate = useNavigate();

  // Show popup for 2.5 seconds
  const showPopup = (message, type = "info") => {
    setPopup({ show: true, message, type });
    setTimeout(() => setPopup({ show: false, message: "", type: "" }), 2500);
  };

  useEffect(() => {
    API.get("/products")
      .then((res) => {
        setProducts(res.data);
        setFilteredProducts(res.data);
      })
      .catch(() => {
        setProducts([]);
        setFilteredProducts([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const addToCart = async (id) => {
    if (!user) {
      showPopup("Please login to add to cart", "error");
      return;
    }
    try {
      await API.post(`/cart/${id}`);
      showPopup("Added to cart", "success");
    } catch {
      showPopup("Failed to add to cart", "error");
    }
  };

  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    setFilteredProducts(
      products.filter((p) =>
        p.name.toLowerCase().includes(term.toLowerCase())
      )
    );
  };

  return (
    <div style={styles.container}>
      {/* Popup Notification */}
      {popup.show && (
        <div
          className={`popup ${popup.type}`}
          style={{
            position: "fixed",
            top: `5%`,
            right: `50%`,
            padding: "20px 16px",
            borderRadius: 8,
            color: "#fff",
            fontWeight: "600",
            zIndex: 9999,
            backgroundColor:
              popup.type === "success"
                ? "#22c55e"
                : popup.type === "error"
                ? "#ef4444"
                : "#374151",
            boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
            animation: "slideIn 0.3s ease",
          }}
        >
          {popup.message}
        </div>
      )}

      {/* Hero */}
      <section style={styles.hero}>
        <h1 style={styles.heroTitle}>Welcome to Electronic Dukaan</h1>
        <p style={styles.heroSubtitle}>
          Best deals and latest products at your fingertips
        </p>
      </section>

      {/* Search */}
      <div style={styles.searchContainer}>
        <input
          type="text"
          value={searchTerm}
          onChange={handleSearch}
          placeholder="Search products..."
          style={styles.searchInput}
        />
      </div>

      <h2 style={styles.heading}>Products</h2>

      {/* Product grid */}
      <div style={styles.productGrid}>
        {loading
          ? Array(8)
              .fill("")
              .map((_, i) => (
                <div key={i} className="skeleton-card">
                  <div className="skeleton skeleton-img"></div>
                  <div className="skeleton skeleton-line"></div>
                  <div className="skeleton skeleton-line"></div>
                  <div
                    className="skeleton skeleton-line"
                    style={{ width: "60%" }}
                  ></div>
                </div>
              ))
          : filteredProducts.length > 0
          ? filteredProducts.map((p) => (
              <div key={p._id} style={styles.productCard}>
                <img
                  src={
                    p.image ||
                    `https://via.placeholder.com/300x200?text=${encodeURIComponent(
                      p.name
                    )}`
                  }
                  alt={p.name}
                  style={styles.productImage}
                  loading="lazy"
                />
                <h3 style={styles.productTitle}>{p.name}</h3>
                <p style={styles.price}>₹{p.price.toFixed(2)}</p>
                <p style={styles.description}>
                  {p.description.length > 100
                    ? p.description.slice(0, 100) + "..."
                    : p.description}
                </p>
                <div style={styles.buttonRow}>
                  <button
                    onClick={() => addToCart(p._id)}
                    style={styles.addButton}
                  >
               <i className="fas fa-shopping-cart"></i> Add to Cart
                  </button>
                </div>
              </div>
            ))
          : !loading && <p>No products found.</p>}
      </div>
    </div>
  );
}

const styles = {
  container: { padding: 20, maxWidth: 1100, margin: "auto" },
  hero: {
    textAlign: "center",
    marginBottom: 30,
    padding: 20,
    background: "linear-gradient(135deg, #ff6600, #ff884d)",
    borderRadius: 12,
    color: "white",
  },
  heroTitle: { fontSize: 36, marginBottom: 8, fontWeight: "700" },
  heroSubtitle: { fontSize: 18 },
  searchContainer: { textAlign: "center", marginBottom: 20 },
  searchInput: {
    width: "80%",
    maxWidth: 400,
    padding: "10px 16px",
    borderRadius: 8,
    border: "1px solid #ccc",
    fontSize: 16,
  },
  heading: {
    marginBottom: 25,
    fontWeight: "600",
    fontSize: 28,
    borderBottom: "2px solid #ff6600",
    paddingBottom: 6,
  },
  productGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 20,
  },
  productCard: {
    border: "1px solid #ddd",
    borderRadius: 12,
    padding: 16,
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
    backgroundColor: "white",
    transition: "all 0.3s ease",
  },
  productImage: {
    width: "100%",
    height: 180,
    objectFit: "contain",
    borderRadius: 8,
  },
  productTitle: { fontSize: 20, marginBottom: 8 },
  price: {
    fontWeight: "700",
    fontSize: 18,
    color: "#ff6600",
    marginBottom: 10,
  },
  description: { fontSize: 14, color: "#555", marginBottom: 18 },
  buttonRow: { display: "flex", gap: 12, justifyContent: "center" },
  addButton: {
    backgroundColor: "#ff6600",
    color: "white",
    border: "none",
    padding: "10px 18px",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: "600",
  },
};
