import React from "react";
import { Container, Box } from "@mui/material";

const HomePage = () => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Container maxWidth="lg" sx={{ flex: 1, my: 4 }}>
        <Box sx={{ minHeight: "60vh" }}>
          {/* Nội dung trang chủ */}
        </Box>
      </Container>
    </Box>
  );
};

export default HomePage;
