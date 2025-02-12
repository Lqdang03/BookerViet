import React from "react";
import { AppBar, Toolbar, Typography, Button, Box, IconButton, Container } from "@mui/material";
import { Link } from "react-router-dom";

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
    backgroundColor: '#fff', // Đổi màu nền thành trắng
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
    color: '#000', // Đổi màu chữ thành đen
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

const Header = () => {
    return (
        <Box sx={{ borderBottom: "1px solid rgba(0, 0, 0, 0.1)", mb: 3 }}>
            <AppBar position="static" sx={{ backgroundColor: "#187bcd", boxShadow: "none" }}>
                <Container>
                    <Toolbar>
                        <Typography variant="h6" sx={{ fontWeight: "bold", mr: 2 }}>
                            BookerViet
                        </Typography>
                        <Search sx={{ flexGrow: 1, maxWidth: "500px" }}>
                            <SearchIconWrapper>
                                <SearchIcon />
                            </SearchIconWrapper>
                            <StyledInputBase placeholder="Tìm kiếm sản phẩm..." inputProps={{ "aria-label": "search" }} />
                        </Search>

                        <MenuItem sx={{
                            display: "flex",
                            alignItems: "center",
                            backgroundColor: "transparent !important",
                            "&:hover": { backgroundColor: "transparent !important" }
                        }}>
                            <IconButton size="large" color="inherit">
                                <PersonPinOutlinedIcon />
                            </IconButton>
                            <Box sx={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
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
                            </Box>


                        </MenuItem>

                        <MenuItem
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
                                <Badge badgeContent={1} color="error">
                                    <FavoriteBorderIcon />
                                </Badge>
                            </IconButton>
                            <Box sx={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
                                <Typography
                                    variant="body2"
                                    component={Link}
                                    to="/wishlist"
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
                                <Typography variant="caption" className="cart-text" component={Link} to="/wishlist" sx={{ textDecoration: "none", color: "inherit", cursor: "pointer" }}>1 Sản phẩm</Typography>
                            </Box>
                        </MenuItem>

                        <MenuItem
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
                                <Badge badgeContent={1} color="error">
                                    <AddShoppingCartIcon />
                                </Badge>
                            </IconButton>
                            <Box sx={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
                                <Typography
                                    variant="body2"
                                    component={Link}
                                    to="/cart"
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
                                <Typography variant="caption" className="cart-text" component={Link} to="/cart" sx={{ textDecoration: "none", color: "inherit", cursor: "pointer" }}>52.000đ</Typography>
                            </Box>
                        </MenuItem>



                    </Toolbar>
                </Container>
            </AppBar>
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