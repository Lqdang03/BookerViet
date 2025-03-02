import React from "react";
import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom";
import { Box, IconButton } from "@mui/material";
import BreadcrumbsNav from "./Breadscumb";
import { useState } from "react";
import MenuIcon from "@mui/icons-material/Menu";

const AdminLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const toggleSidebar = () => {
        setIsSidebarOpen((prev) => !prev);
    };
    return (
        <Box sx={{ display: "flex" }}>
            {/* Sidebar */}
            <Box sx={{ width: isSidebarOpen ? "250px" : "60px", transition: "width 0.3s", }}>
                <Sidebar isSidebarOpen={isSidebarOpen} />
            </Box>

            {/* Main Content */}
            <Box sx={{ flexGrow: 1, padding: 2 }}>
                <Box sx={{ display: "flex", borderBottom: 1 ,marginTop: 3}}>
                    <IconButton onClick={toggleSidebar}>
                        <MenuIcon />
                    </IconButton>
                    <BreadcrumbsNav />
                </Box>
                <Outlet />
            </Box>
        </Box>
    );
};

export default AdminLayout;