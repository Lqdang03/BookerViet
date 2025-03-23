import React, { useState, useEffect } from "react";
import {
    Container, Typography, Button, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Paper, IconButton, Dialog, DialogTitle, DialogContent,
    DialogActions, TextField, Grid, MenuItem, Select, InputLabel, FormControl,
    Box, TablePagination, FormHelperText
} from "@mui/material";
import { Delete, Edit } from "@mui/icons-material";
import axios from "axios";

const DiscountManagement = () => {
    const [discounts, setDiscounts] = useState([]);
    const [open, setOpen] = useState(false);
    const [currentDiscount, setCurrentDiscount] = useState({
        code: "", type: "percentage", value: "", minPurchase: "",
        usageLimit: "", usedCount: 0, startDate: "", endDate: ""
    });
    const [errors, setErrors] = useState({});
    const [isEditing, setIsEditing] = useState(false);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    useEffect(() => {
        fetchDiscounts();
    }, []);

    const fetchDiscounts = async () => {
        try {
            const token = localStorage.getItem("token") || sessionStorage.getItem("token");
            if (!token) return;
            const response = await axios.get("http://localhost:9999/admin/discounts", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setDiscounts(response.data);
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
        
        // Check for empty fields (except usedCount)
        if (!currentDiscount.code.trim()) newErrors.code = "Mã không được để trống";
        if (!currentDiscount.value) newErrors.value = "Giá trị không được để trống";
        if (!currentDiscount.minPurchase) newErrors.minPurchase = "Giá trị tối thiểu không được để trống";
        if (!currentDiscount.usageLimit) newErrors.usageLimit = "Số lượng mã giới hạn không được để trống";
        if (!currentDiscount.startDate) newErrors.startDate = "Ngày bắt đầu không được để trống";
        if (!currentDiscount.endDate) newErrors.endDate = "Ngày kết thúc không được để trống";
        
        // Validate non-negative values
        if (currentDiscount.value < 0) newErrors.value = "Giá trị không được là số âm";
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
                await axios.put(`http://localhost:9999/admin/discounts/${currentDiscount._id}`, formattedDiscount, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } else {
                await axios.post("http://localhost:9999/admin/discounts", formattedDiscount, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }
            fetchDiscounts();
            handleClose();
        } catch (error) {
            console.error("Error saving discount", error);
        }
    };

    const handleDelete = async (id) => {
        try {
            const token = localStorage.getItem("token") || sessionStorage.getItem("token");
            if (!token) return;
            await axios.delete(`http://localhost:9999/admin/discounts/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchDiscounts();
        } catch (error) {
            console.error("Error deleting discount", error);
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
    return (
        <Box sx={{ padding: 1, width: "100%", maxWidth: "calc(100% - 250px)", margin: "auto" }}>
            <Typography variant="h4" gutterBottom>Quản lý mã giảm giá</Typography>
            <Box style={{ display: "flex", justifyContent: "flex-end" }}>
                <Button variant="contained" color="primary" onClick={() => handleOpen()}>tạo mã giảm giá</Button>
            </Box>
            <TableContainer component={Paper} sx={{ marginTop: 2 }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>mã</TableCell>
                            <TableCell>Loại</TableCell>
                            <TableCell>Giá trị</TableCell>
                            <TableCell>Giá trị tối thiểu áp dụng</TableCell>
                            <TableCell>Số lượng mã giới hạn</TableCell>
                            <TableCell>Số lượng mã đã dùng </TableCell>
                            <TableCell>Ngày bắt đầu</TableCell>
                            <TableCell>Ngày kết thúc</TableCell>
                            <TableCell>Hành động</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {discounts
                            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                            .map((discount) => (
                                <TableRow key={discount._id}>
                                    <TableCell>{discount.code}</TableCell>
                                    <TableCell>{discount.type}</TableCell>
                                    <TableCell>{formatPrice(discount.value)}</TableCell>
                                    <TableCell>{formatPrice(discount.minPurchase)}</TableCell>
                                    <TableCell>{discount.usageLimit}</TableCell>
                                    <TableCell>{discount.usedCount}</TableCell>
                                    <TableCell>{new Date(discount.startDate).toLocaleDateString("vi-VN")}</TableCell>
                                    <TableCell>{new Date(discount.endDate).toLocaleDateString("vi-VN")}</TableCell>
                                    <TableCell>
                                        <IconButton color="primary" onClick={() => handleOpen(discount)}><Edit /></IconButton>
                                        <IconButton color="error" onClick={() => handleDelete(discount._id)}><Delete /></IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                    </TableBody>
                </Table>
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={discounts.length}
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