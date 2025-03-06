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
  ListItem,
  List,
  ListItemText,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import SearchIcon from "@mui/icons-material/Search";
import PersonPinOutlinedIcon from "@mui/icons-material/PersonPinOutlined";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import PhoneIcon from "@mui/icons-material/Phone";
import Badge from "@mui/material/Badge";
import InputBase from "@mui/material/InputBase";
import ImageIcon from "@mui/icons-material/Image";
import { styled } from "@mui/material/styles";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import axios from "axios";

// Styles remain the same...
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

const SearchResults = styled(Paper)(({ theme }) => ({
  position: "absolute",
  top: "100%",
  left: 0,
  right: 0,
  zIndex: 10,
  maxHeight: "300px",
  overflowY: "auto",
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

const UserMenuItem = styled(MenuItem)(({ theme }) => ({
  padding: theme.spacing(0.75, 1.5),
  fontSize: '0.875rem',
  "&:hover": {
    backgroundColor: "#f5f5f5",
    color: "#187bcd",
  },
  borderBottom: '1px solid #f0f0f0',
  '&:last-child': {
    borderBottom: 'none',
  }
}));

const UserMenuPopper = styled(Popper)(({ theme }) => ({
  zIndex: 1300,
  "& .MuiPaper-root": {
    minWidth: '150px',
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
    padding: 0,
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
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [userMenuAnchorEl, setUserMenuAnchorEl] = useState(null);
  const [categories, setCategories] = useState([]);
  const [categoryBooks, setCategoryBooks] = useState({});
  const [activeCategory, setActiveCategory] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const userMenuRef = useRef(null);
  const searchRef = useRef(null);
  // Functions remain the same...
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get("http://localhost:9999/category/");
      if (response.data && Array.isArray(response.data)) {
        setCategories(response.data);
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
    if (categoryBooks[categoryId]) return;

    try {
      const response = await axios.get(
        `http://localhost:9999/book/category/${categoryId}`
      );
      if (response.data) {
        const activeBooks = response.data.filter(book => book.isActivated !== false);

        setCategoryBooks((prev) => ({
          ...prev,
          [categoryId]: activeBooks,
        }));
      }
    } catch (error) {
      console.error(`Lỗi khi lấy sách cho danh mục ${categoryId}:`, error);
      setCategoryBooks((prev) => ({
        ...prev,
        [categoryId]: [],
      }));
    }
  };

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setSearchResults([]);
      return;
    }

    const fetchBooks = async () => {
      try {
        const response = await axios.get("http://localhost:9999/book/");
        const filteredBooks = response.data.filter(book =>
          book.title.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setSearchResults(filteredBooks);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách sách:", error);
      }
    };

    fetchBooks();
  }, [searchTerm]);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setShowResults(true);
  };

  const handleClickOutside = (event) => {
    if (searchRef.current && !searchRef.current.contains(event.target)) {
      setShowResults(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    })
      .format(price)
      .replace("₫", "đ");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userEmail");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("userEmail");
    updateUserEmail(null);
    if (typeof updateCartCount === "function") {
      updateCartCount(0);
    }
    if (typeof updateCartTotal === "function") {
      updateCartTotal(0);
    }
    if (typeof updateWishlistCount === "function") {
      updateWishlistCount(0);
    }
    setUserMenuAnchorEl(null);
    navigate("/account/login");
  };

  const handleCategoryMouseEnter = (event) => {
    setAnchorEl(event.currentTarget);
    if (!activeCategory && categories.length > 0) {
      setActiveCategory(categories[0]);
      fetchBooksByCategory(categories[0]._id);
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

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
  const handleSearchSubmit = () => {
    navigate(`/book-result?query=${encodeURIComponent(searchTerm)}`);
  };

  const displayWishlistText =
    wishlistCount === 1 ? "1 Sản phẩm" : `${wishlistCount} Sản phẩm`;
  const open = Boolean(anchorEl);
  const userMenuOpen = Boolean(userMenuAnchorEl);

  return (
    <Box sx={{ borderBottom: "1px solid rgba(0, 0, 0, 0.1)", mb: 1 }}>
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
                ml: -2,
                float: "left",
                textDecoration: "none",
                color: "inherit"
              }}
            >
              BookerViet
            </Typography>

            <Search ref={searchRef} sx={{ flexGrow: 1, maxWidth: "500px" }}>
              <SearchIconWrapper>
                <SearchIcon />
              </SearchIconWrapper>
              <StyledInputBase
                placeholder="Tìm kiếm sản phẩm..."
                value={searchTerm}
                onChange={handleSearchChange}
                onKeyPress={(event) => {
                  if (event.key === "Enter") {
                    handleSearchSubmit();
                  }
                }}
                onClick={handleSearchSubmit} 
              />
             
              {showResults && searchResults.length > 0 && (
                <SearchResults>
                  <List>
                    {searchResults.map((book) => (
                      <ListItem
                        button
                        key={book._id}
                        onClick={() => navigate(`/book/${book._id}`)}
                      >
                        {book.images.length > 0 ? (
                          <img
                            src={book.images[0]}
                            alt={book.title}
                            width="30"
                            height="40"
                            style={{ cursor: "pointer" }}
                          />
                        ) : (<ImageIcon />)}
                        <ListItemText style={{ marginLeft: 15 }} primary={book.title} />
                        {formatPrice(book.price)}
                      </ListItem>
                    ))}
                  </List>
                </SearchResults>
              )}
            </Search>

            {userEmail ? (
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
                            to="/user/profile"
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

      {/* Bottom navigation with fixed alignment */}
      <Container maxWidth="lg">
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingTop: 2,
            paddingLeft: 0,  // Remove default padding
            paddingRight: 5, // Remove default padding
          }}
        >
          {/* Category dropdown aligned with logo */}
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
                                            flexDirection: "column",
                                            alignItems: "center",
                                            textDecoration: "none",
                                            color: "inherit",
                                            "&:hover": { color: "#187bcd" },
                                          }}
                                        >
                                          <Box
                                            sx={{
                                              width: 80,
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
                                              mt: 1,
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
        </Box>
      </Container>
    </Box>
  );
};

export default Header;