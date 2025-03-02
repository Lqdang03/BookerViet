import React, { useState, useEffect } from "react";
import axios from "axios";
import {
    Typography,
    Box,
    Container,
    Paper,
    Grid,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    Divider,
    TextField,
    Button,
    Alert
} from "@mui/material";
import { Link } from "react-router-dom";
import { styled } from '@mui/material/styles';
import ChangePasswordBreadCrumb from "../components/Breadcrumbs/ChangePasswordBreadCrumb";

// Định nghĩa UserName (được sử dụng trong sidebar)
const UserName = styled('span')(({ theme }) => ({
    color: theme.palette.error.main,
    fontWeight: 'bold'
}));

const AccountNavItem = styled(ListItem)(({ theme }) => ({
    padding: theme.spacing(1, 0),
    '&.active': {
      '& .MuiListItemText-primary': {
        color: theme.palette.primary.main,
        fontWeight: 'bold',
      }
    },
    '&:hover': {
      '& .MuiListItemText-primary': {
        color: theme.palette.primary.main,
      }
    }
}));

const ChangePassword = () => {
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [message, setMessage] = useState("");
    const [alertType, setAlertType] = useState("warning");
    const [user, setUser] = useState(null);

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const token = localStorage.getItem('token') || sessionStorage.getItem('token');
                if (!token) return;

                const config = {
                    headers: { 'Authorization': `Bearer ${token}` }
                };

                const response = await axios.get('http://localhost:9999/user/profile', config);
                if (response.data?.user) {
                    setUser(response.data.user);
                }
            } catch (error) {
                console.error("Lỗi khi lấy thông tin user:", error);
            }
        };

        fetchUserProfile();
    }, []);

    const handleChangePassword = async (e) => {
        e.preventDefault();
    
        if (newPassword.length < 6) {
            setMessage("Mật khẩu mới phải có ít nhất 6 ký tự.");
            setAlertType("warning");
            return;
        }
    
        if (newPassword !== confirmPassword) {
            setMessage("Xác nhận mật khẩu không khớp.");
            setAlertType("warning");
            return;
        }
    
        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            if (!token) {
                setMessage("Bạn chưa đăng nhập.");
                setAlertType("warning");
                return;
            }
    
            const config = {
                headers: { 'Authorization': `Bearer ${token}` }
            };
    
            const response = await axios.put(
                "http://localhost:9999/user/change-password",
                { oldPassword, newPassword },
                config
            );
    
            if (response.data.message) {
                setMessage(response.data.message);
                setAlertType("success"); // Hiển thị màu xanh khi thành công
            }
        } catch (error) {
            console.error("Lỗi khi đổi mật khẩu:", error.response?.data || error.message);
            setMessage(error.response?.data?.message || "Lỗi server.");
            setAlertType("error"); // Màu đỏ khi lỗi
        }
    };

    return (
        <>
            <ChangePasswordBreadCrumb />
            <Container maxWidth="lg" sx={{ mt: 2, mb: 6 }}>
                <Grid container spacing={4}>
                    {/* Sidebar */}
                    <Grid item xs={12} md={4} lg={3}>
                        <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
                            <Typography variant="h6" component="h2" gutterBottom>
                                TRANG TÀI KHOẢN
                            </Typography>
                            <Typography variant="body1" sx={{ mb: 2 }}>
                                Xin chào, <UserName>{user?.name || ''}</UserName> !
                            </Typography>

                            <Divider sx={{ mb: 2 }} />

                            <List component="nav" disablePadding>
                                <AccountNavItem button component={Link} to="/user/profile">
                                    <ListItemText primary="Thông tin tài khoản" />
                                </AccountNavItem>

                                <AccountNavItem button component={Link} to="/user/change-password" className="active">
                                    <ListItemText primary="Đổi mật khẩu" />
                                </AccountNavItem>

                                <AccountNavItem button component={Link} to="/account/orders">
                                    <ListItemText primary="Đơn hàng của tôi" />
                                </AccountNavItem>
                            </List>
                        </Paper>
                    </Grid>

                    {/* Main Content */}
                    <Grid item xs={12} md={8} lg={9}>
                        <Paper elevation={1} sx={{ p: 3 }}>
                            <Typography variant="h6" gutterBottom>
                                Thay đổi mật khẩu
                            </Typography>
                            <Divider sx={{ mb: 3 }} />
                            <Typography sx={{ mb: 2 }}>
                                Để đảm bảo tính bảo mật, vui lòng đặt lại mật khẩu với ít nhất 6 ký tự.
                            </Typography>
                            <Box component="form" onSubmit={handleChangePassword} sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: 500 }}>
                                {message && <Alert severity={alertType}>{message}</Alert>}

                                <TextField
                                    label="Mật khẩu cũ"
                                    type="password"
                                    fullWidth
                                    variant="outlined"
                                    value={oldPassword}
                                    onChange={(e) => setOldPassword(e.target.value)}
                                    required
                                />

                                <TextField
                                    label="Mật khẩu mới"
                                    type="password"
                                    fullWidth
                                    variant="outlined"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                />

                                <TextField
                                    label="Xác nhận lại mật khẩu"
                                    type="password"
                                    fullWidth
                                    variant="outlined"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                />
                                <Button sx={{mt: 2}} type="submit" variant="contained" color="primary" width = "200px" >
                                    Đặt Lại Mật Khẩu
                            </Button>
                                
                            </Box>
                            
                        </Paper>
                    </Grid>
                </Grid>
            </Container>
        </>
    );
};

export default ChangePassword;
