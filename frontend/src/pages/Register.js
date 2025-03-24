import React, { useState } from 'react';
import { Button, TextField, Divider, Typography, Dialog, DialogTitle, DialogContent, DialogActions, Snackbar, Alert } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import axios from 'axios';

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
  });
  const [otpDialogOpen, setOtpDialogOpen] = useState(false);
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ open: false, message: "", severity: "info" });

  const handleAlert = (message, severity = "info") => {
    setAlert({ open: true, message, severity });
  };

  const handleCloseAlert = () => {
    setAlert({ ...alert, open: false });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user types
    setError('');
  };

  const handleSendOTP = async () => {
    if (!formData.email || !formData.password || !formData.name || !formData.phone) {
      handleAlert('Vui lòng điền đầy đủ thông tin', 'error');
      return;
    }

    // Validate password length
    if (formData.password.length < 6) {
      handleAlert('Mật khẩu phải có ít nhất 6 ký tự', 'error');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(formData.email)) {
    handleAlert('Email không hợp lệ', 'error');
    return;
  }

    // Validate phone number
    const phoneRegex = /^[0-9]{10}$/;
  if (!phoneRegex.test(formData.phone)) {
    handleAlert('Số điện thoại không hợp lệ (10 số)', 'error');
    return;
  }

  try {
    setLoading(true);
    await axios.post('http://localhost:9999/auth/send-otp', {
      email: formData.email,
      type: 'register'
    });
    setOtpDialogOpen(true);
    handleAlert('Mã OTP đã được gửi đến email của bạn', 'success');
  } catch (error) {
    handleAlert(error.response?.data?.message || 'Có lỗi xảy ra khi gửi OTP. Vui lòng thử lại sau.', 'error');
  } finally {
    setLoading(false);
  }
};

const handleVerifyOTP = async () => {
  if (!otp) {
    handleAlert('Vui lòng nhập mã OTP', 'error');
    return;
  }

  try {
    setLoading(true);
    await axios.post('http://localhost:9999/auth/verify-otp', {
      email: formData.email,
      otp,
      type: 'register'
    });

    await axios.post('http://localhost:9999/auth/register', formData);

    setOtpDialogOpen(false);
    
    // Show success message in Snackbar
    handleAlert('Đăng ký thành công! Hệ thống sẽ tự chuyển bạn sang trang Login.', 'success');
    
    // Redirect after showing the message (with a slight delay)
    setTimeout(() => {
      navigate('/account/login', {
        state: {
          message: 'Đăng ký thành công! Hệ thống sẽ tự chuyển bạn sang trang Login.',
          credentials: {
            email: formData.email,
            password: formData.password
          }
        }
      });
    }, 2000); 
  } catch (error) {
    handleAlert(error.response?.data?.message || 'Có lỗi xảy ra khi xác thực OTP. Vui lòng thử lại.', 'error');
  } finally {
    setLoading(false);
  }
};

  const handleSubmit = async (e) => {
    e.preventDefault();
    handleSendOTP();
  };

  // Social login handlers
  const handleFacebookLogin = async () => {
    try {
      window.open(`${process.env.REACT_APP_API_URL}/auth/facebook`, '_self');
    } catch (error) {
      setError('Đăng nhập bằng Facebook thất bại. Vui lòng thử lại.');
    }
  };

  const handleGoogleLogin = async () => {
    try {
      window.open(`${process.env.REACT_APP_API_URL}/auth/google`, '_self');
    } catch (error) {
      setError('Đăng nhập bằng Google thất bại. Vui lòng thử lại.');
    }
  };

  // Styles for social login buttons
  const facebookButtonStyle = {
    flex: 1,
    borderColor: '#1877F2',
    color: '#1877F2',
    '&:hover': {
      backgroundColor: '#1877F2',
      borderColor: '#1877F2',
      color: 'white',
    }
  };

  const googleButtonStyle = {
    flex: 1,
    borderColor: '#DB4437',
    color: '#DB4437',
    '&:hover': {
      backgroundColor: '#DB4437',
      borderColor: '#DB4437',
      color: 'white',
    }
  };

  const resendOTP = async () => {
    try {
      setLoading(true);
      await handleSendOTP();
      handleAlert('Mã OTP mới đã được gửi đến email của bạn', 'success');
    } catch (error) {
      handleAlert('Không thể gửi lại mã OTP. Vui lòng thử lại sau.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="login-container" style={{
        maxWidth: '400px',
        margin: '40px auto',
        padding: '20px',
        boxShadow: '0 0 10px rgba(0,0,0,0.1)',
        borderRadius: '8px'
      }}>
        <h1 style={{ textAlign: 'center', marginBottom: '10px' }}>ĐĂNG KÝ</h1>

        <div style={{ textAlign: 'center', marginTop: '15px', marginBottom: '15px' }}>
          Đã có tài khoản, đăng nhập&nbsp;
          <Link to="/account/login" style={{ color: '#1976d2', textDecoration: 'none' }}>
            tại đây
          </Link>
        </div>

        {error && (
          <Typography color="error" style={{ marginBottom: '10px', textAlign: 'center' }}>
            {error}
          </Typography>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <TextField
            required
            fullWidth
            id="name"
            label="Họ & tên"
            name="name"
            value={formData.name}
            onChange={handleChange}
            error={!!error && !formData.name}
          />

          <TextField
            required
            fullWidth
            id="phone"
            label="Số điện thoại"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            error={!!error && !formData.phone}
          />

          <TextField
            required
            fullWidth
            id="email"
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            error={!!error && !formData.email}
          />

          <TextField
            required
            fullWidth
            name="password"
            label="Mật khẩu"
            type="password"
            value={formData.password}
            onChange={handleChange}
            error={!!error && (formData.password.length < 6)}
            helperText={formData.password.length < 6 ? "Mật khẩu phải có ít nhất 6 ký tự" : ""}
          />


          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading}
            style={{ marginTop: '5px', padding: '10px' }}
          >
            {loading ? 'Đang xử lý...' : 'Đăng ký'}
          </Button>

          <Divider sx={{ mt: 2, mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Hoặc đăng nhập bằng
            </Typography>
          </Divider>

          <div style={{ display: 'flex', gap: '10px' }}>
            <Button
              variant="outlined"
              onClick={handleFacebookLogin}
              sx={facebookButtonStyle}
              disabled={loading}
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
              onClick={handleGoogleLogin}
              sx={googleButtonStyle}
              disabled={loading}
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

        {/* OTP Dialog */}
        <Dialog open={otpDialogOpen} onClose={() => !loading && setOtpDialogOpen(false)} style={{ marginRight: "17px" }}>
          <DialogTitle>Xác thực OTP</DialogTitle>
          <DialogContent>
            <Typography variant="body2" style={{ marginBottom: '15px' }}>
              Mã OTP đã được gửi đến email {formData.email}
            </Typography>
            <TextField
              autoFocus
              margin="dense"
              label="Nhập mã OTP"
              fullWidth
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              error={!!error}
              helperText={error}
            />
            <Button
              onClick={resendOTP}
              disabled={loading}
              style={{ marginTop: '10px' }}
            >
              Gửi lại mã OTP
            </Button>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => !loading && setOtpDialogOpen(false)} disabled={loading}>
              Hủy
            </Button>
            <Button onClick={handleVerifyOTP} disabled={loading}>
              {loading ? 'Đang xác thực...' : 'Xác nhận'}
            </Button>
          </DialogActions>
        </Dialog>
      </div>

      {/* Snackbar to show OTP resend success message */}
       <>
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
  </>

    </div>
  );
}

export default Register;