import { useEffect, useState } from "react";
import axios from "axios";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get("https://electronic-dukaan.onrender.com/orders", { withCredentials: true })
      .then(res => {
        setOrders(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ textAlign: "center", marginTop: 40 }}>
      <div className="spinner" style={{ marginBottom: 10 }}></div>
      <p>Loading orders...</p>
    </div>
  );

  if (orders.length === 0) return <p style={{ textAlign: "center", marginTop: 40 }}>You have no orders yet.</p>;

  const statusColor = (status) => {
    switch(status.toLowerCase()) {
      case "pending": return "#ff9800";
      case "completed": return "#4caf50";
      case "cancelled": return "#f44336";
      default: return "#777";
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "900px", margin: "auto", fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}>
      <h2 style={{ marginBottom: 25, color: "#007bff", textAlign: "center" }}>My Orders</h2>

      {orders.map(order => (
        <div key={order._id} style={{
          border: "1px solid #ddd",
          borderRadius: 12,
          padding: 20,
          marginBottom: 20,
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
          backgroundColor: "#fff"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 15 }}>
            <p><b>Order ID:</b> {order._id}</p>
            <p><b>Date:</b> {new Date(order.createdAt).toLocaleString()}</p>
          </div>

          <p><b>Status:</b> <span style={{ color: statusColor(order.status), fontWeight: "600" }}>{order.status}</span></p>
          <p><b>Payment Method:</b> <span style={{ color: 'green', fontWeight: "600" }}>{order.paymentMethod}</span></p>

          <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 10 }}>
            <thead>
              <tr style={{ backgroundColor: "#f0f0f0" }}>
                <th style={styles.th}>Product</th>
                <th style={styles.th}>Quantity</th>
                <th style={styles.th}>Price</th>
                <th style={styles.th}>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map(item => (
                <tr key={item.product._id} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={styles.td}>{item.product.name}</td>
                  <td style={styles.td}>{item.quantity}</td>
                  <td style={styles.td}>₹{item.price.toFixed(2)}</td>
                  <td style={styles.td}>₹{(item.price * item.quantity).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <p style={{ textAlign: "right", marginTop: 10, fontWeight: "600", fontSize: 16 }}>
            Total: ₹{order.totalAmount.toFixed(2)}
          </p>
        </div>
      ))}
    </div>
  );
}

const styles = {
  th: {
    textAlign: "left",
    padding: "8px",
    fontWeight: "600",
    fontSize: 14
  },
  td: {
    padding: "8px",
    fontSize: 14,
    color: "#333"
  }
};
