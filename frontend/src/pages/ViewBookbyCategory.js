import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import {
  Grid,
  Typography,
  Card,
  CardMedia,
  CardContent,
  Snackbar,
  Alert,
  Box,
  CircularProgress,
  Container,
  IconButton,
  Rating
} from '@mui/material';
import FavoriteIcon from "@mui/icons-material/Favorite";
import CategoryBreadCrumb from '../components/Breadcrumbs/CategoryBreadCrumb';

const ViewBookByCategory = ({ updateWishlistCount }) => {
  const [books, setBooks] = useState([]);
  const [categoryName, setCategoryName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [wishlist, setWishlist] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const { id: categoryId } = useParams();

  // Function to fetch book ratings
  const fetchBookRatings = async (bookList) => {
    try {
      // Create an array of promises for fetching ratings for each book
      const ratingPromises = bookList.map(book => 
        axios.get(`http://localhost:9999/reviews/${book._id}`)
          .then(response => ({
            ...book,
            averageRating: response.data.averageRating || 0
          }))
          .catch(() => ({
            ...book,
            averageRating: 0
          }))
      );
      
      // Wait for all rating requests to complete
      const booksWithRatings = await Promise.all(ratingPromises);
      return booksWithRatings;
    } catch (error) {
      console.error("Error fetching book ratings:", error);
      return bookList.map(book => ({
        ...book,
        averageRating: book.averageRating || 0
      }));
    }
  };

  useEffect(() => {
    const fetchBooksByCategory = async () => {
      try {
        console.log('Category ID:', categoryId);
        setLoading(true);

        // Fetch books for the category
        const booksResponse = await axios.get(`http://localhost:9999/book/category/${categoryId}`);
        console.log('Books Response:', booksResponse.data);

        // Fetch category name (if needed)
        let categoryName = 'Danh mục';
        try {
          const categoryResponse = await axios.get(`http://localhost:9999/category/${categoryId}`);
          categoryName = categoryResponse.data.name;
          console.log('Category Response:', categoryResponse.data);
        } catch (categoryErr) {
          console.error('Error fetching category:', categoryErr);
        }

        // Filter only activated books
        const activeBooks = booksResponse.data.filter(book => book.isActivated !== false);
        console.log('Active Books:', activeBooks);

        // Fetch ratings for books
        const booksWithRatings = await fetchBookRatings(activeBooks);

        setBooks(booksWithRatings);
        setCategoryName(categoryName);
        setLoading(false);

        // Fetch wishlist
        const token = localStorage.getItem("token") || sessionStorage.getItem("token");
        if (token) {
          const wishlistResponse = await axios.get("http://localhost:9999/user/wishlist", {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (wishlistResponse.data && wishlistResponse.data.wishlist) {
            const wishlistIds = wishlistResponse.data.wishlist.map(book => book._id);
            setWishlist(wishlistIds);
          }
        }
      } catch (err) {
        console.error('Full Error:', err);
        setError(`Không thể tải sách: ${err.response?.data?.message || err.message}`);
        setLoading(false);
      }
    };

    if (categoryId) {
      fetchBooksByCategory();
    }
  }, [categoryId]);

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

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Typography variant="h6" color="error">
          {error}
        </Typography>
        <Typography variant="body1" sx={{ mt: 2 }}>
          Chi tiết lỗi: Vui lòng kiểm tra đường dẫn API và kết nối server
        </Typography>
      </Box>
    );
  }

  if (books.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Typography variant="h6">
          Không có sách trong danh mục {categoryName}.
        </Typography>
        <Typography variant="body1" sx={{ mt: 2 }}>
          Danh mục này hiện chưa có sách.
        </Typography>
      </Box>
    );
  }

  return (
    <>

      <CategoryBreadCrumb categoryName={categoryName} />
      <Container maxWidth="lg">
        <Box p={3} textAlign="center">
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

                     {/* Rating display */}
                     <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 1, 
                      marginBottom: 1 
                    }}>
                      <Rating 
                        value={book.averageRating || 0} 
                        precision={0.1} 
                        readOnly 
                        size="small"
                      />
                    </Box>

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

    </>
  );
};

export default ViewBookByCategory;