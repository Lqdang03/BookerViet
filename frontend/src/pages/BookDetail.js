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
  Container,
  Button,
  Table,
  TableBody,
  TableRow,
  TableCell,
  Divider,
  Tabs,
  Tab,
} from "@mui/material";
import { Link, useParams } from "react-router-dom";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import axios from "axios";

const BookDetail = ({ updateWishlistCount, updateCartData }) => {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [notifications, setNotifications] = useState([]);
  const [inWishlist, setInWishlist] = useState(false);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    setLoading(true);
    // Fetch book details
    axios
      .get(`http://localhost:9999/book/${id}`)
      .then((response) => {
        setBook(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Lỗi khi lấy thông tin sách:", error);
        setLoading(false);
      });

    // Check if book is in wishlist
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    if (token) {
      axios
        .get("http://localhost:9999/user/wishlist", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          if (response.data && response.data.wishlist) {
            const wishlistIds = response.data.wishlist.map((book) => book._id);
            setInWishlist(wishlistIds.includes(id));
          }
        })
        .catch((error) =>
          console.error("Lỗi khi kiểm tra danh sách yêu thích:", error)
        );
    }
  }, [id]);

  // In the handleAddToCart function:
  const handleAddToCart = async () => {
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

  const toggleWishlist = async () => {
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");
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
      if (inWishlist) {
        // Remove from wishlist
        await axios.delete(`http://localhost:9999/user/wishlist/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setInWishlist(false);

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
          `http://localhost:9999/user/wishlist/${id}`,
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setInWishlist(true);

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
    setQuantity((prev) => Math.max(1, prev + change));
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

  return (
    <Container maxWidth="lg">
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
              {/* Add favorite icon with absolute positioning */}
              <IconButton
                onClick={toggleWishlist}
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

          {/* Quantity and Add to Cart */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
            <Box
              sx={{
                display: "flex",
                border: "1px solid #e0e0e0",
                borderRadius: 1,
              }}
            >
              <Button
                variant="text"
                onClick={() => handleQuantityChange(-1)}
                sx={{ minWidth: 40 }}
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
              >
                +
              </Button>
            </Box>

            <Button
              variant="contained"
              color="primary"
              startIcon={<ShoppingCartIcon />}
              onClick={handleAddToCart}
              sx={{ py: 1, px: 3 }}
            >
              Thêm vào giỏ hàng
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
                    <TableCell>{book.coverType || "Bìa mềm"}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell
                      component="th"
                      sx={{ width: "30%", bgcolor: "#f5f5f5" }}
                    >
                      Số trang
                    </TableCell>
                    <TableCell>{book.pages || "160"}</TableCell>
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
                    <TableCell>{book.ageRating || "18+"}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell
                      component="th"
                      sx={{ width: "30%", bgcolor: "#f5f5f5" }}
                    >
                      Trọng lượng
                    </TableCell>
                    <TableCell>{book.weight || "180g"}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell
                      component="th"
                      sx={{ width: "30%", bgcolor: "#f5f5f5" }}
                    >
                      Mã sản phẩm
                    </TableCell>
                    <TableCell>{book.sku || "8935250715775"}</TableCell>
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
                    Nam sinh cấp ba Mido Kenshiro có niềm đam mê mãnh liệt với
                    mĩ phẩm và nghệ thuật trang điểm, song đấy cũng là bí mật mà
                    cậu không đám chia sẻ với bất cứ ai, trừ người bạn thân nhỏ
                    Hiura Mihate. Một ngày nọ sau khi đọc hết sức nói ra, Mido
                    đã thuyết phục thành công Hiura trở thành người mẫu cho mình
                    luyện tay nghề. Kết quả là Hiura có một mặt "biến hình"
                    ngoạn mục đến nỗi ngay cả người trong cuộc cũng lầm lẫn và
                    cũng sửng sốt.
                  </Typography>
                  <Typography paragraph>
                    Nhờ tài trang điểm của Mido, ngoại hình của Hiura thay đổi
                    từ một cậu con trai lầm lì, ủ ám thành một cô gái xinh đẹp,
                    ngọt ngào, rạng rỡ và kể từ đó, Hiura bắt đầu lưng chừng thủ
                    vai mĩ phẩm và trang phục nữ tính, cậu quyết định ăn mặc như
                    con gái và như Mido trong điểm mới ngày trước khi đến
                    trường.
                  </Typography>
                  <Typography paragraph>
                    Trước những chuyện biến đó, Mido từ hối phải chống cầu đã
                    dành thức điều gì đó trong tâm hồn Hiura, hay chỉ đơn giản
                    là phát hiện một khía cạnh mới ở người bạn thân thử dụ mà
                    trước đây cậu chưa từng hay biết. Giữa hai người không ngừng
                    nảy sinh những cảm xúc kì lạ, cùng lúc cùng phức tạp. Liệu
                    mối quan hệ giữa Mido và Hiura sẽ đi đến đâu? Những rung
                    động hết sức mới mẻ và không ngừng sức sôi đó có thể là gì?
                  </Typography>
                </>
              )}
            </Typography>
          )}
        </Box>
        <Box
          role="tabpanel"
          hidden={tabValue !== 1}
          id="tabpanel-1"
          sx={{ p: 3 }}
        >
          {tabValue === 1 && (
            <Typography sx={{ textAlign: "center", py: 4 }}>
              Chưa có đánh giá nào cho sản phẩm này.
            </Typography>
          )}
        </Box>
      </Box>

      {/* Related Products Section */}
      <Box sx={{ mb: 5 }}>
        <Typography
          variant="h5"
          gutterBottom
          sx={{ fontWeight: "bold", mb: 3 }}
        >
          SẢN PHẨM CÙNG LOẠI
        </Typography>
        <Typography sx={{ textAlign: "center", color: "text.secondary" }}>
          Hiện chưa có sản phẩm cùng loại
        </Typography>
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
  );
};

export default BookDetail;