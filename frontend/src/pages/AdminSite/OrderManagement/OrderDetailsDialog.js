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

  const calculateSubtotal = () => {
    return order.items.reduce((acc, item) => acc + (item.book.price * item.quantity), 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    let discount = 0;
    
    // Tính giảm giá từ discountUsed
    if (order.discountUsed) {
      if (order.discountUsed.type === 'fixed') {
        discount += order.discountUsed.value;
      } else if (order.discountUsed.type === 'percentage') {
        discount += (subtotal * order.discountUsed.value) / 100;
      }
    }
    
    // Thêm giảm giá từ totalDiscount nếu có
    if (order.totalDiscount) {
      discount += order.totalDiscount;
    }
    
    // Thêm giảm giá từ pointUsed nếu có
    if (order.pointUsed) {
      discount += order.pointUsed;
    }
    
    const shippingFee = order.shippingInfo.fee || 0;

    return subtotal - discount + shippingFee;
  };

  const getDiscountAmount = () => {
    if (!order.discountUsed) return 0;
    
    if (order.discountUsed.type === 'fixed') {
      return order.discountUsed.value;
    } else if (order.discountUsed.type === 'percentage') {
      return (calculateSubtotal() * order.discountUsed.value) / 100;
    }
    return 0;
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
            <Typography><strong>Phí ship:</strong> {(order.shippingInfo.fee || 0).toLocaleString('vi-VN')} VNĐ</Typography>
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

                  {/* Subtotal - Tổng sản phẩm */}
                  <TableRow>
                    <TableCell colSpan={3} align="right"><strong>Tổng tiền sản phẩm:</strong></TableCell>
                    <TableCell>{calculateSubtotal().toLocaleString('vi-VN')} VNĐ</TableCell>
                  </TableRow>

                  {/* Hiển thị thông tin phí ship */}
                  <TableRow>
                    <TableCell colSpan={3} align="right"><strong>Phí vận chuyển:</strong></TableCell>
                    <TableCell>{(order.shippingInfo.fee || 0).toLocaleString('vi-VN')} VNĐ</TableCell>
                  </TableRow>

                  {/* Hiển thị thông tin giảm giá nếu có */}
                  {order.discountUsed && order.discountUsed.value > 0 && (
                    <TableRow>
                      <TableCell colSpan={3} align="right">
                        <strong>Giảm giá {order.discountUsed.type === 'percentage' ? `(${order.discountUsed.value}%)` : ''}:</strong>
                      </TableCell>
                      <TableCell>-{getDiscountAmount().toLocaleString('vi-VN')} VNĐ</TableCell>
                    </TableRow>
                  )}

                  {/* Điểm sử dụng nếu có */}
                  {order.pointUsed > 0 && (
                    <TableRow>
                      <TableCell colSpan={3} align="right"><strong>Điểm sử dụng:</strong></TableCell>
                      <TableCell>-{order.pointUsed.toLocaleString('vi-VN')} VNĐ</TableCell>
                    </TableRow>
                  )}

                  {/* Tổng tiền */}
                  <TableRow>
                    <TableCell colSpan={3} align="right"><strong>Tổng cộng:</strong></TableCell>
                    <TableCell><strong>{calculateTotal().toLocaleString('vi-VN')} VNĐ</strong></TableCell>
                  </TableRow>
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