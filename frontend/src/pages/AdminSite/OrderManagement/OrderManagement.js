import React, { useState, useEffect } from "react";
import {
    Typography, Button, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Paper, IconButton, Box, Alert, TablePagination,
    Snackbar
} from "@mui/material";
import { Delete, Check, Edit, Visibility } from "@mui/icons-material";
import axios from "axios";
import OrderDetailsDialog from "./OrderDetailsDialog";
import EditBoxDialog from "./EditBoxDialog";

const OrderManagement = () => {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [viewDialogOpen, setViewDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [currentOrder, setCurrentOrder] = useState(null);
    const [alert, setAlert] = useState({ open: false, message: "", severity: "info" });

    // hiển thị thông báo
    const handleAlert = (message, severity = "info") => {
        setAlert({ open: true, message, severity });
    };
    // Close alert
    const handleCloseAlert = () => {
        setAlert({ ...alert, open: false });
    };


    useEffect(() => {
        fetchOrders();
    }, []);

    //Lấy các dữ liệu orders
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

    //Hàm xác nhận đơn hàng
    const handleDeleteOrder = async (orderId) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa đơn hàng này không?")) {
            try {
                const token = localStorage.getItem("token") || sessionStorage.getItem("token");
                if (!token) return;

                await axios.delete(`http://localhost:9999/admin/orders/${orderId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                handleAlert("xoá thông tin đơn hàng thành công", "success");
                // Refresh danh sách đơn hàng sau khi xóa
                fetchOrders();
            } catch (error) {
                console.error("Lỗi khi xóa đơn hàng", error);
                setError("Có lỗi xảy ra khi xóa đơn hàng");
            }
        }
    };

    const handleConfirmOrder = async (orderId) => {
        try {
            const token = localStorage.getItem("token") || sessionStorage.getItem("token");
            if (!token) return;

            // Chuyển trạng thái đơn hàng sang Processing
            const response = await axios.post(
                `http://localhost:9999/admin/orders/confirm/${orderId}`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // Hiển thị thông báo thành công nếu có
            handleAlert("Xác nhận thông tin đơn hàng thành công", "success");

            // và refresh danh sách
            fetchOrders();
        } catch (error) {
            console.error("Lỗi khi xác nhận đơn hàng", error);

            // Hiển thị thông báo lỗi từ backend nếu có
            if (error.response && error.response.data && error.response.data.message) {
                setError(error.response.data.message);
                handleAlert(`${error.response.data.message}`, "error");
            } else {
                setError("Có lỗi xảy ra khi xác nhận đơn hàng");
                handleAlert(`${error}`, "error");
            }
        }
    };

    // Hàm xử lý mở dialog xem chi tiết
    const handleViewOrder = (order) => {
        setSelectedOrder(order);
        setViewDialogOpen(true);
    };

    // Hàm xử lý mở dialog chỉnh sửa
    const handleEditBox = (order) => {
        setCurrentOrder(order);
        setEditDialogOpen(true);
    };

    // Hàm lưu thông tin box
    const handleSaveBox = async (boxInfo) => {
        try {
            const token = localStorage.getItem("token") || sessionStorage.getItem("token");
            await axios.post(
                `http://localhost:9999/admin/orders/update-box-info/${currentOrder._id}`,
                { boxInfo },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            handleAlert("Nhập thông tin đóng gói thành công", "success");
            fetchOrders();
        } catch (error) {
            console.error("Lỗi khi cập nhật thông tin đóng gói", error);
            setError("Có lỗi xảy ra khi cập nhật thông tin đóng gói");
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
        // Cộng thêm phí ship
        total += (order.shippingInfo && order.shippingInfo.fee ? order.shippingInfo.fee : 0);
        return total;
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Pending': return '#FFA500'; // Orange
            case 'Processing': return '#1E90FF'; // Blue
            case 'Shipped': return '#9370DB'; // Purple
            case 'Delivered': return '#32CD32'; // Green
            case 'Cancelled': return '#DC143C'; // Red
            case 'Completed': return '#32CD32';
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

    //Thực hiện phân trang
    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };
    return (
        <Box sx={{ padding: 1, width: "100%", maxWidth: "calc(100% - 250px)", margin: "auto" }}>
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
                        {orders
                            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                            .map((order, index) => (
                                <TableRow key={order._id}>
                                    <TableCell>{order._id.slice(-6).toUpperCase()}</TableCell>
                                    <TableCell>{order.user ? `${order.user.name} ` : 'N/A'}</TableCell>
                                    <TableCell>{formatDate(order.createdAt)}</TableCell>
                                    <TableCell>{getPaymentMethodTranslation(order.paymentMethod)}</TableCell>
                                    <TableCell>
                                        <Box
                                            sx={{
                                                color: getStatusColor(order.paymentStatus),
                                                fontWeight: 'bold'
                                            }}
                                        >
                                            {getPaymentStatusTranslation(order.paymentStatus)}
                                        </Box>
                                    </TableCell>
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
                                                {order.boxInfo.weight}g
                                            </Typography>
                                        ) : (
                                            <Typography variant="body2" color="text.secondary">Chưa có</Typography>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, maxWidth: 140 }}>
                                            <IconButton
                                                color="info"
                                                onClick={() => handleViewOrder(order)}
                                                title="Xem chi tiết"
                                            >
                                                <Visibility />
                                            </IconButton>

                                            {order.orderStatus === 'Pending' && (
                                                <>
                                                    <IconButton
                                                        color="primary"
                                                        onClick={() => handleConfirmOrder(order._id)}
                                                        title="Xác nhận đơn hàng"
                                                        disabled={!order.boxInfo}
                                                    >
                                                        <Check />
                                                    </IconButton>

                                                    <IconButton
                                                        color="secondary"
                                                        onClick={() => handleEditBox(order)}
                                                        title="Chỉnh sửa đóng gói"
                                                    >
                                                        <Edit />
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
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ))}
                    </TableBody>
                </Table>
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={orders.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </TableContainer>

            {/* Dialog components */}
            <OrderDetailsDialog
                open={viewDialogOpen}
                order={selectedOrder}
                onClose={() => setViewDialogOpen(false)}
            />

            <EditBoxDialog
                open={editDialogOpen}
                order={currentOrder}
                onClose={() => setEditDialogOpen(false)}
                onSave={handleSaveBox}
            />
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
        </Box>
    );
};

export default OrderManagement;