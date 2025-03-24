import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Typography, 
  Box, 
  Container, 
  Paper, 
  Grid, 
  List, 
  ListItem, 
  ListItemText, 
  Divider, 
  CircularProgress,
  Alert,
  Button
} from '@mui/material';
import { styled } from '@mui/material/styles';
import AccountBreadCrumb from '../components/Breadcrumbs/AccountBreadCrumb';

// Styled components
const AccountNavItem = styled(ListItem)(({ theme }) => ({
  padding: theme.spacing(1, 0),
  '&.active': {
    '& .MuiListItemText-primary': {
      color: theme.palette.primary.main,
      fontWeight: 'bold',
    }
  },
  '&:hover': {
    '& .MuiListItemText-primary': {
      color: theme.palette.primary.main,
    }
  }
}));

const InfoRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  marginBottom: theme.spacing(2)
}));

const InfoLabel = styled(Typography)(({ theme }) => ({
  fontWeight: 'bold',
  minWidth: 120
}));

const UserName = styled('span')(({ theme }) => ({
  color: theme.palette.error.main,
  fontWeight: 'bold'
}));

const AccountDetail = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        // Check for token in localStorage
        const token = localStorage.getItem('token');
        
        // Check for token in sessionStorage as a fallback
        const sessionToken = sessionStorage.getItem('token');
        
        // Use token from localStorage or sessionStorage
        const authToken = token || sessionToken;
        
        if (!authToken) {
          console.log("No authentication token found");
          setError('Không tìm thấy token xác thực! Vui lòng đăng nhập lại.');
          setIsAuthenticated(false);
          setLoading(false);
          return;
        }
        
        // Configure request with token
        const config = {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        };
        
        // Make API request with proper authorization header
        const response = await axios.get('http://localhost:9999/user/profile', config);
        
        console.log("Profile response:", response.data);
        
        // Check if response contains user data
        if (response.data && response.data.user) {
          setUser(response.data.user);
          setIsAuthenticated(true);
        } else {
          // Handle case where response doesn't have expected structure
          console.error("Invalid response format:", response.data);
          setError('Dữ liệu người dùng không hợp lệ');
          setIsAuthenticated(false);
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching user profile:", error);
        
        // Handle specific error cases
        if (error.response) {
          // Server responded with error status
          if (error.response.status === 401) {
            // Token is invalid or expired
            localStorage.removeItem('token');
            sessionStorage.removeItem('token');
            setError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
            setIsAuthenticated(false);
          } else {
            // Other server errors
            setError(`Lỗi server: ${error.response.data?.message || error.response.statusText}`);
            setIsAuthenticated(false);
          }
        } else if (error.request) {
          // Request made but no response received
          setError('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.');
          setIsAuthenticated(false);
        } else {
          // Error setting up request
          setError(`Lỗi: ${error.message}`);
          setIsAuthenticated(false);
        }
        
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [navigate]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
        <CircularProgress />
      </Box>
    );
  }

  // Login page component
  const LoginPrompt = () => (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
        <Paper elevation={3} sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography variant="h5" component="h1" gutterBottom>
                Vui lòng đăng nhập để tiếp tục
            </Typography>
            <Typography variant="body1" sx={{ mb: 3, textAlign: 'center' }}>
                Bạn cần đăng nhập để xem thông tin tài khoản của mình.
            </Typography>
            <Box sx={{ mt: 2 }}>
                <Button 
                    variant="contained" 
                    color="primary" 
                    component={Link} 
                    to="/login"
                >
                    Đăng nhập
                </Button>
            </Box>
        </Paper>
    </Container>
  );

  return (
    <>
    <AccountBreadCrumb/>
    <Container maxWidth="lg" sx={{ mt: 2, mb: 6 }}>
      {!isAuthenticated ? (
        <LoginPrompt />
      ) : (
        <Grid container spacing={4}>
          {/* Sidebar */}
          <Grid item xs={12} md={4} lg={3}>
            <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" component="h2" gutterBottom>
                TRANG TÀI KHOẢN
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                Xin chào, <UserName>{user?.name || ''}</UserName> !
              </Typography>
              
              <Divider sx={{ mb: 2 }} />
              
              <List component="nav" disablePadding>
                <AccountNavItem button component={Link} to="/user/profile" className="active">
                  <ListItemText primary="Thông tin tài khoản" />
                </AccountNavItem>

                <AccountNavItem button component={Link} to="/user/change-password">
                  <ListItemText primary="Đổi mật khẩu" />
                </AccountNavItem>
                
                <AccountNavItem button component={Link} to="/track-order">
                  <ListItemText primary="Đơn hàng của tôi" />
                </AccountNavItem>
              </List>
            </Paper>
          </Grid>
          
          {/* Main Content */}
          <Grid item xs={12} md={8} lg={9}>
            <Paper elevation={1} sx={{ p: 3 }}>
              <Typography variant="h6" component="h2" gutterBottom>
                THÔNG TIN TÀI KHOẢN
              </Typography>
              
              <Divider sx={{ mb: 3 }} />
              
              <Box sx={{ p: 2, bgcolor: 'background.paper' }}>
                <InfoRow>
                  <InfoLabel variant="body1">Họ tên:</InfoLabel>
                  <Typography variant="body1">{user?.name || 'Chưa cập nhật'}</Typography>
                </InfoRow>
                
                <InfoRow>
                  <InfoLabel variant="body1">Email:</InfoLabel>
                  <Typography variant="body1">{user?.email || 'Chưa cập nhật'}</Typography>
                </InfoRow>
                
                <InfoRow>
                  <InfoLabel variant="body1">Số điện thoại:</InfoLabel>
                  <Typography variant="body1">{user?.phone || 'Chưa cập nhật'}</Typography>
                </InfoRow>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      )}
    </Container>
    </>
  );
};

export default AccountDetail;