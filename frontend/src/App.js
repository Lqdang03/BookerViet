import React, { useState, useEffect } from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Resgiter from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import Wishlist from "./pages/Wishlist";
import Cart from "./pages/Cart";
import HomePage from "./pages/HomePage";
import Header from "./components/reusable/Header";
import Footer from "./components/reusable/Footer";
import AdminLayout from "./components/reusable/AdminLayout";
import AdminDashboard from "./pages/AdminSite/AdminDashboard.js";
import axios from "axios";
import BookDetail from "./pages/BookDetail";
import AccountDetail from "./pages/AccountDetail";
import ChangePassword from "./pages/ChangePassword.js";
import BookResult from "./pages/BookResult.js";
import ViewBookByCategory from "./pages/ViewBookbyCategory.js";
import ComplaintPage from "./pages/ComplaintPage.js";
import OrderPage from "./pages/OrderPage.js";
import OrderSuccessPage from "./pages/OrderSuccessPage.js";
import TrackOrder from "./pages/TrackOrder.js";
import OrderManagement from "./pages/AdminSite/OrderManagement/OrderManagement.js";
import ReviewAndRatingManagement from "./pages/AdminSite/ReviewAndRatingManagement.js";
import ReportManagement from "./pages/AdminSite/ReportManagement.js";
import UserManagement from "./pages/AdminSite/UserManagement.js";
import BookManagement from "./pages/AdminSite/BookManagement.js";
import DiscountManagement from "./pages/AdminSite/DiscountManagement.js";

// Protected Route Components
const AdminRoute = ({ children }) => {
  const userRole = localStorage.getItem("userRole") || sessionStorage.getItem("userRole");
  const isAuthenticated = localStorage.getItem("token") || sessionStorage.getItem("token");
  
  if (!isAuthenticated || userRole !== "admin") {
    // Redirect to forbidden page if not authenticated as admin
    return <Navigate to="/forbidden" replace />;
  }
  
  return children;
};

// Route specifically for user content - prevent admin access
const UserOnlyRoute = ({ children }) => {
  const userRole = localStorage.getItem("userRole") || sessionStorage.getItem("userRole");
  
  // If the user is an admin, redirect to forbidden
  if (userRole === "admin") {
    return <Navigate to="/forbidden" replace />;
  }
  
  return children;
};

// Forbidden page component
const ForbiddenPage = () => {
  return (
    <div style={{ 
      padding: '50px 20px', 
      textAlign: 'center', 
      maxWidth: '600px', 
      margin: '0 auto' 
    }}>
      <h1 style={{ color: '#d32f2f', fontSize: '2rem' }}>403 - Truy cập bị từ chối</h1>
      <p style={{ fontSize: '1.1rem', marginTop: '20px' }}>
        Bạn không có quyền truy cập vào trang này. Vui lòng liên hệ admin nếu bạn cho rằng đây là lỗi.
      </p>
    </div>
  );
};

function App() {
  const [userEmail, setUserEmail] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [cartTotal, setCartTotal] = useState(0);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const storedEmail = localStorage.getItem("userEmail") || sessionStorage.getItem("userEmail");
    const storedRole = localStorage.getItem("userRole") || sessionStorage.getItem("userRole");
    setUserEmail(storedEmail);
    setUserRole(storedRole);

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

  const updateUserEmail = (email, role = null) => {
    setUserEmail(email);
    if (role) {
      setUserRole(role);
    }

    // If user logs in, fetch their data
    if (email) {
      fetchWishlistCount();
      fetchCartData();
    } else {
      // If user logs out, reset counts
      setWishlistCount(0);
      setCartTotal(0);
      setCartCount(0);
      setUserRole(null);
    }
  };

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
        {/* Admin Routes */}
        <Route path="/admin" element={
          <AdminRoute>
            <AdminLayout
              userEmail={userEmail}
              updateUserEmail={updateUserEmail}
            />
          </AdminRoute>
        }>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="books" element={<BookManagement />} />
          <Route path="orders" element={<OrderManagement />} />
          <Route path="discounts" element={<DiscountManagement />} />
          <Route path="review_rating" element={<ReviewAndRatingManagement />} />
          <Route path="reports" element={<ReportManagement />} />
        </Route>

        {/* Authentication Routes */}
        <Route path="/account/login" element={<Login onLoginSuccess={updateUserEmail} />} />
        <Route path="/account/register" element={<Resgiter />} />
        <Route path="/account/forgotpassword" element={<ForgotPassword />} />

        {/* User Routes - Protected from admin access */}
        <Route path="/user/wishlist" element={
          <UserOnlyRoute>
            <Wishlist updateWishlistCount={fetchWishlistCount} />
          </UserOnlyRoute>
        } />
        <Route path="/user/profile" element={
          <UserOnlyRoute>
            <AccountDetail />
          </UserOnlyRoute>
        } />
        <Route path="/user/change-password" element={
          <UserOnlyRoute>
            <ChangePassword />
          </UserOnlyRoute>
        } />
        <Route path="/cart" element={
          <UserOnlyRoute>
            <Cart updateCartData={fetchCartData} />
          </UserOnlyRoute>
        } />
        <Route path="/checkout" element={
          <UserOnlyRoute>
            <OrderPage />
          </UserOnlyRoute>
        } />
        <Route path="/payment-success" element={
          <UserOnlyRoute>
            <OrderSuccessPage updateCartData={fetchCartData} />
          </UserOnlyRoute>
        } />
        <Route path="/track-order" element={
          <UserOnlyRoute>
            <TrackOrder />
          </UserOnlyRoute>
        } />
        <Route path="/complaint" element={
          <UserOnlyRoute>
            <ComplaintPage />
          </UserOnlyRoute>
        } />

        {/* Public Routes */}
        <Route path="/book/:id" element={<BookDetail updateWishlistCount={fetchWishlistCount} updateCartData={fetchCartData} />} />
        <Route path="/book-result" element={<BookResult updateWishlistCount={fetchWishlistCount} updateCartData={fetchCartData} />} />
        <Route path="/" element={<HomePage updateWishlistCount={fetchWishlistCount} updateCartData={fetchCartData} />} />
        <Route path="/category/:id" element={<ViewBookByCategory updateWishlistCount={fetchWishlistCount} />} />
        
        {/* Forbidden/Error Route */}
        <Route path="/forbidden" element={<ForbiddenPage />} />
      </Routes>
      
      {!isAdminRoute && <Footer />}
    </>
  );
}

export default App;