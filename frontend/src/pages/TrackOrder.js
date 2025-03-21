import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Paper,
  Box,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  Avatar,
  Divider,
  Tooltip,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import PersonIcon from "@mui/icons-material/Person";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";
import HomeIcon from "@mui/icons-material/Home";
import DiscountIcon from "@mui/icons-material/Discount";
import LoyaltyIcon from "@mui/icons-material/Loyalty";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import InventoryIcon from "@mui/icons-material/Inventory";

import { Link as RouterLink } from "react-router-dom";
import TrackOrderBreadCrumb from "../components/Breadcrumbs/TrackOrderBreadCrumb";
import axios from "axios";

const TrackOrder = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [dialogLoading, setDialogLoading] = useState(false);

  // Add isAuthenticated state
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication status
  useEffect(() => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    console.log('Token found:', !!token, token?.substring(0, 10) + '...');
    setIsAuthenticated(!!token);
    setIsLoading(false);
  }, []);

  // Fetch orders only if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
    }
  }, [isAuthenticated]);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      console.log('Fetching orders with token:', token?.substring(0, 10) + '...');

      const response = await axios.get('http://localhost:9999/order/my-orders', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log('Orders response:', response.data);
      setOrders(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err.response?.data?.message || 'Failed to fetch orders');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenDialog = async (orderId) => {
    try {
      setDialogLoading(true);
      const response = await axios.get(`http://localhost:9999/order/details/${orderId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token') || sessionStorage.getItem('token')}`,
        },
      });
      setSelectedOrder(response.data);
      setOpenDialog(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch order details');
      console.error('Error fetching order details:', err);
    } finally {
      setDialogLoading(false);
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    })
      .format(price)
      .replace("₫", "đ");
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("vi-VN", {
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Completed":
        return "success"
      case "Pending":
        return "default";
      case "Cancelled":
        return "error";
      default:
        return "default";
    }
  };

  const getOrderStatus = (status) => {
    switch (status) {
      case "Completed":
        return "Đã xác nhận";
      case "Pending":
        return "Chờ xác nhận";
      case "Cancelled":
        return "Đã hủy";
      default:
        return status;
    }
  };

  const getPaymentMethod = (method) => {
    return method === 'COD' ? 'Thanh toán khi nhận hàng (COD)' : 'Thanh toán online';
  };

  const calculateTotal = (order) => {
    if (!order || !order.items) return 0;

    const subtotal = order.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    const discount = order.totalDiscount || 0;
    const pointsUsed = order.pointUsed || 0;
    const shippingFee = order.shippingInfo?.fee || 0;

    return subtotal + shippingFee - discount - pointsUsed;
  };

  const filteredOrders = statusFilter === "all"
    ? orders
    : orders.filter(order => order.orderStatus === statusFilter);

  const truncateOrderId = (orderId) => {
    if (!orderId) return '';
    return orderId.length > 10 ? `${orderId.substring(0, 10)}...` : orderId;
  };

  // Login prompt component
  const LoginPrompt = () => (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography variant="h5" component="h1" gutterBottom>
          Vui lòng đăng nhập để tiếp tục
        </Typography>
        <Typography variant="body1" sx={{ mb: 3, textAlign: 'center' }}>
          Bạn cần đăng nhập để theo dõi đơn hàng của mình.
        </Typography>
        <Box sx={{mb: 2}}>
          <Button 
            variant="contained" 
            color="primary" 
            component={RouterLink} 
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
      <TrackOrderBreadCrumb />
      <Container maxWidth="lg" sx={{ py: 2 }}>
        <Typography variant="h5" component="h1" sx={{ mb: 2, fontWeight: 'bold' }}>
          Theo dõi đơn hàng
        </Typography>

        {!isAuthenticated ? (
          <LoginPrompt />
        ) : (
          <>
            <Paper
              elevation={3}
              sx={{
                p: 3,
                mb: 4,
                backgroundColor: "#f9f9f9",
                borderTop: "3px solid #187bcd",
              }}
            >
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={7}>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Typography variant="subtitle1" sx={{ mr: 2 }}>
                      Lọc theo trạng thái:
                    </Typography>
                    <FormControl variant="outlined" size="small" sx={{ minWidth: 200 }}>
                      <Select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        displayEmpty
                      >
                        <MenuItem value="all">Tất cả đơn hàng</MenuItem>
                        <MenuItem value="Completed">Đã xác nhận</MenuItem>
                        <MenuItem value="Pending">Chờ xác nhận</MenuItem>
                        <MenuItem value="Cancelled">Đã hủy</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                </Grid>
                <Grid item xs={12} md={5}>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <LocalShippingIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="body2">
                      Bạn có thể theo dõi trạng thái các đơn hàng tại BookerViet
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Paper>

            {isLoading ? (
              <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
                <CircularProgress />
              </Box>
            ) : error ? (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            ) : filteredOrders.length === 0 ? (
              <Alert severity="info" sx={{ mb: 3 }}>
                Không tìm thấy đơn hàng nào
              </Alert>
            ) : (
              <TableContainer component={Paper} elevation={2} sx={{ mb: 4 }}>
                <Table sx={{ minWidth: 650 }}>
                  <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: "bold" }}>STT</TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>Mã đơn hàng</TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>Ngày đặt</TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>Trạng thái</TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>Phương thức thanh toán</TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>Tổng tiền</TableCell>
                      <TableCell align="center" sx={{ fontWeight: "bold" }}>Xem chi tiết</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredOrders.map((order, index) => (
                      <TableRow
                        key={order._id}
                        sx={{ '&:hover': { backgroundColor: '#f9f9f9' } }}
                      >
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>
                          <Tooltip title={order._id} placement="top">
                            <span>{truncateOrderId(order._id)}</span>
                          </Tooltip>
                        </TableCell>
                        <TableCell>{formatDate(order.createdAt)}</TableCell>
                        <TableCell>
                          <Chip
                            label={getOrderStatus(order.orderStatus)}
                            color={getStatusColor(order.orderStatus)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{getPaymentMethod(order.paymentMethod)}</TableCell>
                        <TableCell>{formatPrice(calculateTotal(order))}</TableCell>
                        <TableCell align="center">
                          <IconButton
                            color="primary"
                            onClick={() => handleOpenDialog(order._id)}
                            title="Xem chi tiết"
                          >
                            <VisibilityIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            {/* Order Detail Modal */}
            <Dialog
              open={openDialog}
              onClose={handleCloseDialog}
              maxWidth="md"
              fullWidth
            >
              {dialogLoading ? (
                <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
                  <CircularProgress />
                </Box>
              ) : selectedOrder && (
                <>
                  <DialogTitle sx={{ backgroundColor: "#f5f5f5", borderBottom: "1px solid #e0e0e0" }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <Typography variant="h6">
                        Chi tiết đơn hàng #{selectedOrder._id}
                      </Typography>
                      <Chip
                        label={getOrderStatus(selectedOrder.orderStatus)}
                        color={getStatusColor(selectedOrder.orderStatus)}
                        size="small"
                      />
                    </Box>
                  </DialogTitle>
                  <DialogContent dividers>
                    {/* Customer Information */}
                    <Box
                      sx={{
                        p: 2,
                        mb: 1,
                        backgroundColor: "#f9f9f9",
                        borderRadius: 1,
                        border: "1px solid #e0e0e0",
                      }}
                    >
                      <Typography variant="subtitle2" gutterBottom sx={{ color: "#187bcd" }}>
                        Thông tin khách hàng
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                            <PersonIcon fontSize="small" sx={{ mr: 1, color: "#555" }} />
                            <Typography variant="body2">
                              <strong>Họ tên:</strong> {selectedOrder.shippingInfo.name}
                            </Typography>
                          </Box>
                          <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                            <PhoneIcon fontSize="small" sx={{ mr: 1, color: "#555" }} />
                            <Typography variant="body2">
                              <strong>Số điện thoại:</strong> {selectedOrder.shippingInfo.phoneNumber}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                            <HomeIcon fontSize="small" sx={{ mr: 1, color: "#555" }} />
                            <Typography variant="body2">
                              <strong>Địa chỉ:</strong> {selectedOrder.shippingInfo.address}, {selectedOrder.shippingInfo.wardName}, {selectedOrder.shippingInfo.districtName}, {selectedOrder.shippingInfo.provineName}
                            </Typography>
                          </Box>
                          {selectedOrder.shippingInfo.note && (
                            <Box sx={{ display: "flex", alignItems: "flex-start", mb: 1 }}>
                              <Typography variant="body2" sx={{ mr: 1 }}>
                                <strong>Ghi chú:</strong>
                              </Typography>
                              <Typography variant="body2">
                                {selectedOrder.shippingInfo.note}
                              </Typography>
                            </Box>
                          )}
                        </Grid>
                      </Grid>
                    </Box>

                    <Box sx={{ mb: 2, p: 2, backgroundColor: "#f9f9f9", borderRadius: 1, border: "1px solid #e0e0e0" }}>
                      <Typography variant="body2">
                        <strong>Phương thức thanh toán:</strong> {getPaymentMethod(selectedOrder.paymentMethod)}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Trạng thái thanh toán:</strong> {selectedOrder.paymentStatus === 'Completed' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Ngày đặt hàng:</strong> {formatDate(selectedOrder.createdAt)}
                      </Typography>
                    </Box>
                    {/* Order Products */}
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle2" gutterBottom sx={{ color: "#187bcd" }}>
                        Sản phẩm đã đặt
                      </Typography>
                      {selectedOrder.items.map((item, index) => (
                        <Box
                          key={index}
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            py: 1,
                            borderBottom: "1px dashed #e0e0e0",
                          }}
                        >
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <Avatar
                              variant="rounded"
                              sx={{ width: 40, height: 55, mr: 2 }}
                            >
                              {item.book?.title?.charAt(0) || "B"}
                            </Avatar>
                            <Box>
                              <Typography variant="body2">
                                {item.book?.title || "Sách"}
                              </Typography>
                              <Typography variant="caption" display="block">
                                Số lượng: {item.quantity}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {formatPrice(item.price)}
                              </Typography>
                            </Box>
                          </Box>
                          <Typography variant="body2" fontWeight="bold">
                            {formatPrice(item.price * item.quantity)}
                          </Typography>
                        </Box>
                      ))}
                    </Box>

                    {/* Shipping Information */}
                    {selectedOrder.trackingNumber && (
                      <Box sx={{ mb: 3, p: 2, backgroundColor: "#f9f9f9", borderRadius: 1, border: "1px solid #e0e0e0" }}>
                        <Typography variant="subtitle2" gutterBottom sx={{ color: "#187bcd" }}>
                          Thông tin vận chuyển
                        </Typography>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <LocalShippingIcon fontSize="small" sx={{ mr: 1, color: "#555" }} />
                          <Typography variant="body2">
                            <strong>Mã vận đơn:</strong> {selectedOrder.trackingNumber}
                          </Typography>
                        </Box>
                      </Box>
                    )}

                    {/* Package Information */}
                    {selectedOrder.boxInfo && (
                      <Box sx={{ mb: 3, p: 2, backgroundColor: "#f9f9f9", borderRadius: 1, border: "1px solid #e0e0e0" }}>
                        <Typography variant="subtitle2" gutterBottom sx={{ color: "#187bcd" }}>
                          Thông tin kiện hàng
                        </Typography>
                        <Grid container spacing={2}>
                          <Grid item xs={6} sm={3}>
                            <Typography variant="body2">
                              <strong>Chiều dài:</strong> {selectedOrder.boxInfo.length} cm
                            </Typography>
                          </Grid>
                          <Grid item xs={6} sm={3}>
                            <Typography variant="body2">
                              <strong>Chiều rộng:</strong> {selectedOrder.boxInfo.width} cm
                            </Typography>
                          </Grid>
                          <Grid item xs={6} sm={3}>
                            <Typography variant="body2">
                              <strong>Chiều cao:</strong> {selectedOrder.boxInfo.height} cm
                            </Typography>
                          </Grid>
                          <Grid item xs={6} sm={3}>
                            <Typography variant="body2">
                              <strong>Cân nặng:</strong> {selectedOrder.boxInfo.weight} kg
                            </Typography>
                          </Grid>
                        </Grid>
                      </Box>
                    )}

                    {/* Order Summary */}
                    <Box sx={{ p: 2, backgroundColor: "#f9f9f9", borderRadius: 1, border: "1px solid #e0e0e0" }}>
                      <Typography variant="subtitle2" gutterBottom sx={{ color: "#187bcd" }}>
                        Tổng thanh toán
                      </Typography>

                      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                        <Typography variant="body2">Tạm tính:</Typography>
                        <Typography variant="body2">
                          {formatPrice(selectedOrder.items.reduce((total, item) => total + (item.price * item.quantity), 0))}
                        </Typography>
                      </Box>

                      {selectedOrder.shippingInfo.fee > 0 && (
                        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                          <Typography variant="body2">Phí vận chuyển:</Typography>
                          <Typography variant="body2">
                            {formatPrice(selectedOrder.shippingInfo.fee)}
                          </Typography>
                        </Box>
                      )}

                      {selectedOrder.totalDiscount > 0 && (
                        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <DiscountIcon fontSize="small" color="error" sx={{ mr: 0.5 }} />
                            <Typography variant="body2">
                              Mã giảm giá:
                            </Typography>
                          </Box>
                          <Typography variant="body2" color="error">
                            -{formatPrice(selectedOrder.totalDiscount)}
                          </Typography>
                        </Box>
                      )}

                      {selectedOrder.pointUsed > 0 && (
                        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <LoyaltyIcon fontSize="small" color="secondary" sx={{ mr: 0.5 }} />
                            <Typography variant="body2">
                              Sử dụng điểm:
                            </Typography>
                          </Box>
                          <Typography variant="body2" color="secondary">
                            -{formatPrice(selectedOrder.pointUsed)}
                          </Typography>
                        </Box>
                      )}

                      <Divider sx={{ my: 1 }} />

                      <Box sx={{ display: "flex", justifyContent: "space-between", mt: 1 }}>
                        <Typography variant="subtitle2">Tổng cộng:</Typography>
                        <Typography variant="subtitle2" color="primary" sx={{ fontWeight: "bold" }}>
                          {formatPrice(calculateTotal(selectedOrder))}
                        </Typography>
                      </Box>
                    </Box>
                  </DialogContent>
                  <DialogActions>
                    <Button onClick={handleCloseDialog} color="primary">
                      Đóng
                    </Button>
                  </DialogActions>
                </>
              )}
            </Dialog>
          </>
        )}
      </Container>
    </>
  );
};

export default TrackOrder;