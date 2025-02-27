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

function App() {
  const [userEmail, setUserEmail] = useState(null);

  useEffect(() => {
    const storedEmail = localStorage.getItem("userEmail") || sessionStorage.getItem("userEmail");
    setUserEmail(storedEmail);
  }, []);

  const updateUserEmail = (email) => {
    setUserEmail(email);
  };
  console.log(AdminDashboard);
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");
  return (
    <>
      {!isAdminRoute && <Header userEmail={userEmail} updateUserEmail={updateUserEmail} />}
      <Routes>
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={< AdminDashboard/>} />
          
          <Route path="users" element={<UserManagement />} />
          <Route path="books" element={<BookManagement />} />
        </Route>
        <Route path="/account/login" element={<Login onLoginSuccess={updateUserEmail} />} />
        <Route path="/account/register" element={<Resgiter />} />
        <Route path="/account/forgotpassword" element={<ForgotPassword />} />
        <Route path="/" element={<HomePage />} />
        <Route path="/user/wishlist" element={<Wishlist />} />
        <Route path="/cart" element={<Cart />} />
      </Routes>
      {!isAdminRoute && <Footer />}
    </>
  );
}

export default App;