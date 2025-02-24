import { Button, TextField, Divider, Typography, Checkbox, FormControlLabel, Snackbar, Alert } from "@mui/material";
import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Footer from "../components/reusable/Footer";
import Header from "../components/reusable/Header";
import axios from 'axios';

function Login() {
  const navigate = useNavigate();
  const location = useLocation(); 
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [alert, setAlert] = useState({ open: false, message: "", severity: "info" });

  // Hiển thị thông báo Snackbar
  const handleAlert = (message, severity = "info") => {
    setAlert({ open: true, message, severity });
  };

  // Đóng thông báo
  const handleCloseAlert = () => {
    setAlert({ ...alert, open: false });
  };

  useEffect(() => {
    if (location.state?.credentials) {
      const { email, password } = location.state.credentials;
      setFormData(prev => ({
        ...prev,
        email,
        password
      }));
      navigate(location.pathname, { replace: true });
    }
  }, [location.state, location.pathname, navigate]);
  
  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'rememberMe' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:9999/auth/login', {
        email: formData.email,
        password: formData.password
      });

      if (formData.rememberMe) {
        localStorage.setItem('token', response.data.token);
        if (response.data.role) {
          localStorage.setItem('userRole', response.data.role);
        }
      } else {
        sessionStorage.setItem('token', response.data.token);
        if (response.data.role) {
          sessionStorage.setItem('userRole', response.data.role);
        }
      }

      setFormData({
        email: '',
        password: '',
        rememberMe: false
      });

      handleAlert("Đăng nhập thành công!", "success");
      navigate('/');
    } catch (error) {
      handleAlert(error.response?.data?.message || 'Đăng nhập thất bại. Vui lòng thử lại!', "error");
    }
  };

  return (
    <div>
      <Header />
      <div className="login-container" style={{
        maxWidth: '400px',
        margin: '40px auto',
        padding: '20px',
        boxShadow: '0 0 10px rgba(0,0,0,0.1)',
        borderRadius: '8px'
      }}>
        <h1 style={{ textAlign: 'center', marginBottom: '10px' }}>ĐĂNG NHẬP</h1>

        <div style={{ textAlign: 'center', marginTop: '15px', marginBottom: '15px' }}>
          Nếu bạn chưa có tài khoản,&nbsp;
          <Link to="/account/register" style={{ color: '#1976d2', textDecoration: 'none' }}>
            đăng ký tại đây
          </Link>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <TextField
            required
            fullWidth
            id="email"
            label="Email"
            name="email"
            autoComplete="email"
            value={formData.email}
            onChange={handleChange}
          />

          <TextField
            required
            fullWidth
            name="password"
            label="Mật khẩu"
            type="password"
            id="password"
            autoComplete="current-password"
            value={formData.password}
            onChange={handleChange}
          />

          <FormControlLabel
            control={
              <Checkbox 
                checked={formData.rememberMe}
                onChange={handleChange}
                name="rememberMe"
              />
            }
            label="Nhớ đến tôi"
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            style={{ marginTop: '5px', padding: '10px' }}
          >
            Đăng Nhập
          </Button>

          <div style={{ textAlign: 'center', marginTop: '5px' }}>
            <Link
              to="/account/forgotpassword"
              style={{
                color: 'black',
                textDecoration: 'none',
                '&:hover': {
                  color: '#1976d2'
                }
              }}
            >
              Quên mật khẩu
            </Link>
          </div>

          <Divider sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Hoặc đăng nhập bằng
            </Typography>
          </Divider>

          <div style={{ display: 'flex', gap: '10px' }}>
            <Button
              variant="outlined"
              fullWidth
              style={{
                borderColor: '#1877F2',
                color: '#1877F2'
              }}
            >
              <img
                src="https://www.facebook.com/favicon.ico"
                alt="Facebook icon"
                style={{ width: '16px', height: '16px', marginRight: '8px' }}
              />
              Facebook
            </Button>
            <Button
              variant="outlined"
              fullWidth
              style={{
                borderColor: '#DB4437',
                color: '#DB4437'
              }}
            >
              <img
                src="https://www.google.com/favicon.ico"
                alt="Google icon"
                style={{ width: '16px', height: '16px', marginRight: '8px' }}
              />
              Google
            </Button>
          </div>
        </form>
      </div>
      <Footer />

      {/* Snackbar giống ForgotPassword */}
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

export default Login;
