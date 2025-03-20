import React from "react";
import { Typography, Container, Breadcrumbs } from "@mui/material";
import { Link } from "react-router-dom";
function BookResultBreadCrumb() {
    return (
        <Container maxWidth="lg">
            <Breadcrumbs separator="›" aria-label="breadcrumb">
                <Link to="/"  style={{ textDecoration: 'none' }} >
                    Trang chủ
                </Link>
                <Typography sx={{ color: '#187bcd'}}>Tìm kiếm sản phẩm</Typography>
            </Breadcrumbs>
        </Container>
    );
}

export default BookResultBreadCrumb;