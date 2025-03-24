import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import {
    Box,
    Typography,
    Grid,
    Card,
    CardContent,
    CardMedia,
    IconButton,
    Checkbox,
    Paper,
    FormGroup,
    FormControlLabel,
    CircularProgress,
    Container,
    FormControl, Select, MenuItem
} from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import BookResultBreadCrumb from "../components/Breadcrumbs/BookResultBreadCrumb";

const BookResult = ({ updateWishlistCount, updateCartData }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const query = new URLSearchParams(location.search).get("query");
    const [books, setBooks] = useState([]);
    const [filteredBooks, setFilteredBooks] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [wishlist, setWishlist] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchParams] = useSearchParams();
    const [sortOption, setSortOption] = useState("default");

    const handleSortChange = (event) => {
        setSortOption(event.target.value);
    };

    useEffect(() => {
        let sortedBooks = [...filteredBooks];
        switch (sortOption) {
            case "priceAsc":
                sortedBooks.sort((a, b) => a.price - b.price);
                break;
            case "priceDesc":
                sortedBooks.sort((a, b) => b.price - a.price);
                break;
            case "titleAsc":
                sortedBooks.sort((a, b) => a.title.localeCompare(b.title));
                break;
            case "titleDesc":
                sortedBooks.sort((a, b) => b.title.localeCompare(a.title));
                break;
            default:
                break;
        }
        setFilteredBooks(sortedBooks);
    }, [sortOption]);


    // Fetch categories
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.get("http://localhost:9999/category/");
                if (response.data && Array.isArray(response.data)) {
                    setCategories(response.data);
                }
            } catch (error) {
                console.error("Lỗi khi lấy danh mục:", error);
                setNotifications(prev => [...prev, { id: Date.now(), message: "Không thể tải danh mục", severity: "error" }]);
            }
        };

        fetchCategories();
    }, []);

    // Fetch books based on search query
    useEffect(() => {
        const fetchBooks = async () => {
            setIsLoading(true);
            try {
                let response;
                if (query) {
                    // If there's a search query, filter by title
                    response = await axios.get("http://localhost:9999/book/");
                    const queryFilteredBooks = response.data.filter(book =>
                        book.title.toLowerCase().includes(query.toLowerCase())
                    );
                    setBooks(queryFilteredBooks);
                    setFilteredBooks(queryFilteredBooks);
                } else {
                    // If no search query, get all books
                    response = await axios.get("http://localhost:9999/book/");
                    setBooks(response.data);
                    setFilteredBooks(response.data);
                }
            } catch (error) {
                console.error("Lỗi khi lấy danh sách sách:", error);
                setNotifications(prev => [...prev, { id: Date.now(), message: "Không thể tải danh sách sách", severity: "error" }]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchBooks();
    }, [query]);

    // Update filtered books when selected categories change
    useEffect(() => {
        if (selectedCategories.length === 0) {
            setFilteredBooks(books);
        } else {
            const filtered = books.filter(book =>
                book.categories && book.categories.some(categoryId =>
                    selectedCategories.includes(categoryId)
                )
            );
            setFilteredBooks(filtered);
        }
    }, [selectedCategories, books]);

    // Handle category selection
    const handleCategoryChange = (categoryId) => {
        setSelectedCategories(prev => {
            if (prev.includes(categoryId)) {
                return prev.filter(id => id !== categoryId);
            } else {
                return [...prev, categoryId];
            }
        });
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
                if (updateWishlistCount) updateWishlistCount(prev => prev - 1);
                setNotifications(prev => [...prev, { id: Date.now(), message: "Đã xóa khỏi danh sách yêu thích", severity: "success" }]);
            } else {
                // Add to wishlist
                await axios.post(`http://localhost:9999/user/wishlist/${bookId}`, {}, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                setWishlist(prev => [...prev, bookId]);
                if (updateWishlistCount) updateWishlistCount(prev => prev + 1);
                setNotifications(prev => [...prev, { id: Date.now(), message: "Đã thêm vào danh sách yêu thích", severity: "success" }]);
            }
        } catch (error) {
            setNotifications(prev => [...prev, { id: Date.now(), message: "Không thể cập nhật danh sách yêu thích", severity: "error" }]);
        }
    };

    return (
        <div>
            <BookResultBreadCrumb/>
            <Container maxWidth="lg">
            <Box sx={{ paddingBottom: 3 }}>
                <Typography variant="h5" sx={{ marginBottom: 2, textAlign: "center", fontSize: 30, fontWeight: 400 }}>
                    Kết quả tìm kiếm cho: {query}
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                    <FormControl variant="outlined" size="small">
                        <Select value={sortOption} onChange={handleSortChange} displayEmpty>
                            <MenuItem value="default">Mặc định</MenuItem>
                            <MenuItem value="priceAsc">Giá thấp đến cao</MenuItem>
                            <MenuItem value="priceDesc">Giá cao xuống thấp</MenuItem>
                            <MenuItem value="titleAsc">Tên A-Z</MenuItem>
                            <MenuItem value="titleDesc">Tên Z-A</MenuItem>
                        </Select>
                    </FormControl>
                </Box>

                <Grid container spacing={3}>
                    {/* Category selection column */}
                    <Grid item xs={12} md={3}>
                        <Paper elevation={2} sx={{ p: 2, height: '100%' }}>
                            <Typography variant="h6" sx={{ mb: 2 }}>
                                Danh mục
                            </Typography>
                            {isLoading ? (
                                <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                                    <CircularProgress size={24} />
                                </Box>
                            ) : categories.length > 0 ? (
                                <FormGroup>
                                    {categories.map((category) => (
                                        <FormControlLabel
                                            key={category._id}
                                            control={
                                                <Checkbox
                                                    checked={selectedCategories.includes(category._id)}
                                                    onChange={() => handleCategoryChange(category._id)}
                                                />
                                            }
                                            label={category.name}
                                        />
                                    ))}
                                </FormGroup>
                            ) : (
                                <Typography>Không có danh mục nào.</Typography>
                            )}
                        </Paper>
                    </Grid>

                    {/* Books display column */}
                    <Grid item xs={12} md={9}>
                        {isLoading ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                                <CircularProgress />
                            </Box>
                        ) : filteredBooks.length > 0 ? (
                            <Grid container spacing={2}>
                                {filteredBooks.map((book) => (
                                    <Grid item xs={12} sm={6} md={4} lg={3} key={book._id}>
                                        <Card sx={{ width: '100%', minHeight: 250, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', pb: 2 }}>
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
                        ) : (
                            <Typography>Không tìm thấy sách phù hợp.</Typography>
                        )}
                    </Grid>
                </Grid>
            </Box>
        </Container>
        </div>
    );
};

export default BookResult;