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
    // Button
} from "@mui/material";
import { Link } from "react-router-dom";
import FavoriteIcon from "@mui/icons-material/Favorite";
// import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import axios from "axios";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';

const HomePage = ({ updateWishlistCount, updateCartData }) => {
    const [books, setBooks] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [wishlist, setWishlist] = useState([]);

    // Sample banner images - replace with your actual images
    const bannerImages = [
        {
            id: 1,
            imageUrl: "https://newshop.vn/public/uploads/landing-page/sach-hay-newshop/banner-mobile.png",
            link: "/",
            alt: "Summer Reading Promotion"
        },
        {
            id: 2,
            imageUrl: "https://cdn1.fahasa.com/media/magentothem/banner7/muasamkhongtienmatT325_840x320.png",
            link: "/",
            alt: "New Releases"
        },
        {
            id: 3,
            imageUrl: "https://sunbook.vn/wp-content/uploads/2023/08/hmodule_banner_img1_1.webp",
            link: "/",
            alt: "Bestsellers Collection"
        },
        // {
        //     id: 4,
        //     imageUrl: "/pictures/BookerViet.png",
        //     link: "/",
        //     alt: "Bestsellers Collection"
        // }
    ];

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

    // Custom arrow components for the carousel
    const NextArrow = (props) => {
        const { onClick } = props;
        return (
            <IconButton
                onClick={onClick}
                sx={{
                    position: 'absolute',
                    right: 20,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    zIndex: 1,
                    bgcolor: 'rgba(255, 255, 255, 0.7)',
                    '&:hover': {
                        bgcolor: 'rgba(255, 255, 255, 0.9)'
                    }
                }}
            >
                <NavigateNextIcon />
            </IconButton>
        );
    };

    const PrevArrow = (props) => {
        const { onClick } = props;
        return (
            <IconButton
                onClick={onClick}
                sx={{
                    position: 'absolute',
                    left: 20,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    zIndex: 1,
                    bgcolor: 'rgba(255, 255, 255, 0.7)',
                    '&:hover': {
                        bgcolor: 'rgba(255, 255, 255, 0.9)'
                    }
                }}
            >
                <NavigateBeforeIcon />
            </IconButton>
        );
    };

    // Slider settings
    const sliderSettings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 4000,
        nextArrow: <NextArrow />,
        prevArrow: <PrevArrow />,
        responsive: [
            {
                breakpoint: 600,
                settings: {
                    arrows: false
                }
            }
        ]
    };

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

    return (
        <Container maxWidth="lg">
            {/* Banner Carousel Section */}
            <Box sx={{ mt: 4, mb: 2 }}>
                <Slider {...sliderSettings}>
                    {bannerImages.map((banner) => (
                        <div key={banner.id}>
                            <Link to={banner.link}>
                                <Box
                                    sx={{
                                        height: { xs: 150, sm: 250, md: 300, lg: 400 },
                                        width: '100%',
                                        position: 'relative',
                                        borderRadius: 2,
                                        overflow: 'hidden'
                                    }}
                                >
                                    <img
                                        src={banner.imageUrl}
                                        alt={banner.alt}
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover'
                                        }}
                                    />
                                </Box>
                            </Link>
                        </div>
                    ))}
                </Slider>
            </Box>

            <Box p={3} textAlign="center">
                <Typography variant="h5" gutterBottom mb={3}>Danh sách sách</Typography>
                <Grid container spacing={2} justifyContent="flex-start" >
                    {books.map((book) => (
                        <Grid item xs={12} sm={6} md={4} lg={2.4} key={book._id}>
                            <Card sx={{
                                maxWidth: "100%",
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                position: 'relative',
                                mb: 2
                            }}>
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