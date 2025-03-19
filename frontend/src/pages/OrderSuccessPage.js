import React, { useState, useEffect } from "react";
import { 
  Container, Typography, Button, Box, Paper, Grid, Divider, Card, CardContent, 
  Avatar, Chip, Alert, CircularProgress, Snackbar
} from "@mui/material";
import { Link, useLocation, useNavigate } from "react-router-dom";
import CheckIcon from "@mui/icons-material/Check";
import ErrorIcon from "@mui/icons-material/Error";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import PaymentIcon from "@mui/icons-material/Payment";
import PersonIcon from "@mui/icons-material/Person";
import ReceiptIcon from "@mui/icons-material/Receipt";
import axios from "axios";

function OrderSuccessPage({ updateCartData }) {
  const [orderDetails, setOrderDetails] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState({
    isProcessing: true,
    success: false,
    message: ""
  });
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const loadOrderDetails = () => {
      // Get order details from localStorage
      const storedOrder = localStorage.getItem("latestOrder");
      if (storedOrder) {
        try {
          const parsedOrder = JSON.parse(storedOrder);
          setOrderDetails(parsedOrder);
          return parsedOrder;
        } catch (err) {
          console.error("Error parsing stored order:", err);
        }
      }
      return null;
    };

    const processPaymentResponse = async () => {
      try {
        // Extract payment status from URL parameters
        const queryParams = new URLSearchParams(location.search);
        const vnpResponseCode = queryParams.get("vnp_ResponseCode");
        const orderId = queryParams.get("vnp_TxnRef");
        
        console.log("Payment response:", { vnpResponseCode, orderId });
        
        // Load order details first
        const orderData = loadOrderDetails();
        
        // If URL has payment gateway parameters, process them
        if (vnpResponseCode) {
          await handlePaymentResponse(vnpResponseCode, orderId);
        } else if (orderData) {
          // If no payment parameters, assume it's a COD order
          setPaymentStatus({
            isProcessing: false,
            success: true,
            message: "Đơn hàng của bạn đã được đặt thành công!"
          });
          setSnackbarOpen(true);
        } else {
          // No order found
          setPaymentStatus({
            isProcessing: false,
            success: false,
            message: "Không tìm thấy thông tin đơn hàng."
          });
          setSnackbarOpen(true);
        }
      } catch (error) {
        console.error("Error processing payment response:", error);
        setPaymentStatus({
          isProcessing: false,
          success: false,
          message: "Đã xảy ra lỗi khi xử lý thông tin thanh toán."
        });
        setSnackbarOpen(true);
      }
    };
    
    // Reset cart count in header when order success page loads
    if (typeof updateCartData === "function") {
      updateCartData();
    }
    
    // Process the payment
    processPaymentResponse();
  }, [location.search, updateCartData]);
  
  const handlePaymentResponse = async (responseCode, orderId) => {
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      
      // Debug logging
      console.log("Processing payment with code:", responseCode);
      
      // Optional: Verify payment status with backend for better security
      if (token && orderId) {
        try {
          const response = await axios.get(`http://localhost:9999/payment/status/${orderId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          console.log("Backend payment verification response:", response.data);
          
          if (response.data.success) {
            setPaymentStatus({
              isProcessing: false,
              success: true,
              message: "Thanh toán thành công! Đơn hàng của bạn đã được xác nhận."
            });
            setSnackbarOpen(true);
            return;
          }
        } catch (error) {
          console.error("Backend payment verification failed:", error);
          // Continue with client-side verification if backend fails
        }
      }
      
      // If no backend verification or it failed, use the URL parameters
      if (responseCode === "00") {
        setPaymentStatus({
          isProcessing: false,
          success: true,
          message: "Thanh toán thành công! Đơn hàng của bạn đã được xác nhận."
        });
        setSnackbarOpen(true);
      } else {
        // Handle different error codes if needed
        let errorMessage = "Thanh toán không thành công. Vui lòng thử lại hoặc chọn phương thức thanh toán khác.";
        
        // Map common VNPay error codes to messages
        switch(responseCode) {
          case "24":
            errorMessage = "Giao dịch không thành công do khách hàng hủy giao dịch";
            break;
          case "09":
            errorMessage = "Thẻ/Tài khoản của khách hàng chưa đăng ký dịch vụ InternetBanking";
            break;
          case "10":
            errorMessage = "Khách hàng xác thực thông tin thẻ/tài khoản không đúng quá 3 lần";
            break;
          case "11":
            errorMessage = "Đã hết hạn chờ thanh toán";
            break;
          case "12":
            errorMessage = "Thẻ/Tài khoản của khách hàng bị khóa";
            break;
          default:
            errorMessage = `Thanh toán không thành công (Mã lỗi: ${responseCode})`;
        }
        
        setPaymentStatus({
          isProcessing: false,
          success: false,
          message: errorMessage
        });
        setSnackbarOpen(true);
      }
    } catch (error) {
      console.error("Error verifying payment:", error);
      setPaymentStatus({
        isProcessing: false,
        success: false,
        message: "Đã xảy ra lỗi khi xác minh trạng thái thanh toán."
      });
      setSnackbarOpen(true);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  if (paymentStatus.isProcessing) {
    return (
      <Container sx={{ mt: 8, textAlign: "center" }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 3 }}>
          Đang xử lý thông tin thanh toán...
        </Typography>
      </Container>
    );
  }

  if (!orderDetails) {
    return (
      <Container sx={{ mt: 4, textAlign: "center" }}>
        <Typography variant="h6">Không tìm thấy thông tin đơn hàng.</Typography>
        <Button component={Link} to="/" variant="contained" sx={{ mt: 2 }}>
          Quay về trang chủ
        </Button>
      </Container>
    );
  }

  // Calculate subtotal
  const subtotal = orderDetails.items.reduce((acc, item) => acc + item.book.price * item.quantity, 0);

  return (
    <Container maxWidth="md" sx={{ my: 4 }}>
      {/* Snackbar for Alert Messages */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={paymentStatus.success ? "success" : "error"}
          sx={{ width: "100%" }}
        >
          {paymentStatus.message}
        </Alert>
      </Snackbar>
      
      <Paper elevation={3} sx={{ p: { xs: 2, md: 3 }, borderRadius: 2 }}>
        {/* Compact Success Header */}
        <Box sx={{ 
          textAlign: "center", 
          mb: 3, 
          display: "flex", 
          flexDirection: "column", 
          alignItems: "center" 
        }}>
          <Avatar
            sx={{
              width: 70,
              height: 70,
              backgroundColor: paymentStatus.success ? "#4caf50" : "#f44336",
              boxShadow: `0 6px 12px ${paymentStatus.success ? 'rgba(76, 175, 80, 0.3)' : 'rgba(244, 67, 54, 0.3)'}`,
              mb: 2
            }}
          >
            {paymentStatus.success ? (
              <CheckIcon sx={{ color: "white", fontSize: 40 }} />
            ) : (
              <ErrorIcon sx={{ color: "white", fontSize: 40 }} />
            )}
          </Avatar>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
            {paymentStatus.success ? 'Đặt hàng thành công!' : 'Xác nhận đơn hàng'}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            {paymentStatus.success 
              ? 'Cảm ơn bạn đã đặt hàng. Chúng tôi sẽ liên hệ với bạn sớm để xác nhận.'
              : 'Đơn hàng của bạn thanh toán chưa hoàn tất. Vui lòng thử lại.'}
          </Typography>
        </Box>
        
        {/* Main Content - Two Column Layout */}
        <Grid container spacing={3}>
          {/* Left Column - Customer & Shipping Information */}
          <Grid item xs={12} md={5}>
            <Card elevation={1} sx={{ mb: 3 }}>
              <Box sx={{ bgcolor: "#1976d2", color: "white", p: 1.5 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 500, display: "flex", alignItems: "center" }}>
                  <PersonIcon sx={{ fontSize: 20, mr: 1 }} /> Thông tin đơn hàng
                </Typography>
              </Box>
              <CardContent sx={{ p: 2 }}>
                {/* Customer Info */}
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                    Người nhận:
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {orderDetails.shippingInfo.name}
                  </Typography>
                </Box>
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                    Số điện thoại:
                  </Typography>
                  <Typography variant="body1">
                    {orderDetails.shippingInfo.phoneNumber}
                  </Typography>
                </Box>
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                    Địa chỉ giao hàng:
                  </Typography>
                  <Typography variant="body1">
                    {orderDetails.shippingInfo.address}, {orderDetails.shippingInfo.ward}, {orderDetails.shippingInfo.district}, {orderDetails.shippingInfo.province}
                  </Typography>
                </Box>
                
                <Divider sx={{ my: 2 }} />
                
                {/* Payment & Shipping Method */}
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <PaymentIcon fontSize="small" sx={{ color: "#ff9800", mr: 1 }} />
                      <Typography variant="body2" color="text.secondary">
                        Phương thức thanh toán:
                      </Typography>
                    </Box>
                    <Box sx={{ pl: 4, mb: 2 }}>
                      <Typography variant="body1">
                        {orderDetails.paymentMethod === "Online" 
                          ? "Thanh toán trực tuyến" 
                          : "COD (Thanh toán khi nhận hàng)"}
                      </Typography>
                      {orderDetails.paymentMethod === "Online" && (
                        <Chip 
                          label={paymentStatus.success ? "Đã thanh toán" : "Chưa thanh toán"} 
                          color={paymentStatus.success ? "success" : "error"}
                          size="small"
                          sx={{ mt: 1, height: 24 }}
                        />
                      )}
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <LocalShippingIcon fontSize="small" sx={{ color: "#7e57c2", mr: 1 }} />
                      <Typography variant="body2" color="text.secondary">
                        Phí vận chuyển:
                      </Typography>
                    </Box>
                    <Box sx={{ pl: 4 }}>
                      <Typography variant="body1">
                        {orderDetails.shippingInfo.fee > 0 
                          ? `${orderDetails.shippingInfo.fee.toLocaleString()}₫` 
                          : "Miễn phí"}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
          
          {/* Right Column - Order Summary with Products */}
          <Grid item xs={12} md={7}>
            <Card elevation={1} sx={{ mb: 3 }}>
              <Box sx={{ bgcolor: "#4caf50", color: "white", p: 1.5 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 500, display: "flex", alignItems: "center" }}>
                  <ReceiptIcon sx={{ fontSize: 20, mr: 1 }} /> Tổng kết đơn hàng
                </Typography>
              </Box>
              <CardContent sx={{ p: 0 }}>
                {/* Products List */}
                <Box sx={{ borderBottom: "1px solid #eee" }}>
                  <Typography variant="body2" color="text.secondary" sx={{ p: 2, pb: 1 }}>
                    Sản phẩm đã đặt:
                  </Typography>
                  {orderDetails.items && orderDetails.items.map((item, index) => (
                    <Box 
                      key={index}
                      sx={{ 
                        display: "flex", 
                        p: 2, 
                        py: 1.5,
                        borderBottom: index < orderDetails.items.length - 1 ? "1px dashed #eee" : "none"
                      }}
                    >
                      <Box sx={{ width: 40, height: 55, flexShrink: 0, borderRadius: 1, overflow: "hidden" }}>
                        <img 
                          src={item.book.images} 
                          alt={item.book.title} 
                          style={{ width: "100%", height: "100%", objectFit: "cover" }} 
                        />
                      </Box>
                      <Box sx={{ ml: 1.5, flex: 1, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Box sx={{ width: "65%" }}>
                          <Typography variant="body2" sx={{ fontWeight: 500, lineHeight: 1.3 }} noWrap>
                            {item.book.title}
                          </Typography>
                          <Chip 
                            label={`Số lượng: ${item.quantity}`} 
                            size="small" 
                            sx={{ 
                              bgcolor: "rgba(25, 118, 210, 0.1)", 
                              color: "#1976d2",
                              fontSize: "0.7rem",
                              fontWeight: 500,
                              mt: 0.5,
                              height: 20
                            }} 
                          />
                        </Box>
                        <Typography variant="body2" color="error" sx={{ fontWeight: 500 }}>
                          {item.book.price.toLocaleString()}₫
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
                
                {/* Price Summary */}
                <Box sx={{ p: 2 }}>
                  <Grid container spacing={1}>
                    <Grid item xs={7}>
                      <Typography variant="body2" color="text.secondary">Tạm tính:</Typography>
                    </Grid>
                    <Grid item xs={5} sx={{ textAlign: "right" }}>
                      <Typography variant="body1">{subtotal.toLocaleString()}₫</Typography>
                    </Grid>
                    
                    <Grid item xs={7}>
                      <Typography variant="body2" color="text.secondary">Phí vận chuyển:</Typography>
                    </Grid>
                    <Grid item xs={5} sx={{ textAlign: "right" }}>
                      <Typography variant="body1">
                        {orderDetails.shippingInfo.fee > 0 
                          ? `${orderDetails.shippingInfo.fee.toLocaleString()}₫` 
                          : "Miễn phí"}
                      </Typography>
                    </Grid>
                    
                    {orderDetails.totalDiscount > 0 && (
                      <>
                        <Grid item xs={7}>
                          <Typography variant="body2" color="text.secondary">Giảm giá:</Typography>
                        </Grid>
                        <Grid item xs={5} sx={{ textAlign: "right" }}>
                          <Typography variant="body1" color="error">
                            -{orderDetails.totalDiscount.toLocaleString()}₫
                          </Typography>
                        </Grid>
                      </>
                    )}
                    
                    {orderDetails.pointUsed > 0 && (
                      <>
                        <Grid item xs={7}>
                          <Typography variant="body2" color="text.secondary">Điểm thưởng:</Typography>
                        </Grid>
                        <Grid item xs={5} sx={{ textAlign: "right" }}>
                          <Typography variant="body1" color="error">
                            -{orderDetails.pointUsed.toLocaleString()}₫
                          </Typography>
                        </Grid>
                      </>
                    )}
                    
                    <Grid item xs={12}>
                      <Divider sx={{ my: 1.5 }} />
                    </Grid>
                    
                    <Grid item xs={6}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Tổng cộng:</Typography>
                    </Grid>
                    <Grid item xs={6} sx={{ textAlign: "right" }}>
                      <Typography variant="h5" color="error" sx={{ fontWeight: 600 }}>
                        {orderDetails.totalAmount.toLocaleString()}₫
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Action Button - Centered */}
        <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>  
          <Button 
            component={Link} 
            to="/" 
            variant="contained" 
            color="primary" 
            size="large"
            startIcon={<ShoppingCartIcon />}
            sx={{ 
              px: 4, 
              py: 1.2, 
              borderRadius: 2,
              boxShadow: "0 4px 10px rgba(25, 118, 210, 0.3)",
              "&:hover": {
                boxShadow: "0 6px 12px rgba(25, 118, 210, 0.4)",
              }
            }}
          >
            Tiếp tục mua hàng
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}

export default OrderSuccessPage;