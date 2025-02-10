import { Button, TextField, Divider, Typography } from "@mui/material";
import React, { useState } from "react";
import { Link } from "react-router-dom";

// import axios from 'axios';

function Register() {
  // const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });

  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'rememberMe' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    // e.preventDefault();
    // try {
    //   const response = await axios.post('/api/login', formData);
    //   // Handle successful login
    //   navigate('/dashboard');
    // } catch (error) {
    //   console.error('Login failed:', error);
    // }
  };

  const handleGoogleLogin = () => {
    // Implement Google login logic
    console.log('Google login clicked');
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

  return (
    <div className="login-container" style={{
      maxWidth: '400px',
      margin: '40px auto',
      padding: '20px',
      boxShadow: '0 0 10px rgba(0,0,0,0.1)',
      borderRadius: '8px'
    }}>
      <h1 style={{ textAlign: 'center', marginBottom: '10px' }}>ĐĂNG KÝ</h1>

      <div style={{ textAlign: 'center', marginTop: '15px', marginBottom: '15px'}}>
        Đã có tài khoản, đăng nhập&nbsp;
        <Link 
          to="/account/login" 
          style={{ 
            color: '#1976d2', 
            textDecoration: 'none' 
          }}
        >
          tại đây
        </Link>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <TextField
          required
          fullWidth
          id="lastname"
          label="Họ"
          name="lastname"
          autoComplete="lastname"
          value={formData.lastname}
          onChange={handleChange}
        />

        <TextField
          required
          fullWidth
          id="firstname"
          label="Tên"
          name="firstname"
          autoComplete="firstname"
          value={formData.firstname}
          onChange={handleChange}
        />

        <TextField
          required
          fullWidth
          id="number"
          label="Số điện thoại"
          name="number"
          autoComplete="number"
          value={formData.number}
          onChange={handleChange}
        />

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

        <Button
          type="submit"
          fullWidth
          variant="contained"
          style={{ marginTop: '5px', padding: '10px' }}
        >
          Đăng Nhập
        </Button>
        
        <Divider sx={{ mb: 2 }} style={{marginTop: '10px'}}>
            <Typography variant="body2" color="text.secondary">
              Hoặc đăng nhập bằng
            </Typography>
        </Divider>

        <div style={{ display: 'flex', gap: '10px' }}>
          <Button
            variant="outlined"
            onClick={handleGoogleLogin}
            sx={facebookButtonStyle}
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
  );
}

export default Register;