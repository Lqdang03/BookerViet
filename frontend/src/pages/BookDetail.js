import React, { useEffect, useState } from "react";
import {
  Typography,
  Box,
  Snackbar,
  Alert,
  Card,
  CardMedia,
  IconButton,
  Grid,
  CardContent,
  Container,
  Button,
  Table,
  TableBody,
  TableRow,
  TableCell,
  Divider,
  Tabs,
  Tab,
  Rating,

} from "@mui/material";
import { Link, useParams } from "react-router-dom";
import FavoriteIcon from "@mui/icons-material/Favorite";
import { Edit, Delete } from "@mui/icons-material";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import axios from "axios";
import BookDetailBreadCrumb from "../components/Breadcrumbs/BookDetailBreadCrumb";

const BookDetail = ({ updateWishlistCount, updateCartData }) => {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [notifications, setNotifications] = useState([]);
  const [inWishlist, setInWishlist] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [relatedBooks, setRelatedBooks] = useState([]);
  const [wishlist, setWishlist] = useState([]);

  const [reviews, setReviews] = useState([]);
  const [userReview, setUserReview] = useState(null);  // Store the user's own review
  const [averageRating, setAverageRating] = useState(0);  // Store average rating
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(1);
  const [comment, setComment] = useState("");
  const [editingReview, setEditingReview] = useState(null);


  useEffect(() => {
    setLoading(true);
    // Fetch book details
    axios
      .get(`http://localhost:9999/book/${id}`)
      .then((response) => {
        setBook(response.data);
        setLoading(false);

        // After getting book details, fetch related books from the same category
        if (response.data.categories && response.data.categories.length > 0) {
          const categoryId = response.data.categories[0];
          fetchRelatedBooks(categoryId, response.data._id);
        }

        // Fetch reviews for the book
        fetchReviews();

      })
      .catch((error) => {
        console.error("Lỗi khi lấy thông tin sách:", error);
        setLoading(false);
      });

    // Check if book is in wishlist
    const token = getToken();
    if (token) {
      axios
        .get("http://localhost:9999/user/wishlist", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          if (response.data && response.data.wishlist) {
            const wishlistIds = response.data.wishlist.map((book) => book._id);
            setWishlist(wishlistIds);
            setInWishlist(wishlistIds.includes(id));
          }
        })
        .catch((error) =>
          console.error("Lỗi khi kiểm tra danh sách yêu thích:", error)
        );
    }
  }, [id]);

  const getToken = () => localStorage.getItem("token") || sessionStorage.getItem("token");

  const fetchReviews = () => {
    axios
      .get(`http://localhost:9999/reviews/${id}`)
      .then((response) => {
        // Kiểm tra và đảm bảo rằng reviews là mảng
        if (Array.isArray(response.data.reviews)) {
          setReviews(response.data.reviews);
        } else {
          console.error("Dữ liệu reviews không phải là mảng:", response.data.reviews);
        }

        // Set averageRating
        setAverageRating(response.data.averageRating);

        // Fetch user's own review nếu có token
        const token = getToken();
        if (token) {
          axios
            .get(`http://localhost:9999/reviews/user/${id}`, {
              headers: { Authorization: `Bearer ${token}` },
            })
            .then((userReviewResponse) => {
              // Kiểm tra xem dữ liệu trả về có phải là đối tượng hay không
              if (userReviewResponse.data && typeof userReviewResponse.data === 'object') {
                // Kiểm tra nếu userReviewResponse là đối tượng đánh giá người dùng
                const userReview = userReviewResponse.data.book === id ? userReviewResponse.data : null;
                setUserReview(userReview);
              } else {
                console.error("Dữ liệu userReview không phải là đối tượng:", userReviewResponse.data);
              }
            })
            .catch((error) => console.error("Lỗi khi lấy đánh giá của người dùng:", error));
        }
      })
      .catch((error) => {
        console.error("Lỗi khi lấy đánh giá sách:", error);
      });
  };



  const handleSubmitReview = async () => {
    const token = getToken();

    if (!token) {
      setNotifications([...notifications, "Bạn cần đăng nhập để đánh giá."]);
      return;
    }

    try {
      await axios.post(
        `http://localhost:9999/reviews/${id}`,
        { rating, comment },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setShowReviewForm(false);  // Close the form after submission
      setRating(1);  // Reset rating
      setComment("");  // Reset comment
      fetchReviews();  // Re-fetch reviews to update UI
    } catch (error) {
      console.error("Lỗi khi gửi đánh giá:", error);
    }
  };

  const handleEdit = (review) => {
    setEditingReview(review); // Lưu đánh giá đang chỉnh sửa
    setRating(review.rating);  // Cập nhật rating vào form
    setComment(review.comment); // Cập nhật comment vào form
  };

  const handleSubmitEdit = async () => {
    const token = getToken();

    if (!token) {
      setNotifications([...notifications, "Bạn cần đăng nhập để chỉnh sửa đánh giá."]);
      return;
    }

    console.log('Submitting review:', editingReview);

    try {
      const response = await axios.put(
        `http://localhost:9999/reviews/update/${editingReview._id}`,
        editingReview,  // Gửi toàn bộ đối tượng editingReview đã được cập nhật
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status === 200) {
        fetchReviews();  // Fetch lại reviews sau khi cập nhật đánh giá

        // Reset các state
        setEditingReview(null);
        alert('Đánh giá đã được cập nhật!');
      }
    } catch (error) {
      console.error('Cập nhật thất bại:', error);
      alert('Cập nhật thất bại, vui lòng thử lại!');
    }
  };



  const handleDelete = async (reviewId) => {
    const token = getToken(); // Lấy token người dùng

    if (!token) {
      setNotifications((prev) => [...prev, "Bạn cần đăng nhập để xóa đánh giá."]);
      return;
    }

    try {
      const response = await axios.delete(
        `http://localhost:9999/reviews/delete/${reviewId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status === 200) {
        // Sau khi xóa thành công, cập nhật lại danh sách đánh giá
        fetchReviews();
        alert("Đánh giá đã được xóa!");
      } else {
        alert("Xóa đánh giá không thành công!");
      }
    } catch (error) {
      console.error("Xóa đánh giá thất bại:", error);
      alert("Xóa thất bại, vui lòng thử lại!");
    }
  };



  // Add this function
  const fetchRelatedBooks = (categoryId, currentBookId) => {
    axios
      .get(`http://localhost:9999/book/category/${categoryId}`)
      .then((response) => {
        // Filter out the current book and limit to 4 books
        const filteredBooks = response.data
          .filter(book => book._id !== currentBookId)
          .slice(0, 4);
        setRelatedBooks(filteredBooks);
      })
      .catch((error) => {
        console.error("Lỗi khi lấy sách cùng loại:", error);
      });
  };

  // In the handleAddToCart function:
  const handleAddToCart = async () => {
    // Don't allow adding to cart if stock is 0
    if (book.stock === 0) {
      return;
    }

    // Check if quantity exceeds available stock
    if (quantity > book.stock) {
      setNotifications((prev) => [
        ...prev,
        {
          id: Date.now(),
          message: `Không đủ sách trong kho. Chỉ còn ${book.stock} cuốn.`,
          severity: "error",
        },
      ]);
      return;
    }

    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token) {
      setNotifications((prev) => [
        ...prev,
        {
          id: Date.now(),
          message: "Vui lòng đăng nhập để thêm vào giỏ hàng",
          severity: "warning",
        },
      ]);
      return;
    }

    try {
      // This API call is working correctly - it adds to cart
      await axios.post(
        "http://localhost:9999/cart/add",
        { bookId: id, quantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Only call updateCartData if it's a function
      if (typeof updateCartData === "function") {
        updateCartData();
      }

      setNotifications((prev) => [
        ...prev,
        {
          id: Date.now(),
          message: "Đã thêm vào giỏ hàng",
          severity: "success",
        },
      ]);
    } catch (error) {
      console.error("Cart error:", error);
      setNotifications((prev) => [
        ...prev,
        {
          id: Date.now(),
          message: "Không thể thêm vào giỏ hàng",
          severity: "error",
        },
      ]);
    }
  };

  const toggleWishlist = async (bookId) => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token) {
      setNotifications((prev) => [
        ...prev,
        {
          id: Date.now(),
          message: "Vui lòng đăng nhập để thêm vào yêu thích",
          severity: "warning",
        },
      ]);
      return;
    }

    try {
      // If no bookId is provided, use the current book id (for backward compatibility)
      const targetBookId = bookId || id;

      if (wishlist.includes(targetBookId)) {
        // Remove from wishlist
        await axios.delete(`http://localhost:9999/user/wishlist/${targetBookId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setWishlist(prev => prev.filter(id => id !== targetBookId));
        if (targetBookId === id) setInWishlist(false);

        // Only call updateWishlistCount if it's a function
        if (typeof updateWishlistCount === "function") {
          updateWishlistCount((prev) => prev - 1);
        }

        setNotifications((prev) => [
          ...prev,
          {
            id: Date.now(),
            message: "Đã xóa khỏi danh sách yêu thích",
            severity: "success",
          },
        ]);
      } else {
        // Add to wishlist
        await axios.post(
          `http://localhost:9999/user/wishlist/${targetBookId}`,
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setWishlist(prev => [...prev, targetBookId]);
        if (targetBookId === id) setInWishlist(true);

        // Only call updateWishlistCount if it's a function
        if (typeof updateWishlistCount === "function") {
          updateWishlistCount((prev) => prev + 1);
        }

        setNotifications((prev) => [
          ...prev,
          {
            id: Date.now(),
            message: "Đã thêm vào danh sách yêu thích",
            severity: "success",
          },
        ]);
      }
    } catch (error) {
      console.error("Wishlist error:", error);
      setNotifications((prev) => [
        ...prev,
        {
          id: Date.now(),
          message: "Không thể cập nhật danh sách yêu thích",
          severity: "error",
        },
      ]);
    }
  };

  const handleQuantityChange = (change) => {
    const newQuantity = Math.max(1, quantity + change);

    // Validate against stock limit
    if (book && book.stock > 0 && newQuantity > book.stock) {
      setNotifications((prev) => [
        ...prev,
        {
          id: Date.now(),
          message: `Số lượng không thể vượt quá ${book.stock} cuốn.`,
          severity: "warning",
        },
      ]);
      return;
    }

    setQuantity(newQuantity);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "50vh",
          }}
        >
          <Typography>Đang tải...</Typography>
        </Box>
      </Container>
    );
  }

  if (!book) {
    return (
      <Container maxWidth="lg">
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "50vh",
          }}
        >
          <Typography>Không tìm thấy sách</Typography>
        </Box>
      </Container>
    );
  }

  // Check if stock is 0
  const isOutOfStock = book.stock === 0;

  return (
    <>
      <BookDetailBreadCrumb />
      <Container maxWidth="lg" sx={{ mt: 2 }}>
        {/* Book Details Section */}
        <Grid container spacing={4}>
          {/* Left Side - Book Image */}
          <Grid item xs={12} md={5}>
            <Box
              sx={{
                position: "relative",
                width: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <Card
                sx={{
                  width: "100%",
                  maxWidth: 400,
                  mb: 2,
                  position: "relative",
                  boxShadow: 2,
                  borderRadius: 2,
                }}
              >
                {book.originalPrice > book.price && (
                  <Box
                    sx={{
                      position: "absolute",
                      top: 0,
                      right: 0,
                      width: "50px",
                      height: "50px",
                      backgroundImage:
                        "url(//bizweb.dktcdn.net/100/445/986/themes/848655/assets/label-sale.png?1737605118310)",
                      backgroundRepeat: "no-repeat",
                      backgroundSize: "contain",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "14px",
                      fontWeight: "bold",
                      color: "red",
                      zIndex: 2,
                    }}
                  >
                    -{Math.round((1 - book.price / book.originalPrice) * 100)}%
                  </Box>
                )}
                <IconButton
                  onClick={() => toggleWishlist(id)}
                  color={inWishlist ? "error" : "default"}
                  size="medium"
                  sx={{
                    position: "absolute",
                    bottom: 10,
                    right: 20,
                    bgcolor: "rgba(255, 255, 255, 0.8)",
                    "&:hover": {
                      bgcolor: "rgba(255, 255, 255, 0.9)",
                    },
                    zIndex: 2,
                  }}
                >
                  <FavoriteIcon />
                </IconButton>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    width: "100%",
                    height: "100%",
                  }}
                >
                  <CardMedia
                    component="img"
                    image={
                      book.images && book.images.length > 0 ? book.images[0] : ""
                    }
                    alt={book.title}
                    sx={{
                      objectFit: "contain",
                      height: "auto",
                      maxHeight: 500,
                      p: 2,
                      filter: isOutOfStock ? "grayscale(50%)" : "none",
                    }}
                  />
                </Box>
              </Card>

              {/* Thumbnail images */}
              {book.images && book.images.length > 1 && (
                <Grid container spacing={1} justifyContent="center">
                  {book.images.map((img, index) => (
                    <Grid item key={index}>
                      <Box
                        sx={{
                          width: 60,
                          height: 60,
                          border: "1px solid #e0e0e0",
                          borderRadius: 1,
                          overflow: "hidden",
                          cursor: "pointer",
                        }}
                      >
                        <img
                          src={img}
                          alt={`${book.title} - ${index}`}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "contain",
                          }}
                        />
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Box>
          </Grid>

          {/* Right Side - Book Info */}
          <Grid item xs={12} md={7}>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: "bold" }}>
              {book.title}
            </Typography>

            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              <Typography variant="body1" sx={{ mr: 2 }}>
                Tác giả:{" "}
                <Link style={{ textDecoration: "none", color: "#1976d2" }}>
                  {book.author}
                </Link>
              </Typography>
              <Typography variant="body2">
                Nhà xuất bản:{" "}
                <Link style={{ textDecoration: "none", color: "#1976d2" }}>
                  {book.publisher}
                </Link>
              </Typography>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Price Section */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h4" color="error" sx={{ fontWeight: "bold" }}>
                {book.price?.toLocaleString()}₫
              </Typography>
              {book.originalPrice > book.price && (
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}
                >
                  <Typography
                    variant="body1"
                    sx={{ textDecoration: "line-through", color: "gray" }}
                  >
                    {book.originalPrice?.toLocaleString()}₫
                  </Typography>
                  <Typography variant="body2" sx={{ color: "error.main" }}>
                    Tiết kiệm{" "}
                    {(book.originalPrice - book.price)?.toLocaleString()}₫ (
                    {Math.round((1 - book.price / book.originalPrice) * 100)}%)
                  </Typography>
                </Box>
              )}
            </Box>

            {/* Stock status with stock quantity */}
            <Box sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
              <Typography
                variant="body1"
                sx={{
                  color: isOutOfStock ? "error.main" : "success.main",
                  fontWeight: "medium"
                }}
              >
                {isOutOfStock ? "Hết hàng" : "Còn hàng"}
              </Typography>
              {!isOutOfStock && (
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  ({book.stock} cuốn)
                </Typography>
              )}
            </Box>

            {/* Quantity and Add to Cart */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
              <Box
                sx={{
                  display: "flex",
                  border: "1px solid #e0e0e0",
                  borderRadius: 1,
                  opacity: isOutOfStock ? 0.6 : 1,
                }}
              >
                <Button
                  variant="text"
                  onClick={() => handleQuantityChange(-1)}
                  sx={{ minWidth: 40 }}
                  disabled={isOutOfStock}
                >
                  -
                </Button>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 40,
                  }}
                >
                  {quantity}
                </Box>
                <Button
                  variant="text"
                  onClick={() => handleQuantityChange(1)}
                  sx={{ minWidth: 40 }}
                  disabled={isOutOfStock}
                >
                  +
                </Button>
              </Box>

              <Button
                variant="contained"
                color={isOutOfStock ? "secondary" : "primary"}
                startIcon={<ShoppingCartIcon />}
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                sx={{
                  py: 1,
                  px: 3,
                  opacity: isOutOfStock ? 0.8 : 1,
                }}
              >
                {isOutOfStock ? "Hết hàng" : "Thêm vào giỏ hàng"}
              </Button>

              {/* Remove the favorite icon from here as we moved it to the image section */}
            </Box>

            {/* Basic Book Info Table */}
            <Box sx={{ mb: 3 }}>
              <Card sx={{ mb: 3 }}>
                <Table size="small">
                  <TableBody>
                    <TableRow>
                      <TableCell
                        component="th"
                        sx={{ width: "30%", bgcolor: "#f5f5f5" }}
                      >
                        Nhà phát hành
                      </TableCell>
                      <TableCell>{book.publisher || "IPM"}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell
                        component="th"
                        sx={{ width: "30%", bgcolor: "#f5f5f5" }}
                      >
                        Tác giả/Dịch giả
                      </TableCell>
                      <TableCell>{book.author || "Banjo Azusa"}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell
                        component="th"
                        sx={{ width: "30%", bgcolor: "#f5f5f5" }}
                      >
                        Nhà xuất bản
                      </TableCell>
                      <TableCell>
                        {book.publisher || "Nhà Xuất Bản Dân Trí"}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell
                        component="th"
                        sx={{ width: "30%", bgcolor: "#f5f5f5" }}
                      >
                        Hình thức bìa
                      </TableCell>
                      <TableCell>{book.cover || "Bìa mềm"}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell
                        component="th"
                        sx={{ width: "30%", bgcolor: "#f5f5f5" }}
                      >
                        Số trang
                      </TableCell>
                      <TableCell>{book.totalPage || "160"} trang</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell
                        component="th"
                        sx={{ width: "30%", bgcolor: "#f5f5f5" }}
                      >
                        Kích thước
                      </TableCell>
                      <TableCell>
                        {book.dimensions || "18 x 13 x 0.8 cm"}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell
                        component="th"
                        sx={{ width: "30%", bgcolor: "#f5f5f5" }}
                      >
                        Độ tuổi
                      </TableCell>
                      <TableCell>{book.minAge || "18"}+</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell
                        component="th"
                        sx={{ width: "30%", bgcolor: "#f5f5f5" }}
                      >
                        Trọng lượng
                      </TableCell>
                      <TableCell>{book.weight || "180g"}g</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </Card>
            </Box>
          </Grid>
        </Grid>

        {/* Tabs for Description and Details */}
        <Box sx={{ width: "100%", mb: 5 }}>
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              aria-label="book details tabs"
            >
              <Tab label="Mô tả sản phẩm" id="tab-0" />
              <Tab label="Đánh giá" id="tab-1" />
            </Tabs>
          </Box>
          <Box
            role="tabpanel"
            hidden={tabValue !== 0}
            id="tabpanel-0"
            sx={{ p: 3 }}
          >
            {tabValue === 0 && (
              <Typography variant="body1" component="div">
                {book.description || (
                  <>
                    <Typography paragraph>
                      Nam sinh cấp ba Mido Kenshiro
                    </Typography>
                    <Typography paragraph>
                      Nhờ tài trang điểm của Mido
                    </Typography>
                    <Typography paragraph>
                      1
                    </Typography>
                  </>
                )}
              </Typography>
            )}
          </Box>


          {/* Ratings and Reviews Section */}
          <Box role="tabpanel" hidden={tabValue !== 1} id="tabpanel-1" sx={{ p: 3 }}>
            {tabValue === 1 && reviews.length === 0 ? (
              <Typography sx={{ textAlign: "center", py: 4 }}>
                Chưa có đánh giá nào cho sản phẩm này.
              </Typography>
            ) : (
              <>
                <Typography variant="h6" sx={{ py: 2 }}>
                  Đánh giá trung bình:
                  <span style={{ display: "inline-flex" }}>
                    <Rating value={averageRating} precision={0.1} readOnly sx={{ ml: 1 }} />
                  </span>
                  <span style={{ marginLeft: "8px" }}>
                    {averageRating.toFixed(1)} / 5
                  </span>
                </Typography>

                {/* Render reviews */}
                {reviews.map((review) => (
                  <Card key={review._id} sx={{ mb: 2 }}>
                    <CardContent sx={{ position: 'relative' }}>
                      <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                        {review.user.name}
                      </Typography>
                      <Typography variant="body2" sx={{ color: "text.secondary" }}>
                        {new Date(review.createdAt).toLocaleDateString()}
                      </Typography>
                      <Typography variant="body1" sx={{ py: 1 }}>
                        {review.comment}
                      </Typography>
                      <Typography variant="body2">
                        <Rating value={review.rating} precision={0.1} readOnly />
                      </Typography>

                      {/* Nút Edit và Delete chỉ hiển thị nếu review thuộc về người dùng hiện tại */}
                      {userReview && userReview._id === review._id && (
                        <Box
                          sx={{
                            position: "absolute",
                            top: 8,
                            right: 8,
                            display: "flex",
                            flexDirection: "row",
                            gap: 1,
                          }}
                        >
                          {/* Nút Edit */}
                          <Button
                            variant="outlined"
                            color="primary"
                            onClick={() => handleEdit(review)}
                            sx={{
                              padding: "4px 8px",
                              minWidth: "auto",
                              fontSize: "0.75rem",
                              display: "flex",
                              alignItems: "center",
                              gap: 0.5,
                            }}
                          >
                            <Edit fontSize="small" />
                            Chỉnh sửa
                          </Button>

                          {/* Nút Delete */}
                          <Button
                            variant="outlined"
                            color="error"
                            onClick={() => handleDelete(review._id)}
                            sx={{
                              padding: "4px 8px",
                              minWidth: "auto",
                              fontSize: "0.75rem",
                              display: "flex",
                              alignItems: "center",
                              gap: 0.5,
                            }}
                          >
                            <Delete fontSize="small" />
                            Xóa
                          </Button>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                ))}


                {/* Edit review form */}
                {editingReview && (
                  <Box sx={{ p: 3, mt: 3 }}>
                    <Typography variant="h6">Chỉnh sửa đánh giá sản phẩm</Typography>
                    <Box sx={{ mb: 2 }}>
                      <Typography>Rating (1-5):</Typography>
                      <Rating
                        value={editingReview.rating}
                        onChange={(e, newValue) =>
                          setEditingReview({ ...editingReview, rating: newValue })
                        }
                        precision={0.1}
                      />
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Typography>Comment:</Typography>
                      <textarea
                        value={editingReview.comment}
                        onChange={(e) =>
                          setEditingReview({ ...editingReview, comment: e.target.value })
                        }
                        rows="4"
                        style={{ width: "100%" }}
                      />
                    </Box>
                    <Button variant="contained" color="primary" onClick={handleSubmitEdit}>
                      Lưu đánh giá
                    </Button>
                    <Button
                      variant="outlined"
                      sx={{ ml: 2 }}
                      onClick={() => setEditingReview(null)} // Cancel edit
                    >
                      Hủy
                    </Button>
                  </Box>
                )}

              </>
            )}

            {/* Button to open review form */}
            {!showReviewForm && (
              <Button
                variant="contained"
                color="primary"
                onClick={() => setShowReviewForm(true)} // Toggle form visibility
                sx={{ mt: 3 }}
              >
                Đánh giá sản phẩm
              </Button>
            )}

            {/* Review form */}
            {showReviewForm && (
              <Box sx={{ p: 3, mt: 3 }}>
                <Typography variant="h6">Đánh giá sản phẩm</Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography>Rating (1-5):</Typography>
                  <Rating
                    value={rating}
                    onChange={(e, newValue) => setRating(newValue)} // Update rating value
                    precision={0.1}
                  />
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography>Comment:</Typography>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows="4"
                    style={{ width: "100%" }}
                  />
                </Box>
                <Button variant="contained" color="primary" onClick={handleSubmitReview}>
                  Gửi đánh giá
                </Button>
                <Button
                  variant="outlined"
                  sx={{ ml: 2 }}
                  onClick={() => setShowReviewForm(false)} // Close form
                >
                  Hủy
                </Button>
              </Box>
            )}
          </Box>

        </Box>

        {/* Related Products Section */}
        <Box sx={{ mb: 1, bgcolor: "white", p: 3, borderRadius: 1, boxShadow: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography
              variant="h5"
              gutterBottom
              sx={{ fontWeight: "bold", mb: 0 }}
            >
              SẢN PHẨM CÙNG LOẠI
            </Typography>

            {/* Add this Link component to navigate to the category page */}
            {book.categories && book.categories.length > 0 && (
              <Link
                to={`/category/${book.categories[0]}`}
                style={{
                  textDecoration: 'none',
                  color: '#1976d2',
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                Xem tất cả
                <span style={{ fontSize: '1.2rem', marginLeft: '4px' }}>→</span>
              </Link>
            )}
          </Box>
          <Divider sx={{ my: 2 }} />
          {relatedBooks.length > 0 ? (
            <Grid container spacing={3} justifyContent="flex-start">
              {relatedBooks.map((relatedBook) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={relatedBook._id}>
                  <Card sx={{ width: 220, minHeight: 250, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', pb: 2, border: '1px solid #ddd' }}>
                    <Box sx={{ position: 'relative', width: '100%' }}>
                      {relatedBook.originalPrice > relatedBook.price && (
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
                          -{Math.round((1 - relatedBook.price / relatedBook.originalPrice) * 100)}%
                        </Box>
                      )}
                      {relatedBook.stock === 0 && (
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
                        onClick={() => toggleWishlist(relatedBook._id)}
                        color={wishlist.includes(relatedBook._id) ? "error" : "default"}
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
                      <Link to={`/book/${relatedBook._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
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
                            image={relatedBook.images && relatedBook.images.length > 0 ? relatedBook.images[0] : ""}
                            alt={relatedBook.title}
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
                      <Link to={`/book/${relatedBook._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
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
                          {relatedBook.title}
                        </Typography>
                      </Link>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="h5" color="error" sx={{ fontSize: '1.1rem', fontWeight: 'bold', textAlign: 'left', marginTop: '2px' }}>
                          {relatedBook.price?.toLocaleString()}₫
                        </Typography>
                        {relatedBook.originalPrice > relatedBook.price && (
                          <Typography variant="body2" sx={{ textDecoration: 'line-through', color: 'gray', fontSize: '0.75rem' }}>
                            {relatedBook.originalPrice?.toLocaleString()}₫
                          </Typography>
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Typography sx={{ textAlign: "center", color: "text.secondary" }}>
              Hiện chưa có sản phẩm cùng loại
            </Typography>
          )}
        </Box>

        {/* Notifications */}
        {notifications.map((notification) => (
          <Snackbar
            key={notification.id}
            open
            autoHideDuration={2000}
            anchorOrigin={{ vertical: "top", horizontal: "right" }}
            onClose={() =>
              setNotifications((prev) =>
                prev.filter((n) => n.id !== notification.id)
              )
            }
          >
            <Alert severity={notification.severity || "info"}>
              {notification.message}
            </Alert>
          </Snackbar>
        ))}
      </Container>
    </>

  );
};

export default BookDetail;