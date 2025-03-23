import React from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  Typography, Grid, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip
} from '@mui/material';

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
};

const OrderDetailsDialog = ({ open, order, onClose }) => {
  if (!order) return null;

  const calculateTotal = () => {
    return order.items.reduce((acc, item) => acc + (item.book.price * item.quantity), 0) 
           - (order.totalDiscount || 0) 
           - (order.pointUsed || 0);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Chi tiết đơn hàng #{order._id.slice(-6).toUpperCase()}</DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={3}>
          {/* Thông tin khách hàng */}
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>Thông tin khách hàng</Typography>
            <Typography><strong>Tên:</strong> {order.user?.name || 'N/A'}</Typography>
            <Typography><strong>Email:</strong> {order.user?.email || 'N/A'}</Typography>
          </Grid>

          {/* Thông tin vận chuyển */}
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>Thông tin vận chuyển</Typography>
            <Typography><strong>Địa chỉ:</strong> {order.shippingInfo.address}</Typography>
            <Typography><strong>Tỉnh/TP:</strong> {order.shippingInfo.provineName}</Typography>
            <Typography><strong>Quận/Huyện:</strong> {order.shippingInfo.districtName}</Typography>
            <Typography><strong>Phường/Xã:</strong> {order.shippingInfo.wardName}</Typography>
            <Typography><strong>SĐT:</strong> {order.shippingInfo.phoneNumber}</Typography>
          </Grid>

          {/* Thông tin thanh toán */}
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>Thông tin thanh toán</Typography>
            <Typography>
              <strong>Phương thức:</strong> {order.paymentMethod === 'COD' ? 'COD' : 'Online'}
            </Typography>
            <Typography>
              <strong>Trạng thái:</strong> 
              <Chip 
                label={order.paymentStatus === 'Pending' ? 'Chưa thanh toán' : 'Đã thanh toán'}
                color={order.paymentStatus === 'Pending' ? 'warning' : 'success'}
                size="small"
                sx={{ ml: 1 }}
              />
            </Typography>
          </Grid>

          {/* Thông tin đơn hàng */}
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>Thông tin đơn hàng</Typography>
            <Typography><strong>Ngày đặt:</strong> {formatDate(order.createdAt)}</Typography>
            <Typography><strong>Tổng tiền:</strong> {calculateTotal().toLocaleString('vi-VN')} VNĐ</Typography>
            {order.boxInfo && (
              <>
                <Typography><strong>Kích thước:</strong> {order.boxInfo.length}x{order.boxInfo.width}x{order.boxInfo.height} cm</Typography>
                <Typography><strong>Cân nặng:</strong> {order.boxInfo.weight} gram</Typography>
              </>
            )}
          </Grid>

          {/* Danh sách sản phẩm */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>Danh sách sản phẩm</Typography>
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Tên sản phẩm</TableCell>
                    <TableCell>Số lượng</TableCell>
                    <TableCell>Đơn giá</TableCell>
                    <TableCell>Thành tiền</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {order.items.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.book?.title}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>{item.book?.price.toLocaleString('vi-VN')} VNĐ</TableCell>
                      <TableCell>{(item.book?.price * item.quantity).toLocaleString('vi-VN')} VNĐ</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">Đóng</Button>
      </DialogActions>
    </Dialog>
  );
};

export default OrderDetailsDialog;