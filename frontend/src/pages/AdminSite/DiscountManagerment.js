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

    return (
        <Container>
            <Typography variant="h4" gutterBottom>Discount Management</Typography>
            <Box style={{ display: "flex", justifyContent: "flex-end" }}>
                <Button variant="contained" color="primary" onClick={() => handleOpen()}>Add Discount</Button>
            </Box>
            <TableContainer component={Paper} sx={{ marginTop: 2 }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Code</TableCell>
                            <TableCell>Type</TableCell>
                            <TableCell>Value</TableCell>
                            <TableCell>Min Purchase</TableCell>
                            <TableCell>Usage Limit</TableCell>
                            <TableCell>Used Count</TableCell>
                            <TableCell>Start Date</TableCell>
                            <TableCell>End Date</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {discounts.map((discount) => (
                            <TableRow key={discount._id}>
                                <TableCell>{discount.code}</TableCell>
                                <TableCell>{discount.type}</TableCell>
                                <TableCell>{discount.value}</TableCell>
                                <TableCell>{discount.minPurchase}</TableCell>
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
            <Dialog open={open} onClose={handleClose} fullWidth>
                <DialogTitle>{isEditing ? "Edit Discount" : "Add Discount"}</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2}>
                        <Grid item xs={6}><TextField label="Code" name="code" fullWidth value={currentDiscount.code} onChange={handleChange} /></Grid>
                        <Grid item xs={6}><FormControl fullWidth><InputLabel>Type</InputLabel><Select name="type" value={currentDiscount.type} onChange={handleChange}><MenuItem value="fixed">Fixed</MenuItem><MenuItem value="percentage">Percentage</MenuItem></Select></FormControl></Grid>
                        <Grid item xs={6}><TextField label="Value" name="value" type="number" fullWidth value={currentDiscount.value} onChange={handleChange} /></Grid>
                        <Grid item xs={6}><TextField label="Min Purchase" name="minPurchase" type="number" fullWidth value={currentDiscount.minPurchase} onChange={handleChange} /></Grid>
                        <Grid item xs={6}><TextField label="Usage Limit" name="usageLimit" type="number" fullWidth value={currentDiscount.usageLimit} onChange={handleChange} /></Grid>
                        <Grid item xs={6}><TextField label="Used Count" name="usedCount" type="number" fullWidth value={currentDiscount.usedCount} onChange={handleChange} disabled /></Grid>
                        <Grid item xs={6}><TextField label="Start Date" name="startDate" type="date" fullWidth value={currentDiscount.startDate} onChange={handleChange} InputLabelProps={{ shrink: true }} /></Grid>
                        <Grid item xs={6}><TextField label="End Date" name="endDate" type="date" fullWidth value={currentDiscount.endDate} onChange={handleChange} InputLabelProps={{ shrink: true }} /></Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="secondary">Cancel</Button>
                    <Button onClick={handleSubmit} color="primary">Save</Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default DiscountManagement;