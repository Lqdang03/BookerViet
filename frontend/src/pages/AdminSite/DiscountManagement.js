import React, { useState, useEffect } from "react";
import {
    Container, Typography, Button, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Paper, IconButton, Dialog, DialogTitle, DialogContent,
    DialogActions, TextField, Grid, MenuItem, Select, InputLabel, FormControl,
    Box
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
    const [isEditing, setIsEditing] = useState(false);

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
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleChange = (e) => {
        setCurrentDiscount({ ...currentDiscount, [e.target.name]: e.target.value });
    };

    const handleSubmit = async () => {
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
                        {discounts.map((discount) => (
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
            </TableContainer>
            <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
                <DialogTitle>{isEditing ? "Chỉnh sửa mã giảm giá" : "Tạo mã giảm giá"}</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} mt={1}>
                        <Grid item xs={6}>
                            <TextField label="Mã" name="code" fullWidth value={currentDiscount.code} onChange={handleChange} InputLabelProps={{ shrink: true }} />
                        </Grid>
                        <Grid item xs={6}>
                            <FormControl fullWidth variant="outlined">
                                <InputLabel>Loại</InputLabel>
                                <Select name="type" value={currentDiscount.type} onChange={handleChange} label="Loại">
                                    <MenuItem value="fixed">Fixed</MenuItem>
                                    <MenuItem value="percentage">Percentage</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={6}><TextField label="Giá trị" name="value" type="number" fullWidth value={currentDiscount.value} onChange={handleChange} InputLabelProps={{ shrink: true }}/></Grid>
                        <Grid item xs={6}><TextField label="Giá trị tối thiểu áp dụng" name="minPurchase" type="number" fullWidth value={currentDiscount.minPurchase} onChange={handleChange} InputLabelProps={{ shrink: true }}/></Grid>
                        <Grid item xs={6}><TextField label="Số lượng mã giới hạn" name="usageLimit" type="number" fullWidth value={currentDiscount.usageLimit} onChange={handleChange} InputLabelProps={{ shrink: true }}/></Grid>
                        <Grid item xs={6}><TextField label="Số lượng mã đã dùng" name="usedCount" type="number" fullWidth value={currentDiscount.usedCount} onChange={handleChange} disabled InputLabelProps={{ shrink: true }}/></Grid>
                        <Grid item xs={6}><TextField label="Ngày bắt đầu" name="startDate" type="date" fullWidth value={currentDiscount.startDate} onChange={handleChange} InputLabelProps={{ shrink: true }} /></Grid>
                        <Grid item xs={6}><TextField label="Ngày kết thúc" name="endDate" type="date" fullWidth value={currentDiscount.endDate} onChange={handleChange} InputLabelProps={{ shrink: true }} /></Grid>
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