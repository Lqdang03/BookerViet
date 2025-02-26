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
import AdminLayout from "./components/reusable/AdminLayout";
import UserManagement from "./pages/User_Managerment/UserManagerment";
import BookManagement from "./pages/Book_Managerment/BookManagerment";

function App() {
  const [userEmail, setUserEmail] = useState(null);

  useEffect(() => {
    const storedEmail = localStorage.getItem("userEmail") || sessionStorage.getItem("userEmail");
    setUserEmail(storedEmail);
  }, []);

  const updateUserEmail = (email) => {
    setUserEmail(email);
  };

  return (
    <BrowserRouter>
      <Header userEmail={userEmail} updateUserEmail={updateUserEmail} />
      <Routes>
        <Route path="/account/login" element={<Login onLoginSuccess={updateUserEmail} />} />
        <Route path="/account/register" element={<Resgiter />} />
        <Route path="/account/forgotpassword" element={<ForgotPassword />} />
        <Route path="/" element={<HomePage />} />
        <Route path="/user/wishlist" element={<Wishlist />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="users" element={<UserManagement />} />
          <Route path="books" element={<BookManagement />} />
        </Route>
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}

export default App;