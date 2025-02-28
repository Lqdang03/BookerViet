import React, { useState, useEffect, useRef } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Container,
  Popper,
  Paper,
  Fade,
  Grid,
  MenuItem,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import SearchIcon from "@mui/icons-material/Search";
import PersonPinOutlinedIcon from "@mui/icons-material/PersonPinOutlined";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import PhoneIcon from "@mui/icons-material/Phone";
import Badge from "@mui/material/Badge";
import InputBase from "@mui/material/InputBase";
import { styled } from "@mui/material/styles";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import axios from "axios";

const Search = styled("div")(({ theme }) => ({
  position: "relative",
  borderRadius: theme.shape.borderRadius,
  backgroundColor: "#fff",
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: "100%",
  [theme.breakpoints.up("sm")]: {
    marginLeft: theme.spacing(3),
    width: "auto",
  },
}));

const SearchIconWrapper = styled("div")(({ theme }) => ({
  color: "black",
  padding: theme.spacing(0, 2),
  height: "100%",
  position: "absolute",
  pointerEvents: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: "#000",
  "& .MuiInputBase-input": {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create("width"),
    width: "100%",
    [theme.breakpoints.up("md")]: {
      width: "20ch",
    },
  },
}));

const CategoryMenuItem = styled(MenuItem)(({ theme }) => ({
  padding: theme.spacing(1, 2),
  "&:hover": {
    backgroundColor: "#f5f5f5",
    color: "#187bcd",
  },
}));

// Updated style for user menu items
const UserMenuItem = styled(MenuItem)(({ theme }) => ({
  padding: theme.spacing(0.75, 1.5), // Smaller padding
  fontSize: '0.875rem', // Smaller font size
  "&:hover": {
    backgroundColor: "#f5f5f5",
    color: "#187bcd",
  },
  // Add bottom border to each item
  borderBottom: '1px solid #f0f0f0',
  // Remove border from last item
  '&:last-child': {
    borderBottom: 'none',
  }
}));

// Custom styled Popper for user menu with tighter fit
const UserMenuPopper = styled(Popper)(({ theme }) => ({
  zIndex: 1300,
  "& .MuiPaper-root": {
    minWidth: '150px', // Reduced width to fit content
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
    padding: 0, // Remove padding
  }
}));

const Header = ({
  userEmail,
  updateUserEmail,
  wishlistCount = 0,
  cartCount = 0,
  cartTotal = 0,
  updateCartCount,
  updateCartTotal,
  updateWishlistCount,
}) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const [userMenuAnchorEl, setUserMenuAnchorEl] = useState(null);
  const [categories, setCategories] = useState([]);
  const [categoryBooks, setCategoryBooks] = useState({});
  const [activeCategory, setActiveCategory] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Add a ref for the user menu section
  const userMenuRef = useRef(null);

  // Fetch categories on component mount
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get("http://localhost:9999/category/");
      if (response.data && Array.isArray(response.data)) {
        setCategories(response.data);
        // Set active category to first one if available
        if (response.data.length > 0) {
          setActiveCategory(response.data[0]);
          fetchBooksByCategory(response.data[0]._id);
        }
      }
    } catch (error) {
      console.error("Lỗi khi lấy danh mục:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBooksByCategory = async (categoryId) => {
    if (categoryBooks[categoryId]) return; // Already fetched
  
    try {
      const response = await axios.get(
        `http://localhost:9999/book/category/${categoryId}`
      );
      if (response.data) {
        // Filter out books where isActivated is false
        const activeBooks = response.data.filter(book => book.isActivated !== false);
        
        setCategoryBooks((prev) => ({
          ...prev,
          [categoryId]: activeBooks, // Store only active books
        }));
      }
    } catch (error) {
      console.error(`Lỗi khi lấy sách cho danh mục ${categoryId}:`, error);
      // Initialize with empty array in case of error
      setCategoryBooks((prev) => ({
        ...prev,
        [categoryId]: [],
      }));
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    })
      .format(price)
      .replace("₫", "đ");
  };

  const handleLogout = () => {
    // Clear auth data
    localStorage.removeItem("token");
    localStorage.removeItem("userEmail");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("userEmail");

    // Update state
    updateUserEmail(null);

    // Reset cart and wishlist data
    if (typeof updateCartCount === "function") {
      updateCartCount(0);
    }

    if (typeof updateCartTotal === "function") {
      updateCartTotal(0);
    }

    if (typeof updateWishlistCount === "function") {
      updateWishlistCount(0);
    }

    // Close user menu
    setUserMenuAnchorEl(null);

    // Navigate to login page
    navigate("/account/login");
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  // Modified to handle hover instead of click
  const handleCategoryMouseEnter = (event) => {
    setAnchorEl(event.currentTarget);
    // If no active category yet, set the first one
    if (!activeCategory && categories.length > 0) {
      setActiveCategory(categories[0]);
      fetchBooksByCategory(categories[0]._id);
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  // User menu hover handlers
  const handleUserMenuMouseEnter = (event) => {
    setUserMenuAnchorEl(event.currentTarget);
  };

  const handleUserMenuMouseLeave = () => {
    setUserMenuAnchorEl(null);
  };

  const handleCategoryHover = (category) => {
    setActiveCategory(category);
    fetchBooksByCategory(category._id);
  };

  const handleCategoryClick2 = (categoryId) => {
    navigate(`/category/${categoryId}`);
    handleClose();
  };

  const displayWishlistText =
    wishlistCount === 1 ? "1 Sản phẩm" : `${wishlistCount} Sản phẩm`;
  const open = Boolean(anchorEl);
  const userMenuOpen = Boolean(userMenuAnchorEl);

  return (
    <Box sx={{ borderBottom: "1px solid rgba(0, 0, 0, 0.1)", mb: 3 }}>
      <AppBar
        position="static"
        sx={{ backgroundColor: "#187bcd", boxShadow: "none" }}
      >
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
                color: "inherit",
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
            {userEmail ? (
              // Logged-in users: Show dropdown menu that activates on hover
              <Box 
                ref={userMenuRef}
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  position: 'relative',
                  mr: 2
                }}
                onMouseEnter={handleUserMenuMouseEnter}
                onMouseLeave={handleUserMenuMouseLeave}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    cursor: "pointer",
                    "&:hover": { "& .user-text": { color: "#ffd700" } },
                  }}
                >
                  <IconButton size="large" color="inherit">
                    <PersonPinOutlinedIcon />
                  </IconButton>
                  <Box sx={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
                    <Typography
                      variant="body2"
                      className="user-text"
                      sx={{
                        fontWeight: "bold",
                        color: "inherit",
                      }}
                    >
                      Xin chào!
                    </Typography>
                    <Typography
                      variant="caption"
                      className="user-text"
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        color: "inherit",
                      }}
                    >
                      {userEmail.split("@")[0]}
                      <KeyboardArrowDownIcon fontSize="small" sx={{ fontSize: '0.8rem' }} />
                    </Typography>
                  </Box>
                </Box>
                
                {/* User Dropdown Menu - Updated for tighter fit and underlines */}
                <UserMenuPopper
                  open={userMenuOpen}
                  anchorEl={userMenuAnchorEl}
                  placement="bottom-start"
                  transition
                >
                  {({ TransitionProps }) => (
                    <Fade {...TransitionProps} timeout={250}>
                      <Paper sx={{ mt: 1 }}>
                      <Box component="ul" sx={{ padding: 0, margin: 0, listStyle: 'none' }}>

                          <UserMenuItem 
                            component={Link} 
                            to="/user/orders"
                          >
                            Đơn hàng của tôi
                          </UserMenuItem>
                          <UserMenuItem 
                            component={Link} 
                            to="/user/account"
                          >
                            Tài khoản của tôi
                          </UserMenuItem>
                          <UserMenuItem onClick={handleLogout}>
                            Thoát tài khoản
                          </UserMenuItem>
                        </Box>
                      </Paper>
                    </Fade>
                  )}
                </UserMenuPopper>
              </Box>
            ) : (
              // Non-logged-in users: Keep original layout
              <MenuItem
                sx={{
                  display: "flex",
                  alignItems: "center",
                  backgroundColor: "transparent !important",
                  "&:hover": { backgroundColor: "transparent !important" },
                }}
              >
                <IconButton size="large" color="inherit">
                  <PersonPinOutlinedIcon />
                </IconButton>
                <Box
                  sx={{ display: "flex", flexDirection: "column", lineHeight: 1 }}
                >
                  <Typography
                    variant="body2"
                    component={Link}
                    to="/account/login"
                    sx={{
                      textDecoration: "none",
                      fontWeight: "bold",
                      color: "inherit",
                      cursor: "pointer",
                      "&:hover": { color: "#ffd700" },
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
                      "&:hover": { color: "#ffd700" },
                    }}
                  >
                    Đăng ký
                  </Typography>
                </Box>
              </MenuItem>
            )}

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
                "&:hover .cart-text": { color: "#ffd700" },
              }}
            >
              <IconButton size="large" color="inherit">
                <Badge
                  badgeContent={userEmail ? wishlistCount : 0}
                  color="error"
                  showZero
                >
                  <FavoriteBorderIcon />
                </Badge>
              </IconButton>
              <Box
                sx={{ display: "flex", flexDirection: "column", lineHeight: 1 }}
              >
                <Typography
                  variant="body2"
                  className="cart-text"
                  sx={{
                    textDecoration: "none",
                    fontWeight: "bold",
                    color: "inherit",
                    cursor: "pointer",
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
                    cursor: "pointer",
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
                "&:hover .cart-text": { color: "#ffd700" },
              }}
            >
              <IconButton size="large" color="inherit">
                <Badge
                  badgeContent={userEmail ? cartCount : 0}
                  color="error"
                  showZero
                >
                  <AddShoppingCartIcon />
                </Badge>
              </IconButton>
              <Box
                sx={{ display: "flex", flexDirection: "column", lineHeight: 1 }}
              >
                <Typography
                  variant="body2"
                  className="cart-text"
                  sx={{
                    textDecoration: "none",
                    fontWeight: "bold",
                    color: "inherit",
                    cursor: "pointer",
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
                    cursor: "pointer",
                  }}
                >
                  {userEmail ? formatPrice(cartTotal) : "0đ"}
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
        {/* Category dropdown */}
        <Box
          sx={{
            position: "relative",
            "&:hover": {
              "& .dropdown-menu": {
                opacity: 1,
                visibility: "visible",
              },
            },
          }}
          onMouseLeave={handleClose}
        >
          <Button
            variant="contained"
            sx={{
              backgroundColor: "#d32f2f",
              "&:hover": { backgroundColor: "#d32f2f" },
              display: "flex",
              alignItems: "center",
            }}
            onMouseEnter={handleCategoryMouseEnter}
            aria-haspopup="true"
            endIcon={<KeyboardArrowDownIcon />}
          >
            DANH MỤC SẢN PHẨM
          </Button>

          {/* Category Dropdown Menu - this section remains the same */}
          <Popper
            open={open}
            anchorEl={anchorEl}
            placement="bottom-start"
            transition
            style={{ zIndex: 1300 }}
            className="dropdown-menu"
          >
            {({ TransitionProps }) => (
              <Fade {...TransitionProps} timeout={350}>
                <Paper
                  sx={{
                    width: "800px",
                    display: "flex",
                    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
                  }}
                >
                  <Box sx={{ display: "flex", width: "100%" }}>
                    {/* Left panel - Categories list */}
                    <Box
                      sx={{
                        width: "30%",
                        borderRight: "1px solid #eee",
                        maxHeight: "400px",
                        overflowY: "auto",
                      }}
                    >
                      {isLoading ? (
                        <Typography sx={{ p: 2 }}>
                          Đang tải danh mục...
                        </Typography>
                      ) : categories && categories.length > 0 ? (
                        categories.map((category) => (
                          <CategoryMenuItem
                            key={category._id}
                            onClick={() => handleCategoryClick2(category._id)}
                            onMouseEnter={() => handleCategoryHover(category)}
                            sx={{
                              backgroundColor:
                                activeCategory &&
                                activeCategory._id === category._id
                                  ? "#f5f5f5"
                                  : "transparent",
                              color:
                                activeCategory &&
                                activeCategory._id === category._id
                                  ? "#187bcd"
                                  : "inherit",
                              fontWeight:
                                activeCategory &&
                                activeCategory._id === category._id
                                  ? "bold"
                                  : "normal",
                            }}
                          >
                            {category.name}
                          </CategoryMenuItem>
                        ))
                      ) : (
                        <Typography sx={{ p: 2 }}>
                          Không có danh mục nào
                        </Typography>
                      )}
                    </Box>

                    {/* Right panel - Books in category */}
                    <Box
                      sx={{
                        width: "70%",
                        padding: 2,
                        maxHeight: "400px",
                        overflowY: "auto",
                      }}
                    >
                      {activeCategory ? (
                        <>
                          <Typography
                            variant="h6"
                            sx={{
                              mb: 2,
                              color: "#187bcd",
                              borderBottom: "1px solid #eee",
                              paddingBottom: 1,
                            }}
                          >
                            {activeCategory.name}
                          </Typography>

                          {categoryBooks[activeCategory._id] ? (
                            categoryBooks[activeCategory._id].length > 0 ? (
                              <Grid container spacing={2}>
                                {categoryBooks[activeCategory._id]
                                  .slice(0, 3)
                                  .map((book) => (
                                    <Grid item xs={4} key={book._id}>
                                      <Box
                                        component={Link}
                                        to={`/book/${book._id}`}
                                        sx={{
                                          display: "flex",
                                          flexDirection: "column", // Ảnh và tiêu đề xếp dọc
                                          alignItems: "center",
                                          textDecoration: "none",
                                          color: "inherit",
                                          "&:hover": { color: "#187bcd" },
                                        }}
                                      >
                                        <Box
                                          sx={{
                                            width: 80, // Kích thước cố định
                                            height: 120,
                                            minWidth: 80,
                                            minHeight: 120,
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            border: "1px solid #eee",
                                            overflow: "hidden",
                                          }}
                                        >
                                          <img
                                            src={
                                              book.images?.[0] ||
                                              "/placeholder.jpg"
                                            }
                                            alt={book.title}
                                            style={{
                                              width: "100%",
                                              height: "100%",
                                              objectFit: "cover",
                                            }}
                                            onError={(e) => {
                                              e.target.onerror = null;
                                              e.target.src = "/placeholder.jpg";
                                            }}
                                          />
                                        </Box>
                                        <Typography
                                          variant="body2"
                                          sx={{
                                            mt: 1, // Khoảng cách giữa ảnh và tiêu đề
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            display: "-webkit-box",
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: "vertical",
                                            textAlign: "center",
                                            width: "100%",
                                          }}
                                        >
                                          {book.title}
                                        </Typography>
                                      </Box>
                                    </Grid>
                                  ))}
                              </Grid>
                            ) : (
                              <Typography variant="body2">
                                Không có sách nào trong danh mục này
                              </Typography>
                            )
                          ) : (
                            <Typography variant="body2">
                              Đang tải sách...
                            </Typography>
                          )}

                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "center",
                              mt: 2,
                            }}
                          >
                            <Button
                              component={Link}
                              to={`/category/${activeCategory._id}`}
                              variant="outlined"
                              color="primary"
                              size="small"
                              onClick={handleClose}
                            >
                              Xem tất cả
                            </Button>
                          </Box>
                        </>
                      ) : (
                        <Typography variant="body1">
                          Vui lòng chọn danh mục để xem sách
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </Paper>
              </Fade>
            )}
          </Popper>
        </Box>

        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            component={Link}
            to="/viewed-products"
            color="inherit"
            sx={{
              backgroundColor: "transparent !important",
              "&:hover": {
                backgroundColor: "transparent !important",
                color: "#187bcd",
              },
            }}
          >
            Sản phẩm đã xem
          </Button>
          <Button
            component={Link}
            to="/flashsale"
            color="inherit"
            sx={{
              backgroundColor: "transparent !important",
              "&:hover": {
                backgroundColor: "transparent !important",
                color: "#187bcd",
              },
            }}
          >
            Flashsale
          </Button>
          <Button
            component={Link}
            to="/stores"
            color="inherit"
            sx={{
              backgroundColor: "transparent !important",
              "&:hover": {
                backgroundColor: "transparent !important",
                color: "#187bcd",
              },
            }}
          >
            Hệ thống BookerViet
          </Button>
          <Button
            component={Link}
            to="/track-order"
            color="inherit"
            sx={{
              backgroundColor: "transparent !important",
              "&:hover": {
                backgroundColor: "transparent !important",
                color: "#187bcd",
              },
            }}
          >
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