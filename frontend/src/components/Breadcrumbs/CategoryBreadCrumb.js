import React from "react";
import { Typography, Container, Breadcrumbs } from "@mui/material";
import { Link } from "react-router-dom";

function CategoryBreadCrumb({ categoryName }) {
    return (
        <Container maxWidth="lg" sx={{ ms: 0 }}>
            <Breadcrumbs separator="›" aria-label="breadcrumb" sx={{ mb: 2 }}>
                <Link to="/" style={{ textDecoration: 'none', color: '#187bcd' }}>
                    Trang chủ
                </Link>
                <Typography sx={{ color: '#187bcd' }}>
                    {categoryName}
                </Typography>
            </Breadcrumbs>
        </Container>
    );
}

export default CategoryBreadCrumb;
