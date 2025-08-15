import React, { useEffect, useState } from "react";
import "./AdminOrders.css";
import Loading from "../components/Loading";
export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState(""); // <-- search term state
   const [popup, setPopup] = useState({ show: false, message: "", type: "" });
 

  // Show popup for 2.5 seconds
  const showPopup = (message, type = "info") => {
    setPopup({ show: true, message, type });
    setTimeout(() => setPopup({ show: false, message: "", type: "" }), 2500);
  };

  useEffect(() => {
    fetchAllOrders();
  }, []);

  const fetchAllOrders = async () => {
    try {
      const res = await fetch("https://electronic-dukaan.onrender.com/admin/orders", {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch all orders");
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error loading admin orders:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch(`https://electronic-dukaan.onrender.com/admin/orders/${orderId}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update order status");

      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === orderId ? { ...order, status: newStatus } : order
        )
      );
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  const removeOrder = async (orderId) => {
      showPopup("Remove Order successfully!", "success"); 

    try {
      const res = await fetch(`https://electronic-dukaan.onrender.com/admin/orders/${orderId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete order");

      setOrders((prevOrders) => prevOrders.filter((order) => order._id !== orderId));
    } catch (err) {
      console.error("Error deleting order:", err);
    }
  };

if (loading) return <Loading text="Loading orders..." />;

  if (error) return <p className="error">{error}</p>;

  // Filter orders based on search term (case-insensitive match for name or email)
  const filteredOrders = orders.filter((order) => {
    const name = order.user?.name?.toLowerCase() || "";
    const email = order.user?.email?.toLowerCase() || "";
    const term = searchTerm.toLowerCase();

    return name.includes(term) || email.includes(term);
  });

  return (
    <div className="admin-orders-container">
       {/* Popup Notification */}
      {popup.show && (
        <div
          className={`popup ${popup.type}`}
          style={{
            position: "fixed",
            top: `5%`,
            right: `50%`,
            padding: "10px 16px",
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


      <h2>📦 All Orders (Admin)</h2>

      {/* Search input */}
      <input
        type="text"
        placeholder="Search by user name or email..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="search-input"
      />

      {filteredOrders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        filteredOrders.map((order) => (
          <div key={order._id} className="admin-order-card">
            <div className="order-header">
              <div className="order-info">
                <h3>🆔 Order ID: {order._id}</h3>
                <p>
                  <strong>Status:</strong>{" "}
                  <select
                    value={order.status}
                    onChange={(e) => updateStatus(order._id, e.target.value)}
                    className="status-select"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </p>
                <p>
                  <strong>Payment Method:</strong> {order.paymentMethod}
                </p>
                <p>
                  <strong>Placed On:</strong> {new Date(order.createdAt).toLocaleString()}
                </p>
                <p>
                  <strong>Total:</strong> ₹{order.totalAmount?.toFixed(2) || 0}
                </p>
              </div>

              <div className="user-info">
                <h4>👤 Customer Details</h4>
                <p><strong>Name:</strong> {order.user?.name || "Unknown User"}</p>
                <p><strong>Email:</strong> {order.user?.email || "N/A"}</p>
                <p><strong>Phone:</strong> {order.user?.phone || "N/A"}</p>
                <p>
                  <strong>Address:</strong>{" "}
                  {order.address.street}, {order.address.landmark}, {order.address.city}, {order.address.state} - {order.address.pincode}
                </p>
              </div>
            </div>

            <table className="order-items">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Product Name</th>
                  <th>Price</th>
                  <th>Qty</th>
                  <th>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item, idx) => (
                  <tr key={idx}>
                    <td>
                      <img
                        src={item.product?.image || "https://via.placeholder.com/50"}
                        alt={item.product?.name || "Product"}
                        className="product-image"
                      />
                    </td>
                    <td>{item.product?.name || item.name || "Unnamed"}</td>
                    <td>₹{item.product?.price || item.price || 0}</td>
                    <td>{item.quantity}</td>
                    <td>₹{((item.product?.price || item.price || 0) * item.quantity).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <button
              onClick={() => removeOrder(order._id)}
              className="remove-order-btn"
            >
              <i className="fas fa-trash"></i>Remove Order
            </button>
          </div>
        ))
      )}
    </div>
  );
}
