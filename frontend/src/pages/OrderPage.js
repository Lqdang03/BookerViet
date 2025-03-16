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
  const [shippingFee, setShippingFee] = useState(0);
  const [calculatingFee, setCalculatingFee] = useState(false);

  // Fetch cart items
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

  // Fetch provinces from GHN API
  const fetchProvinces = useCallback(async () => {
    try {
      const response = await axios.get("http://localhost:9999/ghn/province");
      setProvinces(response.data.map(province => ({
        id: province.ProvinceID,
        name: province.ProvinceName
      })));
    } catch (error) {
      console.error("Error fetching provinces:", error);
      setAlert({
        open: true,
        message: "Không thể tải danh sách tỉnh/thành phố",
        severity: "error"
      });
    }
  }, []);

  // Fetch districts based on selected province from GHN API
  const fetchDistricts = useCallback(async (provinceId) => {
    try {
      const response = await axios.get("http://localhost:9999/ghn/district", {
        params: {
          provinceID: provinceId
        }
      });

      setDistricts(response.data.map(district => ({
        id: district.DistrictID,
        name: district.DistrictName,
        provinceId: district.ProvinceID
      })));

      setWards([]);
      // Reset district and ward in shipping address
      setShippingAddress(prev => ({
        ...prev,
        district: "",
        ward: ""
      }));
    } catch (error) {
      console.error("Error fetching districts:", error);
      setAlert({
        open: true,
        message: "Không thể tải danh sách quận/huyện",
        severity: "error"
      });
    }
  }, []);

  // Fetch wards based on selected district from GHN API
  const fetchWards = useCallback(async (districtId) => {
    try {
      const response = await axios.get("http://localhost:9999/ghn/ward", {
        params: {
          districtID: districtId
        }
      });

      setWards(response.data.map(ward => ({
        id: ward.WardCode,
        name: ward.WardName,
        districtId: ward.DistrictID
      })));

      // Reset ward in shipping address
      setShippingAddress(prev => ({
        ...prev,
        ward: ""
      }));
    } catch (error) {
      console.error("Error fetching wards:", error);
      setAlert({
        open: true,
        message: "Không thể tải danh sách phường/xã",
        severity: "error"
      });
    }
  }, []);

  // Calculate shipping fee using GHN API
  const calculateShippingFee = useCallback(async () => {
    if (!shippingAddress.ward || !shippingAddress.district) {
      return;
    }

    try {
      setCalculatingFee(true);

      const totalWeight = cartItems.reduce((total, item) => total + (item.quantity * 500), 0);
      const totalValue = cartItems.reduce((total, item) => total + (item.book.price * item.quantity), 0);

      const response = await axios.get("http://localhost:9999/ghn/calculate-fee", {
        params: {
          to_ward_code: shippingAddress.ward,
          to_district_id: parseInt(shippingAddress.district),
          insurance_value: totalValue,
          weight: totalWeight
        },
        headers: {
          Token: "YOUR_GHN_TOKEN" // Đảm bảo gửi token nếu GHN cần
        }
      });

      if (response.data && response.data.data) {
        const calculatedFee = response.data.data.total;
        // Updated: Always charge shipping fee regardless of order total
        setShippingFee(calculatedFee);
      } else {
        setShippingFee(35000);
        console.warn("Unexpected response format from API", response.data);
      }

      setCalculatingFee(false);
    } catch (error) {
      console.error("Error calculating shipping fee:", error.response?.data || error.message);
      setShippingFee(35000);
      setCalculatingFee(false);
      setAlert({
        open: true,
        message: "Không thể tính phí vận chuyển, đã áp dụng phí mặc định",
        severity: "warning"
      });
    }
  }, [cartItems, shippingAddress.district, shippingAddress.ward]);



  useEffect(() => {
    fetchCart();
    fetchProvinces();
  }, [fetchCart, fetchProvinces]);

  // Recalculate shipping fee when address changes
  useEffect(() => {
    if (shippingAddress.ward && shippingAddress.district) {
      calculateShippingFee();
    }
  }, [shippingAddress.ward, shippingAddress.district, calculateShippingFee]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShippingAddress(prev => ({ ...prev, [name]: value }));

    // Fetch dependent data when province/district changes
    if (name === "province" && value) {
      fetchDistricts(value);
    } else if (name === "district" && value) {
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

  // Calculate subtotal
  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.book.price * item.quantity,
    0
  );

  // Calculate total amount
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
      const requiredFields = ["name", "phoneNumber", "address", "province", "district", "ward"];
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

      // Get the names of selected province/district/ward
      const selectedProvince = provinces.find(p => p.id === shippingAddress.province);
      const selectedDistrict = districts.find(d => d.id === shippingAddress.district);
      const selectedWard = wards.find(w => w.id === shippingAddress.ward);

      // Create order object matching backend schema
      const orderData = {
        shippingInfo: {
          name: shippingAddress.name,
          phoneNumber: shippingAddress.phoneNumber,
          address: shippingAddress.address,
          provinceId: shippingAddress.province,
          districtId: shippingAddress.district,
          wardCode: shippingAddress.ward,
          // Add province/district/ward names
          provineName: selectedProvince?.name || "",
          districtName: selectedDistrict?.name || "",
          wardName: selectedWard?.name || "",
          note: shippingAddress.notes || "",
          fee: shippingFee
        },
        paymentMethod: paymentMethod,
        totalDiscount: discountAmount,
        pointUsed: pointsToUse,
        notes: shippingAddress.notes || ""
      };

      // Send the order request
      const response = await axios.post("http://localhost:9999/order/create", orderData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Get the order ID from the response
      const orderId = response.data.data?._id || response.data.savedOrder?._id;

      if (!orderId) {
        throw new Error("Order ID not found in response");
      }

      localStorage.setItem("latestOrder", JSON.stringify({
        shippingInfo: {
          name: shippingAddress.name,
          phoneNumber: shippingAddress.phoneNumber,
          address: shippingAddress.address,
          province: provinces.find(p => p.id === shippingAddress.province)?.name || "",
          district: districts.find(d => d.id === shippingAddress.district)?.name || "",
          ward: wards.find(w => w.id === shippingAddress.ward)?.name || "",
          note: shippingAddress.notes || "",
          fee: shippingFee
        },
        paymentMethod,
        totalDiscount: discountAmount,
        pointUsed: pointsToUse,
        totalAmount,
        items: cartItems
      }));
      
      // Chuyển hướng sang trang Order Success (không cần orderId)
      navigate("/order-success");
      


    } catch (error) {
      console.error("Error details:", error);

      // Log more specific error information
      if (error.response) {
        console.error("Server response data:", error.response.data);
        console.error("Server response status:", error.response.status);

        // More specific error message
        setAlert({
          open: true,
          message: error.response.data.message ||
            `Lỗi ${error.response.status}: Có lỗi xảy ra khi đặt hàng`,
          severity: "error"
        });
      } else if (error.request) {
        // Request was made but no response received
        console.error("No response received:", error.request);
        setAlert({
          open: true,
          message: "Không nhận được phản hồi từ máy chủ",
          severity: "error"
        });
      } else {
        // Something else caused the error
        console.error("Error message:", error.message);
        setAlert({
          open: true,
          message: `Lỗi: ${error.message}`,
          severity: "error"
        });
      }
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
                    <FormControl fullWidth required>
                      <InputLabel>Tỉnh/Thành phố</InputLabel>
                      <Select
                        name="province"
                        value={shippingAddress.province}
                        onChange={handleInputChange}
                        label="Tỉnh/Thành phố *"
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
                    <FormControl fullWidth required>
                      <InputLabel>Quận/Huyện</InputLabel>
                      <Select
                        name="district"
                        value={shippingAddress.district}
                        onChange={handleInputChange}
                        label="Quận/Huyện *"
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
                    <FormControl fullWidth required>
                      <InputLabel>Phường/Xã</InputLabel>
                      <Select
                        name="ward"
                        value={shippingAddress.ward}
                        onChange={handleInputChange}
                        label="Phường/Xã *"
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
                    <Typography variant="body1">
                      Phí vận chuyển
                      {calculatingFee && <CircularProgress size={12} sx={{ ml: 1 }} />}
                    </Typography>
                    <Typography variant="body1">
                      {shippingFee.toLocaleString()}₫
                    </Typography>
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

                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Button
                    component={Link}
                    to="/cart"
                    variant="text"
                    sx={{ fontSize: 10 }}
                    startIcon={<ArrowBackIcon />}
                  >
                    Quay về giỏ hàng
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    sx={{ fontSize: 15 }}
                    onClick={handlePlaceOrder}
                    disabled={loading || calculatingFee}
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