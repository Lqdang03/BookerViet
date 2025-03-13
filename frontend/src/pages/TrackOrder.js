import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Paper,
  Box,
  Chip,
  Button,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
  Link,
  Divider,
  Grid,
  IconButton,
  Avatar,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import InventoryIcon from "@mui/icons-material/Inventory";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import PersonIcon from "@mui/icons-material/Person";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";
import HomeIcon from "@mui/icons-material/Home";
import DiscountIcon from "@mui/icons-material/Discount";
import LoyaltyIcon from "@mui/icons-material/Loyalty";
import { Link as RouterLink } from "react-router-dom";

const TrackOrder = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [userEmail, setUserEmail] = useState(null);

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
          date: "2025-03-08T10:30:00",
          status: "Đã giao hàng",
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
          shippingCompany: "Giao Hàng Tiết Kiệm",
          shippingStatus: "Đã giao",
          shippingAddress: "123 Nguyễn Văn Linh, Quận 7, TP. Hồ Chí Minh",
          paymentMethod: "Thanh toán khi nhận hàng (COD)",
        },
        {
          id: "ORD-123457",
          date: "2025-03-05T14:45:00",
          status: "Đang giao hàng",
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
          shippingStatus: "Đang vận chuyển",
          shippingAddress: "456 Lê Văn Lương, Quận 1, TP. Hồ Chí Minh",
          paymentMethod: "Chuyển khoản ngân hàng",
        },
        {
          id: "ORD-123458",
          date: "2025-03-01T09:15:00",
          status: "Đang chuẩn bị hàng",
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
          shippingCode: "VNP-5678912",
          shippingCompany: "Vietnam Post",
          shippingStatus: "Chờ lấy hàng",
          shippingAddress: "789 Nguyễn Thị Minh Khai, Quận 3, TP. Hồ Chí Minh",
          paymentMethod: "Chuyển khoản ngân hàng",
        },
        {
          id: "ORD-123459",
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
          shippingStatus: "Đã hủy",
          shippingAddress: "101 Lê Lợi, Quận 1, TP. Hồ Chí Minh",
          paymentMethod: "Thanh toán khi nhận hàng (COD)",
        },
      ];

      setOrders(mockOrders);
      setSearchResults(mockOrders);
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleSearch = () => {
    setIsSearching(true);
    
    // Simple search implementation
    const results = orders.filter(
      (order) =>
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.shippingCode && order.shippingCode.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    
    setSearchResults(results);
    setIsSearching(false);
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
      case "Đã giao hàng":
        return "success";
      case "Đang giao hàng":
        return "info";
      case "Đang chuẩn bị hàng":
        return "warning";
      case "Đã hủy":
        return "error";
      default:
        return "default";
    }
  };

  const getShippingUrl = (code, company) => {
    if (!code) return "#";
    
    switch (company) {
      case "Giao Hàng Tiết Kiệm":
        return `https://i.ghtk.vn/${code}`;
      case "Giao Hàng Nhanh":
        return `https://donhang.ghn.vn/?order_code=${code}`;
      case "Vietnam Post":
        return `https://donhang.vnpost.vn/tracking?${code}`;
      default:
        return "#";
    }
  };
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
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
                <Box sx={{ maxWidth: 500 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Tìm kiếm đơn hàng
                  </Typography>
                  <TextField
                    fullWidth
                    placeholder="Nhập mã đơn hàng hoặc mã vận đơn..."
                    variant="outlined"
                    size="small"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        handleSearch();
                      }
                    }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={handleSearch} size="small">
                            <SearchIcon />
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Box>
              </Grid>
              <Grid item xs={12} md={5}>
                <Box sx={{ display: "flex", alignItems: "center", mt: { xs: 1, md: 3 } }}>
                  <LocalShippingIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="body2">
                    Bạn có thể tra cứu thông tin các đơn hàng đã mua tại BookerViet
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>

          {isLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
              <CircularProgress />
            </Box>
          ) : searchResults.length === 0 ? (
            <Alert severity="info" sx={{ mb: 3 }}>
              Không tìm thấy đơn hàng nào{searchTerm ? ` cho tìm kiếm "${searchTerm}"` : ""}
            </Alert>
          ) : (
            <Box>
              <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
                <ReceiptLongIcon sx={{ mr: 1, verticalAlign: "middle" }} />
                Lịch sử đơn hàng 
                <Typography component="span" color="textSecondary" sx={{ ml: 1 }}>
                  ({searchResults.length} đơn hàng)
                </Typography>
              </Typography>

              {searchResults.map((order) => (
                <Paper
                  key={order.id}
                  elevation={2}
                  sx={{ mb: 3, overflow: "hidden", borderRadius: 2 }}
                >
                  <Box
                    sx={{
                      p: 2,
                      backgroundColor: "#f5f5f5",
                      borderBottom: "1px solid #e0e0e0",
                      display: "flex",
                      flexWrap: "wrap",
                      justifyContent: "space-between",
                      gap: 1,
                    }}
                  >
                    <Box>
                      <Typography variant="subtitle1" component="span" sx={{ fontWeight: "bold" }}>
                        Mã đơn hàng: {order.id}
                      </Typography>
                      <Typography variant="body2" color="textSecondary" sx={{ ml: 2, display: "inline" }}>
                        Ngày đặt: {formatDate(order.date)}
                      </Typography>
                    </Box>
                    <Chip
                      label={order.status}
                      color={getStatusColor(order.status)}
                      size="small"
                      sx={{ fontWeight: "medium" }}
                    />
                  </Box>

                  <Box sx={{ p: 2 }}>
                    {/* Customer Information */}
                    <Box
                      sx={{
                        p: 2,
                        mb: 2,
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
                              <strong>Họ tên:</strong> {order.customer.name}
                            </Typography>
                          </Box>
                          <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                            <PhoneIcon fontSize="small" sx={{ mr: 1, color: "#555" }} />
                            <Typography variant="body2">
                              <strong>Số điện thoại:</strong> {order.customer.phone}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                            <EmailIcon fontSize="small" sx={{ mr: 1, color: "#555" }} />
                            <Typography variant="body2">
                              <strong>Email:</strong> {order.customer.email}
                            </Typography>
                          </Box>
                          <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                            <HomeIcon fontSize="small" sx={{ mr: 1, color: "#555" }} />
                            <Typography variant="body2">
                              <strong>Địa chỉ:</strong> {order.shippingAddress}
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>
                    </Box>

                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" gutterBottom>
                        <strong>Sản phẩm:</strong>
                      </Typography>
                      {order.items.map((item) => (
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
                              {/* Fallback if image fails to load */}
                              {item.title.charAt(0)}
                            </Avatar>
                            <Typography variant="body2">
                              {item.title} x{item.quantity}
                            </Typography>
                          </Box>
                          <Typography variant="body2">{formatPrice(item.price * item.quantity)}</Typography>
                        </Box>
                      ))}
                      
                      {/* Order Summary with Vouchers and Points */}
                      <Box
                        sx={{
                          mt: 2,
                          p: 2,
                          backgroundColor: "#f9f9f9",
                          borderRadius: 1,
                          border: "1px solid #e0e0e0",
                        }}
                      >
                        <Typography variant="subtitle2" gutterBottom sx={{ color: "#187bcd" }}>
                          Tổng thanh toán
                        </Typography>
                        
                        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                          <Typography variant="body2">Tạm tính:</Typography>
                          <Typography variant="body2">{formatPrice(order.subtotal)}</Typography>
                        </Box>
                        
                        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                          <Typography variant="body2">Phí vận chuyển:</Typography>
                          <Typography variant="body2">{formatPrice(order.shippingCost)}</Typography>
                        </Box>
                        
                        {order.voucher && (
                          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                            <Box sx={{ display: "flex", alignItems: "center" }}>
                              <DiscountIcon fontSize="small" color="error" sx={{ mr: 0.5 }} />
                              <Typography variant="body2">
                                Mã giảm giá <strong>{order.voucher.code}</strong>:
                              </Typography>
                            </Box>
                            <Typography variant="body2" color="error">
                              -{formatPrice(order.voucher.discount)}
                            </Typography>
                          </Box>
                        )}
                        
                        {order.points && order.points.used > 0 && (
                          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                            <Box sx={{ display: "flex", alignItems: "center" }}>
                              <LoyaltyIcon fontSize="small" color="secondary" sx={{ mr: 0.5 }} />
                              <Typography variant="body2">
                                Sử dụng <strong>{order.points.used}</strong> điểm:
                              </Typography>
                            </Box>
                            <Typography variant="body2" color="secondary">
                              -{formatPrice(order.points.value)}
                            </Typography>
                          </Box>
                        )}
                        
                        <Divider sx={{ my: 1 }} />
                        
                        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 1 }}>
                          <Typography variant="subtitle2">Tổng cộng:</Typography>
                          <Typography variant="subtitle2" color="primary" sx={{ fontWeight: "bold" }}>
                            {formatPrice(order.totalAmount)}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>

                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <Typography variant="body2">
                          <strong>Phương thức thanh toán:</strong>
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {order.paymentMethod === "Thanh toán qua ví MoMo" || 
                           order.paymentMethod === "Thanh toán qua ZaloPay" 
                            ? "Chuyển khoản ngân hàng" 
                            : order.paymentMethod}
                        </Typography>
                      </Grid>
                    </Grid>

                    {order.shippingCode && (
                      <Box sx={{ mt: 2, p: 1.5, backgroundColor: "#f9f9f9", borderRadius: 1 }}>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <InventoryIcon color="primary" sx={{ mr: 1 }} />
                          <Typography variant="body2">
                            <strong>Đơn vị vận chuyển:</strong> {order.shippingCompany}
                          </Typography>
                        </Box>
                        <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                          <Typography variant="body2" sx={{ mr: 1 }}>
                            <strong>Mã vận đơn:</strong>
                          </Typography>
                          <Link 
                            href={getShippingUrl(order.shippingCode, order.shippingCompany)} 
                            target="_blank" 
                            rel="noopener"
                            sx={{ 
                              display: "inline-flex", 
                              alignItems: "center", 
                              color: "#187bcd",
                              '&:hover': { textDecoration: 'none' }
                            }}
                          >
                            {order.shippingCode}
                            <LocalShippingIcon fontSize="small" sx={{ ml: 0.5 }} />
                          </Link>
                          <Chip
                            label={order.shippingStatus}
                            size="small"
                            color={
                              order.shippingStatus === "Đã giao"
                                ? "success"
                                : order.shippingStatus === "Đang vận chuyển"
                                ? "info"
                                : "default"
                            }
                            sx={{ ml: 2 }}
                          />
                        </Box>
                      </Box>
                    )}
                  </Box>
                </Paper>
              ))}
            </Box>
          )}
        </>
      )}
    </Container>
  );
};

export default TrackOrder;