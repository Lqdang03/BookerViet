import React, { useState, useEffect } from "react";
import { Container, Typography, Button, Box, Paper, Grid, Divider } from "@mui/material";
import { Link } from "react-router-dom";
import CheckIcon from "@mui/icons-material/Check";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";

function OrderSuccessPage() {
  const [orderDetails, setOrderDetails] = useState(null);

  useEffect(() => {
    const storedOrder = localStorage.getItem("latestOrder");
    if (storedOrder) {
      setOrderDetails(JSON.parse(storedOrder));
    }
  }, []);

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
    <Container maxWidth="md" sx={{ my: 4 }}>
      <Paper sx={{ p: 4, borderRadius: 2 }}>
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              backgroundColor: "#4caf50",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              margin: "0 auto",
              mb: 2
            }}
          >
            <CheckIcon sx={{ color: "white", fontSize: 40 }} />
          </Box>
          <Typography variant="h5">Cảm ơn bạn đã đặt hàng!</Typography>
          <Typography variant="body1" color="textSecondary">
            Chúng tôi sẽ liên hệ với bạn sớm để xác nhận đơn hàng.
          </Typography>
        </Box>

        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6">Thông tin mua hàng</Typography>
            <Typography variant="body1">{orderDetails.shippingInfo.name}</Typography>
            <Typography variant="body1">{orderDetails.shippingInfo.phoneNumber}</Typography>
            <Typography variant="body1">
              {orderDetails.shippingInfo.address}, {orderDetails.shippingInfo.ward}, {orderDetails.shippingInfo.district}, {orderDetails.shippingInfo.province}
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="h6">Phương thức thanh toán</Typography>
            <Typography variant="body1">
              {orderDetails.paymentMethod === "Online" ? "Thanh toán trực tuyến" : "COD (khi nhận hàng)"}
            </Typography>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4 }} />

        {/* Danh sách sản phẩm */}
        <Typography variant="h6" sx={{ mb: 2 }}>Sản phẩm đã đặt</Typography>
        {orderDetails.items.map((item, index) => (
          <Box key={index} sx={{ display: "flex", alignItems: "center", mb: 2, p: 2, border: "1px solid #ddd", borderRadius: 2 }}>
            <Box sx={{ width: 80, height: 100, flexShrink: 0 }}>
              <img src={item.book.images} alt={item.book.title} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 4 }} />
            </Box>
            <Box sx={{ ml: 2, flex: 1 }}>
              <Typography variant="body1" sx={{ fontWeight: "bold" }}>{item.book.title}</Typography>
              <Typography variant="body2">Số lượng: {item.quantity}</Typography>
              <Typography variant="body2" color="error">{item.book.price.toLocaleString()}₫</Typography>
            </Box>
          </Box>
        ))}

        <Divider sx={{ my: 4 }} />

        {/* Tổng kết đơn hàng */}
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
          <Typography variant="body1">Tạm tính:</Typography>
          <Typography variant="body1">{orderDetails.items.reduce((acc, item) => acc + item.book.price * item.quantity, 0).toLocaleString()}₫</Typography>
        </Box>

        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
          <Typography variant="body1">Phí vận chuyển:</Typography>
          <Typography variant="body1">{orderDetails.shippingInfo.fee > 0 ? `${orderDetails.shippingInfo.fee.toLocaleString()}₫` : "Miễn phí"}</Typography>
        </Box>

        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 4 }}>
          <Typography variant="h6">Tổng cộng:</Typography>
          <Typography variant="h4" color="error">{orderDetails.totalAmount.toLocaleString()}₫</Typography>
        </Box>

        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <Button component={Link} to="/" variant="contained" color="primary" startIcon={<ShoppingCartIcon />}>
            Tiếp tục mua hàng
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}

export default OrderSuccessPage;
