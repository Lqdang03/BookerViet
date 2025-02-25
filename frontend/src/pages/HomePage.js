import React, { useEffect, useState } from "react";
import {
    Typography,
    Box,
    Snackbar,
    Alert,
    Card,
    CardMedia,
    CardContent,
    IconButton,
    Grid,
    Container,
    Button
} from "@mui/material";
import { Link } from "react-router-dom";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import axios from "axios";

const HomePage = ({ updateWishlistCount, updateCartData }) => {
    const [books, setBooks] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [wishlist, setWishlist] = useState([]);

    useEffect(() => {
        axios.get("http://localhost:9999/book/")
            .then(response => {
                const bookData = response.data.map(book => ({
                    ...book,
                    price: book.price,
                    originalPrice: book.originalPrice
                }));
                setBooks(bookData);
            })
            .catch(error => console.error("Lỗi khi lấy danh sách sách:", error));

        const token = localStorage.getItem("token") || sessionStorage.getItem("token");
        if (token) {
            axios.get("http://localhost:9999/user/wishlist", {
                headers: { Authorization: `Bearer ${token}` }
            })
                .then(response => {
                    if (response.data && response.data.wishlist) {
                        const wishlistIds = response.data.wishlist.map(book => book._id);
                        setWishlist(wishlistIds);
                    }
                })
                .catch(error => console.error("Lỗi khi lấy danh sách yêu thích:", error));
        }
    }, []);


    const toggleWishlist = async (bookId) => {
        const token = localStorage.getItem("token") || sessionStorage.getItem("token");
        if (!token) {
            setNotifications(prev => [...prev, { id: Date.now(), message: "Vui lòng đăng nhập để thêm vào yêu thích", severity: "warning" }]);
            return;
        }

        try {
            if (wishlist.includes(bookId)) {
                // Remove from wishlist
                await axios.delete(`http://localhost:9999/user/wishlist/${bookId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                setWishlist(prev => prev.filter(id => id !== bookId));
                updateWishlistCount(prev => prev - 1);
                setNotifications(prev => [...prev, { id: Date.now(), message: "Đã xóa khỏi danh sách yêu thích", severity: "success" }]);
            } else {
                // Add to wishlist
                await axios.post(`http://localhost:9999/user/wishlist/${bookId}`, {}, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                setWishlist(prev => [...prev, bookId]);
                updateWishlistCount(prev => prev + 1);
                setNotifications(prev => [...prev, { id: Date.now(), message: "Đã thêm vào danh sách yêu thích", severity: "success" }]);
            }
        } catch (error) {
            setNotifications(prev => [...prev, { id: Date.now(), message: "Không thể cập nhật danh sách yêu thích", severity: "error" }]);
        }
    };

    const addToCart = async (bookId) => {
        const token = localStorage.getItem("token") || sessionStorage.getItem("token");
        if (!token) {
            setNotifications(prev => [...prev, { id: Date.now(), message: "Vui lòng đăng nhập để thêm vào giỏ hàng", severity: "warning" }]);
            return;
        }

        try {
            await axios.post("http://localhost:9999/cart/add", { bookId, quantity: 1 }, { headers: { Authorization: `Bearer ${token}` } });

            updateCartData(); // Cập nhật lại giỏ hàng
            setNotifications(prev => [...prev, { id: Date.now(), message: "Đã thêm vào giỏ hàng", severity: "success" }]);
        } catch (error) {
            setNotifications(prev => [...prev, { id: Date.now(), message: "Không thể thêm vào giỏ hàng", severity: "error" }]);
        }
    };

    return (
        <Container maxWidth="lg">
            <Box p={3} textAlign="center">
                <Typography variant="h5" gutterBottom mb={3}>Danh sách sách</Typography>
                <Grid container spacing={3} justifyContent="flex-start">
                    {books.map((book) => (
                        <Grid item xs={12} sm={6} md={4} lg={3} key={book._id}>
                            <Card sx={{ width: 220, minHeight: 250, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', pb: 2 }}>
                                <Box sx={{ position: 'relative', width: '100%' }}>
                                {book.originalPrice > book.price && (
                                        <Box
                                            sx={{
                                                position: 'absolute',
                                                top: 0,
                                                right: 0,
                                                width: '38px',
                                                height: '38px',
                                                backgroundImage: 'url(//bizweb.dktcdn.net/100/445/986/themes/848655/assets/label-sale.png?1737605118310)',
                                                backgroundRepeat: 'no-repeat',
                                                backgroundSize: 'contain',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '12px',
                                                fontWeight: 'bold',
                                                color: 'red',
                                                zIndex: 2
                                            }}
                                        >
                                            -{Math.round((1 - book.price / book.originalPrice) * 100)}%
                                        </Box>
                                    )}
                                    <IconButton
                                        onClick={() => toggleWishlist(book._id)}
                                        color={wishlist.includes(book._id) ? "error" : "default"}
                                        size="small"
                                        sx={{
                                            position: 'absolute',
                                            bottom: 5,
                                            right: 20,
                                            bgcolor: 'rgba(255, 255, 255, 0.8)',
                                            '&:hover': {
                                                bgcolor: 'rgba(255, 255, 255, 0.9)'
                                            },
                                            zIndex: 2
                                        }}
                                    >
                                        <FavoriteIcon />
                                    </IconButton>
                                    {/* Rest of card content remains the same */}
                                    <Link to={`/book/${book._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                        <Box
                                            sx={{
                                                position: 'relative',
                                                width: '180px',
                                                height: '180px',
                                                display: 'flex',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                overflow: 'hidden',
                                                mt: 2,
                                                mx: 'auto',
                                                border: '1px solid #e0e0e0',
                                                borderRadius: '4px',
                                                backgroundColor: '#fff',
                                                padding: '3px'
                                            }}
                                        >
                                            <CardMedia
                                                component="img"
                                                image={book.images[0]}
                                                alt={book.title}
                                                sx={{
                                                    width: '100%',
                                                    height: '100%',
                                                    objectFit: 'contain',
                                                    cursor: 'pointer',
                                                    transition: 'transform 0.4s ease-in-out',
                                                    '&:hover': {
                                                        transform: 'scale(1.1)'
                                                    }
                                                }}
                                            />
                                        </Box>
                                    </Link>
                                </Box>
                                <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', width: '180px', padding: '15px 0', "&:last-child": { paddingBottom: 0 } }}>
                                    <Link to={`/book/${book._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                        <Typography
                                            gutterBottom
                                            variant="h6"
                                            sx={{
                                                fontSize: '0.9rem',
                                                textAlign: 'left',
                                                display: '-webkit-box',
                                                WebkitBoxOrient: 'vertical',
                                                WebkitLineClamp: 2,
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                height: '40px',
                                                cursor: 'pointer',
                                                marginBottom: '5px',
                                                paddingBottom: "5px",
                                                '&:hover': { color: '#187bcd' }
                                            }}
                                        >
                                            {book.title}
                                        </Typography>
                                    </Link>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Typography variant="h5" color="error" sx={{ fontSize: '1.1rem', fontWeight: 'bold', textAlign: 'left', marginTop: '2px' }}>
                                            {book.price.toLocaleString()}₫
                                        </Typography>
                                        {book.originalPrice > book.price && (
                                            <Typography variant="body2" sx={{ textDecoration: 'line-through', color: 'gray', fontSize: '0.75rem' }}>
                                                {book.originalPrice.toLocaleString()}₫
                                            </Typography>
                                        )}
                                    </Box>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        size="small"
                                        startIcon={<ShoppingCartIcon />}
                                        onClick={() => addToCart(book._id)}
                                        sx={{ mt: 1 }}
                                    >
                                        Thêm vào giỏ hàng
                                    </Button>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Box>
            {notifications.map((notification) => (
                <Snackbar
                    key={notification.id}
                    open
                    autoHideDuration={2000}
                    anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                    onClose={() => setNotifications(prev => prev.filter(n => n.id !== notification.id))}
                >
                    <Alert severity={notification.severity || 'info'}>
                        {notification.message}
                    </Alert>
                </Snackbar>
            ))}
        </Container>
    );
};

export default HomePage;