import React, { useState } from "react";
import { AppBar, Toolbar, Typography, Button, Box, IconButton, Container } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import SearchIcon from "@mui/icons-material/Search";
import PersonPinOutlinedIcon from '@mui/icons-material/PersonPinOutlined';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import PhoneIcon from "@mui/icons-material/Phone";
import MenuItem from '@mui/material/MenuItem';
import Badge from '@mui/material/Badge';
import InputBase from '@mui/material/InputBase';
import { styled } from '@mui/material/styles';

const Search = styled('div')(({ theme }) => ({
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: '#fff',
    marginRight: theme.spacing(2),
    marginLeft: 0,
    width: '100%',
    [theme.breakpoints.up('sm')]: {
        marginLeft: theme.spacing(3),
        width: 'auto',
    },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
    color: "black",
    padding: theme.spacing(0, 2),
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
    color: '#000',
    '& .MuiInputBase-input': {
        padding: theme.spacing(1, 1, 1, 0),
        paddingLeft: `calc(1em + ${theme.spacing(4)})`,
        transition: theme.transitions.create('width'),
        width: '100%',
        [theme.breakpoints.up('md')]: {
            width: '20ch',
        },
    },
}));

const Header = ({ userEmail, updateUserEmail, wishlistCount = 0, cartTotal = 0 }) => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    
    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price).replace('₫', 'đ');
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userEmail');
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('userEmail');
        updateUserEmail(null);
        navigate('/account/login');
    };

    const handleSearch = (event) => {
        setSearchTerm(event.target.value);
    };

    const displayWishlistText = wishlistCount === 1 ? "1 Sản phẩm" : `${wishlistCount} Sản phẩm`;
    const displayCartTotal = cartTotal > 0 ? formatPrice(cartTotal) : "0đ";

    return (
        <Box sx={{ borderBottom: "1px solid rgba(0, 0, 0, 0.1)", mb: 3 }}>
            <AppBar position="static" sx={{ backgroundColor: "#187bcd", boxShadow: "none" }}>
                <Container maxWidth="lg">
                    <Toolbar>
                        <Typography 
                            variant="h6" 
                            component={Link} 
                            to="/"
                            sx={{ 
                                fontWeight: "bold", 
                                mr: 2, 
                                float: "left",
                                textDecoration: "none",
                                color: "inherit"
                            }}
                        >
                            BookerViet
                        </Typography>

                        <Search sx={{ flexGrow: 1, maxWidth: "500px" }}>
                            <SearchIconWrapper>
                                <SearchIcon />
                            </SearchIconWrapper>
                            <StyledInputBase 
                                placeholder="Tìm kiếm sản phẩm..." 
                                inputProps={{ "aria-label": "search" }}
                                value={searchTerm}
                                onChange={handleSearch}
                            />
                        </Search>

                        {/* User Account Section */}
                        <MenuItem
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                backgroundColor: "transparent !important",
                                "&:hover": { backgroundColor: "transparent !important" }
                            }}
                        >
                            <IconButton size="large" color="inherit">
                                <PersonPinOutlinedIcon />
                            </IconButton>
                            <Box sx={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
                                {userEmail ? (
                                    <>
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                textDecoration: "none",
                                                fontWeight: "bold",
                                                color: "inherit",
                                            }}
                                        >
                                            Xin chào, {userEmail.split('@')[0]}
                                        </Typography>
                                        <Typography
                                            variant="caption"
                                            onClick={handleLogout}
                                            sx={{
                                                textDecoration: "none",
                                                color: "inherit",
                                                cursor: "pointer",
                                                "&:hover": { color: "#ffd700" }
                                            }}
                                        >
                                            Đăng xuất
                                        </Typography>
                                    </>
                                ) : (
                                    <>
                                        <Typography
                                            variant="body2"
                                            component={Link}
                                            to="/account/login"
                                            sx={{
                                                textDecoration: "none",
                                                fontWeight: "bold",
                                                color: "inherit",
                                                cursor: "pointer",
                                                "&:hover": { color: "#ffd700" }
                                            }}
                                        >
                                            Đăng nhập
                                        </Typography>
                                        <Typography
                                            variant="caption"
                                            component={Link}
                                            to="/account/register"
                                            sx={{
                                                textDecoration: "none",
                                                color: "inherit",
                                                cursor: "pointer",
                                                "&:hover": { color: "#ffd700" }
                                            }}
                                        >
                                            Đăng ký
                                        </Typography>
                                    </>
                                )}
                            </Box>
                        </MenuItem>

                        {/* Wishlist MenuItem */}
                        <MenuItem
                            component={Link}
                            to="/user/wishlist"
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                backgroundColor: "transparent !important",
                                "&:hover": { backgroundColor: "transparent !important" },
                                gap: 0.2,
                                "&:hover .cart-text": { color: "#ffd700" }
                            }}
                        >
                            <IconButton size="large" color="inherit">
                                <Badge 
                                    badgeContent={wishlistCount} 
                                    color="error"
                                    showZero
                                >
                                    <FavoriteBorderIcon />
                                </Badge>
                            </IconButton>
                            <Box sx={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
                                <Typography
                                    variant="body2"
                                    className="cart-text"
                                    sx={{
                                        textDecoration: "none",
                                        fontWeight: "bold",
                                        color: "inherit",
                                        cursor: "pointer"
                                    }}
                                >
                                    Yêu thích
                                </Typography>
                                <Typography
                                    variant="caption"
                                    className="cart-text"
                                    sx={{
                                        textDecoration: "none",
                                        color: "inherit",
                                        cursor: "pointer"
                                    }}
                                >
                                    {displayWishlistText}
                                </Typography>
                            </Box>
                        </MenuItem>

                        {/* Cart MenuItem */}
                        <MenuItem
                            component={Link}
                            to="/cart"
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                backgroundColor: "transparent !important",
                                "&:hover": { backgroundColor: "transparent !important" },
                                gap: 0.2,
                                "&:hover .cart-text": { color: "#ffd700" }
                            }}
                        >
                            <IconButton size="large" color="inherit">
                                <Badge 
                                    badgeContent={cartTotal > 0 ? 1 : 0} 
                                    color="error"
                                    showZero
                                >
                                    <AddShoppingCartIcon />
                                </Badge>
                            </IconButton>
                            <Box sx={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
                                <Typography
                                    variant="body2"
                                    className="cart-text"
                                    sx={{
                                        textDecoration: "none",
                                        fontWeight: "bold",
                                        color: "inherit",
                                        cursor: "pointer"
                                    }}
                                >
                                    Giỏ hàng
                                </Typography>
                                <Typography
                                    variant="caption"
                                    className="cart-text"
                                    sx={{
                                        textDecoration: "none",
                                        color: "inherit",
                                        cursor: "pointer"
                                    }}
                                >
                                    {displayCartTotal}
                                </Typography>
                            </Box>
                        </MenuItem>
                    </Toolbar>
                </Container>
            </AppBar>
            
            {/* Bottom navigation */}
            <Container
                maxWidth="lg"
                sx={{
                    display: "flex",
                    justifyContent: "space-evenly",
                    alignItems: "center",
                    paddingTop: 2,
                }}
            >
                <Button
                    variant="contained"
                    sx={{ backgroundColor: "#d32f2f", "&:hover": { backgroundColor: "#d32f2f" } }}
                >
                    DANH MỤC SẢN PHẨM
                </Button>
                <Box sx={{ display: "flex", gap: 2 }}>
                    <Button color="inherit" sx={{ backgroundColor: "transparent !important", "&:hover": { backgroundColor: "transparent !important", color: "#187bcd" } }}>
                        Sản phẩm đã xem
                    </Button>
                    <Button color="inherit" sx={{ backgroundColor: "transparent !important", "&:hover": { backgroundColor: "transparent !important", color: "#187bcd" } }}>
                        Flashsale
                    </Button>
                    <Button color="inherit" sx={{ backgroundColor: "transparent !important", "&:hover": { backgroundColor: "transparent !important", color: "#187bcd" } }}>
                        Hệ thống BookerViet
                    </Button>
                    <Button color="inherit" sx={{ backgroundColor: "transparent !important", "&:hover": { backgroundColor: "transparent !important", color: "#187bcd" } }}>
                        Theo dõi đơn hàng
                    </Button>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                        <PhoneIcon sx={{ mr: 1 }} />
                        <Typography>0123123123</Typography>
                    </Box>
                </Box>
            </Container>
        </Box>
    );
};

export default Header;