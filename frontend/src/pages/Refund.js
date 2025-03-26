import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Paper,
  Divider,
  Alert,
  Snackbar,
  Link
} from '@mui/material';

const Refund = () => {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const navigate = useNavigate(); // Use navigation hook

  // Refund policy constants
  const REFUND_DAYS_LIMIT = 3; // X days limit for returns

  const handleComplaintNavigation = (e) => {
    e.preventDefault(); // Prevent default link behavior
    navigate('/complaint'); // Use React Router's navigation
  };

  const renderRefundConditions = () => (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
        Điều Kiện Hoàn Trả Sách
      </Typography>
      <Divider sx={{ mb: 2 }} />
      <Typography variant="body1" component="div">
        <ul>
          <li>Chỉ được hoàn trả sách cho đơn hàng ở trạng thái <strong>"Đã giao"</strong></li>
          <li>Sách phải được trả trong vòng <strong>{REFUND_DAYS_LIMIT} ngày</strong> kể từ ngày nhận hàng</li>
          <li>Sách không được hư hỏng và không thuộc danh mục không được hoàn trả (sách sale)</li>
        </ul>
      </Typography>
    </Paper>
  );

  const renderComplaintSection = () => (
    <Paper elevation={3} sx={{ p: 3, mt: 3, backgroundColor: '#f0f0f0' }}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: 'primary.main' }}>
        Thông Tin Trả sách
      </Typography>
      <Typography variant="body1" sx={{ mb: 2 }}>
        Vui lòng gửi thông tin chi tiết của khách hàng và thông tin về sách đến{' '}
        <Link 
          component="button" // Change to button to use onClick
          onClick={handleComplaintNavigation}
          color="primary" 
          underline="hover"
          sx={{ fontWeight: 'bold' }}
        >
          Phản ánh khiếu nại
        </Link>
        . Chúng tôi sẽ liên hệ với bạn qua số điện thoại hoặc email trong thời gian sớm nhất.
      </Typography>
    </Paper>
  );

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold', textAlign: 'center' }}>
        Hoàn Trả Sách
      </Typography>

      {renderRefundConditions()}
      {renderComplaintSection()}

      {/* Snackbar for notifications */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setOpenSnackbar(false)} 
          severity={error ? 'error' : 'success'}
        >
          {error || success}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Refund;