import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import API from "../api";
import "./Navbar.css";

export default function Navbar() {
  const { user, admin, setUser, setAdmin, loadingAuth } = useContext(AuthContext);
  const [open, setOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false); // NEW for mobile
  const navigate = useNavigate();

  const logoutUser = async () => {
    try {
      await API.post("/logout", {}, { withCredentials: true });
      setUser(null);
      navigate("/login");
    } catch (err) {
      console.error(err);
    } finally {
      setOpen(false);
      setMobileMenu(false);
    }
  };

  const logoutAdmin = async () => {
    try {
      await API.post("/admin/logout", {}, { withCredentials: true });
      setAdmin(null);
      navigate("/admin/login");
    } catch (err) {
      console.error(err);
    } finally {
      setOpen(false);
      setMobileMenu(false);
    }
  };

  if (loadingAuth) return null;

  return (
    <>
      {/* Navbar (desktop view unchanged) */}
      <nav className="navbar">
        <div className="nav-left">
          <Link to="/" className="logo">
            <img
              src="https://i.postimg.cc/D0G8zN3d/20250813-201436.png"
              alt="Logo"
            />
          </Link>
        </div>

        <div className="nav-right desktop-menu">
          <Link to="/" className="nav-link">
            <i className="fa-solid fa-shop"></i> Products
          </Link>

          {!user && !admin && (
            <div className="login-dropdown">
              <button
                className="nav-btn gradient"
                onClick={() => setLoginOpen(!loginOpen)}
              >
                <i className="fa-solid fa-right-to-bracket"></i> Login{" "}
                <i className="fa-solid fa-caret-down"></i>
              </button>

              {loginOpen && (
                <div className="dropdown" onMouseLeave={() => setLoginOpen(false)}>
                  <button onClick={() => navigate("/login")}>
                    <i className="fa-solid fa-user"></i> User Login
                  </button>
                  <button onClick={() => navigate("/admin/login")}>
                    <i className="fa-solid fa-user-shield"></i> Admin Login
                  </button>
                </div>
              )}

              <Link to="/register" className="nav-btn gradient-outline">
                <i className="fa-solid fa-user-plus"></i> Register
              </Link>
            </div>
          )}

          {user && (
            <div className="profile-menu">
              <button className="profile-btn" onClick={() => setOpen((s) => !s)}>
                <i className="fa-solid fa-user"></i> {user.name}
              </button>
              {open && (
                <div className="dropdown" onMouseLeave={() => setOpen(false)}>
                  <button onClick={() => navigate("/profile")}>
                    <i className="fa-solid fa-id-card"></i> View Profile
                  </button>
                  <button onClick={() => navigate("/edit-profile")}>
                    <i className="fa-solid fa-pen-to-square"></i> Edit Profile
                  </button>
                  <button onClick={() => navigate("/cart")}>
                    <i className="fa-solid fa-cart-shopping"></i> Cart
                  </button>
                  <button onClick={() => navigate("/myOrders")}>
                    <i className="fa-solid fa-box"></i> My Orders
                  </button>
                  <button onClick={logoutUser}>
                    <i className="fa-solid fa-right-from-bracket"></i> Logout
                  </button>
                </div>
              )}
            </div>
          )}

          {admin && (
            <div className="profile-menu">
              <button className="profile-btn" onClick={() => setOpen((s) => !s)}>
                <i className="fa-solid fa-user-shield"></i> {admin.name}
              </button>
              {open && (
                <div className="dropdown" onMouseLeave={() => setOpen(false)}>
                  <button onClick={() => navigate("/admin/dashboard")}>
                    <i className="fas fa-tachometer-alt"></i> Admin Dashboard
                  </button>
                  <button onClick={() => navigate("/AllOrders")}>
                    <i className="fas fa-box"></i> Manage Orders
                  </button>
                  <button onClick={() => navigate("/ProductList")}>
                    <i className="fas fa-shopping-cart"></i> Manage Products
                  </button>
                  <button onClick={() => navigate("/AddProduct")}>
                    <i className="fas fa-plus-circle"></i> Add Products
                  </button>
                  <button onClick={logoutAdmin}>
                    <i className="fa-solid fa-right-from-bracket"></i> Admin Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Hamburger for mobile */}
        <button className="menu-btn" onClick={() => setMobileMenu(!mobileMenu)}>
          ☰
        </button>
      </nav>

      {/* Mobile Sidebar */}
      <div className={`mobile-nav ${mobileMenu ? "active" : ""}`}>
        <button className="close-btn" onClick={() => setMobileMenu(false)}>✖</button>
      

 


       

        {!user && !admin && (
          <>
          
            <Link to="/login" onClick={() => setMobileMenu(false)}>
              <i className="fa-solid fa-user"></i> User Login
            </Link>
            <Link to="/admin/login" onClick={() => setMobileMenu(false)}>
              <i className="fa-solid fa-user-shield"></i> Admin Login
            </Link>
            <Link to="/register" onClick={() => setMobileMenu(false)}>
              <i className="fa-solid fa-user-plus"></i> Register
            </Link>
          </>
        )}

        {user && (
          <>
              <div class="profile">
  <img src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png" alt="Profile" class="profile-icon" />
  <span class="username">{user.name}</span>
       </div>
        <Link to="/" onClick={() => setMobileMenu(false)}>
          <i className="fa-solid fa-shop"></i> Products
        </Link>
            <Link to="/profile" onClick={() => setMobileMenu(false)}>
              <i className="fa-solid fa-id-card"></i> View Profile
            </Link>
            <Link to="/edit-profile" onClick={() => setMobileMenu(false)}>
              <i className="fa-solid fa-pen-to-square"></i> Edit Profile
            </Link>
            <Link to="/cart" onClick={() => setMobileMenu(false)}>
              <i className="fa-solid fa-cart-shopping"></i> Cart
            </Link>
            <Link to="/myOrders" onClick={() => setMobileMenu(false)}>
              <i className="fa-solid fa-box"></i> My Orders
            </Link>
            <button onClick={logoutUser}>
              <i className="fa-solid fa-right-from-bracket"></i> Logout
            </button>
          </>
        )}

        {admin && (
          <>

                   <div class="profile">
  <img src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png" alt="Profile" class="profile-icon" />
  <span class="username">{admin.name}</span>
       </div>
            <Link to="/admin/dashboard" onClick={() => setMobileMenu(false)}>
              <i className="fas fa-tachometer-alt"></i> Admin Dashboard
            </Link>
            <Link to="/AllOrders" onClick={() => setMobileMenu(false)}>
              <i className="fas fa-box"></i> Manage Orders
            </Link>
            <Link to="/ProductList" onClick={() => setMobileMenu(false)}>
              <i className="fas fa-shopping-cart"></i> Manage Products
            </Link>
            <Link to="/AddProduct" onClick={() => setMobileMenu(false)}>
              <i className="fas fa-plus-circle"></i> Add Products
            </Link>
            <button onClick={logoutAdmin}>
              <i className="fa-solid fa-right-from-bracket"></i> Admin Logout
            </button>
          </>
        )}
      </div>
    </>
  );
}
