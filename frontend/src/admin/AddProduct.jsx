import React, { useState } from "react";

export default function AddProduct() {
  const [product, setProduct] = useState({
    name: "",
    price: "",
    image: "",
    category: "",
    description: ""
  });

  const [message, setMessage] = useState({ text: "", type: "" });

  const categories = ["Electronics", "Clothing", "Books", "Home & Kitchen", "Sports"];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct(prev => ({
      ...prev,
      [name]: value,
      // Auto-generate description if name or category changes
      description:
        name === "name" || name === "category"
          ? `${value} ${name === "name" ? prev.category : prev.name} - Best quality and affordable price!`
          : prev.description
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!product.name || !product.price || !product.image || !product.category) {
      setMessage({ text: "Please fill in all required fields.", type: "error" });
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/products", {
        method: "POST",
         credentials: "include",  
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: product.name,
          price: parseFloat(product.price),
          image: product.image,
          category: product.category,
          description: product.description
        })
      });

      if (response.ok) {
        setMessage({ text: "Product added successfully!", type: "success" });
        setProduct({ name: "", price: "", image: "", category: "", description: "" });
      } else {
        const errorData = await response.json();
        setMessage({ text: `Error: ${errorData.message || "Failed to add product."}`, type: "error" });
      }
    } catch {
      setMessage({ text: "Error connecting to server.", type: "error" });
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}> <i class="fa-solid fa-cart-plus"></i> Add Product</h2>

      {message.text && (
        <p style={{ ...styles.message, color: message.type === "error" ? "#f44336" : "#4caf50" }}>
          {message.text}
        </p>
      )}

      <form onSubmit={handleSubmit} style={styles.form}>
        {/* Name */}
        <InputField label="Product Name*" name="name" value={product.name} onChange={handleChange} />

        {/* Price */}
        <InputField label="Price*" name="price" type="number" value={product.price} onChange={handleChange} step="0.01" min="0" />

        {/* Image URL */}
        <InputField label="Image URL*" name="image" value={product.image} onChange={handleChange} />

        {/* Image Preview */}
        {product.image && (
          <div style={{ textAlign: "center", marginBottom: 15 }}>
            <img src={product.image} alt="Preview" style={{ maxWidth: "200px", borderRadius: 6, boxShadow: "0 2px 6px rgba(0,0,0,0.1)" }} />
          </div>
        )}

        {/* Category */}
        <div style={{ marginBottom: 15 }}>
          <label style={styles.label}>Category*</label>
          <select name="category" value={product.category} onChange={handleChange} style={styles.input} required>
            <option value="">Select Category</option>
            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>

        {/* Description (auto-generated) */}
        {product.description && (
          <div style={{ marginBottom: 15 }}>
            <label style={styles.label}>Description  </label>
            <textarea value={product.description}  style={{ ...styles.input, backgroundColor: "#f5f5f5", height: 80 }} />
          </div>
        )}

        <button type="submit" style={styles.submitButton}>Add Product</button>
      </form>
    </div>
  );
}

// Reusable Input Field
function InputField({ label, name, type = "text", value, onChange, ...props }) {
  return (
    <div style={{ marginBottom: 15 }}>
      <label style={styles.label}>{label}</label>
      <input type={type} name={name} value={value} onChange={onChange} style={styles.input} {...props} />
    </div>
  );
}

// Styles
const styles = {
  container: {
    maxWidth: 600,
    margin: "40px auto",
    padding: 25,
    backgroundColor: "#fff",
    borderRadius: 12,
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
  },
  title: { textAlign: "center", marginBottom: 20, color: "#007bff" },
  form: {},
  label: { display: "block", marginBottom: 6, fontWeight: 500 },
  input: { width: "100%", padding: 10, borderRadius: 6, border: "1px solid #ccc", fontSize: 15, outline: "none" },
  submitButton: {
    width: "100%",
    padding: 14,
    background: "linear-gradient(45deg, #4caf50, #81c784)",
    color: "white",
    border: "none",
    borderRadius: 8,
    fontSize: 16,
    fontWeight: 600,
    cursor: "pointer",
    transition: "0.3s"
  },
  message: { textAlign: "center", marginBottom: 15, fontWeight: 500 }
};
