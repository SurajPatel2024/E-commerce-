import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
import Cart from "./pages/Cart";
import Footer from "./components/Footer";
import AddProduct from "./admin/AddProduct";
import ProductList from "./admin/ProductList";
import Payment from "./pages/Profile";
import Orders from "./pages/Orders";
import AdminOrders from "./admin/AdminOrders";
import AdminLogin from "./admin/AdminLogin";
import AdminRegister from "./admin/AdminRegister";
import AdminDashboard from "./admin/AdminDashboard";
 
 
export default function App() {
  return ( 
    <Router>
      <Navbar />
      <main style={{ padding: "20px" }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/edit-profile" element={<EditProfile />} /> 
          <Route path="/cart" element={<Cart />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/AddProduct" element={<AddProduct/>}/>
          <Route path="/ProductList" element={<ProductList/>}/>
          <Route path="/myOrders" element={<Orders/>}/>
          <Route path="/AllOrders" element={<AdminOrders/>}/>
          <Route path="/admin/login" element={<AdminLogin/>}/>
          <Route path="/admin/register" element={<AdminRegister/>}/>
           
               <Route path="/admin/dashboard" element={<AdminDashboard/>} />
        </Routes>
      
      </main>
       <Footer/>
    </Router>
  );
}
