import { Button, TextField, Snackbar, Alert } from "@mui/material";
import React, { useState } from "react";
import { Link } from "react-router-dom";
import Footer from "../components/reusable/Footer";
import Header from "../components/reusable/Header";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // Import useNavigate

function ForgotPassword() {
  const navigate = useNavigate(); // Khởi tạo navigate
  const [step, setStep] = useState(1); // 1: email, 2: OTP, 3: new password
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [alert, setAlert] = useState({ open: false, message: "", severity: "info" });
  const [loading, setLoading] = useState(false);


  const handleAlert = (message, severity = "info") => {
    setAlert({ open: true, message, severity });
  };

  const handleCloseAlert = () => {
    setAlert({ ...alert, open: false });
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true); // Bắt đầu loading
    try {
      const response = await axios.post("http://localhost:9999/auth/send-otp", {
        email,
        type: "reset-password"
      });
      handleAlert(response.data.message, "success");
      setStep(2);
    } catch (error) {
      handleAlert(error.response?.data?.message || "Lỗi gửi OTP!", "error");
    } finally {
      setLoading(false); // Kết thúc loading
    }
  };
  
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post("http://localhost:9999/auth/verify-otp", {
        email,
        otp,
        type: "reset-password"
      });
      handleAlert(response.data.message, "success");
      setStep(3);
    } catch (error) {
      handleAlert(error.response?.data?.message || "OTP không hợp lệ!", "error");
    } finally {
      setLoading(false);
    }
  };
  
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      handleAlert("Mật khẩu phải có ít nhất 6 ký tự!", "error");
      return;
    }
    if (newPassword !== confirmPassword) {
      handleAlert("Mật khẩu xác nhận không khớp!", "error");
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post("http://localhost:9999/auth/reset-password", {
        email,
        newPassword
      });
      handleAlert(response.data.message, "success");
      navigate("/account/login", {
        state: {
          credentials: { email, password: newPassword }
        }
      });
    } catch (error) {
      handleAlert(error.response?.data?.message || "Lỗi đặt lại mật khẩu!", "error");
    } finally {
      setLoading(false);
    }
  };

  

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <form onSubmit={handleSendOTP} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <TextField
              required
              fullWidth
              id="email"
              label="Email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              style={{ marginTop: '5px', padding: '10px' }}
            >
              {loading ? 'Đang xử lý...' : 'Gửi mã OTP'}
            </Button>
          </form>
        );
      case 2:
        return (
          <form onSubmit={handleVerifyOTP} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <TextField
              required
              fullWidth
              id="otp"
              label="Mã OTP"
              name="otp"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              style={{ marginTop: '5px', padding: '10px' }}
            >
              Xác nhận OTP
            </Button>
          </form>
        );
      case 3:
        return (
          <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <TextField
              required
              fullWidth
              id="newPassword"
              label="Mật khẩu mới"
              name="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <TextField
              required
              fullWidth
              id="confirmPassword"
              label="Xác nhận mật khẩu"
              name="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              style={{ marginTop: '5px', padding: '10px' }}
            >
              Đặt lại mật khẩu
            </Button>
          </form>
        );
      default:
        return null;
    }
  };

  return (
    <div>
      <Header/>
      <div className="login-container" style={{
        maxWidth: '400px',
        margin: '40px auto',
        padding: '20px',
        boxShadow: '0 0 10px rgba(0,0,0,0.1)',
        borderRadius: '8px'
      }}>
        <h1 style={{ textAlign: 'center', marginBottom: '20px' }}>QUÊN MẬT KHẨU</h1>
        
        {renderStep()}

        <div style={{ textAlign: 'center', marginTop: '15px' }}>
          Đã có tài khoản?&nbsp;
          <Link
            to="/account/login"
            style={{
              color: '#1976d2',
              textDecoration: 'none'
            }}
          >
            Đăng nhập
          </Link>
        </div>
      </div>
      <Footer />
      
      <Snackbar 
        open={alert.open} 
        autoHideDuration={6000} 
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseAlert} severity={alert.severity}>
          {alert.message}
        </Alert>
      </Snackbar>
    </div>
  );
}

export default ForgotPassword;