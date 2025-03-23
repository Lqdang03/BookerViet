import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Card,
  CardContent,
  Grid,
  Alert,
  Snackbar,
  CircularProgress
} from '@mui/material';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import ComplaintBreadCrumb from '../components/Breadcrumbs/ComplaintBreadCrumb'; 

const ComplaintPage = () => {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    type: '',
    description: ''
  });
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check authentication on component mount
  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        
        if (!token) {
          setIsAuthenticated(false);
          setIsLoading(false);
          return;
        }

        const config = {
          headers: { 'Authorization': `Bearer ${token}` }
        };

        const response = await axios.get('http://localhost:9999/user/profile', config);
        if (response.data?.user) {
          setIsAuthenticated(true);
          fetchComplaints(); // Fetch complaints only when authenticated
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("Lỗi khi kiểm tra xác thực:", error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthentication();
  }, []);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const response = await axios.get('http://localhost:9999/user/complaint', {
        headers: { Authorization: `Bearer ${token}` }
      });
  
      // Sắp xếp complaint theo thời gian mới nhất
      const sortedComplaints = response.data.data.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
  
      setComplaints(sortedComplaints);
    } catch (err) {
      setError('Không thể tải phản ánh. Vui lòng thử lại sau.');
      console.error('Error fetching complaints:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.type) {
      setError('Vui lòng chọn loại phản ánh');
      setOpenSnackbar(true);
      return;
    }
    
    if (!formData.description || formData.description.trim() === '') {
      setError('Vui lòng nhập nội dung phản ánh');
      setOpenSnackbar(true);
      return;
    }
    
    try {
      setLoading(true);
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      await axios.post('http://localhost:9999/user/complaint', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setSuccess('Phản ánh đã được gửi thành công!');
      setOpenSnackbar(true);
      setFormData({ type: '', description: '' });
      fetchComplaints();
    } catch (err) {
      setError('Có lỗi xảy ra khi gửi phản ánh. Vui lòng thử lại sau.');
      setOpenSnackbar(true);
      console.error('Error submitting complaint:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (complaintId) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      await axios.delete(`http://localhost:9999/user/complaint/${complaintId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setSuccess('Hủy phản ánh thành công!');
      setOpenSnackbar(true);
      fetchComplaints();
    } catch (err) {
      setError('Có lỗi xảy ra khi hủy phản ánh. Vui lòng thử lại sau.');
      setOpenSnackbar(true);
      console.error('Error canceling complaint:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  // Helper function to format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'Đang chờ xử lý':
        return '#f57c00'; // orange
      case 'Đã tiếp nhận':
        return '#2196f3'; // blue
      case 'Đã giải quyết':
        return '#4caf50'; // green
      case 'Đã hủy':
        return '#f44336'; // red
      default:
        return '#757575'; // grey
    }
  };

  // Login page component
  const LoginPrompt = () => (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography variant="h5" component="h1" gutterBottom>
          Vui lòng đăng nhập để tiếp tục
        </Typography>
        <Typography variant="body1" sx={{ mb: 3, textAlign: 'center' }}>
          Bạn cần đăng nhập để xem và gửi phản ánh khiếu nại.
        </Typography>
        <Box sx={{ mt: 2 }}>
          <Button 
            variant="contained" 
            color="primary" 
            component={Link} 
            to="/account/login"
          >
            Đăng nhập
          </Button>
        </Box>
      </Paper>
    </Container>
  );

  // Show loading state
  if (isLoading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <>
      <ComplaintBreadCrumb/>
      <Container maxWidth="lg" sx={{ py: 2 }}>
        <Typography variant="h5" component="h1" sx={{ mb: 2, fontWeight: 'bold' }}>
            Phản Ánh Khiếu Nại
        </Typography>
        {!isAuthenticated ? (
          <LoginPrompt />
        ) : (
          <>
            <Grid container spacing={4}>
              {/* Complaint Form */}
              <Grid item xs={12} md={5}>
                <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                    Gửi phản ánh 
                  </Typography>
                  <Divider sx={{ mb: 3 }} />
                  
                  <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <FormControl fullWidth required>
                      <InputLabel id="complaint-type-label">Loại phản ánh</InputLabel>
                      <Select
                        labelId="complaint-type-label"
                        id="type"
                        name="type"
                        value={formData.type}
                        label="Loại phản ánh"
                        onChange={handleInputChange}
                      >
                        <MenuItem value="Web">Website</MenuItem>
                        <MenuItem value="Đơn hàng">Đơn hàng</MenuItem>
                        <MenuItem value="Khác">Khác</MenuItem>
                      </Select>
                    </FormControl>
                    
                    <TextField
                      id="description"
                      name="description"
                      label="Nội dung phản ánh"
                      multiline
                      rows={4}
                      fullWidth
                      required
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Mô tả chi tiết về vấn đề bạn gặp phải..."
                    />
                    
                    <Button 
                      type="submit" 
                      variant="contained" 
                      sx={{ 
                        bgcolor: '#187bcd', 
                        '&:hover': { bgcolor: '#1565c0' },
                        mt: 2
                      }}
                      disabled={loading}
                    >
                      {loading ? <CircularProgress size={24} color="inherit" /> : 'Gửi phản ánh'}
                    </Button>
                  </Box>
                </Paper>
              </Grid>
              
              {/* Complaints List */}
              <Grid item xs={12} md={7}>
                <Paper elevation={3} sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                    Lịch sử phản ánh
                  </Typography>
                  <Divider sx={{ mb: 3 }} />
                  
                  {loading && complaints.length === 0 ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                      <CircularProgress />
                    </Box>
                  ) : complaints.length > 0 ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {complaints.map((complaint) => (
                        <Card key={complaint._id} sx={{ mb: 2, border: '1px solid #ddd' }}>
                          <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                              <Typography variant="subtitle1" fontWeight="bold">
                                {complaint.type === 'Web' ? 'Website' : complaint.type}
                              </Typography>
                              <Box 
                                sx={{ 
                                  px: 1.5, 
                                  py: 0.5, 
                                  borderRadius: 1, 
                                  bgcolor: `${getStatusColor(complaint.status)}20`,
                                  color: getStatusColor(complaint.status),
                                  fontSize: '0.8rem',
                                  fontWeight: 'bold'
                                }}
                              >
                                {complaint.status}
                              </Box>
                            </Box>
                            
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                              Ngày tạo: {formatDate(complaint.createdAt)}
                            </Typography>
                            
                            <Typography variant="body1" sx={{ mb: 2, whiteSpace: 'pre-line' }}>
                              {complaint.description}
                            </Typography>
                            
                            {complaint.status === 'Đang chờ xử lý' && (
                              <Button 
                                variant="outlined" 
                                color="error" 
                                size="small"
                                onClick={() => handleCancel(complaint._id)}
                                disabled={loading}
                              >
                                Hủy phản ánh
                              </Button>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </Box>
                  ) : (
                    <Typography variant="body1" sx={{ textAlign: 'center', py: 3, color: 'text.secondary' }}>
                      Bạn chưa có phản ánh nào
                    </Typography>
                  )}
                </Paper>
              </Grid>
            </Grid>
          </>
        )}
        
        {/* Notifications */}
        <Snackbar
          open={openSnackbar}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert 
            onClose={handleCloseSnackbar} 
            severity={error ? 'error' : 'success'} 
            sx={{ width: '100%' }}
          >
            {error || success}
          </Alert>
        </Snackbar>
      </Container>
    </>
  );
};

export default ComplaintPage;