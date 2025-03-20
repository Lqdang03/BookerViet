import React, { useState, useEffect } from "react";
import {
    Typography, Button, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Paper, IconButton, Dialog, DialogTitle, DialogContent,
    DialogActions, TextField, Grid, MenuItem, Select, InputLabel, FormControl,
    Box, Chip
} from "@mui/material";
import { Edit } from "@mui/icons-material";
import axios from "axios";

const ReportManagement = () => {
    const [complaints, setComplaints] = useState([]);
    const [filteredComplaints, setFilteredComplaints] = useState([]);
    const [open, setOpen] = useState(false);
    const [currentComplaint, setCurrentComplaint] = useState({ status: "" });
    
    // Filter states
    const [customerFilter, setCustomerFilter] = useState("");
    const [typeFilter, setTypeFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("");

    useEffect(() => {
        fetchComplaints();
    }, []);

    useEffect(() => {
        filterComplaints();
    }, [complaints, customerFilter, typeFilter, statusFilter]);

    const fetchComplaints = async () => {
        try {
            const token = localStorage.getItem("token") || sessionStorage.getItem("token");
            if (!token) return;
            const response = await axios.get("http://localhost:9999/admin/complaints", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setComplaints(response.data.data);
            setFilteredComplaints(response.data.data);
        } catch (error) {
            console.error("Error fetching complaints", error);
        }
    };

    const filterComplaints = () => {
        let result = [...complaints];
        
        if (customerFilter) {
            result = result.filter(complaint => 
                complaint.user.email.toLowerCase().includes(customerFilter.toLowerCase())
            );
        }
        
        if (typeFilter) {
            result = result.filter(complaint => 
                complaint.type === typeFilter
            );
        }
        
        if (statusFilter) {
            result = result.filter(complaint => 
                complaint.status === statusFilter
            );
        }
        
        setFilteredComplaints(result);
    };

    const handleOpenEditDialog = (complaint) => {
        setCurrentComplaint(complaint);
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleStatusChange = (e) => {
        setCurrentComplaint({ ...currentComplaint, status: e.target.value });
    };

    const handleUpdateStatus = async () => {
        try {
            const token = localStorage.getItem("token") || sessionStorage.getItem("token");
            if (!token) return;
            
            await axios.put(
                `http://localhost:9999/admin/complaints/${currentComplaint._id}`, 
                { status: currentComplaint.status }, 
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            
            fetchComplaints();
            handleClose();
        } catch (error) {
            console.error("Error updating complaint status", error);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "Đang chờ xử lý":
                return "warning";
            case "Đã tiếp nhận":
                return "info";
            case "Đã giải quyết":
                return "success";
            case "Đã hủy":
                return "error";
            default:
                return "default";
        }
    };

    const resetFilters = () => {
        setCustomerFilter("");
        setTypeFilter("");
        setStatusFilter("");
    };

    return (
        <Box sx={{padding: 1, width: "100%", maxWidth: "calc(100% - 250px)", margin: "auto"}}>
            <Typography variant="h4" gutterBottom>Quản lý báo cáo khiếu nại</Typography>
            
            {/* Filter section */}
            <Box sx={{ mb: 3, p: 2, bgcolor: "#f5f5f5", borderRadius: 1 }}>
                <Typography variant="h6" gutterBottom>Bộ lọc</Typography>
                <Grid container spacing={2}>
                    <Grid item xs={12} md={3}>
                        <TextField
                            label="Tìm theo khách hàng"
                            fullWidth
                            value={customerFilter}
                            onChange={(e) => setCustomerFilter(e.target.value)}
                            size="small"
                        />
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Loại báo cáo</InputLabel>
                            <Select 
                                value={typeFilter} 
                                onChange={(e) => setTypeFilter(e.target.value)}
                                label="Loại báo cáo"
                            >
                                <MenuItem value="">Tất cả</MenuItem>
                                <MenuItem value="Web">Web</MenuItem>
                                <MenuItem value="Đơn hàng">Đơn hàng</MenuItem>
                                <MenuItem value="Khác">Khác</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Trạng thái</InputLabel>
                            <Select 
                                value={statusFilter} 
                                onChange={(e) => setStatusFilter(e.target.value)}
                                label="Trạng thái"
                            >
                                <MenuItem value="">Tất cả</MenuItem>
                                <MenuItem value="Đang chờ xử lý">Đang chờ xử lý</MenuItem>
                                <MenuItem value="Đã tiếp nhận">Đã tiếp nhận</MenuItem>
                                <MenuItem value="Đã giải quyết">Đã giải quyết</MenuItem>
                                <MenuItem value="Đã hủy">Đã hủy</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} md={3} sx={{ display: 'flex', alignItems: 'center' }}>
                        <Button variant="outlined" onClick={resetFilters} fullWidth>
                            Đặt lại bộ lọc
                        </Button>
                    </Grid>
                </Grid>
            </Box>
            
            <TableContainer component={Paper} sx={{ marginTop: 2 }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Khách hàng</TableCell>
                            <TableCell>Loại báo cáo</TableCell>
                            <TableCell>Mô tả</TableCell>
                            <TableCell>Trạng thái</TableCell>
                            <TableCell>Ngày tạo</TableCell>
                            <TableCell>Thao tác</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredComplaints.map((complaint) => (
                            <TableRow key={complaint._id}>
                                <TableCell>{complaint.user.email}</TableCell>
                                <TableCell>{complaint.type}</TableCell>
                                <TableCell>{complaint.description}</TableCell>
                                <TableCell>
                                    <Chip 
                                        label={complaint.status} 
                                        color={getStatusColor(complaint.status)} 
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell>
                                    {new Date(complaint.createdAt).toLocaleDateString("vi-VN")}
                                </TableCell>
                                <TableCell>
                                    <IconButton color="primary" onClick={() => handleOpenEditDialog(complaint)}>
                                        <Edit />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            
            {/* Status Update Dialog */}
            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>Cập nhật trạng thái báo cáo</DialogTitle>
                <DialogContent>
                    <Box sx={{ minWidth: 300, mt: 2 }}>
                        <FormControl fullWidth>
                            <InputLabel>Trạng thái</InputLabel>
                            <Select
                                value={currentComplaint.status}
                                onChange={handleStatusChange}
                                label="Trạng thái"
                            >
                                {/* <MenuItem value="Đang chờ xử lý">Đang chờ xử lý</MenuItem> */}
                                <MenuItem value="Đã tiếp nhận">Đã tiếp nhận</MenuItem>
                                <MenuItem value="Đã giải quyết">Đã giải quyết</MenuItem>
                                <MenuItem value="Đã hủy">Đã hủy</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="secondary">Hủy</Button>
                    <Button onClick={handleUpdateStatus} color="primary">Cập nhật</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ReportManagement;