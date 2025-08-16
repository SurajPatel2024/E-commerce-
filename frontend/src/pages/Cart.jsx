import React, { useEffect, useState, useContext } from "react";
import "./Cart.css";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import API from "../api";   // ✅ Add this


export default function Cart() {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [paymentMethod, setPaymentMethod] = useState(""); 
  const { user, setUser } = useContext(AuthContext);  
  const navigate = useNavigate();
  useEffect(() => {
    fetchCart();
    fetchUser();
  }, []);

  const fetchCart = async () => {
    try {
      const res = await fetch("http://localhost:3000/cart", {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch cart");
      const data = await res.json();
      setCart(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error loading cart:", err);
      setCart([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchUser = async () => {
    try {
      const res = await API.get("/me");
      setUser(res.data);
    } catch (err) {
      console.error("Failed to fetch user:", err);
    }
  };

  const increaseQuantity = async (productId) => {
    await fetch(`http://localhost:3000/cart/${productId}/increase`, {
      method: "POST",
      credentials: "include",
    });
    fetchCart();
  };

  const decreaseQuantity = async (productId) => {
    await fetch(`http://localhost:3000/cart/${productId}/decrease`, {
      method: "POST",
      credentials: "include",
    });
    fetchCart();
  };

  const removeItem = async (productId) => {
    await fetch(`http://localhost:3000/cart/${productId}`, {
      method: "DELETE",
      credentials: "include",
    });
    fetchCart();
  };

  const handleCheckout = async () => {
    if (!paymentMethod) {
      setMessage("Please select a payment method first.");
      return;
    }
 
    // ✅ Address check
    const address = user?.address || {};
    if (!address.street || !address.pincode || !address.city || !address.state) {
      setMessage("⚠️Please complete your 📍Address before checkout.");
      setTimeout(() => navigate("/edit-profile"), 3000); // Redirect after 2s
      return;
    }

    try {
      const res = await fetch("http://localhost:3000/checkout", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentMethod }),
      });

        
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Checkout failed");
      setMessage(data.message || "Order placed successfully!");
      setCart([]);
      setPaymentMethod(""); // Reset payment
    } catch (err) {
      console.error("Checkout error:", err);
      setMessage(err.message);
    }
  };

  if (loading) return <p>Loading cart...</p>;

  const totalPrice = cart.reduce(
    (sum, item) => sum + (item.product?.price || item.price || 0) * (item.quantity || 1),
    0
  );

  return (
    <div className="cart-container">
      <h2>Your Cart</h2>
      {cart.length === 0 ? (
        <p>Cart is empty</p>
      ) : (
        <>
          <table className="cart-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Price</th>
                <th>Qty</th>
                <th>Total</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {cart.map((item, idx) => (
                <tr key={idx}>
                  <td>
                    <img
                      className="product-image"
                      src={item.product?.image || "https://via.placeholder.com/60"}
                      alt={item.product?.name || "Product"}
                    />
                  </td>
                  <td>{item.product?.name || item.name}</td>
                  <td>₹{item.product?.price || item.price}</td>
                  <td>
                    <div className="qty-controls">
                      <button
                        className="qty-btn"
                        onClick={() => decreaseQuantity(item.product?._id || item._id)}
                        disabled={(item.quantity || 1) <= 1}
                      >
                        -
                      </button>
                      <span className="qty-count">{item.quantity || 1}</span>
                      <button
                        className="qty-btn"
                        onClick={() => increaseQuantity(item.product?._id || item._id)}
                      >
                        +
                      </button>
                    </div>
                  </td>
                  <td>
                    ₹
                    {(
                      (item.product?.price || item.price || 0) *
                      (item.quantity || 1)
                    ).toFixed(2)}
                  </td>
                  <td>
                    <button
                      className="remove-btn"
                      onClick={() => removeItem(item.product?._id || item._id)}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="checkout-section">
            <h3>Total Price: ₹{totalPrice.toFixed(2)}</h3>

            {/* Payment Options */}
            {!paymentMethod && (
              <div className="payment-options">
                <h4>Select Payment Method:</h4>
                <label>
                  <input
                    type="radio"
                    name="payment"
                    value="Cash"
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
               <i className="fas fa-money-bill-wave"></i> Cash on Delivery
                </label>
                <label>
                  <input
                    type="radio"
                    name="payment"
                    value="Online"
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                 <i className="fas fa-credit-card"></i> Online Payment
                </label>
              </div>
            )}

            {/* Checkout button */}
            {paymentMethod && (
              <button className="checkout-btn" onClick={handleCheckout}>
                Checkout with {paymentMethod}
              </button>
            )}
          </div>
        </>
      )}

 
      {message && (
  <p style={{ color: "green", marginTop: "10px", fontWeight: "bold" }}>
    {message}
  </p>
)}

    </div>
  );
}
