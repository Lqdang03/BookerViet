import React, { useState, useEffect } from "react";
import { AppBar, Toolbar, Typography, Button, Box, IconButton, Container, Popper, Paper, ClickAwayListener, Fade, Grid } from "@mui/material";
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
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import axios from "axios";

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

const CategoryMenuItem = styled(MenuItem)(({ theme }) => ({
    padding: theme.spacing(1, 2),
    '&:hover': {
        backgroundColor: '#f5f5f5',
        color: '#187bcd',
    },
}));

const Header = ({ userEmail, updateUserEmail, wishlistCount = 0, cartCount = 0, cartTotal = 0, updateCartCount, updateCartTotal, updateWishlistCount }) => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [anchorEl, setAnchorEl] = useState(null);
    const [categories, setCategories] = useState([]);
    const [categoryBooks, setCategoryBooks] = useState({});
    const [activeCategory, setActiveCategory] = useState(null);
    
    // Fetch categories on component mount
    useEffect(() => {
        fetchCategories();
    }, []);
    
    const fetchCategories = async () => {
        try {
            const response = await axios.get("http://localhost:9999/category/");
            setCategories(response.data);
        } catch (error) {
            console.error("Lỗi khi lấy danh mục:", error);
        }
    };
    
    const fetchBooksByCategory = async (categoryId) => {
        if (categoryBooks[categoryId]) return; // Already fetched
        
        try {
            const response = await axios.get(`http://localhost:9999/book/category/${categoryId}`);
            setCategoryBooks(prev => ({
                ...prev,
                [categoryId]: response.data
            }));
        } catch (error) {
            console.error(`Lỗi khi lấy sách cho danh mục ${categoryId}:`, error);
        }
    };
    
    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price).replace('₫', 'đ');
    };

    const handleLogout = () => {
        // Clear auth data
        localStorage.removeItem('token');
        localStorage.removeItem('userEmail');
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('userEmail');
        
        // Update state
        updateUserEmail(null);
        
        // Reset cart and wishlist data
        if (typeof updateCartCount === 'function') {
            updateCartCount(0);
        }
        
        if (typeof updateCartTotal === 'function') {
            updateCartTotal(0);
        }
        
        if (typeof updateWishlistCount === 'function') {
            updateWishlistCount(0);
        }
        
        // Navigate to login page
        navigate('/account/login');
    };

    const handleSearch = (event) => {
        setSearchTerm(event.target.value);
    };
    
    const handleCategoryClick = (event) => {
        setAnchorEl(event.currentTarget);
    };
    
    const handleClose = () => {
        setAnchorEl(null);
        setActiveCategory(null);
    };
    
    const handleCategoryHover = (category) => {
        setActiveCategory(category);
        fetchBooksByCategory(category._id);
    };
    
    const handleCategoryClick2 = (categoryId) => {
        navigate(`/category/${categoryId}`);
        handleClose();
    };

    const displayWishlistText = wishlistCount === 1 ? "1 Sản phẩm" : `${wishlistCount} Sản phẩm`;
    const open = Boolean(anchorEl);
    
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
                                <Badge badgeContent={userEmail ? wishlistCount : 0} color="error" showZero>
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
                                    {userEmail ? displayWishlistText : "0 Sản phẩm"}
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
                                <Badge badgeContent={userEmail ? cartCount : 0} color="error" showZero>
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
                                    {userEmail ? formatPrice(cartTotal).replace('₫', 'đ') : "0đ"}
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
                    sx={{ 
                        backgroundColor: "#d32f2f", 
                        "&:hover": { backgroundColor: "#d32f2f" },
                        display: "flex",
                        alignItems: "center"
                    }}
                    onClick={handleCategoryClick}
                    aria-haspopup="true"
                    endIcon={<KeyboardArrowDownIcon />}
                >
                    DANH MỤC SẢN PHẨM
                </Button>
                
                {/* Category Dropdown Menu */}
                <Popper
                    open={open}
                    anchorEl={anchorEl}
                    placement="bottom-start"
                    transition
                    style={{ zIndex: 1300 }}
                >
                    {({ TransitionProps }) => (
                        <Fade {...TransitionProps} timeout={350}>
                            <Paper sx={{ 
                                width: '800px', 
                                display: 'flex',
                                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
                            }}>
                                <ClickAwayListener onClickAway={handleClose}>
                                    <Box sx={{ display: 'flex', width: '100%' }}>
                                        {/* Left panel - Categories list */}
                                        <Box sx={{ 
                                            width: '30%', 
                                            borderRight: '1px solid #eee',
                                            maxHeight: '400px',
                                            overflowY: 'auto'
                                        }}>
                                            {categories.map((category) => (
                                                <CategoryMenuItem 
                                                    key={category._id}
                                                    onClick={() => handleCategoryClick2(category._id)}
                                                    onMouseEnter={() => handleCategoryHover(category)}
                                                    sx={{
                                                        backgroundColor: activeCategory && activeCategory._id === category._id ? '#f5f5f5' : 'transparent',
                                                        color: activeCategory && activeCategory._id === category._id ? '#187bcd' : 'inherit',
                                                        fontWeight: activeCategory && activeCategory._id === category._id ? 'bold' : 'normal',
                                                    }}
                                                >
                                                    {category.name}
                                                </CategoryMenuItem>
                                            ))}
                                        </Box>
                                        
                                        {/* Right panel - Books in category */}
                                        <Box sx={{ 
                                            width: '70%', 
                                            padding: 2,
                                            maxHeight: '400px',
                                            overflowY: 'auto'
                                        }}>
                                            {activeCategory ? (
                                                <>
                                                    <Typography 
                                                        variant="h6" 
                                                        sx={{ 
                                                            mb: 2, 
                                                            color: '#187bcd', 
                                                            borderBottom: '1px solid #eee',
                                                            paddingBottom: 1
                                                        }}
                                                    >
                                                        {activeCategory.name}
                                                    </Typography>
                                                    
                                                    {categoryBooks[activeCategory._id] ? (
                                                        <Grid container spacing={2}>
                                                            {categoryBooks[activeCategory._id].slice(0, 6).map((book) => (
                                                                <Grid item xs={4} key={book._id}>
                                                                    <Box 
                                                                        component={Link}
                                                                        to={`/book/${book._id}`}
                                                                        sx={{ 
                                                                            display: 'flex', 
                                                                            alignItems: 'center',
                                                                            textDecoration: 'none',
                                                                            color: 'inherit',
                                                                            '&:hover': {
                                                                                color: '#187bcd'
                                                                            }
                                                                        }}
                                                                    >
                                                                        <Box 
                                                                            sx={{ 
                                                                                width: 50, 
                                                                                height: 70, 
                                                                                marginRight: 1,
                                                                                display: 'flex',
                                                                                alignItems: 'center',
                                                                                justifyContent: 'center',
                                                                                border: '1px solid #eee'
                                                                            }}
                                                                        >
                                                                            <img 
                                                                                src={book.images && book.images[0]} 
                                                                                alt={book.title} 
                                                                                style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                                                                            />
                                                                        </Box>
                                                                        <Typography 
                                                                            variant="body2"
                                                                            sx={{
                                                                                overflow: 'hidden',
                                                                                textOverflow: 'ellipsis',
                                                                                display: '-webkit-box',
                                                                                WebkitLineClamp: 2,
                                                                                WebkitBoxOrient: 'vertical',
                                                                            }}
                                                                        >
                                                                            {book.title}
                                                                        </Typography>
                                                                    </Box>
                                                                </Grid>
                                                            ))}
                                                        </Grid>
                                                    ) : (
                                                        <Typography variant="body2">Đang tải sách...</Typography>
                                                    )}
                                                    
                                                    <Button 
                                                        component={Link} 
                                                        to={`/category/${activeCategory._id}`}
                                                        variant="outlined" 
                                                        color="primary"
                                                        size="small"
                                                        sx={{ mt: 2 }}
                                                        onClick={handleClose}
                                                    >
                                                        Xem tất cả
                                                    </Button>
                                                </>
                                            ) : (
                                                <Typography variant="body1">Vui lòng chọn danh mục để xem sách</Typography>
                                            )}
                                        </Box>
                                    </Box>
                                </ClickAwayListener>
                            </Paper>
                        </Fade>
                    )}
                </Popper>
                
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