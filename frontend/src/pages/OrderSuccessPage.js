import React, { useState, useEffect } from "react";
import { Container, Typography, Button, Box, Paper, Grid, Divider, Card, CardContent, Avatar, Chip } from "@mui/material";
import { Link } from "react-router-dom";
import CheckIcon from "@mui/icons-material/Check";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import PaymentIcon from "@mui/icons-material/Payment";
import PersonIcon from "@mui/icons-material/Person";
import ReceiptIcon from "@mui/icons-material/Receipt";

function OrderSuccessPage({ updateCartData }) {
  const [orderDetails, setOrderDetails] = useState(null);

  useEffect(() => {
    const storedOrder = localStorage.getItem("latestOrder");
    if (storedOrder) {
      setOrderDetails(JSON.parse(storedOrder));
    }
    
    // Reset cart count in header when order success page loads
    if (typeof updateCartData === "function") {
      updateCartData();
    }
  }, [updateCartData]);
  
  // Rest of your component remains the same

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

  return (
    <Container maxWidth="md" sx={{ my: 6 }}>
      <Paper 
        elevation={3} 
        sx={{ 
          p: 4, 
          borderRadius: 3,
          background: "linear-gradient(to bottom, #ffffff, #f9f9f9)"
        }}
      >
        {/* Success Header */}
        <Box sx={{ textAlign: "center", mb: 5 }}>
          <Avatar
            sx={{
              width: 90,
              height: 90,
              backgroundColor: "#4caf50",
              boxShadow: "0 8px 16px rgba(76, 175, 80, 0.3)",
              margin: "0 auto",
              mb: 3
            }}
          >
            <CheckIcon sx={{ color: "white", fontSize: 50 }} />
          </Avatar>
          <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
            Đặt hàng thành công!
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" sx={{ maxWidth: 500, mx: "auto" }}>
            Cảm ơn bạn đã đặt hàng. Chúng tôi sẽ liên hệ với bạn sớm để xác nhận đơn hàng.
          </Typography>
        </Box>
        
        {/* Order Information Section */}
        <Box sx={{ mb: 4 }}>
          <Card elevation={2} sx={{ borderRadius: 2, overflow: "hidden" }}>
            {/* Card Header */}
            <Box sx={{ 
              bgcolor: "#1976d2", 
              color: "white", 
              p: 2, 
              display: "flex", 
              alignItems: "center" 
            }}>
              <ReceiptIcon sx={{ mr: 1 }} />
              <Typography variant="h6">Thông tin đơn hàng</Typography>
            </Box>
            
            <CardContent sx={{ p: 3 }}>
              <Grid container spacing={4}>
                {/* Customer Info */}
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <Avatar sx={{ bgcolor: "#1976d2", mr: 2, width: 36, height: 36 }}>
                      <PersonIcon fontSize="small" />
                    </Avatar>
                    <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>Thông tin mua hàng</Typography>
                  </Box>
                  
                  <Box sx={{ pl: 2, borderLeft: "2px solid #1976d2", ml: 1.5, mb: 3 }}>
                    <Typography variant="body1" sx={{ fontWeight: 500, mb: 1 }}>
                      {orderDetails.shippingInfo.name}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      {orderDetails.shippingInfo.phoneNumber}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {orderDetails.shippingInfo.address}, 
                      {orderDetails.shippingInfo.ward}, 
                      {orderDetails.shippingInfo.district}, 
                      {orderDetails.shippingInfo.province}
                    </Typography>
                  </Box>
                </Grid>
                
                {/* Payment Method */}
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <Avatar sx={{ bgcolor: "#ff9800", mr: 2, width: 36, height: 36 }}>
                      <PaymentIcon fontSize="small" />
                    </Avatar>
                    <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>Phương thức thanh toán</Typography>
                  </Box>
                  
                  <Box sx={{ pl: 2, borderLeft: "2px solid #ff9800", ml: 1.5, mb: 2 }}>
                    <Typography variant="body1">
                      {orderDetails.paymentMethod === "Online" 
                        ? "Thanh toán trực tuyến" 
                        : "COD (Thanh toán khi nhận hàng)"}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: "flex", alignItems: "center", mt: 3, mb: 2 }}>
                    <Avatar sx={{ bgcolor: "#7e57c2", mr: 2, width: 36, height: 36 }}>
                      <LocalShippingIcon fontSize="small" />
                    </Avatar>
                    <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>Phí vận chuyển</Typography>
                  </Box>
                  
                  <Box sx={{ pl: 2, borderLeft: "2px solid #7e57c2", ml: 1.5 }}>
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
        </Box>

        {/* Products Section */}
        <Box sx={{ mb: 4 }}>
          <Card elevation={2} sx={{ borderRadius: 2, overflow: "hidden" }}>
            {/* Card Header */}
            <Box sx={{ 
              bgcolor: "#4caf50", 
              color: "white", 
              p: 2, 
              display: "flex", 
              alignItems: "center" 
            }}>
              <ShoppingCartIcon sx={{ mr: 1 }} />
              <Typography variant="h6">Sản phẩm đã đặt</Typography>
            </Box>
            
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ mb: 3 }}>
                {orderDetails.items.map((item, index) => (
                  <React.Fragment key={index}>
                    <Box sx={{ display: "flex", py: 2 }}>
                      <Box sx={{ width: 80, height: 110, flexShrink: 0, borderRadius: 1, overflow: "hidden" }}>
                        <img 
                          src={item.book.images} 
                          alt={item.book.title} 
                          style={{ 
                            width: "100%", 
                            height: "100%", 
                            objectFit: "cover" 
                          }} 
                        />
                      </Box>
                      <Box sx={{ ml: 2, flex: 1 }}>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {item.book.title}
                        </Typography>
                        <Box sx={{ display: "flex", alignItems: "center", my: 1 }}>
                          <Chip 
                            label={`Số lượng: ${item.quantity}`} 
                            size="small" 
                            sx={{ 
                              bgcolor: "rgba(25, 118, 210, 0.1)", 
                              color: "#1976d2",
                              fontWeight: 500,
                              mr: 1
                            }} 
                          />
                        </Box>
                        <Typography variant="body1" color="error" sx={{ fontWeight: 500 }}>
                          {item.book.price.toLocaleString()}₫
                        </Typography>
                      </Box>
                    </Box>
                    {index < orderDetails.items.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Box>
        
        {/* Order Summary Section */}
        <Box sx={{ mb: 4 }}>
          <Card elevation={2} sx={{ borderRadius: 2 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 3 }}>Tổng kết đơn hàng</Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={7} sm={8}>
                  <Typography variant="body1" color="text.secondary">Tạm tính:</Typography>
                </Grid>
                <Grid item xs={5} sm={4} sx={{ textAlign: "right" }}>
                  <Typography variant="body1">
                    {orderDetails.items.reduce((acc, item) => acc + item.book.price * item.quantity, 0).toLocaleString()}₫
                  </Typography>
                </Grid>
                
                <Grid item xs={7} sm={8}>
                  <Typography variant="body1" color="text.secondary">Phí vận chuyển:</Typography>
                </Grid>
                <Grid item xs={5} sm={4} sx={{ textAlign: "right" }}>
                  <Typography variant="body1">
                    {orderDetails.shippingInfo.fee > 0 
                      ? `${orderDetails.shippingInfo.fee.toLocaleString()}₫` 
                      : "Miễn phí"}
                  </Typography>
                </Grid>
                
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                </Grid>
                
                <Grid item xs={7} sm={8}>
                  <Typography variant="h6">Tổng cộng:</Typography>
                </Grid>
                <Grid item xs={5} sm={4} sx={{ textAlign: "right" }}>
                  <Typography variant="h5" color="error" sx={{ fontWeight: 600 }}>
                    {orderDetails.totalAmount.toLocaleString()}₫
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Box>

        {/* Continue Shopping Button */}
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <Button 
            component={Link} 
            to="/" 
            variant="contained" 
            color="primary" 
            size="large"
            startIcon={<ShoppingCartIcon />}
            sx={{ 
              px: 4, 
              py: 1.5, 
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