import React, { useEffect, useState } from "react";
import Loading from "../components/Loading";

export default function ProductList() {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editProduct, setEditProduct] = useState({
    name: "",
    price: "",
    image: "",
    description: ""
  });
  const [message, setMessage] = useState("");

  // Fetch products from server
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await fetch("https://electronic-dukaan.onrender.com/products");
        if (res.ok) {
          const data = await res.json();
          setProducts(data);
        } else {
          setMessage("Failed to load products.");
        }
      } catch {
        setMessage("Error connecting to server.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Disable scroll when modal open
  useEffect(() => {
    document.body.style.overflow = editingId !== null ? "hidden" : "";
  }, [editingId]);

  const handleDelete = async (id) => {
    setLoading(true);
    try {
      const res = await fetch(`https://electronic-dukaan.onrender.com/products/${id}`, {
        method: "DELETE",
        credentials: "include"
      });
      if (res.ok) {
        setMessage("Product deleted successfully.");
        setProducts(products.filter(p => p._id !== id));
      } else {
        setMessage("Failed to delete product.");
      }
    } catch {
      setMessage("Error connecting to server.");
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (product) => {
    setEditingId(product._id);
    setEditProduct({
      name: product.name,
      price: product.price,
      image: product.image,
      description: product.description || ""
    });
    setMessage("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setMessage("");
  };

  const handleEditChange = (e) => {
    setEditProduct({ ...editProduct, [e.target.name]: e.target.value });
  };

  const submitEdit = async (e) => {
    e.preventDefault();
    if (!editProduct.name || !editProduct.price || !editProduct.image) {
      setMessage("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`https://electronic-dukaan.onrender.com/products/${editingId}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editProduct.name,
          price: parseFloat(editProduct.price),
          image: editProduct.image,
          description: editProduct.description
        })
      });

      if (res.ok) {
        setMessage("Product updated successfully.");
        setProducts(products.map(p => p._id === editingId ? { ...p, ...editProduct, price: parseFloat(editProduct.price) } : p));
        setEditingId(null);
      } else {
        setMessage("Failed to update product.");
      }
    } catch {
      setMessage("Error connecting to server.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading text="Loading Products..." />;

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Product List</h2>
      {message && <p style={styles.message}>{message}</p>}

      <ul style={styles.list}>
        {products.map((p) => (
          <li key={p._id} style={styles.listItem}>
            <img src={p.image} alt={p.name} style={styles.productImage} />
            <div style={styles.productInfo}>
              <strong style={styles.productName}>{p.name}</strong>
              <p style={styles.productPrice}>Price: ₹{p.price.toFixed(2)}</p>
              <p style={styles.productDescription}>{p.description}</p>
            </div>
            <div style={styles.buttonGroup}>
              <button
                onClick={() => startEdit(p)}
                style={styles.editBtn}
                disabled={editingId !== null && editingId !== p._id}
              >
                <i className="fas fa-pen"></i> Edit
              </button>
              <button
                onClick={() => handleDelete(p._id)}
                style={styles.deleteBtn}
                disabled={editingId !== null}
              >
                <i className="fas fa-trash"></i> Delete
              </button>
            </div>
          </li>
        ))}
      </ul>

      {editingId !== null && (
        <div style={styles.modalOverlay} onClick={cancelEdit}>
          <div
            style={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Edit Product</h3>
            <form onSubmit={submitEdit} style={styles.editForm}>
              <label style={styles.label}>
                Name
                <input
                  type="text"
                  name="name"
                  placeholder="Product name"
                  value={editProduct.name}
                  onChange={handleEditChange}
                  required
                  style={styles.input}
                />
              </label>

              <label style={styles.label}>
                Price (₹)
                <input
                  type="number"
                  name="price"
                  placeholder="Price"
                  step="0.01"
                  min="0"
                  value={editProduct.price}
                  onChange={handleEditChange}
                  required
                  style={styles.input}
                />
              </label>

              <label style={styles.label}>
                Image URL
                <input
                  type="text"
                  name="image"
                  placeholder="Image URL"
                  value={editProduct.image}
                  onChange={handleEditChange}
                  required
                  style={styles.input}
                />
              </label>

              <label style={styles.label}>
                Description
                <textarea
                  name="description"
                  placeholder="Description"
                  value={editProduct.description}
                  onChange={handleEditChange}
                  style={{ ...styles.input, height: 80, resize: "vertical" }}
                />
              </label>

              <div style={{ marginTop: 12, textAlign: "right" }}>
                <button type="submit" style={styles.saveBtn}>
                  <i className="fas fa-floppy-disk"></i> Save Changes
                </button>
                <button type="button" onClick={cancelEdit} style={styles.cancelBtn}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { maxWidth: 900, margin: "auto", padding: 20, fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", color: "#333" },
  title: { textAlign: "center", marginBottom: 30, fontSize: 28, fontWeight: "700" },
  message: { backgroundColor: "#f0f4f8", color: "#333", padding: 10, borderRadius: 5, marginBottom: 20, textAlign: "center", fontWeight: "600" },
  list: { listStyle: "none", padding: 0, marginBottom: 40 },
  listItem: { border: "1px solid #ddd", borderRadius: 10, padding: 15, marginBottom: 15, display: "flex", alignItems: "center", gap: 15, backgroundColor: "white", boxShadow: "0 1px 6px rgba(0,0,0,0.1)" },
  productImage: { width: 80, height: 80, objectFit: "cover", borderRadius: 8, flexShrink: 0 },
  productInfo: { flex: 1 },
  productName: { fontSize: 18, marginBottom: 5, display: "block" },
  productPrice: { color: "#ff5100ff", marginBottom: 5, fontWeight: "600" },
  productDescription: { fontSize: 14, color: "#555", lineHeight: "1.4em" },
  buttonGroup: { display: "flex", flexDirection: "column", gap: 8 },
  editBtn: { backgroundColor: "#1b8f0cff", color: "white", border: "none", padding: "8px 14px", borderRadius: 6, cursor: "pointer", fontWeight: "600", fontSize: 14 },
  deleteBtn: { backgroundColor: "#ff4800ff", color: "white", border: "none", padding: "8px 14px", borderRadius: 6, cursor: "pointer", fontWeight: "600", fontSize: 14 },
  modalOverlay: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 },
  modalContent: { backgroundColor: "white", borderRadius: 12, padding: 30, width: "90%", maxWidth: 600, boxShadow: "0 0 20px rgba(0,0,0,0.3)", maxHeight: "90vh", overflowY: "auto" },
  editForm: { marginTop: 10 },
  label: { display: "block", marginBottom: 16, fontWeight: "600", color: "#222" },
  input: { width: "100%", padding: "10px 14px", fontSize: 16, borderRadius: 6, border: "1px solid #ccc", marginTop: 6, boxSizing: "border-box" },
  saveBtn: { backgroundColor: "#ff5100ff", color: "white", border: "none", padding: "10px 24px", borderRadius: 8, cursor: "pointer", fontWeight: "700", fontSize: 16, marginRight: 10 },
  cancelBtn: { backgroundColor: "#02991bff", color: "white", border: "none", padding: "10px 24px", borderRadius: 8, cursor: "pointer", fontWeight: "700", fontSize: 16 }
};
