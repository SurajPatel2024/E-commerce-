import React, { useContext, useEffect, useState } from "react";
import API from "../api";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function EditProfile() {
  const { user, setUser } = useContext(AuthContext);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    street: "",
    pincode: "",
    landmark: "",
    city: "",
    state: ""
  });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

 const [popup, setPopup] = useState({ show: false, message: "", type: "" });
   

  // Show popup for 2.5 seconds
  const showPopup = (message, type = "info") => {
    setPopup({ show: true, message, type });
    setTimeout(() => setPopup({ show: false, message: "", type: "" }), 2500);
  };



  useEffect(() => {
    if (user) {
      const address = user.address || {};
      setForm({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        street: address.street || "",
        pincode: address.pincode || "",
        landmark: address.landmark || "",
        city: address.city || "",
        state: address.state || ""
      });
    } else {
      API.get("/me")
        .then(res => { 
          setForm({
            name: res.data.name || "",
            email: res.data.email || "",
            phone: res.data.phone || "",
            street: res.data.address?.street || "",
            pincode: res.data.address?.pincode || "",
            landmark: res.data.address?.landmark || "",
            city: res.data.address?.city || "",
            state: res.data.address?.state || ""
          });
          setUser(res.data);
        })
        .catch(() => navigate("/login"));
    }
  }, [user, setUser, navigate]);

  const validateForm = () => {
    let newErrors = {};
    if (!form.name.trim()) newErrors.name = "Full name is required";
    else if (!/^[A-Za-z\s]+$/.test(form.name.trim())) newErrors.name = "Name must contain only letters";
    if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = "Enter a valid email";
    if (form.phone && !/^\d{10,15}$/.test(form.phone)) newErrors.phone = "Phone must be 10-15 digits";
    if (form.street.trim().length < 5) newErrors.street = "Street address should be at least 5 characters";
    if (!/^\d{6}$/.test(form.pincode)) newErrors.pincode = "Pincode must be exactly 6 digits";
    if (!form.city.trim()) newErrors.city = "City is required";
    if (!form.state.trim()) newErrors.state = "State is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      const updatedData = {
        name: form.name,
        email: form.email,
        phone: form.phone,
        address: {
          street: form.street,
          pincode: form.pincode,
          landmark: form.landmark,
          city: form.city,
          state: form.state,
        }
      };
      const res = await API.put("/profile", updatedData);
      setUser(res.data);
      
      showPopup("Profile updated successfully!", "success");
      
    } catch (err) {
      console.error(err);
      
       showPopup("Update failed. Please try again.", "error");
    }
  };

  const statesList = [
    "Andhra Pradesh", "Bihar", "Delhi", "Gujarat", "Karnataka",
    "Maharashtra", "Punjab", "Rajasthan", "Tamil Nadu", "Uttar Pradesh"
  ];

  return (
    <div style={styles.container}>

       {/* Popup Notification */}
      {popup.show && (
        <div
          className={`popup ${popup.type}`}
          style={{
            position: "fixed",
            top: `5%`,
            right: `auto`,
            padding: "20px 19px",
            width:"30%",
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








      <h2 style={styles.title}>
        <i className="fas fa-user-edit"></i> Edit Profile
      </h2>
      <form onSubmit={submit}>
        {/* Personal Info Section */}
        <section style={styles.section}>
          <h3 style={styles.sectionTitle}>Personal Information</h3>
          <InputField label="Full Name" value={form.name} onChange={val => setForm({...form, name: val})} error={errors.name} />
          <InputField label="Email" type="email" value={form.email} onChange={val => setForm({...form, email: val})} error={errors.email} />
          <InputField label="Phone Number" value={form.phone} onChange={val => setForm({...form, phone: val})} error={errors.phone} placeholder="Phone"/>
        </section>

        {/* Address Section */}
        <section style={styles.section}>
          <h3 style={styles.sectionTitle}>Address</h3>
          <InputField label="Street" value={form.street} onChange={val => setForm({...form, street: val})} error={errors.street} />
          <InputField label="Pincode" value={form.pincode} onChange={val => setForm({...form, pincode: val})} error={errors.pincode} />
          <InputField label="Landmark" value={form.landmark} onChange={val => setForm({...form, landmark: val})} placeholder="Optional"/>
          <InputField label="City" value={form.city} onChange={val => setForm({...form, city: val})} error={errors.city} />
          <div style={{ marginBottom: 15 }}>
            <label style={styles.label}>State</label>
            <select value={form.state} onChange={e => setForm({...form, state: e.target.value})} style={styles.input}>
              <option value="">Select State</option>
              {statesList.map(state => <option key={state} value={state}>{state}</option>)}
            </select>
            {errors.state && <small style={styles.error}>{errors.state}</small>}
          </div>
        </section>

        {/* Save Button */}
        <button type="submit" style={styles.saveButton}>
          <i className="fas fa-save" style={{ marginRight: 6 }}></i> Save Changes
        </button>
      </form>
    </div>
  );
}

// Reusable Input Field
function InputField({ label, type="text", value, onChange, error, placeholder }) {
  return (
    <div style={{ marginBottom: 15 }}>
      <label style={styles.label}>{label}</label>
      <input
        type={type}
        value={value}
        placeholder={placeholder || label}
        onChange={e => onChange(e.target.value)}
        style={{ ...styles.input, borderColor: error ? "#f44336" : "#ccc" }}
      />
      {error && <small style={styles.error}>{error}</small>}
    </div>
  );
}

// Styles
const styles = {
  container: {
    maxWidth: "650px",
    margin: "40px auto",
    padding: "25px",
    backgroundColor: "#fff",
    borderRadius: 12,
    boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
  },
  title: { textAlign: "center", marginBottom: 30, fontSize: 26, color: "#007bff" },
  section: { marginBottom: 25, padding: 15, borderRadius: 8, backgroundColor: "#f9f9f9" },
  sectionTitle: { fontSize: 18, marginBottom: 12, color: "#4caf50", borderBottom: "1px solid #ddd", paddingBottom: 4 },
  label: { display: "block", marginBottom: 6, fontWeight: 500 },
  input: { width: "100%", padding: 10, borderRadius: 6, border: "1px solid #ccc", fontSize: 15, outline: "none" },
  error: { color: "#f44336", fontSize: 12, marginTop: 4, display: "block" },
  saveButton: {
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
  }
};
