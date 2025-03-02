import React, { useState } from "react";
import Sidebar from "./Sidebar";
import { Outlet, useNavigate } from "react-router-dom";
import { Box, IconButton, Typography, Button } from "@mui/material";
import BreadcrumbsNav from "./Breadscumb";
import MenuIcon from "@mui/icons-material/Menu";

const AdminLayout = ({ userEmail, updateUserEmail }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const navigate = useNavigate();


    const toggleSidebar = () => {
        setIsSidebarOpen((prev) => !prev);
    };


    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("userEmail");
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("userEmail");
        updateUserEmail(null);
        navigate("/account/login");
    };

    return (
        <Box sx={{ display: "flex" }}>
            {/* Sidebar */}
            <Box sx={{ width: isSidebarOpen ? "250px" : "60px", transition: "width 0.3s" }}>

                <Sidebar isSidebarOpen={isSidebarOpen} />
            </Box>

            {/* Main Content */}
            <Box sx={{ flexGrow: 1, padding: 2 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: 1, marginTop: 3, paddingBottom: 1 }}>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                        <IconButton onClick={toggleSidebar}>
                            <MenuIcon />
                        </IconButton>
                        <BreadcrumbsNav />
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                            {userEmail || "Guest"}
                        </Typography>
                        {userEmail && (
                            <Button variant="contained" color="error" size="small" onClick={handleLogout}>
                                Đăng xuất
                            </Button>
                        )}
                    </Box>

                </Box>
                <Outlet />
            </Box>
        </Box>
    );
};

export default AdminLayout;

