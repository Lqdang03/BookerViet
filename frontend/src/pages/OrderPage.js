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
  Snackbar,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Collapse,
  IconButton,
  Card,
  CardContent
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import axios from "axios";
import CheckoutBreadCrumb from "../components/Breadcrumbs/CheckoutBreadCrumb";
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';

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
  const [availableDiscounts, setAvailableDiscounts] = useState([]);
  const [loadingDiscounts, setLoadingDiscounts] = useState(false);
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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [showDiscountList, setShowDiscountList] = useState(false);

  // Check authentication status
  const checkAuthentication = useCallback(async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');

      if (!token) {
        setIsAuthenticated(false);
        setIsLoading(false);
        return false;
      }

      const config = {
        headers: { 'Authorization': `Bearer ${token}` }
      };

      const response = await axios.get('http://localhost:9999/user/profile', config);
      if (response.data?.user) {
        setUser(response.data.user);
        setIsAuthenticated(true);
        return true;
      } else {
        setIsAuthenticated(false);
        return false;
      }
    } catch (error) {
      console.error("Lỗi khi lấy thông tin user:", error);
      setIsAuthenticated(false);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch cart items
  const fetchCart = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      if (!token) {
        setLoading(false);
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
  }, []);

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

  // Fetch suitable discounts based on cart amount
  const fetchSuitableDiscounts = useCallback(async () => {
    try {
      setLoadingDiscounts(true);

      // Calculate the subtotal
      const subtotal = cartItems.reduce((total, item) => total + (item.book.price * item.quantity), 0);

      // Call the new discount endpoint
      const response = await axios.get("http://localhost:9999/discount/suitable", {
        params: { amount: subtotal }
      });

      if (response.data && response.data.discounts) {
        setAvailableDiscounts(response.data.discounts);
      } else {
        setAvailableDiscounts([]);
      }
    } catch (error) {
      console.error("Error fetching suitable discounts:", error.response?.data || error.message);
      setAvailableDiscounts([]);
    } finally {
      setLoadingDiscounts(false);
    }
  }, [cartItems]);

  useEffect(() => {
    const init = async () => {
      const isAuth = await checkAuthentication();
      if (isAuth) {
        fetchCart();
        fetchProvinces();
      }
    };

    init();
  }, [checkAuthentication, fetchCart, fetchProvinces]);

  // Fetch suitable discounts whenever cart items change
  useEffect(() => {
    if (cartItems.length > 0) {
      fetchSuitableDiscounts();
    }
  }, [cartItems, fetchSuitableDiscounts]);

  // Recalculate shipping fee when address changes
  useEffect(() => {
    if (isAuthenticated && shippingAddress.ward && shippingAddress.district) {
      calculateShippingFee();
    }
  }, [shippingAddress.ward, shippingAddress.district, calculateShippingFee, isAuthenticated]);

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

  // Toggle discount list visibility
  const handleToggleDiscountList = () => {
    setShowDiscountList(!showDiscountList);
  };

  // Apply a discount from the list
  const handleApplyDiscount = (discount) => {
    if (!discount) return;

    // Calculate discount amount based on discount type
    let calculatedDiscountAmount = 0;

    if (discount.type === 'PERCENTAGE' || discount.type === 'percentage') {
      // Calculate percentage discount
      const subtotal = cartItems.reduce((total, item) => total + (item.book.price * item.quantity), 0);
      calculatedDiscountAmount = subtotal * (discount.value / 100);

      // Cap at maxDiscount if defined
      if (discount.maxDiscount && calculatedDiscountAmount > discount.maxDiscount) {
        calculatedDiscountAmount = discount.maxDiscount;
      }
    } else {
      // Fixed amount discount
      calculatedDiscountAmount = discount.value;
    }

    setDiscountAmount(calculatedDiscountAmount);
    setAppliedDiscount({
      code: discount.code,
      amount: calculatedDiscountAmount,
      _id: discount._id,
      description: discount.description || ""
    });

    setAlert({
      open: true,
      message: "Áp dụng mã giảm giá thành công",
      severity: "success"
    });

    setShowDiscountList(false);
  };

  // Apply discount by code
  const handleApplyDiscountByCode = async () => {
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

      // Find if the discount exists in available discounts
      const foundDiscount = availableDiscounts.find(
        discount => discount.code.toLowerCase() === discountCode.toLowerCase()
      );

      if (foundDiscount) {
        handleApplyDiscount(foundDiscount);
      } else {
        setAlert({
          open: true,
          message: "Mã giảm giá không hợp lệ hoặc không áp dụng được cho đơn hàng này",
          severity: "error"
        });
      }
    } catch (error) {
      console.error("Error applying discount:", error);
      setAlert({
        open: true,
        message: "Có lỗi xảy ra khi áp dụng mã giảm giá",
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
  const totalAmount = (subtotal || 0) + (shippingFee || 0) - (discountAmount || 0) - (pointsToUse || 0);

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
        navigate("/account/login");
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
          provineName: selectedProvince?.name || "",
          districtName: selectedDistrict?.name || "",
          wardName: selectedWard?.name || "",
          note: shippingAddress.notes || "",
          fee: shippingFee
        },
        paymentMethod: paymentMethod,
        // Remove totalDiscount and use discountUsed instead
        discountUsed: appliedDiscount?._id || null, // Use the _id from the discount object
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

      // Store order info in localStorage
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

      // If payment method is online, redirect to payment gateway
      if (paymentMethod === "Online") {
        // Call create payment API
        const paymentResponse = await axios.post(
          "http://localhost:9999/payment/create",
          { orderId },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        // Redirect to payment URL
        if (paymentResponse.data.paymentUrl) {
          window.location.href = paymentResponse.data.paymentUrl;
        } else {
          throw new Error("Payment URL not found in response");
        }
      } else {
        // For COD, redirect directly to order success page
        navigate("/payment-success");
      }
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

  // Discount list component
  const DiscountsList = () => {
    if (availableDiscounts.length === 0) {
      return (
        <Typography variant="body2" color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>
          Không có mã giảm giá nào phù hợp với đơn hàng
        </Typography>
      );
    }

    return (
      <List sx={{ width: '100%', mt: 1, maxHeight: 250, overflow: 'auto', borderRadius: 1, border: '1px solid #e0e0e0' }}>
        {availableDiscounts.map((discount) => {
          // Format the discount description
          let discountDesc = "";
          if (discount.type === 'PERCENTAGE' || discount.type === 'percentage') {
            discountDesc = `Giảm ${discount.value}%`;
            if (discount.maxDiscount) {
              discountDesc += ` (tối đa ${discount.maxDiscount.toLocaleString()}₫)`;
            }
          } else {
            discountDesc = `Giảm ${discount.value.toLocaleString()}₫`;
          }

          return (
            <ListItem
              key={discount._id}
              divider
              button
              onClick={() => handleApplyDiscount(discount)}
              sx={{
                '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' },
                borderLeft: '4px solid #2196f3'
              }}
            >
              <Box sx={{ width: '100%' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#2196f3' }}>
                    {discount.code}
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleApplyDiscount(discount);
                    }}
                  >
                    Áp dụng
                  </Button>
                </Box>
                <Typography variant="body2">{discountDesc}</Typography>
                {discount.description && (
                  <Typography variant="body2" color="text.secondary">
                    {discount.description}
                  </Typography>
                )}
                {discount.minOrderValue > 0 && (
                  <Typography variant="body2" color="text.secondary">
                    Đơn tối thiểu: {discount.minOrderValue.toLocaleString()}₫
                  </Typography>
                )}
                {discount.expiryDate && (
                  <Typography variant="caption" color="text.secondary">
                    HSD: {new Date(discount.expiryDate).toLocaleDateString('vi-VN')}
                  </Typography>
                )}
              </Box>
            </ListItem>
          );
        })}
      </List>
    );
  };

  // Login page component
  const LoginPrompt = () => (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography variant="h5" component="h1" gutterBottom>
          Vui lòng đăng nhập để tiếp tục
        </Typography>
        <Typography variant="body1" sx={{ mb: 3, textAlign: 'center' }}>
          Bạn cần đăng nhập để truy cập trang thanh toán và hoàn tất đơn hàng của mình.
        </Typography>
        <Box sx={{ mt: 2 }}>
          <Button
            variant="contained"
            color="primary"
            component={Link}
            to="/account/login"
          >
            Đăng nhập
          </Button>
        </Box>
      </Paper>
    </Container>
  );

  // Show loading state
  if (isLoading) {
    return (
      <>
        <CheckoutBreadCrumb />
        <Container sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
          <CircularProgress />
        </Container>
      </>
    );
  }

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
        {!isAuthenticated ? (
          <LoginPrompt />
        ) : (
          <>
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
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                        <LocalOfferIcon sx={{ mr: 1, fontSize: "medium" }} />
                        Mã giảm giá
                      </Typography>

                      {appliedDiscount ? (
                        // Applied discount view - clean and informative
                        <Box sx={{
                          mt: 2,
                          p: 2,
                          bgcolor: 'rgba(33, 150, 243, 0.08)',
                          borderRadius: 1,
                          border: '1px dashed #2196f3'
                        }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box>
                              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#2196f3', display: 'flex', alignItems: 'center' }}>
                                <LocalOfferIcon sx={{ mr: 1, fontSize: 18 }} />
                                {appliedDiscount.code}
                              </Typography>
                              <Typography variant="body2" sx={{ color: 'success.main', fontWeight: 'medium', mt: 0.5 }}>
                                Giảm: {appliedDiscount.amount.toLocaleString()}₫
                              </Typography>
                              {appliedDiscount.description && (
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                  {appliedDiscount.description}
                                </Typography>
                              )}
                            </Box>
                            <Button
                              variant="outlined"
                              color="error"
                              size="small"
                              onClick={handleRemoveDiscount}
                              sx={{ minWidth: 80 }}
                            >
                              Xóa
                            </Button>
                          </Box>
                        </Box>
                      ) : (
                        // Not applied discount view - input and available discounts
                        <>
                          <Box sx={{ mt: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                              <TextField
                                fullWidth
                                label="Nhập mã giảm giá"
                                variant="outlined"
                                value={discountCode}
                                onChange={handleDiscountCodeChange}
                                size="small"
                                placeholder="Nhập mã giảm giá tại đây"

                              />
                              <Button
                                variant="contained"
                                color="primary"
                                onClick={handleApplyDiscountByCode}
                                disabled={applyingDiscount || !discountCode.trim()}
                                sx={{
                                  height: 40,
                                  fontSize: '0.75rem',
                                  paddingTop: 2,  // or you can use '12px'
                                  paddingBottom: 2  // or you can use '12px'
                                }}
                              >
                                {applyingDiscount ? <CircularProgress size={10} /> : "Áp dụng"}
                              </Button>
                            </Box>
                          </Box>

                          {/* Available discounts toggle button */}
                          <Box sx={{ mt: 2 }}>
                            <Button
                              variant="text"
                              color="primary"
                              onClick={handleToggleDiscountList}
                              endIcon={showDiscountList ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                              sx={{ textTransform: 'none', p: 0 }}
                            >
                              {showDiscountList ? "Ẩn mã giảm giá" : "Xem mã giảm giá có thể áp dụng"}
                              {loadingDiscounts && <CircularProgress size={16} sx={{ ml: 1 }} />}
                              {!loadingDiscounts && availableDiscounts.length > 0 && (
                                <Typography component="span" variant="body2" sx={{ ml: 1, color: 'primary.main', fontWeight: 'bold' }}>
                                  ({availableDiscounts.length})
                                </Typography>
                              )}
                            </Button>
                          </Box>

                          {/* List of available discounts */}
                          <Collapse in={showDiscountList} sx={{ mt: 1 }}>
                            {loadingDiscounts ? (
                              <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                                <CircularProgress size={24} />
                              </Box>
                            ) : (
                              <DiscountsList />
                            )}
                          </Collapse>
                        </>
                      )}
                    </Box>

                    {/* Points Section */}
                    {availablePoints > 0 && (
                      <Paper sx={{ p: 3, mb: 3 }}>
                        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                          <Box component="span" sx={{ mr: 1, display: 'flex' }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="currentColor" />
                            </svg>
                          </Box>
                          Điểm thưởng
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 2, mt: 1 }}>
                          <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                            Điểm hiện có: <Typography component="span" sx={{ ml: 1, fontWeight: 'bold', color: 'primary.main' }}>{availablePoints.toLocaleString()}</Typography>
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: '200px' }}>
                            <TextField
                              type="number"
                              label="Số điểm muốn sử dụng"
                              size="small"
                              value={pointsToUse}
                              onChange={handlePointsChange}
                              fullWidth
                              inputProps={{ min: 0, max: availablePoints }}
                            />
                          </Box>
                        </Box>
                        {pointsToUse > 0 && (
                          <Typography variant="body2" sx={{ mt: 1, color: 'success.main' }}>
                            Bạn sẽ tiết kiệm được {pointsToUse.toLocaleString()}₫ với {pointsToUse} điểm
                          </Typography>
                        )}
                      </Paper>
                    )}

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
                      <Typography variant="h6" color="error">
                        {(totalAmount || 0).toLocaleString()}₫
                      </Typography>
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
          </>
        )}
      </Container>
    </>
  );
}

export default OrderPage;