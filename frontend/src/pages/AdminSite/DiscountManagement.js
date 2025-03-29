import React, { useState, useEffect } from "react";
import {
    Container, Typography, Button, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Paper, IconButton, Dialog, DialogTitle, DialogContent,
    DialogActions, TextField, Grid, MenuItem, Select, InputLabel, FormControl,
    Box, TablePagination, FormHelperText, Card, CardContent,
    Switch
} from "@mui/material";
import { Delete, Edit, Search, Refresh } from "@mui/icons-material";
import axios from "axios";

const DiscountManagement = () => {
    const [discounts, setDiscounts] = useState([]);
    const [filteredDiscounts, setFilteredDiscounts] = useState([]);
    const [open, setOpen] = useState(false);
    const [currentDiscount, setCurrentDiscount] = useState({
        code: "", type: "percentage", value: "", minPurchase: "",
        usageLimit: "", usedCount: 0, startDate: "", endDate: ""
    });
    const [errors, setErrors] = useState({});
    const [isEditing, setIsEditing] = useState(false);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [backendErrors, setBackendErrors] = useState(null);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    });
    // Filter states
    const [filterCode, setFilterCode] = useState("");
    const [filterType, setFilterType] = useState("all");
    const [filterStatus, setFilterStatus] = useState("all");

    useEffect(() => {
        fetchDiscounts();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [discounts, filterCode, filterType, filterStatus]);

    const fetchDiscounts = async () => {
        try {
            const token = localStorage.getItem("token") || sessionStorage.getItem("token");
            if (!token) return;
            const response = await axios.get("http://localhost:9999/admin/discounts", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setDiscounts(response.data);
            setFilteredDiscounts(response.data);
        } catch (error) {
            console.error("Error fetching discounts", error);
        }
    };

    const handleOpen = (discount = {
        code: "", type: "percentage", value: "", minPurchase: "",
        usageLimit: "", usedCount: 0, startDate: "", endDate: ""
    }) => {
        setCurrentDiscount({
            ...discount,
            startDate: discount.startDate ? discount.startDate.slice(0, 10) : "",
            endDate: discount.endDate ? discount.endDate.slice(0, 10) : "",
        });
        setIsEditing(!!discount._id);
        setOpen(true);
        setErrors({});
    };

    const handleClose = () => {
        setOpen(false);
    };
    // New method to handle error responses consistently
    const handleErrorResponse = (error) => {
        console.error("Error:", error);

        // Check if error has response from server
        if (error.response) {
            const errorMessage =
                error.response.data.errors ?
                    error.response.data.errors.join(', ') :
                    error.response.data.message || 'An error occurred';

            setBackendErrors(errorMessage);
            setSnackbar({
                open: true,
                message: errorMessage,
                severity: 'error'
            });
        } else {
            // Network error or other type of error
            setSnackbar({
                open: true,
                message: error.message || 'Network error occurred',
                severity: 'error'
            });
        }
    };

    const handleChange = (e) => {
        setCurrentDiscount({ ...currentDiscount, [e.target.name]: e.target.value });
        // Clear error for this field when user starts typing
        if (errors[e.target.name]) {
            setErrors({
                ...errors,
                [e.target.name]: null
            });
        }
    };

    const validateForm = () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const newErrors = {};
        const discountCodeRegex = /^[A-Z0-9]{6}$/;
        // Check for empty fields (except usedCount)
        if (!currentDiscount.code.trim()) {
            newErrors.code = "Mã không được để trống";
        } else if (!discountCodeRegex.test(currentDiscount.code.trim())) {
            newErrors.code = "Mã giảm giá phải có đúng 6 ký tự, chỉ bao gồm chữ in hoa và số";
        }
        if (!currentDiscount.value) newErrors.value = "Giá trị không được để trống";
        if (!currentDiscount.minPurchase) newErrors.minPurchase = "Giá trị tối thiểu không được để trống";
        if (!currentDiscount.usageLimit) newErrors.usageLimit = "Số lượng mã giới hạn không được để trống";
        if (!currentDiscount.startDate) newErrors.startDate = "Ngày bắt đầu không được để trống";
        if (!currentDiscount.endDate) newErrors.endDate = "Ngày kết thúc không được để trống";

        // Validate value based on discount type
        if (!currentDiscount.value) {
            newErrors.value = "Giá trị không được để trống";
        } else {
            // Additional validation for percentage type
            if (currentDiscount.type === "percentage") {
                if (currentDiscount.value < 0) {
                    newErrors.value = "Giá trị phần trăm không được là số âm";
                } else if (currentDiscount.value > 100) {
                    newErrors.value = "Giá trị phần trăm không được vượt quá 100%";
                }
            } else if (currentDiscount.value < 0) {
                // Validation for fixed type
                newErrors.value = "Giá trị không được là số âm";
            }
        }
        
        // Validate non-negative values
        if (currentDiscount.minPurchase < 0) newErrors.minPurchase = "Giá trị tối thiểu không được là số âm";
        if (currentDiscount.usageLimit < 0) newErrors.usageLimit = "Số lượng mã giới hạn không được là số âm";

        // Validate minPurchase > 0
        if (currentDiscount.minPurchase <= 0) newErrors.minPurchase = "Giá trị tối thiểu phải lớn hơn 0";

        // Validate usageLimit >= 1
        if (currentDiscount.usageLimit < 1) newErrors.usageLimit = "Số lượng mã giới hạn phải lớn hơn hoặc bằng 1";

        // Validate dates not in the past
        const startDate = new Date(currentDiscount.startDate);
        const endDate = new Date(currentDiscount.endDate);

        if (startDate < today) newErrors.startDate = "Ngày bắt đầu không được ở trong quá khứ";
        if (endDate < today) newErrors.endDate = "Ngày kết thúc không được ở trong quá khứ";

        // Validate endDate is after startDate
        if (startDate && endDate && endDate <= startDate) {
            newErrors.endDate = "Ngày kết thúc phải sau ngày bắt đầu";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        try {
            const token = localStorage.getItem("token") || sessionStorage.getItem("token");
            if (!token) return;
            const formattedDiscount = {
                ...currentDiscount,
                startDate: currentDiscount.startDate ? new Date(currentDiscount.startDate).toISOString() : "",
                endDate: currentDiscount.endDate ? new Date(currentDiscount.endDate).toISOString() : "",
            };

            if (isEditing) {
                const edit = await axios.put(`http://localhost:9999/admin/discounts/${currentDiscount._id}`, formattedDiscount, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                console.log(edit);
            } else {
                const add = await axios.post("http://localhost:9999/admin/discounts", formattedDiscount, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                console.log(add);
            }
            fetchDiscounts();
            handleClose();
            // Show success message
            setSnackbar({
                open: true,
                message: isEditing ? 'Cập nhật mã giảm giá thành công' : 'Tạo mã giảm giá thành công',
                severity: 'success'
            });
        } catch (error) {
            handleErrorResponse(error);
        }
    };
    // New method to change discount status
    const handleChangeStatus = async (discount) => {
        try {
            const token = localStorage.getItem("token") || sessionStorage.getItem("token");
            if (!token) return;

            const response = await axios.put(
                `http://localhost:9999/admin/discounts/${discount._id}/change-status`,
                {},
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            // Update the local state to reflect the status change
            const updatedDiscounts = discounts.map(d =>
                d._id === discount._id
                    ? { ...d, isActive: !d.isActive }
                    : d
            );

            setDiscounts(updatedDiscounts);

            // Show success message
            setSnackbar({
                open: true,
                message: 'Trạng thái mã giảm giá đã được cập nhật',
                severity: 'success'
            });
        } catch (error) {
            handleErrorResponse(error);
        }
    };
    //Chỉnh giá tiền theo format
    const formatPrice = (price) => {
        return new Intl.NumberFormat("vi-VN").format(price) + " VNĐ";
    };

    //Thực hiện phân trang
    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    // Filter handlers
    const handleFilterCodeChange = (e) => {
        setFilterCode(e.target.value);
        setPage(0); // Reset to first page when filtering
    };

    const handleFilterTypeChange = (e) => {
        setFilterType(e.target.value);
        setPage(0); // Reset to first page when filtering
    };

    const handleFilterStatusChange = (e) => {
        setFilterStatus(e.target.value);
        setPage(0); // Reset to first page when filtering
    };

    const resetFilters = () => {
        setFilterCode("");
        setFilterType("all");
        setFilterStatus("all");
        setPage(0);
    };

    // Apply filters to discounts
    const applyFilters = () => {
        let result = [...discounts];
        const today = new Date();

        // Filter by code
        if (filterCode.trim() !== "") {
            result = result.filter(discount =>
                discount.code.toLowerCase().includes(filterCode.toLowerCase())
            );
        }

        // Filter by type
        if (filterType !== "all") {
            result = result.filter(discount => discount.type === filterType);
        }

        // Filter by status
        if (filterStatus !== "all") {
            if (filterStatus === "active") {
                result = result.filter(discount => {
                    const startDate = new Date(discount.startDate);
                    const endDate = new Date(discount.endDate);
                    return startDate <= today && endDate >= today && discount.usedCount < discount.usageLimit;
                });
            } else if (filterStatus === "expired") {
                result = result.filter(discount => {
                    const endDate = new Date(discount.endDate);
                    return endDate < today;
                });
            } else if (filterStatus === "upcoming") {
                result = result.filter(discount => {
                    const startDate = new Date(discount.startDate);
                    return startDate > today;
                });
            } else if (filterStatus === "depleted") {
                result = result.filter(discount =>
                    discount.usedCount >= discount.usageLimit
                );
            } else if (filterStatus == "false") {
                result = result.filter(discount =>
                    discount.isActive == false
                );
            }
        }

        setFilteredDiscounts(result);
    };

    // Determine discount status for display
    const getDiscountStatus = (discount) => {
        const today = new Date();
        const startDate = new Date(discount.startDate);
        const endDate = new Date(discount.endDate);

        if (discount.usedCount >= discount.usageLimit) {
            return "Đã hết lượt dùng";
        } else if (startDate > today) {
            return "Sắp có hiệu lực";
        } else if (endDate < today) {
            return "Đã hết hạn";
        } else if (discount.isActive == false) {
            return "Chưa kích hoạt";
        } else {
            return "Đang hoạt động";
        }
    };

    return (
        <Box sx={{ padding: 1, width: "100%", maxWidth: "calc(100% - 250px)", margin: "auto" }}>
            <Typography variant="h4" gutterBottom>Quản lý mã giảm giá</Typography>

            {/* Filter Section */}
            <Card sx={{ mb: 2 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>Bộ lọc</Typography>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} sm={3}>
                            <TextField
                                label="Mã giảm giá"
                                value={filterCode}
                                onChange={handleFilterCodeChange}
                                fullWidth
                                size="small"
                                variant="outlined"
                            />
                        </Grid>
                        <Grid item xs={12} sm={3}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Loại</InputLabel>
                                <Select
                                    value={filterType}
                                    onChange={handleFilterTypeChange}
                                    label="Loại"
                                >
                                    <MenuItem value="all">Tất cả</MenuItem>
                                    <MenuItem value="percentage">Phần trăm</MenuItem>
                                    <MenuItem value="fixed">Cố định</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={3}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Trạng thái</InputLabel>
                                <Select
                                    value={filterStatus}
                                    onChange={handleFilterStatusChange}
                                    label="Trạng thái"
                                >
                                    <MenuItem value="all">Tất cả</MenuItem>
                                    <MenuItem value="active">Đang hoạt động</MenuItem>
                                    <MenuItem value="upcoming">Sắp có hiệu lực</MenuItem>
                                    <MenuItem value="expired">Đã hết hạn</MenuItem>
                                    <MenuItem value="depleted">Đã hết lượt dùng</MenuItem>
                                    <MenuItem value="false">Chưa kích hoạt</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={3} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <Button
                                variant="outlined"
                                startIcon={<Refresh />}
                                onClick={resetFilters}
                                sx={{ mr: 1 }}
                            >
                                Đặt lại
                            </Button>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={() => handleOpen()}
                            >
                                Tạo mã giảm giá
                            </Button>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Mã</TableCell>
                            <TableCell>Giá trị</TableCell>
                            <TableCell>Giá trị tối thiểu áp dụng</TableCell>
                            <TableCell>Số mã đã dùng</TableCell>
                            <TableCell>Ngày bắt đầu</TableCell>
                            <TableCell>Ngày kết thúc</TableCell>
                            <TableCell>Trạng thái</TableCell>
                            <TableCell>Kích hoạt</TableCell>
                            <TableCell>Hành động</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredDiscounts.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={9} align="center">Không tìm thấy mã giảm giá nào</TableCell>
                            </TableRow>
                        ) : (
                            filteredDiscounts
                                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                .map((discount) => (
                                    <TableRow key={discount._id}>
                                        <TableCell>{discount.code}</TableCell>
                                        {discount.type === "percentage" && (
                                            <TableCell>{discount.value} %</TableCell>
                                        )}
                                        {discount.type === "fixed" && (
                                            <TableCell>{formatPrice(discount.value)}</TableCell>
                                        )}
                                        <TableCell>{formatPrice(discount.minPurchase)}</TableCell>
                                        <TableCell>{discount.usedCount} / {discount.usageLimit}</TableCell>
                                        <TableCell>{new Date(discount.startDate).toLocaleDateString("vi-VN")}</TableCell>
                                        <TableCell>{new Date(discount.endDate).toLocaleDateString("vi-VN")}</TableCell>
                                        <TableCell>{getDiscountStatus(discount)}</TableCell>
                                        <TableCell>
                                            <Switch
                                                checked={discount.isActive}
                                                onChange={() => handleChangeStatus(discount)}
                                                color="primary"
                                            /></TableCell>
                                        <TableCell>
                                            <IconButton color="primary" onClick={() => handleOpen(discount)}><Edit /></IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))
                        )}
                    </TableBody>
                </Table>
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={filteredDiscounts.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </TableContainer>

            <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
                <DialogTitle>{isEditing ? "Chỉnh sửa mã giảm giá" : "Tạo mã giảm giá"}</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} mt={1}>
                        <Grid item xs={6}>
                            <TextField
                                label="Mã"
                                name="code"
                                fullWidth
                                value={currentDiscount.code}
                                onChange={handleChange}
                                InputLabelProps={{ shrink: true }}
                                error={!!errors.code}
                                helperText={errors.code}
                                disabled={isEditing}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <FormControl fullWidth variant="outlined" error={!!errors.type}>
                                <InputLabel>Loại</InputLabel>
                                <Select
                                    name="type"
                                    value={currentDiscount.type}
                                    onChange={handleChange}
                                    label="Loại"
                                    disabled={isEditing}
                                >
                                    <MenuItem value="fixed">Fixed</MenuItem>
                                    <MenuItem value="percentage">Percentage</MenuItem>
                                </Select>
                                {errors.type && <FormHelperText>{errors.type}</FormHelperText>}
                            </FormControl>
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                label="Giá trị"
                                name="value"
                                type="number"
                                fullWidth
                                value={currentDiscount.value}
                                onChange={handleChange}
                                InputLabelProps={{ shrink: true }}
                                error={!!errors.value}
                                helperText={errors.value}
                                inputProps={{ min: 0 }}
                                disabled={isEditing}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                label="Giá trị tối thiểu áp dụng"
                                name="minPurchase"
                                type="number"
                                fullWidth
                                value={currentDiscount.minPurchase}
                                onChange={handleChange}
                                InputLabelProps={{ shrink: true }}
                                error={!!errors.minPurchase}
                                helperText={errors.minPurchase}
                                inputProps={{ min: 1 }}
                                disabled={isEditing}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                label="Số lượng mã giới hạn"
                                name="usageLimit"
                                type="number"
                                fullWidth
                                value={currentDiscount.usageLimit}
                                onChange={handleChange}
                                InputLabelProps={{ shrink: true }}
                                error={!!errors.usageLimit}
                                helperText={errors.usageLimit}
                                inputProps={{ min: 1 }}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                label="Số lượng mã đã dùng"
                                name="usedCount"
                                type="number"
                                fullWidth
                                value={currentDiscount.usedCount}
                                onChange={handleChange}
                                disabled
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                label="Ngày bắt đầu"
                                name="startDate"
                                type="date"
                                fullWidth
                                value={currentDiscount.startDate}
                                onChange={handleChange}
                                InputLabelProps={{ shrink: true }}
                                error={!!errors.startDate}
                                helperText={errors.startDate}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                label="Ngày kết thúc"
                                name="endDate"
                                type="date"
                                fullWidth
                                value={currentDiscount.endDate}
                                onChange={handleChange}
                                InputLabelProps={{ shrink: true }}
                                error={!!errors.endDate}
                                helperText={errors.endDate}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="secondary">Huỷ</Button>
                    <Button onClick={handleSubmit} color="primary">Lưu</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default DiscountManagement;