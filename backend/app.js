require("dotenv").config();
// ===== IMPORTS =====
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const cors = require("cors");
 
// ===== CONFIG ===== 
const app = express();
const SECRET_KEY = process.env.SECRET_KEY;
const PORT = process.env.PORT || 3000;
const DB_URI = process.env.DB_URI;

// ===== MIDDLEWARE =====
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// ===== DB CONNECTION =====
mongoose.connect(DB_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ Mongo error:", err));

// ===== MODELS =====
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    match: /^[A-Za-z\s]+$/
  },
  email: { type: String, unique: true, required: true },
  password: String,
  phone: { type: String },
  address: {
    street: { type: String },
    pincode: { type: String },
    landmark: { type: String },
    city: { type: String },
    state: { type: String }
  },
  // cart stores objects { product: ObjectId, quantity: Number }
  cart: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      quantity: { type: Number, default: 1, min: 1 }
    }
  ]
});
const User = mongoose.model("User", userSchema);

const productSchema = new mongoose.Schema({
  name: String,
  price: Number,
  image: String,
  description: String
});
const Product = mongoose.model("Product", productSchema);
 
const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  items: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
      price: { type: Number, required: true },
      quantity: { type: Number, required: true, min: 1 },
    },
  ],
  totalAmount: { type: Number, required: true },
   paymentMethod: { type: String, enum: ["Cash", "Online"], required: true },
  createdAt: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"],
    default: "Pending",
  },
  address: {  street: { type: String },
    pincode: { type: String },
    landmark: { type: String },
    city: { type: String },
    state: { type: String } },
   
});

const Order = mongoose.model("Order", orderSchema);


const adminSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, minlength: 3 },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6 },
});

// Hash password before saving
adminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Method to compare password
adminSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};
const Admin = mongoose.model("Admin", adminSchema);

const adminAuthMiddleware = (req, res, next) => {
  const token = req.cookies.authToken;
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    if (decoded.role !== "admin") {
      return res.status(403).json({ error: "Forbidden: Admins only" });
    }
    req.admin = decoded;
    next();
  } catch (err) {
    console.error("Admin JWT verify error:", err);
    return res.status(403).json({ error: "Invalid or expired token" });
  }
};
app.post("/admin/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(401).json({ error: "Incorrect email or password." });

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) return res.status(401).json({ error: "Incorrect email or password." });

    const token = jwt.sign(
      { id: admin._id, email: admin.email, role: "admin" },
      SECRET_KEY,
      { expiresIn: "1d" }
    );

    res.cookie("authToken", token, {
      httpOnly: true,
      secure: false, // true in production with HTTPS
      sameSite: "Lax",
      maxAge: 86400000,
    });

    res.json({ message: "Admin login successful" });
  } catch (err) {
    console.error("Admin login error:", err);
    res.status(500).json({ error: "Login failed" });
  }  
}); 

app.post("/admin/register", async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ error: "Email already registered" });
    }

    const admin = new Admin({ name, email, password });
    await admin.save();
    res.status(201).json({ message: "Admin registered successfully" });
  } catch (err) {
    console.error("Admin register error:", err);
    res.status(500).json({ error: "Registration failed" });
  }
});

app.post("/admin/logout" , (req, res) => {
  res.clearCookie("authToken", {
    httpOnly: true,
    sameSite: "Lax",
    secure: false
  });
  res.json({ message: "Logged out successfully" });
});


// ===== AUTH MIDDLEWARE =====
const authMiddleware = (req, res, next) => {
  const token = req.cookies.authToken;
  if (!token) return res.status(401).json({ error: "Unauthorized" });
  try {
    // jwt payload holds { id, email, name }
    req.user = jwt.verify(token, SECRET_KEY);
    next();
  } catch (err) {
    console.error("JWT verify error:", err);
    return res.status(403).json({ error: "Invalid or expired token" });
  }
};

// ===== AUTH ROUTES =====
app.post("/register", async (req, res) => {
  const { name, email, password, phone, address } = req.body;
  if (!/^[A-Za-z\s]+$/.test(name)) {
    return res.status(400).json({ error: "Name must only contain letters and spaces!" });
  }
  try {
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ error: "Email already used!" });
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword, phone, address });
    await newUser.save();
    res.json({ message: "User registered successfully" });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Registration failed" });
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: "Incorrect email or password." });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: "Incorrect email or password." });

    const token = jwt.sign(
      { id: user._id, email: user.email, name: user.name },
      SECRET_KEY,
      { expiresIn: "1h" }
    );
    res.cookie("authToken", token, {
      httpOnly: true,
      secure: false, // set true in production with https
      sameSite: "Lax",
      maxAge: 3600000
    });
    res.json({
      message: "Login successful",
      user: { id: user._id, name: user.name, email: user.email }
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Login failed" });
  }
});

app.post("/logout",  (req, res) => {
  res.clearCookie("authToken", {
    httpOnly: true,
    sameSite: "Lax",
    secure: false
  });
  res.json({ message: "Logged out successfully" });
});

// ===== USER PROFILE ROUTES =====
app.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select("-password")
      .populate("cart.product");
    res.json(user);
  } catch (err) {
    console.error("GET /me error:", err);
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

app.put("/profile", authMiddleware, async (req, res) => {
  try {
    const { name, email, phone, address } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    if (name) user.name = name;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    if (address) {
      user.address = {
        street: address.street || user.address.street,
        pincode: address.pincode || user.address.pincode,
        landmark: address.landmark || user.address.landmark,
        city: address.city || user.address.city,
        state: address.state || user.address.state,
      };
    }

    await user.save();
    const updatedUser = await User.findById(user._id).select("-password");
    res.json(updatedUser);
  } catch (err) {
    console.error("PUT /profile error:", err);
    res.status(500).json({ error: "Failed to update profile" });
  }
});

// ===== PRODUCT ROUTES =====
app.get("/products",  async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    console.error("GET /products error:", err);
    res.status(500).json({ message: "Failed to fetch products" });
  }
});

app.post("/products",adminAuthMiddleware, async (req, res) => {
  try {
    const { name, price, image, description } = req.body;
    if (!name || price == null || !image) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    const newProduct = new Product({ name, price, image, description });
    await newProduct.save();
    res.status(201).json({ message: "Product added", product: newProduct });
  } catch (error) {
    console.error("POST /products error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.delete("/products/:id",adminAuthMiddleware, async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product deleted" });
  } catch (err) {
    console.error("DELETE /products/:id error:", err);
    res.status(500).json({ message: "Failed to delete product" });
  }
});

app.put("/products/:id",adminAuthMiddleware, async (req, res) => {
  try {
    const { name, price, image, description } = req.body;
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { name, price, image, description },
      { new: true }
    );
    res.json({ message: "Product updated", product: updatedProduct });
  } catch (err) {
    console.error("PUT /products/:id error:", err);
    res.status(500).json({ message: "Failed to update product" });
  }
});

// ===== CART ROUTES =====
// Helper: find cart item index (works with various shapes safely)
function findCartItemByProductId(user, productId) {
  if (!user?.cart) return -1;
  return user.cart.findIndex(ci => {
    const pid = ci?.product;
    // pid may be ObjectId or populated object; compare using toString if available
    if (!pid) return false;
    try {
      return pid.toString() === productId.toString();
    } catch {
      // if pid is object with _id
      return (pid._id?.toString && pid._id.toString() === productId.toString());
    }
  });
}

// POST /cart  -> body: { productId, quantity }
app.post("/cart", authMiddleware, async (req, res) => {
  const { productId, quantity = 1 } = req.body;
  if (!productId) return res.status(400).json({ error: "productId is required" });

  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    const idx = findCartItemByProductId(user, productId);
    if (idx >= 0) {
      user.cart[idx].quantity = (user.cart[idx].quantity || 0) + Number(quantity);
    } else {
      user.cart.push({ product: productId, quantity: Number(quantity) });
    }

    await user.save();
    await user.populate("cart.product");
    res.json(user.cart);
  } catch (err) {
    console.error("POST /cart error:", err);
    res.status(500).json({ error: "Failed to add to cart" });
  }
});
  
// POST /cart/:productId  -> increment by 1 (convenience route)
app.post("/cart/:productId", authMiddleware, async (req, res) => {
  const { productId } = req.params;
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    const idx = findCartItemByProductId(user, productId);
    if (idx >= 0) {
      user.cart[idx].quantity = (user.cart[idx].quantity || 0) + 1;
    } else {
      user.cart.push({ product: productId, quantity: 1 });
    }

    await user.save();
    await user.populate("cart.product");
    res.json(user.cart);
  } catch (err) {
    console.error("POST /cart/:productId error:", err);
    res.status(500).json({ error: "Failed to add to cart" });
  }
});

// PUT /cart/:productId -> set exact quantity (body: { quantity })
app.put("/cart/:productId", authMiddleware, async (req, res) => {
  const { productId } = req.params;
  let { quantity } = req.body;
  quantity = Number(quantity);
  if (!Number.isInteger(quantity) || quantity < 0) {
    return res.status(400).json({ error: "quantity must be integer >= 0" });
  }

  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    const idx = findCartItemByProductId(user, productId);
    if (idx === -1) return res.status(404).json({ error: "Product not in cart" });

    if (quantity === 0) {
      // remove item
      user.cart.splice(idx, 1);
    } else {
      user.cart[idx].quantity = quantity;
    }

    await user.save();
    await user.populate("cart.product");
    res.json(user.cart);
  } catch (err) {
    console.error("PUT /cart/:productId error:", err);
    res.status(500).json({ error: "Failed to update quantity" });
  }
});

// POST /cart/:productId/increase -> +1
app.post("/cart/:productId/increase", authMiddleware, async (req, res) => {
  const { productId } = req.params;
  try {
    const user = await User.findById(req.user.id);
    const idx = findCartItemByProductId(user, productId);
    if (idx >= 0) {
      user.cart[idx].quantity = (user.cart[idx].quantity || 0) + 1;
    } else {
      user.cart.push({ product: productId, quantity: 1 });
    }
    await user.save();
    await user.populate("cart.product");
    res.json(user.cart);
  } catch (err) {
    console.error("POST /cart/:productId/increase error:", err);
    res.status(500).json({ error: "Failed to increase quantity" });
  }
});

// POST /cart/:productId/decrease -> -1 (minimum 1, or remove if reaches 0)
app.post("/cart/:productId/decrease", authMiddleware, async (req, res) => {
  const { productId } = req.params;
  try {
    const user = await User.findById(req.user.id);
    const idx = findCartItemByProductId(user, productId);
    if (idx === -1) return res.status(404).json({ error: "Product not in cart" });

    user.cart[idx].quantity = (user.cart[idx].quantity || 1) - 1;
    if (user.cart[idx].quantity <= 0) {
      user.cart.splice(idx, 1);
    }

    await user.save();
    await user.populate("cart.product");
    res.json(user.cart);
  } catch (err) {
    console.error("POST /cart/:productId/decrease error:", err);
    res.status(500).json({ error: "Failed to decrease quantity" });
  }
});

// GET /cart -> get user's populated cart
app.get("/cart", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("cart.product");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user.cart);
  } catch (err) {
    console.error("GET /cart error:", err);
    res.status(500).json({ error: "Failed to fetch cart" });
  }
});

// DELETE /cart/:productId -> remove item
app.delete("/cart/:productId", authMiddleware, async (req, res) => {
  try {
    const { productId } = req.params;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    user.cart = user.cart.filter(ci => {
      try {
        return ci.product.toString() !== productId.toString();
      } catch {
        // if ci.product missing or not comparable, keep item to avoid accidental deletion
        return true;
      }
    });

    await user.save();
    await user.populate("cart.product");
    res.json({ message: "Product removed from cart", cart: user.cart });
  } catch (err) {
    console.error("DELETE /cart/:productId error:", err);
    res.status(500).json({ error: "Failed to remove product from cart" });
  }
});

 

// POST /checkout -> create an order from all cart items
app.post("/checkout", authMiddleware, async (req, res) => {
  try {
    const { paymentMethod } = req.body;
    if (!paymentMethod) {
      return res.status(400).json({ error: "Payment method is required" });
    }

    const user = await User.findById(req.user.id).populate("cart.product");
    if (!user || !user.cart.length) {
      return res.status(400).json({ error: "Cart is empty" });
    }

    const orderItems = user.cart.map(item => ({
      product: item.product._id,
      price: item.product.price,
      quantity: item.quantity
    }));

    const totalAmount = orderItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

    const newOrder = new Order({
      user: user._id,
      address: user.address,
      items: orderItems,
      totalAmount,
      paymentMethod, // store payment method here
    });

    await newOrder.save();

    // Empty the cart
    user.cart = [];
    await user.save();

    res.status(201).json({ message: "Order placed successfully", order: newOrder });
  } catch (err) {
    console.error("POST /checkout error:", err);
    res.status(500).json({ error: "Failed to checkout" });
  }
});


// GET /orders -> get logged-in user's orders
app.get("/orders", authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate("items.product")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error("GET /orders error:", err);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// Example in Express.js
app.get("/admin/orders",adminAuthMiddleware, async (req, res) => {
  try {
    //  if (!req.user || !req.user.isAdmin) return res.status(403).json({ error: "Not authorized" });
        
    const orders = await Order.find()
        .populate("user", "name email phone ") // populate user name & email
      
        
      .populate("items.product", "name price image") // populate product details
      .sort({ createdAt: -1 }); // newest first

    res.json(orders);
  } catch (err) {
    console.error("Error fetching admin orders:", err);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});
// PATCH /admin/orders/:orderId
app.patch("/admin/orders/:orderId",adminAuthMiddleware, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: "Status is required" });
    }

    const allowedStatuses = [
      "Pending",
      "Processing",
      "Shipped",
      "Delivered",
      "Cancelled",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status value" });
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.json({ message: "Order status updated", order: updatedOrder });
  } catch (err) {
    console.error("Error updating order status:", err);
    res.status(500).json({ error: "Server error" });
  }
});

 app.delete("/admin/orders/:orderId",adminAuthMiddleware, async (req, res) => {
  try {
    const { orderId } = req.params;
    const deletedOrder = await Order.findByIdAndDelete(orderId);
    if (!deletedOrder) {
      return res.status(404).json({ error: "Order not found" });
    }
    res.json({ message: "Order deleted successfully" });
  } catch (err) {
    console.error("Error deleting order:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/admin/me", adminAuthMiddleware, async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin.id).select("-password");
    if (!admin) return res.status(404).json({ error: "Admin not found" });
    res.json(admin);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch admin details" });
  } 
});
 
// ===== START SERVER =====
app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
 