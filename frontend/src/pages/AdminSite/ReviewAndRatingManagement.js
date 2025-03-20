import React, { useState, useEffect } from "react";
import {
    Container, Typography, Button, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Paper, IconButton, Dialog, DialogTitle, DialogContent,
    DialogActions, Select, MenuItem, FormControl, InputLabel, Box, Grid,
    TablePagination
} from "@mui/material";
import { Delete } from "@mui/icons-material";
import { Star, StarBorder } from "@mui/icons-material";
import axios from "axios";

const ReviewAndRatingManagement = () => {
    const [feedbacks, setFeedbacks] = useState([]);
    const [selectedBook, setSelectedBook] = useState("");
    const [selectedUser, setSelectedUser] = useState("");
    const [books, setBooks] = useState([]);
    const [users, setUsers] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    useEffect(() => {
        fetchFeedbacks();
        fetchBooks();
        fetchUsers();
    }, []);

    const fetchFeedbacks = async () => {
        try {
            const token = localStorage.getItem("token") || sessionStorage.getItem("token");
            if (!token) return;
            const response = await axios.get("http://localhost:9999/admin/reviews", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setFeedbacks(response.data);
        } catch (error) {
            console.error("Error fetching feedbacks", error);
        }
    };

    const fetchBooks = async () => {
        try {
            const token = localStorage.getItem("token") || sessionStorage.getItem("token");
            if (!token) return;
            const response = await axios.get("http://localhost:9999/admin/books", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setBooks(response.data);
        } catch (error) {
            console.error("Error fetching books", error);
        }
    };

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem("token") || sessionStorage.getItem("token");
            if (!token) return;
            const response = await axios.get("http://localhost:9999/admin/users", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsers(response.data);
        } catch (error) {
            console.error("Error fetching users", error);
        }
    };

    const filterFeedbacks = async () => {
        try {
            const token = localStorage.getItem("token") || sessionStorage.getItem("token");
            if (!token) return;
            let url = "http://localhost:9999/admin/reviews";
            if (selectedBook) url = `http://localhost:9999/admin/books/${selectedBook}/reviews`;
            if (selectedUser) url = `http://localhost:9999/admin/users/${selectedUser}/reviews`;
            const response = await axios.get(url, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setFeedbacks(response.data);
        } catch (error) {
            console.error("Error filtering feedbacks", error);
        }
    };

    const handleDelete = async (id) => {
        try {
            const token = localStorage.getItem("token") || sessionStorage.getItem("token");
            if (!token) return;
            await axios.delete(`http://localhost:9999/admin/reviews/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchFeedbacks();
        } catch (error) {
            console.error("Error deleting feedback", error);
        }
    };

    const renderStars = (rating) => {
        let stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(i <= rating ? <Star key={i} color="primary" /> : <StarBorder key={i} color="primary" />);
        }
        return stars;
    };

    //Thực hiện phân trang
    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    return (
        <Box sx={{ padding: 2, width: "100%", maxWidth: "calc(100% - 250px)", margin: "auto" }}>
            <Typography variant="h4" gutterBottom>Feedback Management</Typography>

            <Grid container spacing={2} sx={{ marginBottom: 2 }}>
                <Grid item xs={12} sm={6} md={4}>
                    <FormControl fullWidth>
                        <InputLabel>Filter by Book</InputLabel>
                        <Select value={selectedBook} onChange={(e) => setSelectedBook(e.target.value)}>
                            <MenuItem value="">All</MenuItem>
                            {books.map((book) => (
                                <MenuItem key={book._id} value={book._id}>{book.title}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                    <FormControl fullWidth>
                        <InputLabel>Filter by User</InputLabel>
                        <Select value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)}>
                            <MenuItem value="">All</MenuItem>
                            {users.map((user) => (
                                <MenuItem key={user._id} value={user._id}>{user.name}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>

                <Grid item xs={12} sm={12} md={4} sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
                    <Button variant="contained" color="primary" onClick={filterFeedbacks}>Apply Filter</Button>
                </Grid>
            </Grid>

            <TableContainer component={Paper} sx={{ marginTop: 2 }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>User</TableCell>
                            <TableCell>Book</TableCell>
                            <TableCell>Rating</TableCell>
                            <TableCell>Comment</TableCell>
                            <TableCell>Actions</TableCell>
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
                                    <IconButton color="error" onClick={() => handleDelete(feedback._id)}>
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
        </Box>
    );
};

export default ReviewAndRatingManagement;
