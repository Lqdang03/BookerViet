import React, { useEffect, useState } from "react";
import { Typography, Container, Breadcrumbs } from "@mui/material";
import { Link, useParams } from "react-router-dom";
import axios from "axios";

function BookDetailBreadCrumb() {
    const { id } = useParams();
    const [book, setBook] = useState(null);
    const [bookCategories, setBookCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    // Custom style to remove underlines from links
    const linkStyle = {
        textDecoration: 'none',
        color: '#187bcd',
        '&:hover': {
            textDecoration: 'none',
            color: '#1565c0'
        }
    };

    useEffect(() => {
        // Set loading state
        setLoading(true);
        
        // Fetch book details
        axios.get(`http://localhost:9999/book/${id}`)
            .then(async (bookResponse) => {
                setBook(bookResponse.data);
                
                // If the book has categories, fetch all categories and filter
                if (bookResponse.data.categories && bookResponse.data.categories.length > 0) {
                    try {
                        // Fetch all categories
                        const categoriesResponse = await axios.get("http://localhost:9999/category");
                        
                        // Filter to only include categories that belong to this book
                        const relevantCategories = categoriesResponse.data.filter(
                            category => bookResponse.data.categories.includes(category._id)
                        );
                        
                        setBookCategories(relevantCategories);
                    } catch (error) {
                        console.error("Lỗi khi lấy danh mục:", error);
                    }
                }
                
                setLoading(false);
            })
            .catch(error => {
                console.error("Lỗi khi lấy dữ liệu sách:", error);
                setLoading(false);
            });
    }, [id]);

    if (loading) {
        return (
            <Container maxWidth="lg">
                <Typography>Đang tải...</Typography>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg">
            <Breadcrumbs separator="›" aria-label="breadcrumb">
                {/* Apply the style directly to the Link component */}
                <Link 
                    to="/" 
                    style={{ textDecoration: 'none' }}
                >
                    Trang chủ
                </Link>
                
                {/* Display the book's categories with no underline */}
                {bookCategories.map((category) => (
                    <Link 
                        key={category._id} 
                        to={`/category/${category._id}`}
                        style={{ textDecoration: 'none', color: '#187bcd'}}
                        
                    >
                        {category.name}
                    </Link>
                ))}
                
                {book && <Typography sx={{ color: '#187bcd'}}>{book.title}</Typography>}
            </Breadcrumbs>
        </Container>
    );
}

export default BookDetailBreadCrumb;