import React, { useState, useEffect, useCallback } from "react";
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
    Container
} from "@mui/material";
import { Link } from "react-router-dom";
import FavoriteIcon from "@mui/icons-material/Favorite";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Wishlist({ updateWishlistCount }) {
    const navigate = useNavigate();
    const [wishlist, setWishlist] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [error, setError] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Improved token verification
    const verifyAuth = () => {
        const token = localStorage.getItem("token") || sessionStorage.getItem("token");
        if (!token) {
            setIsAuthenticated(false);
            // Clear any remaining auth data
            localStorage.removeItem("token");
            localStorage.removeItem("userEmail");
            sessionStorage.removeItem("token");
            sessionStorage.removeItem("userEmail");
            return null;
        }
        setIsAuthenticated(true);
        return token;
    };

    const fetchWishlist = useCallback(async () => {
        const token = verifyAuth();
        if (!token) {
            return;
        }

        try {
            const response = await axios.get("http://localhost:9999/user/wishlist", {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.data && response.data.wishlist) {
                setWishlist(response.data.wishlist);
                if (updateWishlistCount) {
                    updateWishlistCount(response.data.wishlist.length);
                }
                setError(null);
            }
        } catch (err) {
            console.error('Wishlist fetch error:', err);
            if (err.response?.status === 401) {
                setIsAuthenticated(false);
                localStorage.removeItem("token");
                localStorage.removeItem("userEmail");
                sessionStorage.removeItem("token");
                sessionStorage.removeItem("userEmail");
                return;
            }
            setError("Không thể tải danh sách yêu thích. Vui lòng thử lại sau.");
        }
    }, [updateWishlistCount]);


    const removeFromWishlist = async (bookId) => {
        const token = verifyAuth();
        if (!token) {
            navigate("/account/login", { replace: true });
            return;
        }

        try {
            await axios.delete(`http://localhost:9999/user/wishlist/${bookId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const updatedWishlist = wishlist.filter(book => book._id !== bookId);
            setWishlist(updatedWishlist);

            // Update count in parent component
            if (updateWishlistCount) {
                updateWishlistCount(updatedWishlist.length);
            }

            setNotifications(prev => [...prev, {
                id: Date.now(),
                message: 'Đã xóa sách khỏi danh sách yêu thích',
                severity: 'success'
            }]);
        } catch (err) {
            console.error('Remove from wishlist error:', err);
            if (err.response?.status === 401) {
                localStorage.removeItem("token");
                localStorage.removeItem("userEmail");
                sessionStorage.removeItem("token");
                sessionStorage.removeItem("userEmail");
                navigate("/account/login", { replace: true });
                return;
            }
            setNotifications(prev => [...prev, {
                id: Date.now(),
                message: 'Không thể xóa sách khỏi danh sách yêu thích',
                severity: 'error'
            }]);
        }
    };

    useEffect(() => {
        fetchWishlist();
    }, [fetchWishlist]);


    const WishlistContent = () => {
        if (!isAuthenticated) {
            return (
                <Box display="flex" flexDirection="column" alignItems="center" py={3} mb={42}>
                    <Typography variant="h5" gutterBottom mb={3}>
                        Danh sách yêu thích của tôi
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Vui lòng{" "}
                        <Link to="/account/login" style={{ color: '#1976d2', textDecoration: 'none' }}>
                            đăng nhập
                        </Link>
                        {" "}hoặc{" "}
                        <Link to="/account/register" style={{ color: '#1976d2', textDecoration: 'none' }}>
                            đăng ký
                        </Link>
                        {" "}để có thể thêm thật nhiều sản phẩm vào yêu thích.
                    </Typography>
                </Box>
            );
        }

        if (error) {
            return (
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
                    <Typography color="error">{error}</Typography>
                </Box>
            );
        }

        if (wishlist.length === 0) {
            return (
                <Box display="flex" flexDirection="column" alignItems="center" py={3} mb={42}>
                    <Typography variant="h5" gutterBottom mb={3}>
                        Danh sách yêu thích của tôi
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Bạn chưa có sản phẩm yêu thích,{" "}
                        <Link to="/" style={{ color: '#1976d2', textDecoration: 'none' }}>
                            vào đây
                        </Link>
                        {' '}để thêm thật nhiều sản phẩm vào yêu thích nào.
                    </Typography>
                </Box>
            );
        }

        return (
            <Container maxWidth="lg">
                <Box p={3} textAlign="center">
                    <Typography variant="h5" gutterBottom mb={3}>
                        Danh sách yêu thích của tôi
                    </Typography>
                    <Grid container spacing={3} justifyContent="flex-start">
                        {wishlist.map((book) => (
                            <Grid item xs={12} sm={6} md={4} lg={3} key={book._id}>
                                <Card sx={{
                                    width: 220,
                                    minHeight: 250,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    position: 'relative',
                                    pb: 2
                                }}>
                                    <Box sx={{ position: 'relative', width: '100%' }}>
                                        {book.originalPrice > book.price && (
                                            <Box
                                                className="smart"
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
                                        {book.stock === 0 && (
                                            <Box
                                                sx={{
                                                    position: 'absolute',
                                                    top: 0,
                                                    left: 0,
                                                    bgcolor: 'rgba(0, 0, 0, 0.7)',
                                                    color: 'white',
                                                    padding: '4px 8px',
                                                    fontSize: '12px',
                                                    fontWeight: 'bold',
                                                    zIndex: 2,
                                                    borderRadius: '0 0 4px 0'
                                                }}
                                            >
                                                Hết hàng
                                            </Box>
                                        )}

                                        <IconButton
                                            onClick={() => removeFromWishlist(book._id)}
                                            color="error"
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
                                                    image={book?.images[0]}
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
                                    <CardContent
                                        sx={{
                                            flexGrow: 1,
                                            display: 'flex',
                                            flexDirection: 'column',
                                            justifyContent: 'flex-start',
                                            width: '180px',
                                            padding: '15px 0',
                                            "&:last-child": {
                                                paddingBottom: 0
                                            }
                                        }}
                                    >
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

                                        <Box sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 1
                                        }}>
                                            <Typography
                                                variant="h5"
                                                color="error"
                                                sx={{
                                                    fontSize: '1.1rem',
                                                    fontWeight: 'bold',
                                                    textAlign: 'left',
                                                    marginTop: '2px'
                                                }}
                                            >
                                                {book.price.toLocaleString()}₫
                                            </Typography>
                                            {book.originalPrice > book.price && (
                                                <Typography
                                                    variant="body2"
                                                    sx={{
                                                        textDecoration: 'line-through',
                                                        color: 'gray',
                                                        fontSize: '0.75rem'
                                                    }}
                                                >
                                                    {book.originalPrice.toLocaleString()}₫
                                                </Typography>
                                            )}
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Box>
            </Container>
        );
    };

    return (
        <div>
            <WishlistContent />
            {notifications.map((notification) => (
                <Snackbar
                    key={notification.id}
                    open
                    autoHideDuration={2000}
                    anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                    onClose={() => setNotifications(prev =>
                        prev.filter(n => n.id !== notification.id)
                    )}
                >
                    <Alert
                        severity={notification.severity || 'info'}
                        onClose={() => setNotifications(prev =>
                            prev.filter(n => n.id !== notification.id)
                        )}
                    >
                        {notification.message}
                    </Alert>
                </Snackbar>
            ))}
        </div>
    );
}

export default Wishlist;