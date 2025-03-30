import React, { useEffect, useState } from "react";
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Paper, Button, IconButton, Dialog, DialogActions, DialogContent,
  DialogTitle, TextField, Select, MenuItem, FormControl, InputLabel,
  TablePagination, Switch, TextareaAutosize,
  Grid,
  Snackbar,
  Alert,
  FormHelperText
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import ImageIcon from "@mui/icons-material/Image";
import axios from "axios";
import CategoryManagement from "./CategoryManagement";

const BookManagement = () => {
  const [books, setBooks] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [categories, setCategories] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [openImageDialog, setOpenImageDialog] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchCategory, setSearchCategory] = useState("");
  const [formData, setFormData] = useState({
    title: "", author: "", genre: "", description: "", language: "", translator: "",
    publisher: "", publishDate: "", price: "", originalPrice: "", stock: "", isActivated: true,
    images: [], categories: []
  });
  const [alert, setAlert] = useState({ open: false, message: "", severity: "info" });

  // Validation state
  const [errors, setErrors] = useState({});

  //Sử dụng cho mở category dialog
  const [openCategoryManagement, setOpenCategoryManagement] = useState(false);
  const [categoryMode, setCategoryMode] = useState("add"); // "add", "edit", "delete"

  // hiển thị thông báo
  const handleAlert = (message, severity = "info") => {
    setAlert({ open: true, message, severity });
  };
  // Close alert
  const handleCloseAlert = () => {
    setAlert({ ...alert, open: false });
  };

  // Lấy danh sách sách từ API
  const fetchBooks = async () => {
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      if (!token) {
        console.error("Không tìm thấy token, vui lòng đăng nhập lại.");
        return;
      }
      const response = await axios.get("http://localhost:9999/admin/books", {
        headers: { Authorization: `Bearer ${token}` }
      });
      //lọc sách theo tên và category
      if (searchTerm || searchCategory) {
        const filteredBook = response.data.filter(book => {
          const matchTitle = book.title.toLowerCase().includes(searchTerm.toLowerCase());
          const matchCategory = !searchCategory.length || book.categories.some(cat => searchCategory.includes(cat._id));
          return matchTitle && matchCategory;
        });
        setBooks(filteredBook);
      } else {
        setBooks(response.data);
      }
    } catch (error) {
      console.error("Lỗi khi lấy sách:", error);
    }
  };

  //Lấy danh sách mục lục
  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      if (!token) {
        console.error("Không tìm thấy token, vui lòng đăng nhập lại.");
        return;
      }
      const response = await axios.get("http://localhost:9999/admin/categories", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCategories(response.data);
    } catch (error) {
      console.error("Lỗi lấy danh mục:", error);
    }
  };

  useEffect(() => {
    fetchBooks();
    fetchCategories();
  }, [searchTerm, searchCategory]);

  // Hiển thị dialog thêm/sửa sách
  const handleOpenBookDialog = (book = null) => {
    setSelectedBook(book);
    if (book) {
      // Transform categories from objects to just their IDs for the Select component
      const formattedBook = {
        ...book,
        categories: book.categories.map(cat => cat._id)
      };
      setFormData(formattedBook);
    } else {
      setFormData({
        title: "", author: "", genre: "", description: "", language: "",
        translator: "", publisher: "", publishDate: "", price: "",
        originalPrice: "", stock: "", isActivated: true, images: [], categories: []
      });
    }
    // Reset errors when opening the dialog
    setErrors({});
    setOpenDialog(true);
  };

  // Cập nhật dữ liệu form khi nhập liệu
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error for this field when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  // Toggle trạng thái kích hoạt sách
  const handleSwitchChange = (e) => {
    setFormData((prev) => ({ ...prev, isActivated: e.target.checked }));
  };

  // Xử lý nhập danh sách URL ảnh
  const handleImageChange = (e) => {
    setFormData((prev) => ({ ...prev, images: e.target.value.split(",") }));
  };

  // Xử lý chọn danh mục sách
  const handleCategoryChange = (event) => {
    setFormData((prev) => ({ ...prev, categories: event.target.value }));

    // Clear category error when user selects categories
    if (errors.categories) {
      setErrors(prev => ({ ...prev, categories: null }));
    }
  };

  // Hiển thị dialog xem nhiều ảnh
  const handleOpenImageDialog = (images) => {
    setSelectedImages(images);
    setOpenImageDialog(true);
  };

  // Validate form data
  const validateForm = () => {
    const newErrors = {};
    const requiredFields = ['title', 'author', 'genre', 'description', 'language', 'publisher', 'publishDate', 'price', 'stock'];

    // Check required fields
    requiredFields.forEach(field => {
      // Check if the field exists and is a string before calling trim()
      if (!formData[field] || (typeof formData[field] === 'string' && formData[field].trim() === '')) {
        newErrors[field] = 'Trường này không được để trống';
      } else if (formData[field] === '') {
        newErrors[field] = 'Trường này không được để trống';
      }
    });

    // Check publish date is not in the future
    if (formData.publishDate) {
      const publishDate = new Date(formData.publishDate);
      const today = new Date();

      if (publishDate > today) {
        newErrors.publishDate = 'Ngày xuất bản không được là ngày ở tương lai';
      }
    }

    // Check price and quantity fields are not negative
    const numericFields = ['price', 'originalPrice', 'stock'];
    numericFields.forEach(field => {
      if (formData[field] && parseFloat(formData[field]) < 0) {
        newErrors[field] = 'Giá trị không được âm';
      }
    });

    // Check if categories are selected
    if (!formData.categories || formData.categories.length === 0) {
      newErrors.categories = 'Vui lòng chọn ít nhất một danh mục';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  //Thực hiện thêm và sửa sách
  const handleSubmit = async () => {
    // Validate form before submission
    if (!validateForm()) {
      handleAlert("Vui lòng kiểm tra lại thông tin sách", "error");
      return;
    }

    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      if (!token) {
        console.error("Không tìm thấy token, vui lòng đăng nhập lại.");
        return;
      }

      if (selectedBook) {
        await axios.put(`http://localhost:9999/admin/books/${selectedBook._id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        handleAlert("Sửa thông tin sách thành công", "success");
      } else {
        await axios.post("http://localhost:9999/admin/books", formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        handleAlert("Thêm thông tin sách thành công", "success");
      }
      fetchBooks();
      setOpenDialog(false);
    } catch (error) {
      console.error("Lỗi khi lưu sách:", error);
      handleAlert("Có lỗi xảy ra khi lưu thông tin sách", "error");
    }
  };

  // Xóa sách khỏi danh sách
  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      if (!token) {
        console.error("Không tìm thấy token, vui lòng đăng nhập lại.");
        return;
      }
      await axios.delete(`http://localhost:9999/admin/books/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBooks(books.filter(book => book._id !== id));
      handleAlert("Xóa sách thành công", "error");
    } catch (error) {
      console.error("Lỗi khi xóa sách:", error);
    }
  };

  //Thực hiện phân trang
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  //Chỉnh giá tiền theo format
  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN").format(price) + " VNĐ";
  };

  //xử lý mở dialog category
  const handleOpenCategoryManagement = (mode) => {
    setCategoryMode(mode);
    setOpenCategoryManagement(true);
  };

  return (
    <Box sx={{ padding: 1, width: "100%", maxWidth: "calc(100% - 250px)", margin: "auto" }}>
      <Typography variant="h4" gutterBottom>Quản lý Sách</Typography>
      <Box sx={{ display: "flex", gap: 3, marginBottom: 2 }}>
        <FormControl fullWidth variant="outlined">
          <InputLabel >Danh mục</InputLabel>
          <Select
            multiple
            value={searchCategory || []}
            onChange={(e) => setSearchCategory(e.target.value)}
            label="Danh mục"
          >
            {categories.map((cat) => (
              <MenuItem key={cat._id} value={cat._id}>{cat.name}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          label="Tìm kiếm theo tên sách"
          variant="outlined"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          fullWidth
        />

        <Button style={{ padding: 0, width: "17%" }} variant="contained" color="primary" onClick={() => handleOpenBookDialog()}>Thêm Sách</Button>

      </Box>
      <TableContainer component={Paper} sx={{ marginTop: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><b>STT</b></TableCell>
              <TableCell><b>Hình ảnh</b></TableCell>
              <TableCell><b>Tiêu đề</b></TableCell>
              <TableCell><b>Tác giả</b></TableCell>
              <TableCell><b>Danh mục</b></TableCell>
              <TableCell><b>Giá</b></TableCell>
              <TableCell><b>Số lượng</b></TableCell>
              <TableCell><b>Hành động</b></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {books
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((book, index) => (
                <TableRow key={book._id}>
                  <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                  <TableCell>
                    {book.images.length > 0 ? (
                      <img
                        src={book.images[0]}
                        alt={book.title}
                        width="50"
                        height="50"
                        style={{ cursor: "pointer" }}
                        onClick={() => handleOpenImageDialog(book.images)}
                      />
                    ) : (<ImageIcon />)}
                  </TableCell>
                  <TableCell>{book.title}</TableCell>
                  <TableCell>{book.author}</TableCell>
                  <TableCell>{book.categories.map(c => c.name).join(" ")}</TableCell>
                  <TableCell>{formatPrice(book.price)}</TableCell>
                  <TableCell>{book.stock}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleOpenBookDialog(book)} color="primary"><EditIcon /></IconButton>
                    {/* <IconButton color="error" onClick={() => handleDelete(book._id)}><DeleteIcon /></IconButton> */}
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={books.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>

      {/* Dialog hiển thị nhiều ảnh */}
      <Dialog open={openImageDialog} onClose={() => setOpenImageDialog(false)}>
        <DialogTitle>Hình ảnh sách</DialogTitle>
        <DialogContent>
          {selectedImages.map((image, index) => (
            <img key={index} src={image} alt="Book" style={{ width: "100%", marginBottom: 10 }} />
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenImageDialog(false)}>Đóng</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog Thêm hoặc sửa */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>{selectedBook ? "Chỉnh sửa sách" : "Thêm sách mới"}</DialogTitle>
        <DialogContent>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Tiêu đề"
                name="title"
                value={formData.title}
                onChange={handleChange}
                margin="dense"
                InputLabelProps={{ shrink: true }}
                error={!!errors.title}
                helperText={errors.title}
                required
              />
              <TextField
                fullWidth
                label="Tác giả"
                name="author"
                value={formData.author}
                onChange={handleChange}
                margin="dense"
                InputLabelProps={{ shrink: true }}
                error={!!errors.author}
                helperText={errors.author}
                required
              />
              <TextField
                fullWidth
                label="Thể loại"
                name="genre"
                value={formData.genre}
                onChange={handleChange}
                margin="dense"
                InputLabelProps={{ shrink: true }}
                error={!!errors.genre}
                helperText={errors.genre}
                required
              />
              <TextField
                fullWidth
                label="Mô tả"
                name="description"
                value={formData.description}
                onChange={handleChange}
                multiline
                rows={4}
                margin="dense"
                InputLabelProps={{ shrink: true }}
                error={!!errors.description}
                helperText={errors.description}
                required
              />
              <TextField
                fullWidth
                label="Ngôn ngữ"
                name="language"
                value={formData.language}
                onChange={handleChange}
                margin="dense"
                InputLabelProps={{ shrink: true }}
                error={!!errors.language}
                helperText={errors.language}
                required
              />
              <TextField
                fullWidth
                label="Người dịch"
                name="translator"
                value={formData.translator || 'N/A'}
                onChange={handleChange}
                margin="dense"
                required
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Người xuất bản"
                name="publisher"
                value={formData.publisher}
                onChange={handleChange}
                margin="dense"
                InputLabelProps={{ shrink: true }}
                error={!!errors.publisher}
                helperText={errors.publisher}
                required
              />
              <TextField
                fullWidth
                label="Ngày Xuất Bản"
                name="publishDate"
                type="date"
                value={formData.publishDate ? new Date(formData.publishDate).toISOString().split("T")[0] : ""}
                onChange={handleChange}
                margin="dense"
                InputLabelProps={{ shrink: true }}
                error={!!errors.publishDate}
                helperText={errors.publishDate}
                required
              />
              <TextField
                fullWidth
                label="Giá"
                name="price"
                type="number"
                value={formData.price}
                onChange={handleChange}
                margin="dense"
                InputLabelProps={{ shrink: true }}
                error={!!errors.price}
                helperText={errors.price}
                required
                inputProps={{ min: 0 }}
              />
              <TextField
                fullWidth
                label="Giá gốc"
                name="originalPrice"
                type="number"
                value={formData.originalPrice}
                onChange={handleChange}
                margin="dense"
                InputLabelProps={{ shrink: true }}
                error={!!errors.originalPrice}
                helperText={errors.originalPrice}
                inputProps={{ min: 0 }}
              />
              <TextField
                fullWidth
                label="Số lượng"
                name="stock"
                type="number"
                value={formData.stock}
                onChange={handleChange}
                margin="dense"
                InputLabelProps={{ shrink: true }}
                error={!!errors.stock}
                helperText={errors.stock}
                required
                inputProps={{ min: 0 }}
              />
              <TextField
                fullWidth
                label="URL Ảnh (cách nhau bằng dấu phẩy)"
                name="images"
                value={formData.images.join(",")}
                onChange={handleImageChange}
                multiline
                rows={3}
                margin="dense"
                required
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl
                fullWidth
                margin="dense"
                variant="outlined"
                error={!!errors.categories}
                required
              >
                <InputLabel>Danh mục</InputLabel>
                <Select
                  multiple
                  value={formData.categories}
                  onChange={handleCategoryChange}
                  label="Danh mục"
                >
                  {categories.map((cat) => (
                    <MenuItem key={cat._id} value={cat._id}>{cat.name}</MenuItem>
                  ))}
                </Select>
                {errors.categories && <FormHelperText>{errors.categories}</FormHelperText>}
              </FormControl>
              <Box mt={2}>
                <Button variant="outlined" color="primary" onClick={() => handleOpenCategoryManagement("add")} sx={{ mr: 1 }}>Thêm danh mục</Button>
                <Button variant="outlined" color="primary" onClick={() => handleOpenCategoryManagement("edit")} sx={{ mr: 1 }}>Sửa danh mục</Button>
                <Button variant="outlined" color="error" onClick={() => handleOpenCategoryManagement("delete")}>Xóa danh mục</Button>
              </Box>
              <Box display="flex" alignItems="center" mt={2}>
                <Typography>Kích hoạt</Typography>
                <Switch checked={formData.isActivated} onChange={handleSwitchChange} />
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Hủy</Button>
          <Button variant="contained" color="primary" onClick={handleSubmit}>Lưu</Button>
        </DialogActions>
      </Dialog>

      {/* dialog category */}
      <CategoryManagement
        open={openCategoryManagement}
        onClose={() => setOpenCategoryManagement(false)}
        categories={categories}
        setCategories={setCategories}
        mode={categoryMode}
        handleAlert={handleAlert}
        fetchCategories={fetchCategories}
      />
      <Snackbar
        open={alert.open}
        autoHideDuration={6000}
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseAlert} severity={alert.severity}>
          {alert.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default BookManagement;