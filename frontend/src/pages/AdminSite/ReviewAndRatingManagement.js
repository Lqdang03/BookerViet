import React, { useState, useEffect } from "react";
import { Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Box, Grid, TablePagination, Snackbar, CircularProgress, Alert, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import { Delete } from "@mui/icons-material";
import { Star, StarBorder } from "@mui/icons-material";
import axios from "axios";
import { debounce } from "lodash";  // For debounce functionality

const ReviewAndRatingManagement = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [bookName, setBookName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [books, setBooks] = useState([]);
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [selectedBook, setSelectedBook] = useState("");
  const [selectedUser, setSelectedUser] = useState("");

  useEffect(() => {
    fetchFeedbacks();
    fetchBooks();
    fetchUsers();
  }, []);

  const getToken = () =>
    localStorage.getItem("token") || sessionStorage.getItem("token");

  const fetchFeedbacks = async () => {
    try {
      const token = getToken();
      if (!token) return;
      const response = await axios.get("http://localhost:9999/admin/reviews", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFeedbacks(response.data);
    } catch (error) {
      console.error("Error fetching feedbacks", error);
    }
  };

  const fetchBooks = async () => {
    try {
      const token = getToken();
      if (!token) return;
      const response = await axios.get("http://localhost:9999/admin/books", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBooks(response.data);
    } catch (error) {
      console.error("Error fetching books", error);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = getToken();
      if (!token) return;
      const response = await axios.get("http://localhost:9999/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const filteredUsers = response.data.filter(user => user.role !== "admin");
      setUsers(filteredUsers);
    } catch (error) {
      console.error("Error fetching users", error);
    }
  };

  const filterFeedbacks = debounce(async () => {
    try {
      const token = getToken();
      if (!token) return;

      let url = "http://localhost:9999/admin/reviews";

      if (selectedUser) {
        url = `http://localhost:9999/admin/users/${selectedUser}/reviews`;
      }

      if (selectedBook && selectedUser) {
        url = `http://localhost:9999/admin/books/${selectedBook}/reviews?userEmail=${selectedUser}`;
      }

      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFeedbacks(response.data);

      // Handle no reviews for the selected book or user
      if (selectedBook && response.data.length === 0) {
        setNotifications((prev) => [
          ...prev,
          { id: Date.now(), message: `Sách này chưa có ai đánh giá`, severity: "info" },
        ]);
      }
    } catch (error) {
      console.error("Error filtering feedbacks", error);
    }
  }, 500); // Debounce delay of 500ms

  const confirmDelete = (review) => {
    setSelectedReview(review);
    setDeleteConfirm(true);
  };

  const handleDelete = async () => {
    if (!selectedReview) return;
    setLoading(true);
    try {
      const token = getToken();
      if (!token) return;
      await axios.delete(`http://localhost:9999/admin/reviews/${selectedReview._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications((prev) => [
        ...prev,
        { id: Date.now(), message: "Đã xóa thành công đánh giá", severity: "success" },
      ]);
      fetchFeedbacks();
    } catch (error) {
      console.error("Error deleting feedback", error);
      setNotifications((prev) => [
        ...prev,
        { id: Date.now(), message: "Đánh giá thất bại", severity: "error" },
      ]);
    }
    setLoading(false);
    setDeleteConfirm(false);
    setSelectedReview(null);
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) =>
      i < rating ? <Star key={i} color="primary" /> : <StarBorder key={i} color="primary" />
    );
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Box sx={{ padding: 2, width: "100%", maxWidth: "calc(100% - 250px)", margin: "auto" }}>
      <Typography variant="h4" gutterBottom>Quản lý các đánh giá</Typography>
      <Grid container spacing={2} sx={{ marginBottom: 2 }}>
        <Grid item xs={12} sm={6} md={4}>
          <FormControl fullWidth sx={{ mt: 1 }} variant="outlined">
            <InputLabel id="book-label" shrink>Tìm kiếm theo tên sách</InputLabel>
            <Select
              labelId="book-label"
              value={selectedBook}
              onChange={(e) => {
                setSelectedBook(e.target.value);
                filterFeedbacks();
              }}
              displayEmpty
              label="Tìm kiếm theo tên sách"
            >

              <MenuItem value="">All</MenuItem>
              {books.map((book) => (
                <MenuItem key={book._id} value={book._id}>
                  {book.title}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <FormControl fullWidth sx={{ mt: 1 }}>
            <InputLabel id="user-label" shrink>Tìm kiếm theo người dùng</InputLabel>

            <Select
              labelId="user-label"
              value={selectedUser}
              onChange={(e) => {
                setSelectedUser(e.target.value);
                filterFeedbacks();
              }}
              displayEmpty
              label="Tìm kiếm theo người dùng" // Đúng label
            >

              <MenuItem value="">All</MenuItem>
              {users.map((user) => (
                <MenuItem key={user._id} value={user._id}>
                  {user.email}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>



      <TableContainer component={Paper} sx={{ marginTop: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>STT</TableCell>
              <TableCell>Người Dùng</TableCell>
              <TableCell>Sách</TableCell>
              <TableCell>Đánh giá</TableCell>
              <TableCell>Nhận xét</TableCell>
              <TableCell>Hành động</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {feedbacks
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((feedback, index) => (
                <TableRow key={feedback._id}>
                  <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                  <TableCell>{feedback.user.name}</TableCell>
                  <TableCell>{feedback.book.title}</TableCell>
                  <TableCell>{renderStars(feedback.rating)}</TableCell>
                  <TableCell>{feedback.comment}</TableCell>
                  <TableCell>
                    <IconButton color="error" onClick={() => confirmDelete(feedback)}>
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={feedbacks.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>

      <Dialog open={deleteConfirm} onClose={() => setDeleteConfirm(false)}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>
            Bạn có chắc chắn xóa nhận xét này của {" "}
            <strong>{selectedReview?.user.name}</strong> trong sách {" "}
            <strong>{selectedReview?.book.title}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirm(false)} color="primary">Cancel</Button>
          <Button onClick={handleDelete} color="error" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>

      {notifications.map((notification) => (
        <Snackbar key={notification.id} open autoHideDuration={2000} anchorOrigin={{ vertical: "top", horizontal: "right" }} onClose={() => setNotifications((prev) => prev.filter((n) => n.id !== notification.id))}>
          <Alert severity={notification.severity || "info"}>{notification.message}</Alert>
        </Snackbar>
      ))}
    </Box>
  );
};

export default ReviewAndRatingManagement;
