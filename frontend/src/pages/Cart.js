import React, { useState, useEffect, useCallback } from "react";
import {
  Container,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Box,
  Snackbar,
  Alert,
} from "@mui/material";
import { Link } from "react-router-dom";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import DeleteIcon from "@mui/icons-material/Delete";
import axios from "axios";
import CartBreadCrumb from "../components/Breadcrumbs/CartBreadCrumb";

function Cart({ updateCartData }) {
  const [cartItems, setCartItems] = useState([]);
  const [message, setMessage] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const fetchCart = useCallback(async () => {
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      if (!token) {
        console.error("Không tìm thấy token, vui lòng đăng nhập lại.");
        return;
      }

      const response = await axios.get("http://localhost:9999/cart", {
        headers: { Authorization: `Bearer ${token}` }
      });

      setCartItems(response.data.cartItems);

      // Update parent component
      if (updateCartData) {
        updateCartData();
      }
    } catch (error) {
      console.error("Error fetching cart:", error.response?.data || error.message);
    }
  }, []);

  // Fetch cart items when the component mounts
  useEffect(() => {
    fetchCart();
  }, [fetchCart]); // Thêm fetchCart vào dependencies

  const handleIncrease = async (id) => {
    const updatedItem = cartItems.find((item) => item.book._id === id);
    if (updatedItem) {
      try {
        const token = localStorage.getItem("token") || sessionStorage.getItem("token");
        if (!token) {
          console.error("Không tìm thấy token, vui lòng đăng nhập lại.");
          return;
        }

        await axios.put("http://localhost:9999/cart/update",
          { bookId: id, quantity: updatedItem.quantity + 1 },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        fetchCart();
      } catch (error) {
        console.error("Error updating quantity:", error);
      }
    }
  };

  const handleDecrease = async (id) => {
    const updatedItem = cartItems.find((item) => item.book._id === id);
    if (updatedItem && updatedItem.quantity > 1) {
      try {
        const token = localStorage.getItem("token") || sessionStorage.getItem("token");
        if (!token) {
          console.error("Không tìm thấy token, vui lòng đăng nhập lại.");
          return;
        }

        await axios.put("http://localhost:9999/cart/update",
          { bookId: id, quantity: updatedItem.quantity - 1 },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        fetchCart();
      } catch (error) {
        console.error("Error updating quantity:", error);
      }
    } else {
      handleRemove(id);
    }
  };

  const handleRemove = async (id) => {
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      if (!token) {
        console.error("Không tìm thấy token, vui lòng đăng nhập lại.");
        return;
      }

      const response = await axios.delete(`http://localhost:9999/cart/remove/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Display the success message from the server
      if (response.data && response.data.message) {
        setMessage(response.data.message);
        setOpenSnackbar(true);
      }
      
      fetchCart();
    } catch (error) {
      console.error("Error removing item:", error);
      // Display error message if available
      if (error.response && error.response.data && error.response.data.message) {
        setMessage(error.response.data.message);
        setOpenSnackbar(true);
      }
    }
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  const totalAmount = cartItems.reduce(
    (acc, item) => acc + item.book.price * item.quantity,
    0
  );

  return (
    <>
      <CartBreadCrumb />
      <Container sx={{ mt: 1, mb: 4 }}>
        <Snackbar
          open={openSnackbar}
          autoHideDuration={3000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
            {message}
          </Alert>
        </Snackbar>

        <Typography variant="h5" gutterBottom>
          Giỏ hàng của bạn
        </Typography>
        {cartItems.length === 0 ? (
          <Typography variant="body1" color="textSecondary" align="center" mb={17}>
            <ShoppingBagOutlinedIcon sx={{ fontSize: 100 }} />
            <br />
            Không có sản phẩm nào trong giỏ hàng của bạn
          </Typography>
        ) : (
          <>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Thông tin sản phẩm</TableCell>
                    <TableCell sx={{ textAlign: "center" }}>Đơn giá</TableCell>
                    <TableCell sx={{ textAlign: "center" }}>Số lượng</TableCell>
                    <TableCell sx={{ textAlign: "center" }}>Thành tiền</TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {cartItems.map((item) => (
                    <TableRow key={item.book._id}>
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "right" }}>
                          <Link to={`/book/${item.book._id}`} style={{ textDecoration: "none" }}>
                            <img
                              src={item.book.images}
                              alt={item.book.name}
                              width={80}
                              height={100}
                              style={{ objectFit: "cover", borderRadius: "5px", cursor: "pointer" }}
                            />
                          </Link>
                          <Typography
                            sx={{
                              fontWeight: "bold",
                              fontSize: "1rem",
                              ml: 5,
                              '&:hover': { color: '#187bcd' }
                            }}
                          >
                            <Link
                              to={`/book/${item.book._id}`}
                              style={{ textDecoration: "none", color: "inherit" }}
                            >
                              {item.book.title}
                            </Link>
                          </Typography>
                        </Box>
                      </TableCell>

                      <TableCell sx={{ textAlign: "center" }}>
                        {item.book.price.toLocaleString()}₫
                      </TableCell>

                      <TableCell sx={{ textAlign: "center" }}>
                        <IconButton onClick={() => handleDecrease(item.book._id)}>
                          <RemoveIcon />
                        </IconButton>
                        {item.quantity}
                        <IconButton onClick={() => handleIncrease(item.book._id)}>
                          <AddIcon />
                        </IconButton>
                      </TableCell>

                      <TableCell sx={{ textAlign: "center", color: "#187bcd" }}>
                        {(item.book.price * item.quantity).toLocaleString()}₫
                      </TableCell>

                      <TableCell>
                        <IconButton onClick={() => handleRemove(item.book._id)} color="error">
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <Box sx={{ mt: 2, textAlign: "right" }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Tổng tiền: <span style={{ color: "#187bcd" }}> {totalAmount.toLocaleString()}₫</span>
              </Typography>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Button component={Link} to="/" variant="contained" sx={{ backgroundColor: "#6c757d" }}>
                  Tiếp tục mua hàng
                </Button>
                <Button
                  component={Link}
                  to="/checkout"
                  variant="contained"
                  color="primary"
                  sx={{ padding: "8px 24px", minWidth: "180px" }} 
                >
                  Thanh toán
                </Button>
              </Box>
            </Box>
          </>
        )}
      </Container>
    </>
  );
}

export default Cart;