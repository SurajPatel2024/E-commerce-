import React, { useEffect, useState, useContext } from "react";
import "./Cart.css";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import API from "../api";    
import Loading from "../components/Loading";
export default function Cart() {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [paid, setPaid] = useState(false); 
  const [addressChecked, setAddressChecked] = useState(false);
  const { user, setUser } = useContext(AuthContext);  
  const navigate = useNavigate();

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const res = await fetch("https://electronic-dukaan.onrender.com/cart", {
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

  const increaseQuantity = async (productId) => {
    await fetch(`https://electronic-dukaan.onrender.com/cart/${productId}/increase`, {
      method: "POST",
      credentials: "include",
    });
    fetchCart();
  };

  const decreaseQuantity = async (productId) => {
    await fetch(`https://electronic-dukaan.onrender.com/cart/${productId}/decrease`, {
      method: "POST",
      credentials: "include",
    });
    fetchCart();
  };

  const removeItem = async (productId) => {
    await fetch(`https://electronic-dukaan.onrender.com/cart/${productId}`, {
      method: "DELETE",
      credentials: "include",
    });
    fetchCart();
  };

  // ✅ New: Check Address function
  const handleCheckAddress = () => {
    const address = user?.address || {};
    if (!address.street || !address.pincode || !address.city || !address.state) {
      setMessage("⚠️ Please complete your 📍Address before checkout.");
      setTimeout(() => navigate("/edit-profile"), 2000);
    } else {
      setAddressChecked(true);
    }
  };

  const handleCashCheckout = async () => {
    if (!paymentMethod) {
      setMessage("Please select a payment method first.");
      return;
    }
    try {
      const res = await fetch("https://electronic-dukaan.onrender.com/checkout", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentMethod: "Cash" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Checkout failed");
      setMessage("✅ Order placed with Cash on Delivery!");
      setCart([]);
    } catch (err) {
      console.error("Checkout error:", err);
      setMessage(err.message);
    }
  };

  const handleOnlineCheckout = async () => {
    try {
      const res = await fetch("https://electronic-dukaan.onrender.com/checkout", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentMethod: "Online" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Checkout failed");
      setMessage("✅ Order placed with Online Payment!");
      setCart([]);
    } catch (err) {
      console.error("Checkout error:", err);
      setMessage(err.message);
    }
  };

 
   if (loading) return <Loading text="Loading cart..." />;

  const totalPrice = cart.reduce(
    (sum, item) =>
      sum +
      (item.product?.price || item.price || 0) * (item.quantity || 1),
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
                        onClick={() =>
                          decreaseQuantity(item.product?._id || item._id)
                        }
                        disabled={(item.quantity || 1) <= 1}
                      >
                        -
                      </button>
                      <span className="qty-count">{item.quantity || 1}</span>
                      <button
                        className="qty-btn"
                        onClick={() =>
                          increaseQuantity(item.product?._id || item._id)
                        }
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

            {/* ✅ Step 1: Show Check Address Button */}
            {!addressChecked && (
              <button className="checkout-btn" onClick={handleCheckAddress}>
                Check Address
              </button>
            )}

            {/* ✅ Step 2: If address checked, then show payment method buttons */}
            {addressChecked && !paymentMethod && (
              <div className="payment-options">
                <h4>Select Payment Method:</h4>
                <div className="payment-buttons">
                  <button
                    className="checkout-btn"
                    onClick={() => setPaymentMethod("Cash")}
                  >
                    💵 Cash on Delivery
                  </button>
                  <button
                    className="checkout-btn"
                    onClick={() => setPaymentMethod("Online")}
                  >
                    💳 Online Payment (PayPal)
                  </button>
                </div>
              </div>
            )}

            {/* Cash Checkout */}
            {paymentMethod === "Cash" && (
              <button className="checkout-btn" onClick={handleCashCheckout}>
                Checkout with Cash
              </button>
            )}

            {/* PayPal Buttons */}
            {paymentMethod === "Online" && !paid && (
              <PayPalScriptProvider
                options={{
                  "client-id":
                    "AafAegu05e4ImWlAPI_ItcBSZVNOvZke4UWXzFfTcMfQvszFpbfb8s4TwvkPTPgeEEkQBGUpSYQm3ii5",
                  currency: "USD", // ⚠️ Sandbox works with USD
                }}
              >
                <PayPalButtons
                  style={{
                    layout: "vertical",
                    color: "blue",
                    shape: "pill",
                    label: "paypal",
                  }}
                  createOrder={(data, actions) => {
                    const priceINR = totalPrice;
                    const priceUSD = (priceINR / 83).toFixed(2); // 💱 convert INR → USD for sandbox
                    return actions.order.create({
                      purchase_units: [
                        {
                          description: "Your Product Order",
                          amount: {
                            currency_code: "USD",
                            value: priceUSD,
                          },
                        },
                      ],
                    });
                  }}
                  onApprove={async (data, actions) => {
                    const details = await actions.order.capture();
                    alert("✅ Transaction completed by " + details.payer.name.given_name);
                    setPaid(true);
                  }}
                  onError={(err) => {
                    console.error("❌ PayPal Checkout onError", err);
                    alert("Payment failed, please try again.");
                  }}
                />
              </PayPalScriptProvider>
            )}

            {/* Final Checkout Button */}
            {paymentMethod === "Online" && paid && (
              <button className="checkout-btn" onClick={handleOnlineCheckout}>
                Confirm Order (Online Paid)
              </button>
            )}
          </div>
        </>
      )}
      {message && <p className="checkout-message">{message}</p>}
    </div>
  );
}
