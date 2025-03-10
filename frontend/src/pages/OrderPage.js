import React, { useState, useEffect, useCallback } from "react";
import {
  Container,
  Typography,
  Button,
  Box,
  Paper,
  Grid,
  TextField,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  CircularProgress,
  Alert,
  Snackbar
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import axios from "axios";
import CheckoutBreadCrumb from "../components/Breadcrumbs/CheckoutBreadCrumb";
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';

function OrderPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [alert, setAlert] = useState({ open: false, message: "", severity: "success" });
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [discountCode, setDiscountCode] = useState("");
  const [applyingDiscount, setApplyingDiscount] = useState(false);
  const [appliedDiscount, setAppliedDiscount] = useState(null);
  const [pointsToUse, setPointsToUse] = useState(0);
  const [availablePoints, setAvailablePoints] = useState(0);
  const [shippingAddress, setShippingAddress] = useState({
    name: "",
    phoneNumber: "",
    address: "",
    province: "",
    district: "",
    ward: "",
    notes: ""
  });
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);

  // Fetch cart items
  // In the fetchCart function, modify the setShippingAddress part:

  const fetchCart = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      if (!token) {
        setAlert({
          open: true,
          message: "Vui lòng đăng nhập để tiếp tục",
          severity: "error"
        });
        navigate("/login");
        return;
      }

      const response = await axios.get("http://localhost:9999/cart", {
        headers: { Authorization: `Bearer ${token}` }
      });

      setCartItems(response.data.cartItems);

      // Get user info for shipping details
      const userResponse = await axios.get("http://localhost:9999/user/profile", {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Extract the user data - check if it's in user property or directly in the response
      const userData = userResponse.data.user || userResponse.data;

      console.log("User data received:", userData);

      // Update shipping address with user profile data
      // Use the correct field names 
      setShippingAddress(prev => ({
        ...prev,
        name: userData.name || "",
        phoneNumber: userData.phone || "",
        address: userData.address || "",
        province: userData.province || "",
        district: userData.district || "",
        ward: userData.ward || ""
      }));

      // Set available points if your system has reward points
      setAvailablePoints(userData.points || 0);

      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error.response?.data || error.message);
      setLoading(false);
      setAlert({
        open: true,
        message: "Có lỗi xảy ra khi tải dữ liệu",
        severity: "error"
      });
    }
  }, [navigate]);

  // Fetch address data
  const fetchAddressData = useCallback(async () => {
    try {
      // This would typically be an API call to get provinces/cities
      // For example purposes we're using a placeholder
      const provincesResponse = await axios.get("http://localhost:9999/address/provinces");
      setProvinces(provincesResponse.data);
    } catch (error) {
      console.error("Error fetching address data:", error);
    }
  }, []);

  // Fetch districts based on selected province
  const fetchDistricts = useCallback(async (provinceId) => {
    try {
      const districtsResponse = await axios.get(`http://localhost:9999/address/districts/${provinceId}`);
      setDistricts(districtsResponse.data);
      setWards([]);
    } catch (error) {
      console.error("Error fetching districts:", error);
    }
  }, []);

  // Fetch wards based on selected district
  const fetchWards = useCallback(async (districtId) => {
    try {
      const wardsResponse = await axios.get(`http://localhost:9999/address/wards/${districtId}`);
      setWards(wardsResponse.data);
    } catch (error) {
      console.error("Error fetching wards:", error);
    }
  }, []);

  useEffect(() => {
    fetchCart();
    fetchAddressData();
  }, [fetchCart, fetchAddressData]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShippingAddress(prev => ({ ...prev, [name]: value }));

    // Fetch dependent data when province/district changes
    if (name === "province") {
      fetchDistricts(value);
    } else if (name === "district") {
      fetchWards(value);
    }
  };

  // Handle payment method change
  const handlePaymentMethodChange = (e) => {
    setPaymentMethod(e.target.value);
  };

  // Handle discount code change
  const handleDiscountCodeChange = (e) => {
    setDiscountCode(e.target.value);
  };

  // Apply discount code
  const handleApplyDiscount = async () => {
    if (!discountCode.trim()) {
      setAlert({
        open: true,
        message: "Vui lòng nhập mã giảm giá",
        severity: "error"
      });
      return;
    }

    try {
      setApplyingDiscount(true);
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");

      // Calculate the subtotal for validation
      const subtotal = cartItems.reduce(
        (acc, item) => acc + item.book.price * item.quantity,
        0
      );

      // Call API to validate and get discount amount
      const response = await axios.post(
        "http://localhost:9999/discounts/apply",
        {
          code: discountCode,
          subtotal: subtotal
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      // If successful, update the discount amount
      if (response.data.valid) {
        setDiscountAmount(response.data.discountAmount);
        setAppliedDiscount({
          code: discountCode,
          amount: response.data.discountAmount,
          description: response.data.description || ""
        });
        setAlert({
          open: true,
          message: "Áp dụng mã giảm giá thành công",
          severity: "success"
        });
      } else {
        setAlert({
          open: true,
          message: response.data.message || "Mã giảm giá không hợp lệ",
          severity: "error"
        });
      }
    } catch (error) {
      console.error("Error applying discount:", error.response?.data || error.message);
      setAlert({
        open: true,
        message: error.response?.data?.message || "Có lỗi xảy ra khi áp dụng mã giảm giá",
        severity: "error"
      });
    } finally {
      setApplyingDiscount(false);
    }
  };

  // Remove applied discount
  const handleRemoveDiscount = () => {
    setDiscountAmount(0);
    setDiscountCode("");
    setAppliedDiscount(null);
    setAlert({
      open: true,
      message: "Đã xóa mã giảm giá",
      severity: "info"
    });
  };

  // Handle using loyalty points
  const handlePointsChange = (e) => {
    const points = parseInt(e.target.value) || 0;
    if (points > availablePoints) {
      setPointsToUse(availablePoints);
    } else {
      setPointsToUse(points);
    }
  };

  // Calculate totals
  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.book.price * item.quantity,
    0
  );
  const shippingFee = subtotal > 300000 ? 0 : 30000;
  const totalAmount = subtotal + shippingFee - discountAmount - pointsToUse;

  // Submit order
  const handlePlaceOrder = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      if (!token) {
        setAlert({
          open: true,
          message: "Vui lòng đăng nhập để tiếp tục",
          severity: "error"
        });
        navigate("/login");
        return;
      }

      // Validate required fields
      const requiredFields = ["name", "phoneNumber", "address"];
      const missingFields = requiredFields.filter(field => !shippingAddress[field]);

      if (missingFields.length > 0) {
        setAlert({
          open: true,
          message: "Vui lòng điền đầy đủ thông tin giao hàng",
          severity: "error"
        });
        setLoading(false);
        return;
      }

      // Format address with province/district/ward if they exist
      let fullAddress = shippingAddress.address;
      if (shippingAddress.ward && wards.length > 0) {
        const selectedWard = wards.find(w => w.id === shippingAddress.ward);
        if (selectedWard) fullAddress += `, ${selectedWard.name}`;
      }
      if (shippingAddress.district && districts.length > 0) {
        const selectedDistrict = districts.find(d => d.id === shippingAddress.district);
        if (selectedDistrict) fullAddress += `, ${selectedDistrict.name}`;
      }
      if (shippingAddress.province && provinces.length > 0) {
        const selectedProvince = provinces.find(p => p.id === shippingAddress.province);
        if (selectedProvince) fullAddress += `, ${selectedProvince.name}`;
      }

      // Create order object matching backend schema
      const orderData = {
        items: cartItems.map(item => ({
          book: item.book._id,
          quantity: item.quantity
        })),
        shippingAddress: {
          name: shippingAddress.name,
          phoneNumber: shippingAddress.phoneNumber,
          address: fullAddress
        },
        paymentMethod: paymentMethod,
        totalDiscount: discountAmount,
        pointUsed: pointsToUse,
        notes: shippingAddress.notes || "",
        discountCode: appliedDiscount ? appliedDiscount.code : null
      };

      // Send order to server
      const response = await axios.post("http://localhost:9999/orders/create", orderData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Handle online payment if selected
      if (paymentMethod === "Online") {
        // Redirect to payment gateway with order ID
        window.location.href = `http://localhost:9999/payment/process/${response.data.savedOrder._id}`;
        return;
      }

      // Clear cart
      await axios.delete("http://localhost:9999/cart/clear", {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Show success message
      setAlert({
        open: true,
        message: "Đặt hàng thành công!",
        severity: "success"
      });

      // Redirect to order confirmation page
      setTimeout(() => {
        navigate(`/order-success/${response.data.savedOrder._id}`);
      }, 2000);
    } catch (error) {
      console.error("Error placing order:", error.response?.data || error.message);
      setAlert({
        open: true,
        message: error.response?.data?.message || "Có lỗi xảy ra khi đặt hàng",
        severity: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle alert close
  const handleCloseAlert = () => {
    setAlert({ ...alert, open: false });
  };

  return (
    <>
      <CheckoutBreadCrumb />
      <Snackbar
        open={alert.open}
        autoHideDuration={6000}
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseAlert} severity={alert.severity}>
          {alert.message}
        </Alert>
      </Snackbar>

      <Container sx={{ mt: 1, mb: 4 }}>
        <Typography variant="h5" gutterBottom sx={{ mb: 1 }}>
          Thanh toán
        </Typography>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : cartItems.length === 0 ? (
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body1" color="textSecondary">
              Không có sản phẩm nào trong giỏ hàng
            </Typography>
            <Button
              component={Link}
              to="/"
              variant="contained"
              sx={{ mt: 2 }}
              startIcon={<ArrowBackIcon />}
            >
              Tiếp tục mua hàng
            </Button>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {/* Shipping Information */}
            <Grid item xs={12} md={8}>
              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Thông tin giao hàng
                </Typography>

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      required
                      fullWidth
                      label="Họ và tên"
                      name="name"
                      value={shippingAddress.name}
                      onChange={handleInputChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      required
                      fullWidth
                      label="Số điện thoại"
                      name="phoneNumber"
                      value={shippingAddress.phoneNumber}
                      onChange={handleInputChange}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      required
                      fullWidth
                      label="Địa chỉ"
                      name="address"
                      value={shippingAddress.address}
                      onChange={handleInputChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <FormControl fullWidth>
                      <InputLabel>Tỉnh/Thành phố</InputLabel>
                      <Select
                        name="province"
                        value={shippingAddress.province}
                        onChange={handleInputChange}
                        label="Tỉnh/Thành phố"
                      >
                        {provinces.map(province => (
                          <MenuItem key={province.id} value={province.id}>
                            {province.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <FormControl fullWidth>
                      <InputLabel>Quận/Huyện</InputLabel>
                      <Select
                        name="district"
                        value={shippingAddress.district}
                        onChange={handleInputChange}
                        label="Quận/Huyện"
                        disabled={!shippingAddress.province}
                      >
                        {districts.map(district => (
                          <MenuItem key={district.id} value={district.id}>
                            {district.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <FormControl fullWidth>
                      <InputLabel>Phường/Xã</InputLabel>
                      <Select
                        name="ward"
                        value={shippingAddress.ward}
                        onChange={handleInputChange}
                        label="Phường/Xã"
                        disabled={!shippingAddress.district}
                      >
                        {wards.map(ward => (
                          <MenuItem key={ward.id} value={ward.id}>
                            {ward.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Ghi chú (tùy chọn)"
                      name="notes"
                      value={shippingAddress.notes}
                      onChange={handleInputChange}
                      multiline
                      rows={2}
                    />
                  </Grid>
                </Grid>
              </Paper>

              {/* Payment Method */}
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Phương thức thanh toán
                </Typography>
                <FormControl component="fieldset">
                  <RadioGroup
                    name="paymentMethod"
                    value={paymentMethod}
                    onChange={handlePaymentMethodChange}
                  >
                    <FormControlLabel
                      value="COD"
                      control={<Radio />}
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography>Thanh toán khi giao hàng (COD)</Typography>
                        </Box>
                      }
                    />
                    <FormControlLabel
                      value="Online"
                      control={<Radio />}
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Typography>Thanh toán trực tuyến </Typography>
                          <AccountBalanceIcon />
                        </Box>
                      }
                    />

                  </RadioGroup>
                </FormControl>
              </Paper>

              {/* Points and Discounts - only show if available */}
              {availablePoints > 0 && (
                <Paper sx={{ p: 3, mt: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Điểm thưởng và giảm giá
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <TextField
                      label="Sử dụng điểm thưởng"
                      type="number"
                      value={pointsToUse}
                      onChange={handlePointsChange}
                      InputProps={{
                        inputProps: { min: 0, max: availablePoints }
                      }}
                      helperText={`Bạn có ${availablePoints} điểm thưởng`}
                      sx={{ width: 200 }}
                    />
                    <Typography variant="body2">
                      (1 điểm = 1.000đ)
                    </Typography>
                  </Box>
                </Paper>
              )}
            </Grid>

            {/* Order Summary */}
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3, top: 20 }}>
                <Typography variant="h6" gutterBottom>
                  Đơn hàng ({cartItems.length} sản phẩm)
                </Typography>

                <Box sx={{ maxHeight: 300, overflow: 'auto', mb: 0 }}>
                  {cartItems.map(item => (
                    <Box key={item.book._id} sx={{ display: 'flex', mb: 2, pb: 2, borderBottom: '1px solid #eee' }}>
                      <Box sx={{ width: 60, height: 80, flexShrink: 0 }}>
                        <img
                          src={item.book.images}
                          alt={item.book.title}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }}
                        />
                      </Box>
                      <Box sx={{ ml: 2, flex: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          {item.book.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Số lượng: {item.quantity}
                        </Typography>
                        <Typography variant="body2" color="error">
                          {item.book.price.toLocaleString()}₫
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>

                {/* Discount Code Input */}
                <Box sx={{ mb: 2 }}>
                  {!appliedDiscount ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <TextField
                        fullWidth
                        size="small"
                        placeholder="Nhập mã giảm giá"
                        value={discountCode}
                        onChange={handleDiscountCodeChange}
                        sx={{ flex: 1 }}
                      />
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={handleApplyDiscount}
                        disabled={applyingDiscount || !discountCode.trim()}
                        sx={{ minWidth: '100px', height: '40px' }}
                      >
                        {applyingDiscount ? <CircularProgress size={20} /> : 'Áp dụng'}
                      </Button>
                    </Box>
                  ) : (
                    <Box sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      border: '1px dashed #4caf50',
                      borderRadius: '4px',
                      p: 1,
                      backgroundColor: 'rgba(76, 175, 80, 0.1)'
                    }}>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#4caf50' }}>
                          Mã {appliedDiscount.code}
                        </Typography>
                        <Typography variant="body2">
                          {appliedDiscount.description || `Giảm ${appliedDiscount.amount.toLocaleString()}₫`}
                        </Typography>
                      </Box>
                      <Button
                        color="error"
                        size="small"
                        onClick={handleRemoveDiscount}
                      >
                        Xóa
                      </Button>
                    </Box>
                  )}
                </Box>

                <Divider sx={{ my: 2 }} />

                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body1">Tạm tính</Typography>
                    <Typography variant="body1">{subtotal.toLocaleString()}₫</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body1">Phí vận chuyển</Typography>
                    <Typography variant="body1">{shippingFee > 0 ? `${shippingFee.toLocaleString()}₫` : 'Miễn phí'}</Typography>
                  </Box>
                  {discountAmount > 0 && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body1">Giảm giá</Typography>
                      <Typography variant="body1" color="error">-{discountAmount.toLocaleString()}₫</Typography>
                    </Box>
                  )}
                  {pointsToUse > 0 && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body1">Điểm thưởng sử dụng</Typography>
                      <Typography variant="body1" color="error">-{pointsToUse.toLocaleString()}₫</Typography>
                    </Box>
                  )}
                </Box>

                <Divider sx={{ my: 2 }} />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                  <Typography variant="h6">Tổng cộng</Typography>
                  <Typography variant="h6" color="error">{totalAmount.toLocaleString()}₫</Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between'}}>
                  <Button
                    component={Link}
                    to="/cart"
                    variant="text"
                    sx={{fontSize: 10}}
                    startIcon={<ArrowBackIcon />}
                  >
                    Quay về giỏ hàng
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    sx={{fontSize: 15}}
                    onClick={handlePlaceOrder}
                    disabled={loading}
                  >
                    {loading ? <CircularProgress size={24} /> : 'Đặt hàng'}
                  </Button>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        )}
      </Container>
    </>
  );
}

export default OrderPage;