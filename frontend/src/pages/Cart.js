import React, { useState, useEffect } from "react";
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
} from "@mui/material";
import { Link } from "react-router-dom";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import DeleteIcon from "@mui/icons-material/Delete";
import axios from "axios";

function Cart() {
  const [cartItems, setCartItems] = useState([]);

  // Fetch cart items when the component mounts
  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
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
    } catch (error) {
        console.error("Error fetching cart:", error.response?.data || error.message);
    }
};


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
                { headers: { Authorization: `Bearer ${token}` } } // ✅ Thêm header
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
                { headers: { Authorization: `Bearer ${token}` } } // ✅ Thêm header
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

        await axios.delete(`http://localhost:9999/cart/remove/${id}`, {
            headers: { Authorization: `Bearer ${token}` } // ✅ Thêm header
        });
        fetchCart();
    } catch (error) {
        console.error("Error removing item:", error);
    }
};


  const totalAmount = cartItems.reduce(
    (acc, item) => acc + item.book.price * item.quantity,
    0
  );

  return (
    <Container sx={{ mt: 4, mb: 4 }}>
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
                  <TableCell></TableCell>
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
                      <img src={item.book.images} alt={item.book.name} width={100} />
                    </TableCell>
                    <TableCell>{item.book.title}</TableCell>
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
                    <TableCell sx={{ textAlign: "center" }}>
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
              Tổng tiền: {totalAmount.toLocaleString()}₫
            </Typography>
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Button component={Link} to="/" variant="contained" sx={{ backgroundColor: "#6c757d" }}>
                Tiếp tục mua hàng
              </Button>
              <Button variant="contained" color="primary">
                Thanh toán
              </Button>
            </Box>
          </Box>
        </>
      )}
    </Container>
  );
}

export default Cart;
