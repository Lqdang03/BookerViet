import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Resgiter from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import Wishlist from "./pages/Wishlist";
import Cart from "./pages/Cart";
import HomePage from "./pages/HomePage";
import Header from "./components/reusable/Header";
import Footer from "./components/reusable/Footer";
import axios from "axios";

function App() {
  const [userEmail, setUserEmail] = useState(null);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [cartTotal, setCartTotal] = useState(0);
  const [cartCount, setCartCount] = useState(0);
  const [cartItems, setCartItems] = useState([]);

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
            setCartCount(response.data.cartItems.length); // Cập nhật số lượng sách khác nhau
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
      setCartItems([]);
    }
  };

  // Create methods to update wishlist and cart counts from child components
  const updateWishlistCount = (count) => {
    setWishlistCount(count);
  };
  
  const updateCartData = () => {
    fetchCartData();
  };

  return (
    <BrowserRouter>
      <Header 
    userEmail={userEmail} 
    updateUserEmail={updateUserEmail}
    wishlistCount={wishlistCount}
    cartCount={cartCount} 
    cartTotal={cartTotal}
/>
      <Routes>
        <Route path="/account/login" element={<Login onLoginSuccess={updateUserEmail} />} />
        <Route path="/account/register" element={<Resgiter />} />
        <Route path="/account/forgotpassword" element={<ForgotPassword />} />
        <Route path="/" element={<HomePage updateWishlistCount={setWishlistCount} updateCartData={fetchCartData} />} />
<Route path="/user/wishlist" element={<Wishlist updateWishlistCount={setWishlistCount} />} />
<Route path="/cart" element={<Cart updateCartData={fetchCartData} />} />

      </Routes>
      <Footer />
    </BrowserRouter>
  );
}

export default App;