import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Login from "./pages/Login";
import Resgiter from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import Wishlist from "./pages/Wishlist";
import Cart from "./pages/Cart";
import HomePage from "./pages/HomePage";
import Header from "./components/reusable/Header";
import Footer from "./components/reusable/Footer";
import AdminLayout from "./components/reusable/AdminLayout";
import UserManagement from "./pages/AdminSite/UserManagerment";
import BookManagement from "./pages/AdminSite/BookManagerment";
import AdminDashboard from "./pages/AdminSite/AdminDashboard.js";
import axios from "axios";
import BookDetail from "./pages/BookDetail";

function App() {
  const [userEmail, setUserEmail] = useState(null);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [cartTotal, setCartTotal] = useState(0);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const storedEmail = localStorage.getItem("userEmail") || sessionStorage.getItem("userEmail");
    setUserEmail(storedEmail);

    if (storedEmail) {
      fetchWishlistCount();
      fetchCartData();
    }
  }, []);

  const fetchWishlistCount = async () => {
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      if (!token) return;

      const response = await axios.get("http://localhost:9999/user/wishlist", {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data && response.data.wishlist) {
        setWishlistCount(response.data.wishlist.length);
      }
    } catch (error) {
      console.error("Error fetching wishlist count:", error);
    }
  };

  const fetchCartData = async () => {
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      if (!token) return;

      const response = await axios.get("http://localhost:9999/cart", {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data && response.data.cartItems) {
        setCartCount(response.data.cartItems.length);
        setCartTotal(response.data.cartItems.reduce((sum, item) => sum + item.book.price * item.quantity, 0));
      }
    } catch (error) {
      console.error("Error fetching cart data:", error);
    }
  };

  const updateUserEmail = (email) => {
    setUserEmail(email);

    // If user logs in, fetch their data
    if (email) {
      fetchWishlistCount();
      fetchCartData();
    } else {
      // If user logs out, reset counts
      setWishlistCount(0);
      setCartTotal(0);
      setCartCount(0);
    }
  };
  console.log(AdminDashboard);
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");
  return (
    <>
      {!isAdminRoute &&
        <Header
          userEmail={userEmail}
          updateUserEmail={updateUserEmail}
          wishlistCount={wishlistCount}
          cartCount={cartCount}
          cartTotal={cartTotal}
        />
      }

      <Routes>
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={< AdminDashboard />} />

          <Route path="users" element={<UserManagement />} />
          <Route path="books" element={<BookManagement />} />
        </Route>
        <Route path="/account/login" element={<Login onLoginSuccess={updateUserEmail} />} />
        <Route path="/account/register" element={<Resgiter />} />
        <Route path="/account/forgotpassword" element={<ForgotPassword />} />
        <Route path="/book/:id" element={<BookDetail updateWishlistCount={fetchWishlistCount} updateCartData={fetchCartData} />} />
        <Route path="/" element={<HomePage updateWishlistCount={fetchWishlistCount} updateCartData={fetchCartData} />} />
        <Route path="/user/wishlist" element={<Wishlist updateWishlistCount={fetchWishlistCount} />} />
        <Route path="/cart" element={<Cart updateCartData={fetchCartData} />} />
      </Routes>
      {!isAdminRoute && <Footer />}
    </>
  );
}

export default App;