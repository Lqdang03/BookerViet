import React, { useState, useEffect } from "react";
import {
    Typography, Button, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Paper, IconButton, Dialog, DialogTitle, DialogContent,
    DialogActions, TextField, Grid, Box, FormControl, InputLabel, Select, MenuItem,
    Alert
} from "@mui/material";
import { Delete, Check } from "@mui/icons-material";
import axios from "axios";

const OrderManagement = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [openBoxDialog, setOpenBoxDialog] = useState(false);
    const [currentOrder, setCurrentOrder] = useState(null);
    const [boxInfo, setBoxInfo] = useState({
        weight: "",
        length: "",
        height: "",
        width: ""
    });

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token") || sessionStorage.getItem("token");
            if (!token) {
                setError("Bạn cần đăng nhập để xem danh sách đơn hàng");
                setLoading(false);
                return;
            }
            
            const response = await axios.get("http://localhost:9999/admin/orders", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setOrders(response.data);
            setLoading(false);
        } catch (error) {
            console.error("Lỗi khi lấy danh sách đơn hàng", error);
            setError("Có lỗi xảy ra khi lấy danh sách đơn hàng");
            setLoading(false);
        }
    };

    const handleDeleteOrder = async (orderId) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa đơn hàng này không?")) {
            try {
                const token = localStorage.getItem("token") || sessionStorage.getItem("token");
                if (!token) return;
                
                await axios.delete(`http://localhost:9999/admin/orders/${orderId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                // Refresh danh sách đơn hàng sau khi xóa
                fetchOrders();
            } catch (error) {
                console.error("Lỗi khi xóa đơn hàng", error);
                setError("Có lỗi xảy ra khi xóa đơn hàng");
            }
        }
    };

    const handleOpenBoxDialog = (order) => {
        setCurrentOrder(order);
        // Nếu đơn hàng đã có boxInfo, sử dụng thông tin đó
        if (order.boxInfo) {
            setBoxInfo({
                weight: order.boxInfo.weight || "",
                length: order.boxInfo.length || "",
                height: order.boxInfo.height || "",
                width: order.boxInfo.width || ""
            });
        } else {
            // Reset về giá trị mặc định nếu chưa có
            setBoxInfo({
                weight: "",
                length: "",
                height: "",
                width: ""
            });
        }
        setOpenBoxDialog(true);
    };

    const handleCloseBoxDialog = () => {
        setOpenBoxDialog(false);
        setCurrentOrder(null);
    };

    const handleBoxInfoChange = (e) => {
        setBoxInfo({
            ...boxInfo,
            [e.target.name]: e.target.value
        });
    };

    const handleConfirmOrder = async () => {
        try {
            const token = localStorage.getItem("token") || sessionStorage.getItem("token");
            if (!token || !currentOrder) return;

            // Cập nhật thông tin boxInfo
            await axios.post(`http://localhost:9999/admin/orders/update-box-info/${currentOrder._id}`, 
                { boxInfo },
                { headers: { Authorization: `Bearer ${token}` }}
            );

            // Chuyển trạng thái đơn hàng sang Processing
            await axios.post(`http://localhost:9999/admin/orders/confirm/${currentOrder._id}`, 
                {},
                { headers: { Authorization: `Bearer ${token}` }}
            );

            // Đóng dialog và refresh danh sách
            handleCloseBoxDialog();
            fetchOrders();
        } catch (error) {
            console.error("Lỗi khi xác nhận đơn hàng", error);
            setError("Có lỗi xảy ra khi xác nhận đơn hàng");
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    const calculateTotalAmount = (order) => {
        let total = 0;
        if (order.items && order.items.length > 0) {
            order.items.forEach(item => {
                if (item.book && item.book.price) {
                    total += item.book.price * item.quantity;
                }
            });
        }
        // Trừ giảm giá và điểm sử dụng nếu có
        total -= (order.totalDiscount || 0) + (order.pointUsed || 0);
        return total;
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Pending': return '#FFA500'; // Orange
            case 'Processing': return '#1E90FF'; // Blue
            case 'Shipped': return '#9370DB'; // Purple
            case 'Delivered': return '#32CD32'; // Green
            case 'Cancelled': return '#DC143C'; // Red
            default: return '#000000';
        }
    };

    const getStatusTranslation = (status) => {
        switch (status) {
            case 'Pending': return 'Chờ xử lý';
            case 'Processing': return 'Đang xử lý';
            case 'Shipped': return 'Đã gửi';
            case 'Delivered': return 'Đã giao';
            case 'Cancelled': return 'Đã hủy';
            default: return status;
        }
    };

    const getPaymentMethodTranslation = (method) => {
        return method === 'COD' ? 'Thanh toán khi nhận hàng' : 'Thanh toán online';
    };

    const getPaymentStatusTranslation = (status) => {
        return status === 'Pending' ? 'Chờ thanh toán' : 'Đã thanh toán';
    };

    if (loading) return <Typography>Đang tải dữ liệu...</Typography>;
    if (error) return <Alert severity="error">{error}</Alert>;

    return (
        <Box sx={{padding: 1, width: "100%", maxWidth: "calc(100% - 250px)", margin: "auto"}}>
            <Typography variant="h4" gutterBottom>Quản lý đơn hàng</Typography>
            
            <TableContainer component={Paper} sx={{ marginTop: 2 }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Mã đơn hàng</TableCell>
                            <TableCell>Khách hàng</TableCell>
                            <TableCell>Ngày đặt</TableCell>
                            <TableCell>Phương thức thanh toán</TableCell>
                            <TableCell>Trạng thái thanh toán</TableCell>
                            <TableCell>Tổng tiền (VNĐ)</TableCell>
                            <TableCell>Trạng thái đơn hàng</TableCell>
                            <TableCell>Thông tin vận chuyển</TableCell>
                            <TableCell>Thao tác</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {orders.map((order) => (
                            <TableRow key={order._id}>
                                <TableCell>{order._id.slice(-6).toUpperCase()}</TableCell>
                                <TableCell>{order.user ? `${order.user.name} (${order.user.email})` : 'N/A'}</TableCell>
                                <TableCell>{formatDate(order.createdAt)}</TableCell>
                                <TableCell>{getPaymentMethodTranslation(order.paymentMethod)}</TableCell>
                                <TableCell>{getPaymentStatusTranslation(order.paymentStatus)}</TableCell>
                                <TableCell>{calculateTotalAmount(order).toLocaleString('vi-VN')} VNĐ</TableCell>
                                <TableCell>
                                    <Box 
                                        sx={{ 
                                            color: getStatusColor(order.orderStatus),
                                            fontWeight: 'bold'
                                        }}
                                    >
                                        {getStatusTranslation(order.orderStatus)}
                                    </Box>
                                </TableCell>
                                <TableCell>
                                    {order.boxInfo ? (
                                        <Typography variant="body2">
                                            KT: {order.boxInfo.length}x{order.boxInfo.width}x{order.boxInfo.height}cm, 
                                            {order.boxInfo.weight}kg
                                        </Typography>
                                    ) : (
                                        <Typography variant="body2" color="text.secondary">Chưa có</Typography>
                                    )}
                                </TableCell>
                                <TableCell>
                                    {order.orderStatus === 'Pending' && (
                                        <>
                                            <IconButton 
                                                color="primary" 
                                                onClick={() => handleOpenBoxDialog(order)}
                                                title="Xác nhận và chuyển sang đang xử lý"
                                            >
                                                <Check />
                                            </IconButton>
                                            <IconButton 
                                                color="error" 
                                                onClick={() => handleDeleteOrder(order._id)}
                                                title="Xóa đơn hàng"
                                            >
                                                <Delete />
                                            </IconButton>
                                        </>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Dialog nhập thông tin box */}
            <Dialog open={openBoxDialog} onClose={handleCloseBoxDialog} fullWidth>
                <DialogTitle>Nhập thông tin đóng gói</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={6}>
                            <TextField
                                name="weight"
                                label="Cân nặng (kg)"
                                type="number"
                                fullWidth
                                value={boxInfo.weight}
                                onChange={handleBoxInfoChange}
                                inputProps={{ min: 0, step: 0.1 }}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                name="length"
                                label="Chiều dài (cm)"
                                type="number"
                                fullWidth
                                value={boxInfo.length}
                                onChange={handleBoxInfoChange}
                                inputProps={{ min: 0 }}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                name="width"
                                label="Chiều rộng (cm)"
                                type="number"
                                fullWidth
                                value={boxInfo.width}
                                onChange={handleBoxInfoChange}
                                inputProps={{ min: 0 }}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                name="height"
                                label="Chiều cao (cm)"
                                type="number"
                                fullWidth
                                value={boxInfo.height}
                                onChange={handleBoxInfoChange}
                                inputProps={{ min: 0 }}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseBoxDialog} color="secondary">Hủy</Button>
                    <Button 
                        onClick={handleConfirmOrder} 
                        color="primary"
                        disabled={!boxInfo.weight || !boxInfo.length || !boxInfo.width || !boxInfo.height}
                    >
                        Xác nhận
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default OrderManagement;