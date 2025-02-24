import React, { useState } from "react";
import { Container, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Box } from "@mui/material";
import { Link } from "react-router-dom";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import DeleteIcon from "@mui/icons-material/Delete";

const fakeCartItems = [
    {
        id: 1,
        name: "Bộ Sách Storytime - Truyện Hay Nuôi Dưỡng Tâm Hồn (10 Cuốn)",
        price: 290000,
        quantity: 1,
        image: "https://bizweb.dktcdn.net/100/445/986/products/2171303006681.jpg?v=1700470329683"
    },
    {
        id: 2,
        name: "Bộ Sách Storytime - Truyện Hay Nuôi Dưỡng Tâm Hồn (10 Cuốn)",
        price: 300000,
        quantity: 1,
        image: "https://bizweb.dktcdn.net/100/445/986/products/2171303006681.jpg?v=1700470329683",
        discount: '10%'
    }
];

function Cart() {
    const [cartItems, setCartItems] = useState(fakeCartItems);

    const handleIncrease = (id) => {
        setCartItems(cartItems.map(item => item.id === id ? { ...item, quantity: item.quantity + 1 } : item));
    };

    const handleDecrease = (id) => {
        setCartItems(cartItems.map(item => 
            item.id === id ? { ...item, quantity: item.quantity - 1 } : item
        ).filter(item => item.quantity > 0));
    };
    

    const handleRemove = (id) => {
        setCartItems(cartItems.filter(item => item.id !== id));
    };

    const totalAmount = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

    return (
        <div>
            <Container sx={{ mt: 4, mb: 4 }}>
                <Typography variant="h5" gutterBottom>
                    Giỏ hàng của bạn
                </Typography>
                {cartItems.length === 0 ? (
                    <Typography variant="body1" color="textSecondary" align="center" mb={17}>
                        <ShoppingBagOutlinedIcon sx={{ fontSize: 100 }} />
                        <br />Không có sản phẩm nào trong giỏ hàng của bạn
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
                                    {cartItems.map(item => (
                                        <TableRow key={item.id}>
                                            <TableCell><img src={item.image} alt={item.name} width={100} /></TableCell>
                                            <TableCell>{item.name}</TableCell>
                                            <TableCell sx={{ textAlign: "center" }}>{item.price.toLocaleString()}₫</TableCell>
                                            <TableCell sx={{ textAlign: "center" }}>
                                                <IconButton onClick={() => handleDecrease(item.id)}><RemoveIcon /></IconButton>
                                                {item.quantity}
                                                <IconButton onClick={() => handleIncrease(item.id)}><AddIcon /></IconButton>
                                            </TableCell>
                                            <TableCell sx={{ textAlign: "center" }}>{(item.price * item.quantity).toLocaleString()}₫</TableCell>
                                            <TableCell>
                                                <IconButton onClick={() => handleRemove(item.id)} color="error"><DeleteIcon /></IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                        <Box sx={{ mt: 2, textAlign: "right" }}>
                            <Typography variant="h6" sx={{ mb: 2 }}>Tổng tiền: {totalAmount.toLocaleString()}₫</Typography>
                            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                                <Button component={Link} to="/" variant="contained" sx={{ backgroundColor: "#6c757d" }}>Tiếp tục mua hàng</Button>
                                <Button variant="contained" color="primary">Thanh toán</Button>
                            </Box>
                        </Box>
                    </>
                )}
            </Container>
        </div>
    );
}

export default Cart;
