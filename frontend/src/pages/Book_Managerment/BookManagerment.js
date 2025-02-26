import React, { useEffect, useState } from "react";
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Paper, Button, IconButton, Dialog, DialogActions, DialogContent,
  DialogTitle, TextField, Select, MenuItem, FormControl, InputLabel,
  TablePagination, Switch, TextareaAutosize
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import ImageIcon from "@mui/icons-material/Image";
import axios from "axios";

const BookManagement = () => {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [openImageDialog, setOpenImageDialog] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [formData, setFormData] = useState({
    title: "", author: "", genre: "", description: "", language: "", translator: "",
    publisher: "", publishDate: "", price: "", originalPrice: "", stock: "", isActivated: true,
    images: [], categories: []
  });

  useEffect(() => {
    fetchBooks();
    fetchCategories();
  }, []);

  // Lấy danh sách sách từ API
  const fetchBooks = async () => {
    try {
      const response = await axios.get("http://localhost:9999/admin/books");
      setBooks(response.data);
    } catch (error) {
      console.error("Lỗi khi lấy sách:", error);
    }
  };

  //Lấy danh sách mục lục
  const fetchCategories = async () => {
    try {
      const response = await axios.get("http://localhost:9999/admin/categories");
      setCategories(response.data);
    } catch (error) {
      console.error("Lỗi lấy danh mục:", error);
    }
  };

  // Hiển thị dialog thêm/sửa sách
  const handleOpenDialog = (book = null) => {
    setSelectedBook(book);
    setFormData(
      book || { title: "", author: "", genre: "", description: "", language: "", translator: "", publisher: "", publishDate: "", price: "", originalPrice: "", stock: "", isActivated: true, images: [], categories: [] }
    );
    setOpenDialog(true);
  };

  // Cập nhật dữ liệu form khi nhập liệu
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
  };

  // Hiển thị dialog xem nhiều ảnh
  const handleOpenImageDialog = (images) => {
    setSelectedImages(images);
    setOpenImageDialog(true);
  };

  //Thực hiện thêm và sửa sách
  const handleSubmit = async () => {
    try {
      if (selectedBook) {
        await axios.put(`http://localhost:9999/admin/books/${selectedBook._id}`, formData);
      } else {
        await axios.post("http://localhost:9999/admin/books", formData);
      }
      fetchBooks();
      setOpenDialog(false);
    } catch (error) {
      console.error("Lỗi khi lưu sách:", error);
    }
  };

  // Xóa sách khỏi danh sách
  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:9999/admin/books/${id}`);
      setBooks(books.filter(book => book._id !== id));
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

  return (
    <Box sx={{ padding: 3, marginLeft: "250px" }}>
      <Typography variant="h4" gutterBottom>Quản lý Sách</Typography>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <Button variant="contained" color="primary" onClick={() => handleOpenDialog()}>Thêm Sách</Button>
      </div>

      <TableContainer component={Paper} sx={{ marginTop: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><b>STT</b></TableCell>
              <TableCell><b>Hình ảnh</b></TableCell>
              <TableCell><b>Tiêu đề</b></TableCell>
              <TableCell><b>Tác giả</b></TableCell>
              <TableCell><b>Thể loại</b></TableCell>
              <TableCell><b>Giá</b></TableCell>
              <TableCell><b>Số lượng</b></TableCell>
              <TableCell><b>Hành động</b></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {books.map((book, index) => (
              <TableRow key={book._id}>
                <TableCell>{index + 1}</TableCell>
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
                <TableCell>{book.genre}</TableCell>
                <TableCell>{formatPrice(book.price)}</TableCell>
                <TableCell>{book.stock}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleOpenDialog(book)} color="primary"><EditIcon /></IconButton>
                  <IconButton color="error" onClick={() => handleDelete(book._id)}><DeleteIcon /></IconButton>
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
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{selectedBook ? "Chỉnh sửa sách" : "Thêm sách mới"}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            fullWidth
            label="Tiêu đề"
            name="title"
            value={formData.title}
            onChange={handleChange}
          />
          <TextField
            fullWidth
            label="Tác giả"
            name="author"
            value={formData.author}
            onChange={handleChange}
          />
          <TextField
            fullWidth
            label="Thể loại"
            name="genre"
            value={formData.genre}
            onChange={handleChange}
          />
          <TextField
            fullWidth
            label="Mô tả"
            name="description"
            value={formData.description}
            onChange={handleChange}
            multiline
            rows={4}
          />
          <TextField
            fullWidth
            label="Ngôn ngữ"
            name="language"
            value={formData.language}
            onChange={handleChange}
          />
          <TextField
            fullWidth
            label="Người dịch"
            name="translator"
            value={formData.translator}
            onChange={handleChange}
          />
          <TextField
            fullWidth
            label="Người xuất bản"
            name="publisher"
            value={formData.publisher}
            onChange={handleChange}
          />
          <label>Ngày Xuất Bản</label>
          <TextField
            fullWidth
            name="publishDate"
            type="date"
            value={formData.publishDate}
            onChange={handleChange}
          />
          <TextField
            fullWidth
            label="Giá"
            name="price"
            type="number"
            value={formData.price}
            onChange={handleChange}
          />
          <TextField
            fullWidth
            label="Giá gốc"
            name="originalPrice"
            type="number"
            value={formData.originalPrice}
            onChange={handleChange}
          />
          <TextField
            fullWidth
            label="Số lượng"
            name="stock"
            type="number"
            value={formData.stock}
            onChange={handleChange}
          />
          <TextField
            fullWidth
            label="URL Ảnh (cách nhau bằng dấu phẩy)"
            name="images" value={formData.images.join(",")}
            onChange={handleImageChange}
            multiline
            rows={4}
          />
          <FormControl fullWidth>
            <InputLabel>Danh mục</InputLabel>
            <Select multiple value={formData.categories} onChange={handleCategoryChange}>
              {categories.map((cat) => (<MenuItem key={cat._id} value={cat._id}>{cat.name}</MenuItem>))}
            </Select>
          </FormControl>
          <Box display="flex" alignItems="center" mt={2}>
            <Typography>Kích hoạt</Typography>
            <Switch checked={formData.isActivated} onChange={handleSwitchChange} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Hủy</Button>
          <Button variant="contained" color="primary" onClick={handleSubmit}>Lưu</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BookManagement;
