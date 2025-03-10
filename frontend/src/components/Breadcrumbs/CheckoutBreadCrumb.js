import React from "react";
import { Typography, Container, Breadcrumbs } from "@mui/material";
import { Link } from "react-router-dom";
function CheckoutBreadCrumb() {
    return (
        <Container maxWidth="lg">
            <Breadcrumbs separator="›" aria-label="breadcrumb">
                <Link to="/"  style={{ textDecoration: 'none' }}>
                    Trang chủ
                </Link>
                <Link to="/cart" color="text.primary" style={{ textDecoration: 'none' }}>
                    Giỏ hàng
                </Link>
                <Typography sx={{ color: '#187bcd'}}>Thanh toán</Typography>
            </Breadcrumbs>
        </Container>
    );
}

export default CheckoutBreadCrumb;