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
  Link,
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

const TrackOrder = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userEmail, setUserEmail] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    // Get user email from localStorage
    const email = localStorage.getItem("userEmail") || sessionStorage.getItem("userEmail");
    setUserEmail(email);
    
    // Simulate API call with a delay
    const timer = setTimeout(() => {
      // Mock data for orders with customer information
      const mockOrders = [
        {
          id: "ORD-123456",
          orderNumber: "BV25030801",
          date: "2025-03-08T10:30:00",
          status: "Đã xác nhận",
          totalAmount: 550000,
          subtotal: 540000,
          shippingCost: 30000,
          voucher: {
            code: "BOOKLOVER10",
            discount: 20000,
          },
          points: {
            used: 0,
            value: 0,
          },
          customer: {
            name: "Nguyễn Văn An",
            phone: "0901234567",
            email: "nguyenvanan@email.com"
          },
          items: [
            { id: 1, title: "Đắc Nhân Tâm", price: 150000, quantity: 1, image: "/images/dac-nhan-tam.jpg" },
            { id: 2, title: "Nhà Giả Kim", price: 120000, quantity: 1, image: "/images/nha-gia-kim.jpg" },
            { id: 3, title: "Tư Duy Phản Biện", price: 135000, quantity: 2, image: "/images/tu-duy-phan-bien.jpg" },
          ],
          shippingCode: "7891234",
          shippingCompany: "Giao Hàng Nhanh",
          shippingTrackUrl: "https://tracking.ghn.vn/?order_code=6789123",
          shippingStatus: "Đã giao",
          shippingAddress: "123 Nguyễn Văn Linh, Quận 7, TP. Hồ Chí Minh",
          paymentMethod: "Thanh toán khi nhận hàng (COD)",
        },
        {
          id: "ORD-123457",
          orderNumber: "BV25030502",
          date: "2025-03-05T14:45:00",
          status: "Đã xác nhận",
          totalAmount: 430000,
          subtotal: 430000,
          shippingCost: 35000,
          voucher: {
            code: "FREESHIP",
            discount: 35000,
          },
          points: {
            used: 0,
            value: 0,
          },
          customer: {
            name: "Trần Thị Bình",
            phone: "0912345678",
            email: "tranthibinh@email.com"
          },
          items: [
            { id: 4, title: "Đọc Vị Bất Kỳ Ai", price: 130000, quantity: 1, image: "/images/doc-vi-bat-ky-ai.jpg" },
            { id: 5, title: "Tâm Lý Học Đám Đông", price: 150000, quantity: 2, image: "/images/tam-ly-hoc-dam-dong.jpg" },
          ],
          shippingCode: "6789123",
          shippingCompany: "Giao Hàng Nhanh",
          shippingTrackUrl: "https://tracking.ghn.vn/?order_code=6789123",
          shippingStatus: "Đang vận chuyển",
          shippingAddress: "456 Lê Văn Lương, Quận 1, TP. Hồ Chí Minh",
          paymentMethod: "Chuyển khoản ngân hàng",
        },
        {
          id: "ORD-123458",
          orderNumber: "BV25030103",
          date: "2025-03-01T09:15:00",
          status: "Chờ xác nhận",
          totalAmount: 380000,
          subtotal: 380000,
          shippingCost: 30000,
          voucher: null,
          points: {
            used: 300,
            value: 30000,
          },
          customer: {
            name: "Lê Văn Cường",
            phone: "0978123456",
            email: "levancuong@email.com"
          },
          items: [
            { id: 6, title: "Cuộc Đời Kỳ Lạ Của Nikola Tesla", price: 180000, quantity: 1, image: "/images/nikola-tesla.jpg" },
            { id: 7, title: "Sapiens: Lược Sử Loài Người", price: 200000, quantity: 1, image: "/images/sapiens.jpg" },
          ],
          shippingCode: "",
          shippingCompany: "Giao Hàng Nhanh",
          shippingTrackUrl: "https://tracking.ghn.vn/?order_code=6789123",
          shippingStatus: "Chờ lấy hàng",
          shippingAddress: "789 Nguyễn Thị Minh Khai, Quận 3, TP. Hồ Chí Minh",
          paymentMethod: "Chuyển khoản ngân hàng",
        },
        {
          id: "ORD-123459",
          orderNumber: "BV25022504",
          date: "2025-02-25T11:20:00",
          status: "Đã hủy",
          totalAmount: 270000,
          subtotal: 270000,
          shippingCost: 25000,
          voucher: {
            code: "WELCOME15",
            discount: 40000,
          },
          points: {
            used: 150,
            value: 15000,
          },
          customer: {
            name: "Phạm Thị Dung",
            phone: "0987654321",
            email: "phamthidung@email.com"
          },
          items: [
            { id: 8, title: "Chủ Nghĩa Khắc Kỷ", price: 135000, quantity: 2, image: "/images/chu-nghia-khac-ky.jpg" },
          ],
          shippingCode: null,
          shippingCompany: null,
          shippingTrackUrl: null,
          shippingStatus: "Đã hủy",
          shippingAddress: "101 Lê Lợi, Quận 1, TP. Hồ Chí Minh",
          paymentMethod: "Thanh toán khi nhận hàng (COD)",
        },
      ];

      setOrders(mockOrders);
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleOpenDialog = (order) => {
    setSelectedOrder(order);
    setOpenDialog(true);
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
      case "Đã xác nhận":
        return "success";
      case "Chờ xác nhận":
        return "default";
      case "Đã hủy":
        return "error";
      default:
        return "default";
    }
  };

  const filteredOrders = statusFilter === "all" 
    ? orders 
    : orders.filter(order => order.status === statusFilter);

  return (
    <>
      <TrackOrderBreadCrumb/>
      <Container maxWidth="lg" sx={{ py: 2 }}>
       <Typography variant="h5" component="h1" sx={{ mb: 2, fontWeight: 'bold' }}>
          Theo dõi đơn hàng
        </Typography>
      
      {!userEmail ? (
        <Paper elevation={3} sx={{ p: 4, textAlign: "center" }}>
          <Typography variant="h6" gutterBottom>
            Vui lòng đăng nhập để xem đơn hàng của bạn
          </Typography>
          <Button
            component={RouterLink}
            to="/account/login"
            variant="contained"
            color="primary"
            sx={{ mt: 2 }}
          >
            Đăng nhập
          </Button>
        </Paper>
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
                      <MenuItem value="Chờ xác nhận">Chờ xác nhận</MenuItem>
                      <MenuItem value="Đã xác nhận">Đã xác nhận</MenuItem>
                      <MenuItem value="Đã hủy">Đã hủy</MenuItem>
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
                    <TableCell sx={{ fontWeight: "bold" }}>Tổng tiền</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Mã vận đơn</TableCell>
                    <TableCell align="center" sx={{ fontWeight: "bold" }}>Xem chi tiết</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredOrders.map((order, index) => (
                    <TableRow 
                      key={order.id}
                      sx={{ '&:hover': { backgroundColor: '#f9f9f9' } }}
                    >
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{order.orderNumber}</TableCell>
                      <TableCell>{formatDate(order.date)}</TableCell>
                      <TableCell>
                        <Chip
                          label={order.status}
                          color={getStatusColor(order.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{formatPrice(order.totalAmount)}</TableCell>
                      <TableCell>
                        {order.shippingCode ? (
                          <Link 
                            href={order.shippingTrackUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            sx={{ display: 'flex', alignItems: 'center' }}
                          >
                            {order.shippingCode}
                         
                          </Link>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell align="center">
                        <IconButton 
                          color="primary" 
                          onClick={() => handleOpenDialog(order)}
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
            {selectedOrder && (
              <>
                <DialogTitle sx={{ backgroundColor: "#f5f5f5", borderBottom: "1px solid #e0e0e0" }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Typography variant="h6">
                      Chi tiết đơn hàng
                    </Typography>
                  </Box>
                </DialogTitle>
                <DialogContent dividers>
                  {/* Customer Information */}
                  <Box
                    sx={{
                      p: 2,
                      mb: 3,
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
                            <strong>Họ tên:</strong> {selectedOrder.customer.name}
                          </Typography>
                        </Box>
                        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                          <PhoneIcon fontSize="small" sx={{ mr: 1, color: "#555" }} />
                          <Typography variant="body2">
                            <strong>Số điện thoại:</strong> {selectedOrder.customer.phone}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                          <EmailIcon fontSize="small" sx={{ mr: 1, color: "#555" }} />
                          <Typography variant="body2">
                            <strong>Email:</strong> {selectedOrder.customer.email}
                          </Typography>
                        </Box>
                        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                          <HomeIcon fontSize="small" sx={{ mr: 1, color: "#555" }} />
                          <Typography variant="body2">
                            <strong>Địa chỉ:</strong> {selectedOrder.shippingAddress}
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </Box>

                  {/* Order Products */}
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" gutterBottom sx={{ color: "#187bcd" }}>
                      Sản phẩm đã đặt
                    </Typography>
                    {selectedOrder.items.map((item) => (
                      <Box
                        key={item.id}
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
                            src={item.image} 
                            alt={item.title}
                            variant="rounded"
                            sx={{ width: 40, height: 55, mr: 2 }}
                          >
                            {item.title.charAt(0)}
                          </Avatar>
                          <Typography variant="body2">
                            {item.title} x{item.quantity}
                          </Typography>
                        </Box>
                        <Typography variant="body2">{formatPrice(item.price * item.quantity)}</Typography>
                      </Box>
                    ))}
                  </Box>

                  {/* Shipping Information */}
                  {selectedOrder.shippingCode && (
                    <Box sx={{ mb: 3, p: 2, backgroundColor: "#f9f9f9", borderRadius: 1, border: "1px solid #e0e0e0" }}>
                      <Typography variant="subtitle2" gutterBottom sx={{ color: "#187bcd" }}>
                        Thông tin vận chuyển
                      </Typography>
                      <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                        <InventoryIcon fontSize="small" sx={{ mr: 1, color: "#555" }} />
                        <Typography variant="body2">
                          <strong>Đơn vị vận chuyển:</strong> {selectedOrder.shippingCompany}
                        </Typography>
                      </Box>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <LocalShippingIcon fontSize="small" sx={{ mr: 1, color: "#555" }} />
                        <Typography variant="body2">
                          <strong>Mã vận đơn:</strong>{" "}
                          {selectedOrder.shippingTrackUrl ? (
                            <Link 
                              href={selectedOrder.shippingTrackUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              sx={{ display: 'inline-flex', alignItems: 'center' }}
                            >
                              {selectedOrder.shippingCode}
  
                            </Link>
                          ) : (
                            selectedOrder.shippingCode
                          )}
                        </Typography>
                      </Box>
                    </Box>
                  )}

                  {/* Order Summary */}
                  <Box sx={{ p: 2, backgroundColor: "#f9f9f9", borderRadius: 1, border: "1px solid #e0e0e0" }}>
                    <Typography variant="subtitle2" gutterBottom sx={{ color: "#187bcd" }}>
                      Tổng thanh toán
                    </Typography>
                    
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                      <Typography variant="body2">Tạm tính:</Typography>
                      <Typography variant="body2">{formatPrice(selectedOrder.subtotal)}</Typography>
                    </Box>
                    
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                      <Typography variant="body2">Phí vận chuyển:</Typography>
                      <Typography variant="body2">{formatPrice(selectedOrder.shippingCost)}</Typography>
                    </Box>
                    
                    {selectedOrder.voucher && (
                      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <DiscountIcon fontSize="small" color="error" sx={{ mr: 0.5 }} />
                          <Typography variant="body2">
                            Mã giảm giá <strong>{selectedOrder.voucher.code}</strong>:
                          </Typography>
                        </Box>
                        <Typography variant="body2" color="error">
                          -{formatPrice(selectedOrder.voucher.discount)}
                        </Typography>
                      </Box>
                    )}
                    
                    {selectedOrder.points && selectedOrder.points.used > 0 && (
                      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <LoyaltyIcon fontSize="small" color="secondary" sx={{ mr: 0.5 }} />
                          <Typography variant="body2">
                            Sử dụng <strong>{selectedOrder.points.used}</strong> điểm:
                          </Typography>
                        </Box>
                        <Typography variant="body2" color="secondary">
                          -{formatPrice(selectedOrder.points.value)}
                        </Typography>
                      </Box>
                    )}
                    
                    <Divider sx={{ my: 1 }} />
                    
                    <Box sx={{ display: "flex", justifyContent: "space-between", mt: 1 }}>
                      <Typography variant="subtitle2">Tổng cộng:</Typography>
                      <Typography variant="subtitle2" color="primary" sx={{ fontWeight: "bold" }}>
                        {formatPrice(selectedOrder.totalAmount)}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2">
                        <strong>Phương thức thanh toán:</strong> {selectedOrder.paymentMethod}
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