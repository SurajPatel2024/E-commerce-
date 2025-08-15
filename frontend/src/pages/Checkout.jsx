import { useEffect, useState } from "react";
import axios from "axios";

export default function Checkout() {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    axios.get("http://localhost:3000/cart", { withCredentials: true })
      .then(res => {
        setCart(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleCheckout = () => {
    axios.post("http://localhost:3000/checkout", {}, { withCredentials: true })
      .then(res => {
        setMessage(res.data.message);
        setCart([]);
      })
      .catch(err => {
        setMessage(err.response?.data?.error || "Checkout failed");
      });
  };

  if (loading) return <p>Loading cart...</p>;

  const total = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  return (
    <div style={{ padding: "20px" }}>
      <h2>Checkout</h2>
      {cart.length === 0 ? (
        <p>Your cart is empty</p>
      ) : (
        <>
          <ul>
            {cart.map(item => (
              <li key={item.product._id}>
                {item.product.name} - {item.quantity} × ₹{item.product.price}
              </li>
            ))}
          </ul>
          <h3>Total: ₹{total}</h3>
          <button onClick={handleCheckout}>Place Order</button>
        </>
      )}
      {message && <p>{message}</p>}
    </div>
  );
}
